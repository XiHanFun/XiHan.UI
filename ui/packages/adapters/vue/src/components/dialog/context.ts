import type { InjectionKey } from 'vue'
import type { DialogContext } from './use-dialog'
import { inject, provide } from 'vue'

const KEY: InjectionKey<DialogContext> = Symbol('xh-dialog')

export function provideDialog(ctx: DialogContext): void {
  provide(KEY, ctx)
}

export function useDialogContext(): DialogContext {
  const ctx = inject(KEY, null)
  if (!ctx)
    throw new Error('[xh] Dialog 部件必须用在 XhDialogRoot 内')
  return ctx
}
