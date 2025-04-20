export interface Document {
  id: string;
  title: string;
  url: string;
  content: string;
  created_at?: string;
  updated_at?: string;
  status?: string;
  file_path?: string;
}

export interface DocumentInsights {
  document_id: string;
  summary: string;
  sentiment: string;
}

export interface Entity {
  name: string;
  type: string;
  count: number;
}

export interface Topic {
  name: string;
  relevance: number;
}