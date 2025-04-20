import { supabase } from '../lib/supabase';

export interface DocumentStats {
  total_documents: number;
  processed_documents: number;
  failed_documents: number;
  average_processing_time: number;
}

export interface TopEntity {
  name: string;
  count: number;
  type: string;
}

export interface TopTopic {
  name: string;
  document_count: number;
  average_relevance: number;
}

export const getDocumentStats = async (): Promise<DocumentStats> => {
  try {
    const { data, error } = await supabase
      .rpc('get_document_stats');

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching document stats:', error);
    throw error;
  }
};

export const getTopEntities = async (limit: number = 10): Promise<TopEntity[]> => {
  try {
    const { data, error } = await supabase
      .rpc('get_top_entities', { limit_count: limit });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching top entities:', error);
    throw error;
  }
};

export const getTopTopics = async (limit: number = 10): Promise<TopTopic[]> => {
  try {
    const { data, error } = await supabase
      .rpc('get_top_topics', { limit_count: limit });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching top topics:', error);
    throw error;
  }
};