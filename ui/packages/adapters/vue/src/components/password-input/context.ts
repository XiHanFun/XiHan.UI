import type { InjectionKey } from 'vue'
import type { PasswordInputContext } from './use-password-input'
import { inject, provide } from 'vue'

const KEY: InjectionKey<PasswordInputContext> = Symbol('xh-password-input')

export function providePasswordInput(ctx: PasswordInputContext): void {
  provide(KEY, ctx)
}

export function usePasswordInputContext(): PasswordInputContext {
  const ctx = inject(KEY, null)
  if (!ctx)
    throw new Error('[xh] PasswordInput 部件必须用在 XhPasswordInputRoot 内')
  return ctx
}
