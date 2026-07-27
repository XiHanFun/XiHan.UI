import type { InjectionKey } from 'vue'
import type { RatingContext } from './use-rating'
import { inject, provide } from 'vue'

const KEY: InjectionKey<RatingContext> = Symbol('xh-rating')

export function provideRating(ctx: RatingContext): void {
  provide(KEY, ctx)
}

export function useRatingContext(): RatingContext {
  const ctx = inject(KEY, null)
  if (!ctx)
    throw new Error('[xh] Rating 部件必须用在 XhRatingRoot 内')
  return ctx
}
