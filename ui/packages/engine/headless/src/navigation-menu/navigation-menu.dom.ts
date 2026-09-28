/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 机器与连接层共用的子级 DOM 读侧：只在事件处理器与动作里调用，渲染期（Vue 的 computed / WC 的 wire）不得调用。

import type { Scope } from '@xihan-ui/core'
import { contains, isItemDisabled, itemValue } from '@xihan-ui/core'
import { navigationMenuAnatomy, navigationMenuPartId } from './navigation-menu.anatomy'

const scoped = (part: string): string => `[data-scope="${navigationMenuAnatomy.name}"][data-part="${part}"]`

/** 焦点落在展开着的那一枝子级里时，返回这一枝的开关；焦点不在里面或没有展开的子级时为 null。 */
export function branchTriggerHoldingFocus(scope: Scope, branchValue: string | null): HTMLElement | null {
  if (branchValue == null)
    return null
  const content = scope.getById(navigationMenuPartId(scope, 'branch-content', branchValue))
  if (!content || !contains(content, scope.getActiveElement()))
    return null
  return scope.getById(navigationMenuPartId(scope, 'branch-trigger', branchValue))
}

/**
 * 一张面板里当前页链接所在的那一枝，按开关的 value 报；当前页不在任何一枝里、或那一枝的开关禁用时为 null。
 * 以 aria-current 为准：手写部件与按 collection 铺开的结构都由连接层写它，两条路一个判据。
 */
export function currentBranchIn(scope: Scope, value: string): string | null {
  const content = scope.getById(navigationMenuPartId(scope, 'content', value))
  const current = content?.querySelector<HTMLElement>(`${scoped('link')}[aria-current="page"]`) ?? null
  const branch = current?.closest<HTMLElement>(scoped('branch-content')) ?? null
  if (!content || !branch || !content.contains(branch))
    return null
  for (const trigger of content.querySelectorAll<HTMLElement>(scoped('branch-trigger'))) {
    if (trigger.getAttribute('aria-controls') === branch.id)
      return isItemDisabled(trigger) ? null : itemValue(trigger)
  }
  return null
}
