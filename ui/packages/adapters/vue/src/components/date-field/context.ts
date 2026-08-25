import type { InjectionKey } from 'vue'
import type { DateFieldContext } from './use-date-field'
import { inject, provide } from 'vue'

const KEY: InjectionKey<DateFieldContext> = Symbol.for('xh-date-field')

export function provideDateField(ctx: DateFieldContext): void {
  provide(KEY, ctx)
}

export function useDateFieldContext(): DateFieldContext {
  const ctx = inject(KEY, null)
  if (!ctx)
    throw new Error('[xh] DateField 部件必须用在 XhDateFieldRoot 内')
  return ctx
}
