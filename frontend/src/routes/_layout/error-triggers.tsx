import { createFileRoute } from "@tanstack/react-router"
import { useRef } from "react"

import { Button } from "@/components/ui/button"

export const Route = createFileRoute("/_layout/error-triggers")({
  component: ErrorTriggers,
  head: () => ({
    meta: [
      {
        title: "Error triggers - FastAPI Template",
      },
    ],
  }),
})

let idCounter = 0

/**
 * A fresh id per click - timestamp plus a counter, so two clicks in the same
 * millisecond still differ. Used to give every request/error its own path or
 * message, since the monitoring widget groups identical ones together.
 */
function nextId() {
  idCounter += 1
  return `${Date.now()}-${idCounter}`
}

/**
 * Named on purpose: this is the frame that should show up in the monitoring
 * widget's stack trace. Reads a field off a null record - a real, uncaught
 * TypeError. Nothing here catches or rethrows it.
 */
function readFieldOffNullRecord(fieldName: string) {
  const record: Record<string, unknown> | null = null
  return record![fieldName]
}

interface TriggerRowProps {
  label: string
  description: string
  fire: (setLast: (text: string) => void) => void
}

function TriggerRow({ label, description, fire }: TriggerRowProps) {
  // A ref updated with plain DOM writes, not React state: the JS-throw
  // trigger crashes synchronously right after recording what it used, and
  // that record must not depend on a state update surviving the throw.
  const lastRef = useRef<HTMLParagraphElement>(null)

  const setLast = (text: string) => {
    if (lastRef.current) lastRef.current.textContent = `Last: ${text}`
  }

  return (
    <div className="flex items-center justify-between gap-4 rounded-lg border p-4">
      <div>
        <p className="font-medium">{label}</p>
        <p className="text-sm text-muted-foreground">{description}</p>
        <p
          ref={lastRef}
          className="mt-1 font-mono text-xs text-muted-foreground"
        />
      </div>
      <Button variant="destructive" onClick={() => fire(setLast)}>
        Fire
      </Button>
    </div>
  )
}

function ErrorTriggers() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Error triggers</h1>
        <p className="text-muted-foreground">
          One button per browser error, for the monitoring widget to capture.
          Every click hits a fresh path or message on purpose, so repeated
          clicks don't collapse into a single grouped record.
        </p>
      </div>

      <TriggerRow
        label="403 Forbidden"
        description="Same-origin fetch to a path that returns 403 with a JSON body."
        fire={(setLast) => {
          const path = `/api/test/forbidden/${nextId()}`
          setLast(path)
          fetch(path)
        }}
      />

      <TriggerRow
        label="404 Not Found"
        description="Same-origin fetch to a path that returns 404."
        fire={(setLast) => {
          const path = `/api/test/notfound/${nextId()}`
          setLast(path)
          fetch(path)
        }}
      />

      <TriggerRow
        label="500 Server Error"
        description="Same-origin fetch to a path that returns 500 with a realistic exception body."
        fire={(setLast) => {
          const path = `/api/test/servererror/${nextId()}`
          setLast(path)
          fetch(path)
        }}
      />

      <TriggerRow
        label="Throw JS error"
        description="Uncaught TypeError from a named function, reading a field off null."
        fire={(setLast) => {
          const fieldName = `field_${nextId()}`
          setLast(`readFieldOffNullRecord(field: "${fieldName}")`)
          readFieldOffNullRecord(fieldName)
        }}
      />
    </div>
  )
}
