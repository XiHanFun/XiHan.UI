import type { SelectGroupProps, SelectItemProps } from '@xihan-ui/headless'
import type { SelectContext } from './use-select'
import { createContext, useContext } from 'react'

const Ctx = createContext<SelectContext | undefined>(undefined)
const GroupCtx = createContext<SelectGroupProps | undefined>(undefined)
const ItemCtx = createContext<SelectItemProps | undefined>(undefined)
const TagCtx = createContext<string | undefined>(undefined)

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

export function useSelectItemContext(): SelectItemProps {
  const item = useContext(ItemCtx)
  if (!item)
    throw new Error('条目的子部件要放在 XhSelectItem 里')
  return item
}

export function useSelectTagContext(): string {
  const value = useContext(TagCtx)
  if (value === undefined)
    throw new Error('XhSelectItemDeleteTrigger 要放在 XhSelectTag 里')
  return value
}
