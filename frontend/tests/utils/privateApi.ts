import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceRoleKey) {
  throw new Error(
    "Missing Supabase environment variables. Set VITE_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.",
  )
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey)

export const createUser = async ({
  email,
  password,
}: {
  email: string
  password: string
}) => {
  const { data, error } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: "Test User" },
  })

  if (error || !data.user) {
    throw error ?? new Error("Failed to create test user")
  }

  return {
    id: data.user.id,
    email: data.user.email,
    full_name: data.user.user_metadata?.full_name,
  }
}
