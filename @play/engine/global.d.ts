interface KatexRenderOptions {
  throwOnError: boolean
}

interface Katex {
  renderToString(latex: string, options: KatexRenderOptions): string
  render(latex: string, element: HTMLElement, options: KatexRenderOptions): void
}

declare var katex: Katex
