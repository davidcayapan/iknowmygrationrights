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
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    const formData = await req.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      throw new Error('No file provided');
    }

    // Upload file to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabaseClient
      .storage
      .from('documents')
      .upload(`${crypto.randomUUID()}/${file.name}`, file);

    if (uploadError) throw uploadError;

    // Create document record
    const { data: document, error: docError } = await supabaseClient
      .from('documents')
      .insert({
        title: file.name,
        file_type: file.type,
        size: file.size,
        file_path: uploadData.path,
      })
      .select()
      .single();

    if (docError) throw docError;

    // Upload to Snowflake
    const snowflakeResponse = await fetch(`${Deno.env.get('VITE_SNOWFLAKE_HOST')}/api/documents/upload`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('SNOWFLAKE_API_KEY')}`,
        'X-Snowflake-Account': Deno.env.get('VITE_SNOWFLAKE_ACCOUNT') ?? '',
        'X-Snowflake-Role': Deno.env.get('VITE_SNOWFLAKE_ROLE') ?? '',
      },
      body: formData,
    });

    if (!snowflakeResponse.ok) {
      throw new Error('Failed to upload to Snowflake');
    }

    // Trigger document processing
    const processResponse = await fetch(`${req.url.replace('/upload-document', '/process-document')}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': req.headers.get('Authorization') ?? '',
      },
      body: JSON.stringify({ document_id: document.id }),
    });

    if (!processResponse.ok) {
      throw new Error('Failed to trigger document processing');
    }

    return new Response(
      JSON.stringify(document),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
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