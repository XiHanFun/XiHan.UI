import type { InjectionKey } from 'vue'
import type { InfiniteScrollContext } from './use-infinite-scroll'
import { inject, provide } from 'vue'

const KEY: InjectionKey<InfiniteScrollContext> = Symbol('xh-infinite-scroll')

export function provideInfiniteScroll(ctx: InfiniteScrollContext): void {
  provide(KEY, ctx)
}

export function useInfiniteScrollContext(): InfiniteScrollContext {
  const ctx = inject(KEY, null)
  if (!ctx)
    throw new Error('[xh] InfiniteScroll 部件必须用在 XhInfiniteScrollRoot 内')
  return ctx
}
