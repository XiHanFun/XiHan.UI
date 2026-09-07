import type { InputGroupApi } from '@xihan-ui/headless'
import { createContext, useContext } from 'react'

export interface InputGroupContext {
  api: InputGroupApi
}

const Ctx = createContext<InputGroupContext | undefined>(undefined)

export const InputGroupProvider = Ctx

export function useInputGroupContext(): InputGroupContext {
  const ctx = useContext(Ctx)
  if (!ctx)
    throw new Error('XhInputGroup 的部件要放在 XhInputGroupRoot 里')
  return ctx
}
