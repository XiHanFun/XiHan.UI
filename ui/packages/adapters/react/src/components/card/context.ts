import type { CardApi } from '@xihan-ui/headless'
import { createContext, useContext } from 'react'

export interface CardContext {
  api: CardApi
}

const Ctx = createContext<CardContext | undefined>(undefined)

export const CardProvider = Ctx

export function useCardContext(): CardContext {
  const ctx = useContext(Ctx)
  if (!ctx)
    throw new Error('XhCard 的部件要放在 XhCardRoot 里')
  return ctx
}
