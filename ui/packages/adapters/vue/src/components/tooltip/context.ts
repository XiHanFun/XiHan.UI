/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 context 相关实现。

import type { Service } from '@xihan-ui/core'
import type { TooltipApi, TooltipGroup, TooltipSchema } from '@xihan-ui/headless'
import type { ComputedRef, InjectionKey, Ref } from 'vue'
import { inject, provide } from 'vue'

export interface TooltipContext {
  service: Service<TooltipSchema>
  api: ComputedRef<TooltipApi>
  /** 定位锚点。 */
  triggerRef: Ref<HTMLElement | null>
  /** 被定位的浮层。 */
  positionerRef: Ref<HTMLElement | null>
  /** 浮层本体，退场动画从它上面探测。 */
  contentRef: Ref<HTMLElement | null>
  /** 当前是否应当可见：退场动画播完之前仍为真。 */
  visible: Ref<boolean>
  /** 浮层迁移到的位置：全局配置的容器 > 运行时的浮层落点 > body。 */
  portalTarget: ComputedRef<string | Element>
}

const KEY: InjectionKey<TooltipContext> = Symbol.for('xh-tooltip')
const GROUP_KEY: InjectionKey<TooltipGroup> = Symbol.for('xh-tooltip-group')

/** XhTooltipProvider 把它那一组交给子树里的提示。 */
export function provideTooltipGroup(group: TooltipGroup): void {
  provide(GROUP_KEY, group)
}

/** 最近的 XhTooltipProvider 建的那一组；不在 Provider 里时为 null，提示归页面级的那一组。 */
export function useTooltipGroup(): TooltipGroup | null {
  return inject(GROUP_KEY, null)
}

export function provideTooltip(ctx: TooltipContext): void {
  provide(KEY, ctx)
}

export function useTooltipContext(): TooltipContext {
  const ctx = inject(KEY, null)
  if (!ctx)
    throw new Error('[xh] Tooltip 部件必须用在 XhTooltipRoot 内')
  return ctx
}
