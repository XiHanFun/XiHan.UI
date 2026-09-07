import type { AlertContext } from './use-alert'
import { createContext, useContext } from 'react'

const Ctx = createContext<AlertContext | undefined>(undefined)

export const AlertProvider = Ctx

export function useAlertContext(): AlertContext {
  const ctx = useContext(Ctx)
  if (!ctx)
    throw new Error('XhAlert 的部件要放在 XhAlertRoot 里')
  return ctx
}
