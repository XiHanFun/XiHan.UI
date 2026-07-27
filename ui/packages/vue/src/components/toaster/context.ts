import type { InjectionKey } from 'vue'
import type { ToasterContext } from './use-toaster'
import { inject, provide } from 'vue'

const KEY: InjectionKey<ToasterContext> = Symbol('xh-toaster')

export function provideToaster(ctx: ToasterContext): void {
  provide(KEY, ctx)
}

export function useToasterContext(): ToasterContext {
  const ctx = inject(KEY, null)
  if (!ctx)
    throw new Error('[xh] Toaster 部件必须用在 XhToasterRoot 内')
  return ctx
}

/**
 * 拿不到就返回 null 的注入口。单条通知既可以长在队列里，也可以被作者单独摆出来
 * （确认框里的一条提示、文档里的示例），那时外面本来就没有队列，不该因此抛。
 */
export function useToasterContextOptional(): ToasterContext | null {
  return inject(KEY, null)
}
