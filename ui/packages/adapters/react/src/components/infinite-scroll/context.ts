import type { InfiniteScrollContext } from './use-infinite-scroll'
import { createContext, useContext } from 'react'

const Ctx = createContext<InfiniteScrollContext | undefined>(undefined)

export const InfiniteScrollProvider = Ctx

export function useInfiniteScrollContext(): InfiniteScrollContext {
  const ctx = useContext(Ctx)
  if (!ctx)
    throw new Error('XhInfiniteScroll 的部件要放在 XhInfiniteScrollRoot 里')
  return ctx
}
