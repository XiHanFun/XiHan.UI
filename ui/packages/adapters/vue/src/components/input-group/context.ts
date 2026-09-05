import type { InputGroupApi } from '@xihan-ui/headless'
import type { ComputedRef, InjectionKey } from 'vue'
import { inject, provide } from 'vue'

export interface InputGroupContext {
  api: ComputedRef<InputGroupApi>
}

const KEY: InjectionKey<InputGroupContext> = Symbol.for('xh-input-group')

export function provideInputGroup(ctx: InputGroupContext): void {
  provide(KEY, ctx)
}

export function useInputGroupContext(): InputGroupContext {
  const ctx = inject(KEY, null)
  if (!ctx)
    throw new Error('[xh] InputGroup 部件必须用在 XhInputGroupRoot 内')
  return ctx
}
