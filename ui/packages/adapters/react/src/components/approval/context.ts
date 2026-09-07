import type { ApprovalContext } from './use-approval'
import { createContext, useContext } from 'react'

const Ctx = createContext<ApprovalContext | undefined>(undefined)

export const ApprovalProvider = Ctx

export function useApprovalContext(): ApprovalContext {
  const ctx = useContext(Ctx)
  if (!ctx)
    throw new Error('XhApproval 的部件要放在 XhApprovalRoot 里')
  return ctx
}
