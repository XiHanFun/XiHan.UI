import type { CardApi } from '@xihan-ui/headless'
import type { ComputedRef, InjectionKey } from 'vue'
import { inject, provide } from 'vue'

export interface CardContext {
  api: ComputedRef<CardApi>
}

const KEY: InjectionKey<CardContext> = Symbol.for('xh-card')

export function provideCard(ctx: CardContext): void {
  provide(KEY, ctx)
}

export function useCardContext(): CardContext {
  const ctx = inject(KEY, null)
  if (!ctx)
    throw new Error('[xh] Card 部件必须用在 XhCardRoot 内')
  return ctx
}
