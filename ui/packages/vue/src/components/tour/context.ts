import type { InjectionKey } from 'vue'
import type { TourContext } from './use-tour'
import { inject, provide } from 'vue'

const KEY: InjectionKey<TourContext> = Symbol('xh-tour')

export function provideTour(ctx: TourContext): void {
  provide(KEY, ctx)
}

export function useTourContext(): TourContext {
  const ctx = inject(KEY, null)
  if (!ctx)
    throw new Error('[xh] Tour 部件必须用在 XhTourRoot 内')
  return ctx
}
