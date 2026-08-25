import type { InjectionKey } from 'vue'
import type { ToasterContext } from './use-toaster'
import { inject, provide } from 'vue'

const KEY: InjectionKey<ToasterContext> = Symbol.for('xh-toaster')

export function provideToaster(ctx: ToasterContext): void {
  provide(KEY, ctx)
}

export function useToasterContext(): ToasterContext {
  const ctx = inject(KEY, null)
  if (!ctx)
    throw new Error('[xh] Toaster 部件必须用在 XhToasterRoot 内')
  return ctx
}

/** 注入队列上下文，不在队列内时返回 null 而非抛错。 */
export function useToasterContextOptional(): ToasterContext | null {
  return inject(KEY, null)
}
