import type { InjectionKey } from 'vue'
import type { ToastContext } from './use-toast'
import { inject, provide } from 'vue'

const KEY: InjectionKey<ToastContext> = Symbol('xh-toast')

export function provideToast(ctx: ToastContext): void {
  provide(KEY, ctx)
}

export function useToastContext(): ToastContext {
  const ctx = inject(KEY, null)
  if (!ctx)
    throw new Error('[xh] Toast 部件必须用在 XhToastRoot 内')
  return ctx
}
