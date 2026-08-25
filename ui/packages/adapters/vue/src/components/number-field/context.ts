import type { InjectionKey } from 'vue'
import type { NumberFieldContext } from './use-number-field'
import { inject, provide } from 'vue'

const KEY: InjectionKey<NumberFieldContext> = Symbol.for('xh-number-field')

export function provideNumberField(ctx: NumberFieldContext): void {
  provide(KEY, ctx)
}

export function useNumberFieldContext(): NumberFieldContext {
  const ctx = inject(KEY, null)
  if (!ctx)
    throw new Error('[xh] NumberField 部件必须用在 XhNumberFieldRoot 内')
  return ctx
}
