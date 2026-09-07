import type { SliderContext } from './use-slider'
import { createContext, useContext } from 'react'

const Ctx = createContext<SliderContext | undefined>(undefined)
/** 拇指自报的下标，供它内部的值气泡与隐藏输入复用同一份声明。 */
const ThumbCtx = createContext<number | undefined>(undefined)

export const SliderProvider = Ctx
export const SliderThumbProvider = ThumbCtx

export function useSliderContext(): SliderContext {
  const ctx = useContext(Ctx)
  if (!ctx)
    throw new Error('XhSlider 的部件要放在 XhSliderRoot 里')
  return ctx
}

export function useSliderThumbContext(): number {
  const index = useContext(ThumbCtx)
  if (index === undefined)
    throw new Error('值气泡与隐藏输入要放在 XhSliderThumb 里')
  return index
}
