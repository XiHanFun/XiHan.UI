import type { PopconfirmContext } from './use-popconfirm'
import { createContext, useContext } from 'react'

const Ctx = createContext<PopconfirmContext | undefined>(undefined)

export const PopconfirmProvider = Ctx

export function usePopconfirmContext(): PopconfirmContext {
  const ctx = useContext(Ctx)
  if (!ctx)
    throw new Error('XhPopconfirm 的部件要放在 XhPopconfirmRoot 里')
  return ctx
}
