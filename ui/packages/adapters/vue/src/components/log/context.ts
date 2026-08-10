import type { InjectionKey } from 'vue'
import type { LogContext } from './use-log'
import { inject, provide } from 'vue'

const KEY: InjectionKey<LogContext> = Symbol('xh-log')

export function provideLog(ctx: LogContext): void {
  provide(KEY, ctx)
}

export function useLogContext(): LogContext {
  const ctx = inject(KEY, null)
  if (!ctx)
    throw new Error('[xh] Log 部件必须用在 XhLogRoot 内')
  return ctx
}
