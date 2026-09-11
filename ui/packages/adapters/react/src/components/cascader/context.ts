import type { CascaderGroupProps, CascaderItemProps } from '@xihan-ui/headless'
import type { CascaderContext } from './use-cascader'
import { createContext, useContext } from 'react'

export interface CascaderContentContext {
  /** 每次 Content render 独有的登记对象；中断或并发 render 不会改写另一棵待提交树。 */
  renderRegistration: { authoredLoading: boolean }
  authoredLoadingCount: number
  registerLoading: () => () => void
}

const Ctx = createContext<CascaderContext | undefined>(undefined)
const GroupCtx = createContext<CascaderGroupProps | undefined>(undefined)
const ItemCtx = createContext<CascaderItemProps | undefined>(undefined)
const ContentCtx = createContext<CascaderContentContext | undefined>(undefined)

export const CascaderProvider = Ctx
export const CascaderGroupProvider = GroupCtx
export const CascaderItemProvider = ItemCtx
export const CascaderContentProvider = ContentCtx

export function useCascaderContext(): CascaderContext {
  const ctx = useContext(Ctx)
  if (!ctx)
    throw new Error('XhCascader 的部件要放在 XhCascaderRoot 里')
  return ctx
}

export function useCascaderContentContext(): CascaderContentContext {
  const ctx = useContext(ContentCtx)
  if (!ctx)
    throw new Error('XhCascaderLoading 要放在 XhCascaderContent 里')
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
