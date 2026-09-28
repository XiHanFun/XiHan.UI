/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 context 相关实现。

import type { InjectionKey } from 'vue'
import type { SideNavContext } from './use-side-nav'
import { inject, provide } from 'vue'

const KEY: InjectionKey<SideNavContext> = Symbol.for('xh-side-nav')

export function provideSideNav(ctx: SideNavContext): void {
  provide(KEY, ctx)
}

export function useSideNavContext(): SideNavContext {
  const ctx = inject(KEY, null)
  if (!ctx)
    throw new Error('[xh] SideNav 部件必须用在 XhSideNavRoot 内')
  return ctx
}

/** 分支上下文：子部件从中取所属分支的 value，不必逐个再声明。 */
const NODE_KEY: InjectionKey<{ value: string }> = Symbol.for('xh-side-nav-node')

export function provideSideNavNode(node: { value: string }): void {
  provide(NODE_KEY, node)
}

export function useSideNavNodeContext(): { value: string } {
  const node = inject(NODE_KEY, null)
  if (!node)
    throw new Error('[xh] SideNav 分支部件必须用在 XhSideNavBranch 内')
  return node
}

/** 列表项接住它包着的那条链接报上来的身份：搜索时按它决定整行收不收。链接卸下时报 null。 */
type ReportItemValue = (value: string | null) => void
const ITEM_KEY: InjectionKey<ReportItemValue> = Symbol.for('xh-side-nav-item')

export function provideSideNavItem(report: ReportItemValue): void {
  provide(ITEM_KEY, report)
}

/** 链接没包在列表项里时取不到，即不报。 */
export function useSideNavItemContext(): ReportItemValue | null {
  return inject(ITEM_KEY, null)
}

/** 分组收集成员：链接与分支挂上时登记自己的 value，返回撤销函数。 */
type JoinGroup = (value: string) => () => void
const GROUP_KEY: InjectionKey<JoinGroup> = Symbol.for('xh-side-nav-group')

export function provideSideNavGroup(join: JoinGroup): void {
  provide(GROUP_KEY, join)
}

/** 不在分组里的链接与分支取不到，不登记。 */
export function useSideNavGroupContext(): JoinGroup | null {
  return inject(GROUP_KEY, null)
}
