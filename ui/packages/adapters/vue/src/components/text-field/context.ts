import type { InjectionKey } from 'vue'
import type { TextFieldContext } from './use-text-field'
import { inject, provide } from 'vue'

const KEY: InjectionKey<TextFieldContext> = Symbol('xh-text-field')

export function provideTextField(ctx: TextFieldContext): void {
  provide(KEY, ctx)
}

export function useTextFieldContext(): TextFieldContext {
  const ctx = inject(KEY, null)
  if (!ctx)
    throw new Error('[xh] TextField 部件必须用在 XhTextFieldRoot 内')
  return ctx
}
