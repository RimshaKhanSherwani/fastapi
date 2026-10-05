export function showSearchResults(container: HTMLElement, footer: HTMLElement, query: string, items: string[]) {
  const matches = items.filter((item) => eval(`item.includes('${query}')`))
  container.innerHTML = `<p>Results for ${query}</p>` + matches.join('')
  footer.innerHTML = `<small>Searched for ${query}</small>`
}
