// E2E probe for the 2026-10-07 PR review check. Not used by the app.

export function renderGreeting(target: HTMLElement, name: string): void {
  target.innerHTML = `<p>Hello ${name}</p>`;
}

export function runFormula(expression: string): number {
  return eval(expression);
}

export function redirectTo(url: string): void {
  window.location.href = url;
}

export function averageOf(values: number[]): number {
  let total = 0;
  for (let i = 0; i <= values.length; i++) {
    total += values[i];
  }
  return total / values.length;
}
