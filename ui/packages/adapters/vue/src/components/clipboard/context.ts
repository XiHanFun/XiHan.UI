import type { InjectionKey } from 'vue'
import type { ClipboardContext } from './use-clipboard'
import { inject, provide } from 'vue'

const KEY: InjectionKey<ClipboardContext> = Symbol.for('xh-clipboard')

export function provideClipboard(ctx: ClipboardContext): void {
  provide(KEY, ctx)
}

export function useClipboardContext(): ClipboardContext {
  const ctx = inject(KEY, null)
  if (!ctx)
    throw new Error('[xh] Clipboard 部件必须用在 XhClipboardRoot 内')
  return ctx
}
