/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 context 相关实现。

import type { TagGroupItemProps } from '@xihan-ui/headless'
import type { TagGroupContext } from './use-tag-group'
import { createContext, useContext } from 'react'

/** 条目声明的值、禁用与可移除，供 cell / item-text / item-delete-trigger 复用同一份声明。 */
export interface TagGroupItemContext {
  item: TagGroupItemProps
}

const Ctx = createContext<TagGroupContext | undefined>(undefined)
const ItemCtx = createContext<TagGroupItemContext | undefined>(undefined)

export const TagGroupProvider = Ctx

export function useTagGroupContext(): TagGroupContext {
  const ctx = useContext(Ctx)
  if (!ctx)
    throw new Error('[xh] TagGroup 部件必须用在 XhTagGroupRoot 内')
  return ctx
}

export const TagGroupItemProvider = ItemCtx

export function useTagGroupItemContext(): TagGroupItemContext {
  const ctx = useContext(ItemCtx)
  if (!ctx)
    throw new Error('[xh] TagGroup 条目子部件必须用在 XhTagGroupItem 内')
  return ctx
}
