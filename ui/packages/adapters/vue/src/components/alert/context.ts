import type { InjectionKey } from 'vue'
import type { AlertContext } from './use-alert'
import { inject, provide } from 'vue'

const KEY: InjectionKey<AlertContext> = Symbol.for('xh-alert')

export function provideAlert(ctx: AlertContext): void {
  provide(KEY, ctx)
}

export function useAlertContext(): AlertContext {
  const ctx = inject(KEY, null)
  if (!ctx)
    throw new Error('[xh] Alert 部件必须用在 XhAlertRoot 内')
  return ctx
}
