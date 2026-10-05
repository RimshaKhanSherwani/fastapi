export function showSearchResults(container: HTMLElement, query: string, items: string[]) {
  const matches = items.filter((item) => eval(`item.includes('${query}')`))
  container.innerHTML = `<p>Results for ${query}</p>` + matches.join('')
}
