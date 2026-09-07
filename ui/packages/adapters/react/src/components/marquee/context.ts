import type { MarqueeApi } from '@xihan-ui/headless'
import { createContext, useContext } from 'react'

export interface MarqueeContext {
  api: MarqueeApi
}

const Ctx = createContext<MarqueeContext | undefined>(undefined)

export const MarqueeProvider = Ctx

export function useMarqueeContext(): MarqueeContext {
  const ctx = useContext(Ctx)
  if (!ctx)
    throw new Error('[xh] Marquee 部件必须用在 XhMarqueeRoot 内')
  return ctx
}
