import type { InjectionKey } from 'vue'
import type { FloatingPanelContext } from './use-floating-panel'
import { inject, provide } from 'vue'

const KEY: InjectionKey<FloatingPanelContext> = Symbol('xh-floating-panel')

export function provideFloatingPanel(ctx: FloatingPanelContext): void {
  provide(KEY, ctx)
}

export function useFloatingPanelContext(): FloatingPanelContext {
  const ctx = inject(KEY, null)
  if (!ctx)
    throw new Error('[xh] FloatingPanel 部件必须用在 XhFloatingPanelRoot 内')
  return ctx
}
