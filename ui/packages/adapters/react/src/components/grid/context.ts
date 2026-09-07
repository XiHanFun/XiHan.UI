import type { GridApi } from '@xihan-ui/headless'
import { createContext, useContext } from 'react'

export interface GridContext {
  api: GridApi
}

const Ctx = createContext<GridContext | undefined>(undefined)

export const GridProvider = Ctx

export function useGridContext(): GridContext {
  const ctx = useContext(Ctx)
  if (!ctx)
    throw new Error('XhGrid 的部件要放在 XhGridRoot 里')
  return ctx
}
