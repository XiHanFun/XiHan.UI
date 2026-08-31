import type { InjectionKey } from 'vue'
import type { MarkdownStreamContext } from './use-markdown-stream'
import { inject, provide } from 'vue'

const KEY: InjectionKey<MarkdownStreamContext> = Symbol.for('xh-markdown-stream')

export function provideMarkdownStream(ctx: MarkdownStreamContext): void {
  provide(KEY, ctx)
}

export function useMarkdownStreamContext(): MarkdownStreamContext {
  const ctx = inject(KEY, null)
  if (!ctx)
    throw new Error('[xh] MarkdownStream 部件必须用在 XhMarkdownStreamRoot 内')
  return ctx
}
