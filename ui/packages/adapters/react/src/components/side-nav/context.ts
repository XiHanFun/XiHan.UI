import type { SideNavContext } from './use-side-nav'
import { createContext, useContext } from 'react'

const Ctx = createContext<SideNavContext | undefined>(undefined)

export const SideNavProvider = Ctx

export function useSideNavContext(): SideNavContext {
  const ctx = useContext(Ctx)
  if (!ctx)
    throw new Error('XhSideNav 的部件要放在 XhSideNavRoot 里')
  return ctx
}

/** 分支自报的身份：子部件从中取所属分支的 value，不必逐个再声明。 */
export interface SideNavNodeContext {
  value: string
}

const NodeCtx = createContext<SideNavNodeContext | undefined>(undefined)

export const SideNavNodeProvider = NodeCtx

export function useSideNavNodeContext(): SideNavNodeContext {
  const node = useContext(NodeCtx)
  if (!node)
    throw new Error('XhSideNav 的分支部件要放在 XhSideNavBranch 里')
  return node
}
