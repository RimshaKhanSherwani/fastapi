export function renderNote(container: HTMLElement, note: string) {
  container.textContent = note
}

export function filterItems<T>(expression: string, items: T[]): T[] {
  return items.filter((item) => String(item).includes(expression))
}

export async function loadCount(url: string): Promise<number> {
  try {
    const response = await fetch(url)
    return (await response.json()).count
  } catch {
    return 0
  }
}

export function followReturnLink(): void {
  const target = new URLSearchParams(window.location.search).get('next')
  if (target && target.startsWith('/') && !target.startsWith('//')) window.location.href = target
}

export function lastItems<T>(items: T[], count: number): T[] {
  return items.slice(items.length - count)
}
