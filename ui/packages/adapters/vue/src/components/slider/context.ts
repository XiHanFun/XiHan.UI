import type { ComputedRef, InjectionKey } from 'vue'
import type { SliderContext } from './use-slider'
import { inject, provide } from 'vue'

/** 拇指自报的下标，供它内部的隐藏输入复用同一份声明。 */
export interface SliderThumbContext {
  index: ComputedRef<number>
}

const KEY: InjectionKey<SliderContext> = Symbol.for('xh-slider')
const THUMB_KEY: InjectionKey<SliderThumbContext> = Symbol.for('xh-slider-thumb')

export function provideSlider(ctx: SliderContext): void {
  provide(KEY, ctx)
}

export function useSliderContext(): SliderContext {
  const ctx = inject(KEY, null)
  if (!ctx)
    throw new Error('[xh] Slider 部件必须用在 XhSliderRoot 内')
  return ctx
}

export function provideSliderThumb(ctx: SliderThumbContext): void {
  provide(THUMB_KEY, ctx)
}

export function useSliderThumbContext(): SliderThumbContext {
  const ctx = inject(THUMB_KEY, null)
  if (!ctx)
    throw new Error('[xh] Slider 隐藏输入必须用在 XhSliderThumb 内')
  return ctx
}
