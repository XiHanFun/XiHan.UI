import type { ListApi } from '@xihan-ui/headless'
import { createContext, useContext } from 'react'

export interface ListContext {
  api: ListApi
}

const Ctx = createContext<ListContext | undefined>(undefined)

export const ListProvider = Ctx

export function useListContext(): ListContext {
  const ctx = useContext(Ctx)
  if (!ctx)
    throw new Error('XhList 的部件要放在 XhListRoot 里')
  return ctx
}
