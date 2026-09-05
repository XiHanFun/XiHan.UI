import type { FlexApi } from '@xihan-ui/headless'
import type { ComputedRef, InjectionKey } from 'vue'
import { inject, provide } from 'vue'

export interface FlexContext {
  api: ComputedRef<FlexApi>
}

const KEY: InjectionKey<FlexContext> = Symbol.for('xh-flex')

export function provideFlex(ctx: FlexContext): void {
  provide(KEY, ctx)
}

export function useFlexContext(): FlexContext {
  const ctx = inject(KEY, null)
  if (!ctx)
    throw new Error('[xh] Flex 部件必须用在 XhFlex 内')
  return ctx
}
