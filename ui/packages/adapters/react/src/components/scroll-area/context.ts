import type { Orientation } from '@xihan-ui/core'
import type { ScrollAreaContext } from './use-scroll-area'
import { createContext, useContext } from 'react'

const Ctx = createContext<ScrollAreaContext | undefined>(undefined)
/** 滚动条自报的轴向，供它内部的轨道、滑块与交叉口复用同一份声明。 */
const ScrollbarCtx = createContext<Orientation | undefined>(undefined)

export const ScrollAreaProvider = Ctx
export const ScrollAreaScrollbarProvider = ScrollbarCtx

export function useScrollAreaContext(): ScrollAreaContext {
  const ctx = useContext(Ctx)
  if (!ctx)
    throw new Error('XhScrollArea 的部件要放在 XhScrollAreaRoot 里')
  return ctx
}

export function useScrollAreaScrollbarContext(): Orientation {
  const axis = useContext(ScrollbarCtx)
  if (!axis)
    throw new Error('轨道与滑块要放在 XhScrollAreaScrollbar 里')
  return axis
}
