/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 context 相关实现。

import type { TreeNodeProps } from '@xihan-ui/headless'
import type { TreeContext } from './use-tree'
import { createContext, useContext } from 'react'

const Ctx = createContext<TreeContext | undefined>(undefined)
const NodeCtx = createContext<TreeNodeProps | undefined>(undefined)

export const TreeProvider = Ctx
export const TreeNodeProvider = NodeCtx

export function useTreeContext(): TreeContext {
  const ctx = useContext(Ctx)
  if (!ctx)
    throw new Error('XhTree 的部件要放在 XhTreeRoot 里')
  return ctx
}

export function useTreeNodeContext(): TreeNodeProps {
  const node = useContext(NodeCtx)
  if (!node)
    throw new Error('节点的子部件要放在 XhTreeItem 或 XhTreeBranch 里')
  return node
}
