import type { TimerContext } from './use-timer'
import { createContext, useContext } from 'react'

const Ctx = createContext<TimerContext | undefined>(undefined)

export const TimerProvider = Ctx

export function useTimerContext(): TimerContext {
  const ctx = useContext(Ctx)
  if (!ctx)
    throw new Error('XhTimer 的部件要放在 XhTimerRoot 里')
  return ctx
}
