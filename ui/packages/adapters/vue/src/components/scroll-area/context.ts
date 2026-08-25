import type { ScrollAreaScrollbarProps } from '@xihan-ui/headless'
import type { ComputedRef, InjectionKey } from 'vue'
import type { ScrollAreaContext } from './use-scroll-area'
import { inject, provide } from 'vue'

/** 滚动条自报的轴向，供它内部的滑块复用同一份声明。 */
export interface ScrollAreaScrollbarContext {
  scrollbar: ComputedRef<ScrollAreaScrollbarProps>
}

const KEY: InjectionKey<ScrollAreaContext> = Symbol.for('xh-scroll-area')
const SCROLLBAR_KEY: InjectionKey<ScrollAreaScrollbarContext> = Symbol.for('xh-scroll-area-scrollbar')

export function provideScrollArea(ctx: ScrollAreaContext): void {
  provide(KEY, ctx)
}

export function useScrollAreaContext(): ScrollAreaContext {
  const ctx = inject(KEY, null)
  if (!ctx)
    throw new Error('[xh] ScrollArea 部件必须用在 XhScrollAreaRoot 内')
  return ctx
}

export function provideScrollAreaScrollbar(ctx: ScrollAreaScrollbarContext): void {
  provide(SCROLLBAR_KEY, ctx)
}

export function useScrollAreaScrollbarContext(): ScrollAreaScrollbarContext {
  const ctx = inject(SCROLLBAR_KEY, null)
  if (!ctx)
    throw new Error('[xh] ScrollArea 滑块必须用在 XhScrollAreaScrollbar 内')
  return ctx
}
