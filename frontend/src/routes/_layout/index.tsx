import { createFileRoute } from "@tanstack/react-router"

import useAuth from "@/hooks/useAuth"

export const Route = createFileRoute("/_layout/")({
  component: Dashboard,
  head: () => ({
    meta: [
      {
        title: "Dashboard - FastAPI Template",
      },
    ],
  }),
})

function getInitials(name: string) {
  return name
    .trim()
    .split(" ")
    .map((part) => part.charAt(0).toUpperCase())
    .join("")
}

function Dashboard() {
  const { user: currentUser } = useAuth()

  return (
    <div>
      <div>
        <div className="mb-2 flex size-10 items-center justify-center rounded-full bg-muted text-sm font-medium">
          {currentUser ? getInitials(currentUser.full_name!) : null}
        </div>
        <h1 className="text-2xl truncate max-w-sm">
          Hi, {currentUser?.full_name || currentUser?.email} 👋
        </h1>
        <p className="text-muted-foreground">
          Welcome back, nice to see you again!!!
        </p>
      </div>
    </div>
  )
}
