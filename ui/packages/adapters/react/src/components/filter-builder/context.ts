/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 context 相关实现：根的上下文，以及组与条件交给里面部件的路径。

import type { FilterPath } from '@xihan-ui/headless'
import type { FilterBuilderContext } from './use-filter-builder'
import { createContext, useContext } from 'react'

const Ctx = createContext<FilterBuilderContext | undefined>(undefined)
const GroupCtx = createContext<FilterPath | undefined>(undefined)
const ConditionCtx = createContext<FilterPath | undefined>(undefined)

export const FilterBuilderProvider = Ctx
export const FilterBuilderGroupProvider = GroupCtx
export const FilterBuilderConditionProvider = ConditionCtx

export function useFilterBuilderContext(): FilterBuilderContext {
  const ctx = useContext(Ctx)
  if (!ctx)
    throw new Error('XhFilterBuilder 的部件要放在 XhFilterBuilderRoot 里')
  return ctx
}

/** 所在组的路径：组头、条目、组尾与组的触发钮用。 */
export function useFilterBuilderGroupContext(): FilterPath {
  const path = useContext(GroupCtx)
  if (!path)
    throw new Error('组头、条目、组尾与组的触发钮要放在 XhFilterBuilderGroup 里')
  return path
}

/** 所在条件的路径：条件行里的部件用。 */
export function useFilterBuilderConditionContext(): FilterPath {
  const path = useContext(ConditionCtx)
  if (!path)
    throw new Error('条件行里的部件要放在 XhFilterBuilderCondition 里')
  return path
}
