/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 context 相关实现。

import type { TooltipGroup } from '@xihan-ui/headless'
import type { InjectionKey } from 'vue'
import type { TooltipContext } from './use-tooltip'
import { inject, provide } from 'vue'

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
