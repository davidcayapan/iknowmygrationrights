import { createClient } from 'npm:@supabase/supabase-js@2.39.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    const { document_ids } = await req.json();

    if (!Array.isArray(document_ids) || document_ids.length === 0) {
      throw new Error('Invalid or empty document_ids array');
    }

    // Get documents from Supabase
    const { data: documents, error: fetchError } = await supabaseClient
      .from('documents')
      .select('*')
      .in('id', document_ids)
      .eq('status', 'processing');

    if (fetchError) throw fetchError;
    if (!documents || documents.length === 0) {
      throw new Error('No documents found to retry');
    }

    // Reset document status in Supabase
    const { error: updateError } = await supabaseClient
      .from('documents')
      .update({ 
        status: 'processing',
        processing_started_at: null,
        processing_completed_at: null,
        error_message: null
      })
      .in('id', document_ids);

    if (updateError) throw updateError;

    // Process each document
    const processPromises = documents.map(async (doc) => {
      try {
        // Get the file content from Supabase Storage
        const { data: fileData, error: storageError } = await supabaseClient
          .storage
          .from('Documents')
          .download(doc.url);

        if (storageError) throw storageError;
        if (!fileData) throw new Error(`No file data found for document ${doc.id}`);

        // Convert file to text
        const text = await fileData.text();

        // Connect to Snowflake using REST API
        const snowflakeUrl = `${Deno.env.get('VITE_SNOWFLAKE_HOST')}/api/v2/statements`;
        
        // SQL to process document
        const sql = `
          CALL DOCUMENTS_DB.DOCUMENTS_SCHEMA.PROCESS_DOCUMENT(
            document_id => '${doc.id}',
            document_content => '${text.replace(/'/g, "''")}',
            document_title => '${doc.title.replace(/'/g, "''")}'
          );
        `;

        const snowflakeResponse = await fetch(snowflakeUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${Deno.env.get('SNOWFLAKE_API_KEY')}`,
            'X-Snowflake-Account': Deno.env.get('VITE_SNOWFLAKE_ACCOUNT') ?? '',
            'X-Snowflake-Role': Deno.env.get('VITE_SNOWFLAKE_ROLE') ?? '',
            'X-Snowflake-Database': Deno.env.get('SNOWFLAKE_DATABASE') ?? '',
            'X-Snowflake-Schema': Deno.env.get('SNOWFLAKE_SCHEMA') ?? '',
            'X-Snowflake-Warehouse': Deno.env.get('SNOWFLAKE_WAREHOUSE') ?? '',
          },
          body: JSON.stringify({
            statement: sql,
            timeout: 60
          })
        });

        if (!snowflakeResponse.ok) {
          const errorData = await snowflakeResponse.json();
          throw new Error(`Snowflake processing failed: ${errorData.message || snowflakeResponse.statusText}`);
        }

        // Update document status to show processing has started
        await supabaseClient
          .from('documents')
          .update({ 
            processing_started_at: new Date().toISOString()
          })
          .eq('id', doc.id);

        return snowflakeResponse.json();
      } catch (error) {
        // Update document status to failed if processing fails
        await supabaseClient
          .from('documents')
          .update({ 
            status: 'failed',
            error_message: error.message,
            processing_completed_at: new Date().toISOString()
          })
          .eq('id', doc.id);

        throw error;
      }
    });

    // Wait for all documents to be processed
    await Promise.allSettled(processPromises);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Processing retry initiated',
        processed_documents: document_ids
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: error.stack
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});