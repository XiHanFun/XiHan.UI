import type { InjectionKey } from 'vue'
import type { FieldsetContext } from './use-fieldset'
import { inject, provide } from 'vue'

const KEY: InjectionKey<FieldsetContext> = Symbol('xh-fieldset')

export function provideFieldset(ctx: FieldsetContext): void {
  provide(KEY, ctx)
}

export function useFieldsetContext(): FieldsetContext {
  const ctx = inject(KEY, null)
  if (!ctx)
    throw new Error('[xh] Fieldset 部件必须用在 XhFieldsetRoot 内')
  return ctx
}
