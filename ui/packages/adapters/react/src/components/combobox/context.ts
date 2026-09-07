import type { ComboboxGroupProps, ComboboxItemProps } from '@xihan-ui/headless'
import type { ComboboxContext } from './use-combobox'
import { createContext, useContext } from 'react'

const Ctx = createContext<ComboboxContext | undefined>(undefined)
const GroupCtx = createContext<ComboboxGroupProps | undefined>(undefined)
const ItemCtx = createContext<ComboboxItemProps | undefined>(undefined)

export const ComboboxProvider = Ctx
export const ComboboxGroupProvider = GroupCtx
export const ComboboxItemProvider = ItemCtx

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

export function useComboboxItemContext(): ComboboxItemProps {
  const item = useContext(ItemCtx)
  if (!item)
    throw new Error('候选的子部件要放在 XhComboboxItem 里')
  return item
}
