import type { DescriptionsApi } from '@xihan-ui/headless'
import type { ComputedRef, InjectionKey } from 'vue'
import { inject, provide } from 'vue'

export interface DescriptionsContext {
  api: ComputedRef<DescriptionsApi>
}

const KEY: InjectionKey<DescriptionsContext> = Symbol.for('xh-descriptions')

export function provideDescriptions(ctx: DescriptionsContext): void {
  provide(KEY, ctx)
}

export function useDescriptionsContext(): DescriptionsContext {
  const ctx = inject(KEY, null)
  if (!ctx)
    throw new Error('[xh] Descriptions 部件必须用在 XhDescriptionsRoot 内')
  return ctx
}
