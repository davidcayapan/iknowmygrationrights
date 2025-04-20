export interface Document {
  id: string;
  title: string;
  url: string;
  content: string;
  status: 'processing' | 'analyzed' | 'failed';
  created_at?: string;
  updated_at?: string;
}