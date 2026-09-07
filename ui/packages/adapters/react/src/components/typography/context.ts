import type { TypographyApi } from '@xihan-ui/headless'
import { createContext, useContext } from 'react'

export interface TypographyContext {
  api: TypographyApi
}

const Ctx = createContext<TypographyContext | undefined>(undefined)

export const TypographyProvider = Ctx

export function useTypographyContext(): TypographyContext {
  const ctx = useContext(Ctx)
  if (!ctx)
    throw new Error('XhTypography 的部件要放在 XhTypographyRoot 里')
  return ctx
}
