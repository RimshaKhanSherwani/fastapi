// App-facing domain types. These replace the previously auto-generated
// FastAPI client types (formerly imported from "@/client").

export interface CurrentUser {
  id: string
  email: string
  full_name: string | null
}

export interface ItemPublic {
  id: string
  title: string
  description: string | null
  owner_id: string
  created_at?: string | null
}

export interface ItemCreate {
  title: string
  description?: string | null
}

export interface ItemUpdate {
  title?: string
  description?: string | null
}
