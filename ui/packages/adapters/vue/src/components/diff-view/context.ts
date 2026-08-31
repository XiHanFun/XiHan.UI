import type { InjectionKey } from 'vue'
import type { DiffViewContext } from './use-diff-view'
import { inject, provide } from 'vue'

const KEY: InjectionKey<DiffViewContext> = Symbol.for('xh-diff-view')

export function provideDiffView(ctx: DiffViewContext): void {
  provide(KEY, ctx)
}

export function useDiffViewContext(): DiffViewContext {
  const ctx = inject(KEY, null)
  if (!ctx)
    throw new Error('[xh] DiffView 部件必须用在 XhDiffViewRoot 内')
  return ctx
}
