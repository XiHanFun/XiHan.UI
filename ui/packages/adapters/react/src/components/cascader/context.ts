import type { CascaderGroupProps, CascaderItemProps } from '@xihan-ui/headless'
import type { CascaderContext } from './use-cascader'
import { createContext, useContext } from 'react'

const Ctx = createContext<CascaderContext | undefined>(undefined)
const GroupCtx = createContext<CascaderGroupProps | undefined>(undefined)
const ItemCtx = createContext<CascaderItemProps | undefined>(undefined)

export const CascaderProvider = Ctx
export const CascaderGroupProvider = GroupCtx
export const CascaderItemProvider = ItemCtx

export function useCascaderContext(): CascaderContext {
  const ctx = useContext(Ctx)
  if (!ctx)
    throw new Error('XhCascader 的部件要放在 XhCascaderRoot 里')
  return ctx
}

export function useCascaderGroupContext(): CascaderGroupProps {
  const group = useContext(GroupCtx)
  if (!group)
    throw new Error('XhCascaderGroupLabel 要放在 XhCascaderGroup 里')
  return group
}

export function useCascaderItemContext(): CascaderItemProps {
  const item = useContext(ItemCtx)
  if (!item)
    throw new Error('条目的子部件要放在 XhCascaderItem 里')
  return item
}
