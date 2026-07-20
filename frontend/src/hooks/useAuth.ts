import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useNavigate } from "@tanstack/react-router"
import { useEffect } from "react"

import { supabase } from "@/lib/supabase"
import type { CurrentUser } from "@/types"
import { handleError } from "@/utils"
import useCustomToast from "./useCustomToast"

export interface LoginCredentials {
  username: string
  password: string
}

export interface SignUpData {
  email: string
  password: string
  full_name?: string
}

// Async because Supabase reads the persisted session from storage.
// Used by route `beforeLoad` guards, which support async.
const isLoggedIn = async (): Promise<boolean> => {
  const { data } = await supabase.auth.getSession()
  return data.session !== null
}

const getCurrentUser = async (): Promise<CurrentUser | null> => {
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null
  return {
    id: user.id,
    email: user.email ?? "",
    full_name: (user.user_metadata?.full_name as string | undefined) ?? null,
  }
}

const useAuth = () => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { showErrorToast } = useCustomToast()

  const { data: user } = useQuery<CurrentUser | null>({
    queryKey: ["currentUser"],
    queryFn: getCurrentUser,
  })

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      queryClient.invalidateQueries({ queryKey: ["currentUser"] })
    })
    return () => subscription.unsubscribe()
  }, [queryClient])

  const signUpMutation = useMutation({
    mutationFn: async (data: SignUpData) => {
      const { error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: { full_name: data.full_name ?? null },
        },
      })
      if (error) throw error
    },
    onSuccess: () => {
      navigate({ to: "/login" })
    },
    onError: handleError.bind(showErrorToast),
  })

  const loginMutation = useMutation({
    mutationFn: async (data: LoginCredentials) => {
      const { error } = await supabase.auth.signInWithPassword({
        email: data.username,
        password: data.password,
      })
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["currentUser"] })
      navigate({ to: "/" })
    },
    onError: handleError.bind(showErrorToast),
  })

  const logout = async () => {
    await supabase.auth.signOut()
    queryClient.clear()
    navigate({ to: "/login" })
  }

  return {
    signUpMutation,
    loginMutation,
    logout,
    user,
  }
}

export { isLoggedIn }
export default useAuth
