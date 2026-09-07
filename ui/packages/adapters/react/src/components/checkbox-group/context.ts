import type { CheckboxGroupItemProps } from '@xihan-ui/headless'
import type { CheckboxGroupContext } from './use-checkbox-group'
import { createContext, useContext } from 'react'

const Ctx = createContext<CheckboxGroupContext | undefined>(undefined)
/** 条目自报的值与禁用，供 indicator / item-text 复用同一份声明。 */
const ItemCtx = createContext<CheckboxGroupItemProps | undefined>(undefined)

export const CheckboxGroupProvider = Ctx
export const CheckboxGroupItemProvider = ItemCtx

export function useCheckboxGroupContext(): CheckboxGroupContext {
  const ctx = useContext(Ctx)
  if (!ctx)
    throw new Error('XhCheckboxGroup 的部件要放在 XhCheckboxGroupRoot 里')
  return ctx
}

export function useCheckboxGroupItemContext(): CheckboxGroupItemProps {
  const item = useContext(ItemCtx)
  if (!item)
    throw new Error('条目的子部件要放在 XhCheckboxGroupItem 里')
  return item
}
