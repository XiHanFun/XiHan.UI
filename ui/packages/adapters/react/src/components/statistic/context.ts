import type { StatisticApi } from '@xihan-ui/headless'
import { createContext, useContext } from 'react'

export interface StatisticContext {
  api: StatisticApi
}

const Ctx = createContext<StatisticContext | undefined>(undefined)

export const StatisticProvider = Ctx

export function useStatisticContext(): StatisticContext {
  const ctx = useContext(Ctx)
  if (!ctx)
    throw new Error('XhStatistic 的部件要放在 XhStatisticRoot 里')
  return ctx
}
