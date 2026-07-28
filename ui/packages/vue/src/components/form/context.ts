import type { InjectionKey } from 'vue'
import type { FormContext } from './use-form'
import { inject, provide } from 'vue'

const KEY: InjectionKey<FormContext> = Symbol('xh-form')

export function provideForm(ctx: FormContext): void {
  provide(KEY, ctx)
}

export function useFormContext(): FormContext {
  const ctx = inject(KEY, null)
  if (!ctx)
    throw new Error('[xh] Form 部件必须用在 XhFormRoot 内')
  return ctx
}
