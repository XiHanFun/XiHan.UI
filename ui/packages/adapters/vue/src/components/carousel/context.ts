import type { InjectionKey } from 'vue'
import type { CarouselContext } from './use-carousel'
import { inject, provide } from 'vue'

const KEY: InjectionKey<CarouselContext> = Symbol.for('xh-carousel')

export function provideCarousel(ctx: CarouselContext): void {
  provide(KEY, ctx)
}

export function useCarouselContext(): CarouselContext {
  const ctx = inject(KEY, null)
  if (!ctx)
    throw new Error('[xh] Carousel 部件必须用在 XhCarouselRoot 内')
  return ctx
}
