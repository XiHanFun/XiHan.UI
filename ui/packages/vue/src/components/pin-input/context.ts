import type { InjectionKey } from 'vue'
import type { PinInputContext } from './use-pin-input'
import { inject, provide } from 'vue'

const KEY: InjectionKey<PinInputContext> = Symbol('xh-pin-input')

export function providePinInput(ctx: PinInputContext): void {
  provide(KEY, ctx)
}

export function usePinInputContext(): PinInputContext {
  const ctx = inject(KEY, null)
  if (!ctx)
    throw new Error('[xh] PinInput 部件必须用在 XhPinInputRoot 内')
  return ctx
}
