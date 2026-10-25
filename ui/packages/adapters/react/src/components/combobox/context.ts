/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 context 相关实现。

import type { ComboboxGroupProps, ComboboxItemProps } from '@xihan-ui/headless'
import type { ComboboxContext } from './use-combobox'
import { createContext, useContext } from 'react'

const Ctx = createContext<ComboboxContext | undefined>(undefined)
const GroupCtx = createContext<ComboboxGroupProps | undefined>(undefined)
const ItemCtx = createContext<ComboboxItemProps<unknown> | undefined>(undefined)
// 包一层：值本身可以是任何东西（含空串、0），缺席只认 undefined 这一个容器
const TagCtx = createContext<{ value: unknown } | undefined>(undefined)

export const ComboboxProvider = Ctx
export const ComboboxGroupProvider = GroupCtx
export const ComboboxItemProvider = ItemCtx
export const ComboboxTagProvider = TagCtx

export function useComboboxContext(): ComboboxContext {
  const ctx = useContext(Ctx)
  if (!ctx)
    throw new Error('XhCombobox 的部件要放在 XhComboboxRoot 里')
  return ctx
}

export function useComboboxGroupContext(): ComboboxGroupProps {
  const group = useContext(GroupCtx)
  if (!group)
    throw new Error('XhComboboxGroupLabel 要放在 XhComboboxGroup 里')
  return group
}

export function useComboboxItemContext(): ComboboxItemProps<unknown> {
  const item = useContext(ItemCtx)
  if (!item)
    throw new Error('候选的子部件要放在 XhComboboxItem 里')
  return item
}

export function useComboboxTagContext(): unknown {
  const tag = useContext(TagCtx)
  if (tag === undefined)
    throw new Error('XhComboboxItemDeleteTrigger 要放在 XhComboboxTag 里')
  return tag.value
}
