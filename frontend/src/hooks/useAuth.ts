import { isAuthError, isAuthRetryableFetchError } from "@supabase/supabase-js"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useNavigate } from "@tanstack/react-router"
import { useEffect } from "react"

import { supabase } from "@/lib/supabase"
import type { CurrentUser } from "@/types"
import { handleError } from "@/utils"
import useCustomToast from "./useCustomToast"

const ACCOUNT_EXISTS_MESSAGE =
  "An account with this email already exists. Try logging in instead."

// Supabase's raw auth errors are either misleading ("Failed to fetch" when the
// project is paused or VITE_SUPABASE_URL is wrong) or terse, so translate the
// ones users actually hit into something actionable.
const toFriendlyAuthError = (err: unknown): unknown => {
  if (
    isAuthRetryableFetchError(err) ||
    (isAuthError(err) && err.status === 0)
  ) {
    return new Error(
      "Can't reach the authentication server. Check your connection, or verify the Supabase project is active and VITE_SUPABASE_URL is correct.",
    )
  }
  if (!isAuthError(err)) return err
  switch (err.code) {
    case "invalid_credentials":
      return new Error("Incorrect email or password")
    case "email_not_confirmed":
      return new Error(
        "Please confirm your email address first. Check your inbox for the confirmation link.",
      )
    case "user_already_exists":
    case "email_exists":
      return new Error(ACCOUNT_EXISTS_MESSAGE)
    case "over_email_send_rate_limit":
    case "over_request_rate_limit":
      return new Error("Too many attempts. Please wait a minute and try again.")
    default:
      return err
  }
}

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
  const { showErrorToast, showSuccessToast } = useCustomToast()

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
      const { data: result, error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: { full_name: data.full_name ?? null },
          emailRedirectTo: `${window.location.origin}/login`,
        },
      })
      if (error) throw toFriendlyAuthError(error)
      // With email confirmation on, Supabase hides existing accounts by
      // returning a fake user with no identities instead of an error.
      if (result.user && result.user.identities?.length === 0) {
        throw new Error(ACCOUNT_EXISTS_MESSAGE)
      }
      return result
    },
    onSuccess: (result) => {
      if (result.session) {
        // Email confirmation is disabled: the user is already signed in.
        queryClient.invalidateQueries({ queryKey: ["currentUser"] })
        navigate({ to: "/" })
        return
      }
      showSuccessToast(
        "Account created. Check your email and click the confirmation link, then log in.",
      )
      navigate({ to: "/login" })
    },
    onError: handleError.bind(showErrorToast),
  })

  const loginMutation = useMutation({
    mutationFn: async (data: LoginCredentials) => {
      const { error } = await supabase.auth.signInWithPassword({
        email: data.username.trim(),
        password: data.password,
      })
      if (error) throw toFriendlyAuthError(error)
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
