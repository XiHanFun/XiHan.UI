/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 context 相关实现。

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

/** 分支声明的身份：子部件从中取所属分支的 value，不必逐个再声明。 */
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

/** 列表项接住它包着的那条链接报上来的身份：搜索时按它决定整行收不收。链接卸下时报 null。 */
const ItemCtx = createContext<((value: string | null) => void) | null>(null)

export const SideNavItemProvider = ItemCtx

/** 链接没包在列表项里时取不到，即不报。 */
export function useSideNavItemContext(): ((value: string | null) => void) | null {
  return useContext(ItemCtx)
}

/**
 * 分组上下文：value 是分组身份，group-list 据此与 group-label 配对；
 * join 收集成员：链接与分支挂上时登记自己的 value，返回撤销函数。
 */
export interface SideNavGroupContext {
  value: string
  join: (value: string) => () => void
}

const GroupCtx = createContext<SideNavGroupContext | null>(null)

export const SideNavGroupProvider = GroupCtx

/** 不在分组里的链接与分支取不到，不登记。 */
export function useSideNavGroupContext(): SideNavGroupContext | null {
  return useContext(GroupCtx)
}
