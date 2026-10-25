/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 context 相关实现。

import type { SelectGroupProps, SelectItemProps } from '@xihan-ui/headless'
import type { SelectContext } from './use-select'
import { createContext, useContext } from 'react'

const Ctx = createContext<SelectContext | undefined>(undefined)
const GroupCtx = createContext<SelectGroupProps | undefined>(undefined)
const ItemCtx = createContext<SelectItemProps<unknown> | undefined>(undefined)
// 包一层：值本身可以是任何东西（含空串、0），缺席只认 undefined 这一个容器
const TagCtx = createContext<{ value: unknown } | undefined>(undefined)

export const SelectProvider = Ctx
export const SelectGroupProvider = GroupCtx
export const SelectItemProvider = ItemCtx
export const SelectTagProvider = TagCtx

export function useSelectContext(): SelectContext {
  const ctx = useContext(Ctx)
  if (!ctx)
    throw new Error('XhSelect 的部件要放在 XhSelectRoot 里')
  return ctx
}

export function useSelectGroupContext(): SelectGroupProps {
  const group = useContext(GroupCtx)
  if (!group)
    throw new Error('XhSelectGroupLabel 要放在 XhSelectGroup 里')
  return group
}

export function useSelectItemContext(): SelectItemProps<unknown> {
  const item = useContext(ItemCtx)
  if (!item)
    throw new Error('条目的子部件要放在 XhSelectItem 里')
  return item
}

export function useSelectTagContext(): unknown {
  const tag = useContext(TagCtx)
  if (tag === undefined)
    throw new Error('XhSelectItemDeleteTrigger 要放在 XhSelectTag 里')
  return tag.value
}
