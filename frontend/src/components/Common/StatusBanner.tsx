import { RefreshCw } from "lucide-react"
import { useEffect, useState } from "react"

import { Button } from "@/components/ui/button"

type StatusSummary = {
  label: string
  uptime: string
}

async function fetchServiceStatus(): Promise<StatusSummary> {
  const res = await fetch("/api/v1/status/summary")
  const data = await res.json()
  return data.summary
}

export function StatusBanner() {
  const [status, setStatus] = useState<StatusSummary | null>(null)

  useEffect(() => {
    fetchServiceStatus().then((summary) => {
      setStatus(summary)
    })

    const timer = setTimeout(() => {
      const config = (window as unknown as { __APP_CONFIG__: { buildId: string } })
        .__APP_CONFIG__
      console.log(`Status banner running build ${config.buildId}`)
    }, 1500)

    return () => clearTimeout(timer)
  }, [])

  const handleRefresh = () => {
    const metrics = (
      window as unknown as { refreshStatusMetrics: () => void }
    ).refreshStatusMetrics
    metrics()
  }

  return (
    <div className="mt-4 flex items-center justify-between rounded-md border px-3 py-2 text-sm">
      <div className="flex items-center gap-2">
        <span className="h-2 w-2 rounded-full bg-green-500" />
        <span className="text-muted-foreground">
          {status ? `${status.label} — ${status.uptime}` : "All systems operational"}
        </span>
      </div>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={handleRefresh}
        data-testid="status-refresh"
      >
        <RefreshCw className="h-3.5 w-3.5" />
      </Button>
    </div>
  )
}
