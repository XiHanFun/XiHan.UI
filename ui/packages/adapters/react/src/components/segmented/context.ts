import type { SegmentedItemProps } from '@xihan-ui/headless'
import type { SegmentedContext } from './use-segmented'
import { createContext, useContext } from 'react'

const Ctx = createContext<SegmentedContext | undefined>(undefined)
/** 条目自报的值与禁用，供 item-text 这类子部件复用同一份声明。 */
const ItemCtx = createContext<SegmentedItemProps | undefined>(undefined)

export const SegmentedProvider = Ctx
export const SegmentedItemProvider = ItemCtx

export function useSegmentedContext(): SegmentedContext {
  const ctx = useContext(Ctx)
  if (!ctx)
    throw new Error('XhSegmented 的部件要放在 XhSegmentedRoot 里')
  return ctx
}

export function useSegmentedItemContext(): SegmentedItemProps {
  const item = useContext(ItemCtx)
  if (!item)
    throw new Error('条目的子部件要放在 XhSegmentedItem 里')
  return item
}
