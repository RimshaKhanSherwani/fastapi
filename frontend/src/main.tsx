import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { createRouter, RouterProvider } from "@tanstack/react-router"
import { StrictMode } from "react"
import ReactDOM from "react-dom/client"
import { ThemeProvider } from "./components/theme-provider"
import { Toaster } from "./components/ui/sonner"
import "./index.css"
import { supabase } from "./lib/supabase"
import { routeTree } from "./routeTree.gen"

const queryClient = new QueryClient()

const router = createRouter({ routeTree })
declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router
  }
}

// When Supabase signs the user out (manual logout or an unrecoverable session),
// clear cached data and send them back to the login screen.
supabase.auth.onAuthStateChange((event) => {
  if (event === "SIGNED_OUT") {
    queryClient.clear()
    if (
      !["/login", "/signup", "/recover-password", "/reset-password"].includes(
        window.location.pathname,
      )
    ) {
      window.location.href = "/login"
    }
  }
})

ReactDOM.createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
        <Toaster richColors closeButton />
      </QueryClientProvider>
    </ThemeProvider>
  </StrictMode>,
)
