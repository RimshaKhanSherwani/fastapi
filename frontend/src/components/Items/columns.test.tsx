import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

import { columns } from "./columns"

// Regression test for the "Copy ID" button crashing before `copy()` ever
// ran. The handler used to do `id.split("-")[5].toUpperCase()`, but a
// standard UUID only has 5 segments (indices 0-4), so index 5 is
// `undefined` and calling `.toUpperCase()` on it throws a TypeError. That
// exception happened inside the onClick handler, so `copy()` was never
// invoked and the button never reached its "copied" state.
describe("Items columns - CopyId", () => {
  const id = "11111111-2222-3333-4444-555555555555"

  it("copies the full item id without throwing when the copy button is clicked", () => {
    const writeText = vi.fn().mockResolvedValue(undefined)
    Object.assign(navigator, {
      clipboard: { writeText },
    })

    // The "id" column is the first entry in `columns`; it renders
    // <CopyId id={row.original.id} /> via its `cell` renderer.
    const idColumn = columns[0]
    const row = { original: { id } } as never
    // @ts-expect-error - cell is defined for this column
    const element = idColumn.cell({ row })

    render(element)

    const button = screen.getByRole("button", { name: /copy id/i })

    expect(() => fireEvent.click(button)).not.toThrow()
    expect(writeText).toHaveBeenCalledWith(id)
  })
})
