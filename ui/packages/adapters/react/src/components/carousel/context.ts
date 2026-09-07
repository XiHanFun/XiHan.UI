import type { CarouselContext } from './use-carousel'
import { createContext, useContext } from 'react'

const Ctx = createContext<CarouselContext | undefined>(undefined)

export const CarouselProvider = Ctx

export function useCarouselContext(): CarouselContext {
  const ctx = useContext(Ctx)
  if (!ctx)
    throw new Error('XhCarousel 的部件要放在 XhCarouselRoot 里')
  return ctx
}
