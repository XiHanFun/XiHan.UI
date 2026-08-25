import type { InjectionKey } from 'vue'
import type { ThreadContext } from './use-thread'
import { inject, provide } from 'vue'

const KEY: InjectionKey<ThreadContext> = Symbol.for('xh-thread')

export function provideThread(ctx: ThreadContext): void {
  provide(KEY, ctx)
}

export function useThreadContext(): ThreadContext {
  const ctx = inject(KEY, null)
  if (!ctx)
    throw new Error('[xh] Thread 部件必须用在 XhThreadRoot 内')
  return ctx
}
