import type { InjectionKey } from 'vue'
import type { ToolCallContext } from './use-tool-call'
import { inject, provide } from 'vue'

const KEY: InjectionKey<ToolCallContext> = Symbol.for('xh-tool-call')

export function provideToolCall(ctx: ToolCallContext): void {
  provide(KEY, ctx)
}

export function useToolCallContext(): ToolCallContext {
  const ctx = inject(KEY, null)
  if (!ctx)
    throw new Error('[xh] ToolCall 部件必须用在 XhToolCallRoot 内')
  return ctx
}
