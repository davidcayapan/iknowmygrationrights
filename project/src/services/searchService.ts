import { supabase } from '../lib/supabase';

export interface SearchResult {
  id: string;
  title: string;
  content: string;
  relevance: number;
  created_at: string;
}

export const searchDocuments = async (query: string): Promise<SearchResult[]> => {
  try {
    const { data: documents, error } = await supabase
      .rpc('search_documents', {
        search_query: query
      });

    if (error) throw error;
    return documents || [];
  } catch (error) {
    console.error('Error searching documents:', error);
    throw error;
  }
};

export const getRecentSearches = async (): Promise<string[]> => {
  try {
    const { data: searches, error } = await supabase
      .from('user_searches')
      .select('query')
      .order('created_at', { ascending: false })
      .limit(5);

    if (error) throw error;
    return searches?.map(s => s.query) || [];
  } catch (error) {
    console.error('Error fetching recent searches:', error);
    return [];
  }
};