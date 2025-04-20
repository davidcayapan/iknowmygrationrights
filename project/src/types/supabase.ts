export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      documents: {
        Row: {
          id: string
          title: string
          url: string
          content: string
          file_path: string | null
          status: string
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          title: string
          url: string
          content: string
          file_path?: string | null
          status?: string
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          title?: string
          url?: string
          content?: string
          file_path?: string | null
          status?: string
          created_at?: string | null
          updated_at?: string | null
        }
      }
      document_insights: {
        Row: {
          id: string
          document_id: string
          summary: string
          sentiment: number | null
          created_at: string | null
        }
        Insert: {
          id?: string
          document_id: string
          summary: string
          sentiment?: number | null
          created_at?: string | null
        }
        Update: {
          id?: string
          document_id?: string
          summary?: string
          sentiment?: number | null
          created_at?: string | null
        }
      }
      document_entities: {
        Row: {
          id: string
          document_id: string
          name: string
          type: string
          count: number
          created_at: string | null
        }
        Insert: {
          id?: string
          document_id: string
          name: string
          type: string
          count: number
          created_at?: string | null
        }
        Update: {
          id?: string
          document_id?: string
          name?: string
          type?: string
          count?: number
          created_at?: string | null
        }
      }
      document_topics: {
        Row: {
          id: string
          document_id: string
          name: string
          relevance: number
          created_at: string | null
        }
        Insert: {
          id?: string
          document_id: string
          name: string
          relevance: number
          created_at?: string | null
        }
        Update: {
          id?: string
          document_id?: string
          name?: string
          relevance?: number
          created_at?: string | null
        }
      }
    }
  }
}