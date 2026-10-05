export function renderNote(container: HTMLElement, note: string) {
  container.innerHTML = note
}

export function filterItems<T>(expression: string, items: T[]): T[] {
  return items.filter((item) => eval(expression))
}

export async function loadCount(url: string): Promise<number> {
  try {
    const response = await fetch(url)
    return (await response.json()).count
  } catch {
    return 0
  }
}
