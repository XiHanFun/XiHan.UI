/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 context 相关实现。

import type { Service } from '@xihan-ui/core'
import type { TooltipApi, TooltipGroup, TooltipSchema } from '@xihan-ui/headless'
import type { RefObject } from 'react'
import type { OverlayWiring } from '../../runtime/use-overlay'
import { createContext, useContext } from 'react'

export interface TooltipContext extends OverlayWiring {
  service: Service<TooltipSchema>
  api: TooltipApi
  /** 定位锚点。 */
  triggerRef: RefObject<HTMLElement | null>
  /** 被定位的浮层。 */
  positionerRef: RefObject<HTMLElement | null>
  /** 浮层本体，退场动画从它上面探测。 */
  contentRef: RefObject<HTMLElement | null>
}

const Ctx = createContext<TooltipContext | undefined>(undefined)

export const TooltipProvider = Ctx

/** XhTooltipProvider 建的那一组；不在 Provider 里时为 null，提示归页面级的那一组。 */
export const TooltipGroupContext = createContext<TooltipGroup | null>(null)

export function useTooltipContext(): TooltipContext {
  const ctx = useContext(Ctx)
  if (!ctx)
    throw new Error('XhTooltip 的部件要放在 XhTooltipRoot 里')
  return ctx
}
