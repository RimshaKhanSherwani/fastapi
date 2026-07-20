// Minimal, hand-maintained Supabase database types for the tables and
// functions this app uses. Regenerate a full version any time with:
//   supabase gen types typescript --project-id <ref> > src/lib/database.types.ts

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      items: {
        Row: {
          id: string
          title: string
          description: string | null
          owner_id: string
          created_at: string
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          owner_id?: string
          created_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          owner_id?: string
          created_at?: string
        }
        Relationships: []
      }
    }
    Views: Record<never, never>
    Functions: {
      delete_user: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
    }
    Enums: Record<never, never>
    CompositeTypes: Record<never, never>
  }
}
