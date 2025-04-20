/**
 * Service for handling Snowflake API integration
 */

// Base configuration for Snowflake API
const SNOWFLAKE_CONFIG = {
  account: import.meta.env.VITE_SNOWFLAKE_ACCOUNT,
  host: import.meta.env.VITE_SNOWFLAKE_HOST,
  role: import.meta.env.VITE_SNOWFLAKE_ROLE,
};

// Validate Snowflake configuration
const validateConfig = () => {
  const requiredEnvVars = ['VITE_SNOWFLAKE_ACCOUNT', 'VITE_SNOWFLAKE_HOST', 'VITE_SNOWFLAKE_ROLE'];
  const missingVars = requiredEnvVars.filter(varName => !import.meta.env[varName]);
  
  if (missingVars.length > 0) {
    throw new Error(`Missing required Snowflake environment variables: ${missingVars.join(', ')}`);
  }
};

// Constants for endpoint paths
const ENDPOINTS = {
  QUERY: '/api/statements',
  AI: '/api/ai/completions',
  EMBEDDINGS: '/api/ai/embeddings',
  DOCUMENTS: '/api/documents',
};

// Types for Snowflake API requests and responses
interface SnowflakeQueryRequest {
  statement: string;
  timeout?: number;
}

interface SnowflakeAIRequest {
  prompt: string;
  model?: string;
  temperature?: number;
  max_tokens?: number;
}

interface SnowflakeEmbeddingRequest {
  text: string[];
  model?: string;
}

/**
 * Creates headers for Snowflake API requests
 */
const createHeaders = (apiKey: string) => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${apiKey}`,
  'X-Snowflake-Account': SNOWFLAKE_CONFIG.account,
  'X-Snowflake-Role': SNOWFLAKE_CONFIG.role,
});

/**
 * Generic error handler for Snowflake API responses
 */
const handleResponse = async (response: Response) => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: response.statusText }));
    throw new Error(`Snowflake API error: ${errorData.message || response.statusText}`);
  }
  return response.json();
};

/**
 * Executes a SQL query against Snowflake
 */
export const executeQuery = async (query: string, apiKey: string) => {
  try {
    validateConfig();
    
    const payload: SnowflakeQueryRequest = {
      statement: query,
      timeout: 60,
    };

    const response = await fetch(`${SNOWFLAKE_CONFIG.host}${ENDPOINTS.QUERY}`, {
      method: 'POST',
      headers: createHeaders(apiKey),
      body: JSON.stringify(payload),
    });

    return handleResponse(response);
  } catch (error) {
    console.error('Error executing Snowflake query:', error);
    throw error;
  }
};

/**
 * Gets AI completion from Snowflake
 */
export const getAICompletion = async (prompt: string, apiKey: string) => {
  try {
    validateConfig();
    
    const payload: SnowflakeAIRequest = {
      prompt,
      model: 'llama2-70b',
      temperature: 0.7,
      max_tokens: 1000,
    };

    const response = await fetch(`${SNOWFLAKE_CONFIG.host}${ENDPOINTS.AI}`, {
      method: 'POST',
      headers: createHeaders(apiKey),
      body: JSON.stringify(payload),
    });

    return handleResponse(response);
  } catch (error) {
    console.error('Error getting AI completion from Snowflake:', error);
    throw error;
  }
};

/**
 * Generates embeddings for text using Snowflake
 */
export const generateEmbeddings = async (texts: string[], apiKey: string) => {
  try {
    validateConfig();
    
    const payload: SnowflakeEmbeddingRequest = {
      text: texts,
      model: 'e5-large-v2',
    };

    const response = await fetch(`${SNOWFLAKE_CONFIG.host}${ENDPOINTS.EMBEDDINGS}`, {
      method: 'POST',
      headers: createHeaders(apiKey),
      body: JSON.stringify(payload),
    });

    return handleResponse(response);
  } catch (error) {
    console.error('Error generating embeddings with Snowflake:', error);
    throw error;
  }
};

/**
 * Upload files to Snowflake storage
 */
export const uploadDocuments = async (files: File[], apiKey: string) => {
  try {
    validateConfig();
    
    const formData = new FormData();
    files.forEach((file, index) => {
      formData.append(`file_${index}`, file);
    });

    const response = await fetch(`${SNOWFLAKE_CONFIG.host}${ENDPOINTS.DOCUMENTS}/upload`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'X-Snowflake-Account': SNOWFLAKE_CONFIG.account,
        'X-Snowflake-Role': SNOWFLAKE_CONFIG.role,
      },
      body: formData,
    });

    return handleResponse(response);
  } catch (error) {
    console.error('Error uploading documents to Snowflake:', error);
    throw error;
  }
};

/**
 * Process documents with Snowflake AI
 */
export const processDocuments = async (documentIds: string[], apiKey: string) => {
  try {
    validateConfig();
    
    const response = await fetch(`${SNOWFLAKE_CONFIG.host}${ENDPOINTS.DOCUMENTS}/process`, {
      method: 'POST',
      headers: createHeaders(apiKey),
      body: JSON.stringify({ document_ids: documentIds }),
    });

    return handleResponse(response);
  } catch (error) {
    console.error('Error processing documents with Snowflake:', error);
    throw error;
  }
};

/**
 * RAG (Retrieval Augmented Generation) query using document context
 */
export const ragQuery = async (query: string, documentIds: string[], apiKey: string) => {
  try {
    validateConfig();
    
    const response = await fetch(`${SNOWFLAKE_CONFIG.host}${ENDPOINTS.DOCUMENTS}/rag/query`, {
      method: 'POST',
      headers: createHeaders(apiKey),
      body: JSON.stringify({
        query,
        document_ids: documentIds,
        model: 'llama2-70b',
        temperature: 0.7,
      }),
    });

    return handleResponse(response);
  } catch (error) {
    console.error('Error with Snowflake RAG query:', error);
    throw error;
  }
};