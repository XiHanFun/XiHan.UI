/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 context 相关实现。

import type { StepsItemProps } from '@xihan-ui/headless'
import type { StepsContext } from './use-steps'
import { createContext, useContext } from 'react'

const Ctx = createContext<StepsContext | undefined>(undefined)
/** 条目身份下传给 trigger / indicator / title / description / separator。 */
const ItemCtx = createContext<StepsItemProps | undefined>(undefined)

export const StepsProvider = Ctx
export const StepsItemProvider = ItemCtx

export function useStepsContext(): StepsContext {
  const ctx = useContext(Ctx)
  if (!ctx)
    throw new Error('XhSteps 的部件要放在 XhStepsRoot 里')
  return ctx
}

export function useStepsItemContext(): StepsItemProps {
  const item = useContext(ItemCtx)
  if (!item)
    throw new Error('条目的子部件要放在 XhStepsItem 里')
  return item
}
