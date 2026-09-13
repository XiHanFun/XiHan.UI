/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 context 相关实现。

import type { ListboxGroupProps, ListboxItemProps } from '@xihan-ui/headless'
import type { ListboxContext } from './use-listbox'
import { createContext, useContext } from 'react'

const Ctx = createContext<ListboxContext | undefined>(undefined)
const GroupCtx = createContext<ListboxGroupProps | undefined>(undefined)
const ItemCtx = createContext<ListboxItemProps | undefined>(undefined)

export const ListboxProvider = Ctx
export const ListboxGroupProvider = GroupCtx
export const ListboxItemProvider = ItemCtx

export function useListboxContext(): ListboxContext {
  const ctx = useContext(Ctx)
  if (!ctx)
    throw new Error('XhListbox 的部件要放在 XhListboxRoot 里')
  return ctx
}

export function useListboxGroupContext(): ListboxGroupProps {
  const group = useContext(GroupCtx)
  if (!group)
    throw new Error('XhListboxGroupLabel 要放在 XhListboxGroup 里')
  return group
}

export function useListboxItemContext(): ListboxItemProps {
  const item = useContext(ItemCtx)
  if (!item)
    throw new Error('条目的子部件要放在 XhListboxItem 里')
  return item
}
