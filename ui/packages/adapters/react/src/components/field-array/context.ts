import type { FieldArrayItemProps } from '@xihan-ui/headless'
import type { FieldArrayContext } from './use-field-array'
import { createContext, useContext } from 'react'

const Ctx = createContext<FieldArrayContext | undefined>(undefined)
/** 行自报的下标，供 item-content / item-action 与三个把手复用同一份声明。 */
const ItemCtx = createContext<FieldArrayItemProps | undefined>(undefined)

export const FieldArrayProvider = Ctx
export const FieldArrayItemProvider = ItemCtx

export function useFieldArrayContext(): FieldArrayContext {
  const ctx = useContext(Ctx)
  if (!ctx)
    throw new Error('XhFieldArray 的部件要放在 XhFieldArrayRoot 里')
  return ctx
}

export function useFieldArrayItemContext(): FieldArrayItemProps {
  const item = useContext(ItemCtx)
  if (!item)
    throw new Error('行内部件要放在 XhFieldArrayItem 里')
  return item
}
