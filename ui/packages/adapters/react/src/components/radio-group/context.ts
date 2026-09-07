import type { RadioGroupItemProps } from '@xihan-ui/headless'
import type { RadioGroupContext } from './use-radio-group'
import { createContext, useContext } from 'react'

const Ctx = createContext<RadioGroupContext | undefined>(undefined)
/** 条目自报的值与禁用，供 item-text 复用同一份声明。 */
const ItemCtx = createContext<RadioGroupItemProps | undefined>(undefined)

export const RadioGroupProvider = Ctx
export const RadioGroupItemProvider = ItemCtx

export function useRadioGroupContext(): RadioGroupContext {
  const ctx = useContext(Ctx)
  if (!ctx)
    throw new Error('XhRadioGroup 的部件要放在 XhRadioGroupRoot 里')
  return ctx
}

export function useRadioGroupItemContext(): RadioGroupItemProps {
  const item = useContext(ItemCtx)
  if (!item)
    throw new Error('条目的子部件要放在 XhRadioGroupItem 里')
  return item
}
