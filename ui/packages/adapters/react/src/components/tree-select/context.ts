import type { TreeSelectNodeProps } from '@xihan-ui/headless'
import type { TreeSelectContext } from './use-tree-select'
import { createContext, useContext } from 'react'

const Ctx = createContext<TreeSelectContext | undefined>(undefined)
const NodeCtx = createContext<TreeSelectNodeProps | undefined>(undefined)

export const TreeSelectProvider = Ctx
export const TreeSelectNodeProvider = NodeCtx

export function useTreeSelectContext(): TreeSelectContext {
  const ctx = useContext(Ctx)
  if (!ctx)
    throw new Error('XhTreeSelect 的部件要放在 XhTreeSelectRoot 里')
  return ctx
}

export function useTreeSelectNodeContext(): TreeSelectNodeProps {
  const node = useContext(NodeCtx)
  if (!node)
    throw new Error('节点的子部件要放在 XhTreeSelectItem 或 XhTreeSelectBranch 里')
  return node
}
