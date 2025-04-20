import { createClient } from 'npm:@supabase/supabase-js@2.39.0';
import { Entity, Topic } from './lib/types.ts';

interface Document {
  id: string;
  title: string;
  file_type: string;
  size: number;
  file_path: string;
  status: string;
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Timeout for Snowflake processing (2 minutes)
const PROCESSING_TIMEOUT = 120000;

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    const jwt = authHeader?.replace('Bearer ', '');

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: `Bearer ${jwt}` } } }
    );

    const { document_id } = await req.json();

    // Get document from database
    const { data: document, error: docError } = await supabaseClient
      .from('documents')
      .select('*')
      .eq('id', document_id)
      .single();

    if (docError) throw docError;

    // Process document with Snowflake
    try {
      // Create an AbortController for the timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), PROCESSING_TIMEOUT);

      const snowflakeResponse = await fetch(`${Deno.env.get('VITE_SNOWFLAKE_HOST')}/api/documents/process`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${Deno.env.get('SNOWFLAKE_API_KEY')}`,
          'X-Snowflake-Account': Deno.env.get('VITE_SNOWFLAKE_ACCOUNT') ?? '',
          'X-Snowflake-Role': Deno.env.get('VITE_SNOWFLAKE_ROLE') ?? '',
        },
        body: JSON.stringify({ document_path: document.file_path }),
        signal: controller.signal
      }).finally(() => clearTimeout(timeoutId));

      if (!snowflakeResponse.ok) {
        throw new Error(`Snowflake processing failed: ${snowflakeResponse.statusText}`);
      }

      const analysis = await snowflakeResponse.json();

      // Validate analysis data
      if (!analysis.summary || !analysis.sentiment) {
        throw new Error('Invalid analysis data received from Snowflake');
      }

      // Store analysis results
      const { error: insightError } = await supabaseClient
        .from('document_insights')
        .insert({
          document_id,
          summary: analysis.summary,
          sentiment: analysis.sentiment,
        });

      if (insightError) throw insightError;

      // Store entities
      if (analysis.entities?.length) {
        const { error: entityError } = await supabaseClient
          .from('document_entities')
          .insert(
            analysis.entities.map((entity: Entity) => ({
              document_id,
              name: entity.name,
              type: entity.type,
              count: entity.count,
            }))
          );

        if (entityError) throw entityError;
      }

      // Store topics
      if (analysis.topics?.length) {
        const { error: topicError } = await supabaseClient
          .from('document_topics')
          .insert(
            analysis.topics.map((topic: Topic) => ({
              document_id,
              name: topic.name,
              relevance: topic.relevance,
            }))
          );

        if (topicError) throw topicError;
      }

      // Update document status to analyzed
      const { error: updateError } = await supabaseClient
        .from('documents')
        .update({ 
          status: 'analyzed',
          error_message: null
        })
        .eq('id', document_id);

      if (updateError) throw updateError;

      return new Response(
        JSON.stringify({ success: true }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );

    } catch (processingError) {
      // Handle AbortError specifically
      const errorMessage = processingError.name === 'AbortError' 
        ? 'Processing timed out after 2 minutes'
        : processingError.message;

      // Update document status to failed with error message
      await supabaseClient
        .from('documents')
        .update({ 
          status: 'failed',
          error_message: errorMessage
        })
        .eq('id', document_id);

      throw processingError;
    }

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});