import type { InjectionKey } from 'vue'
import type { SignaturePadContext } from './use-signature-pad'
import { inject, provide } from 'vue'

const KEY: InjectionKey<SignaturePadContext> = Symbol('xh-signature-pad')

export function provideSignaturePad(ctx: SignaturePadContext): void {
  provide(KEY, ctx)
}

export function useSignaturePadContext(): SignaturePadContext {
  const ctx = inject(KEY, null)
  if (!ctx)
    throw new Error('[xh] SignaturePad 部件必须用在 XhSignaturePadRoot 内')
  return ctx
}
