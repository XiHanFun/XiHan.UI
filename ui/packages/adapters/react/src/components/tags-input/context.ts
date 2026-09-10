import type { TagsInputItemProps } from '@xihan-ui/headless'
import type { TagsInputContext } from './use-tags-input'
import { createContext, useContext } from 'react'

const Ctx = createContext<TagsInputContext | undefined>(undefined)
/** 标签自报的值，供预览（tag 的 root）/ 文字（tag 的 label）/ 删除钮（tag 的 close-trigger）/ 编辑框复用同一份声明。 */
const ItemCtx = createContext<TagsInputItemProps | undefined>(undefined)

export const TagsInputProvider = Ctx
export const TagsInputItemProvider = ItemCtx

export function useTagsInputContext(): TagsInputContext {
  const ctx = useContext(Ctx)
  if (!ctx)
    throw new Error('XhTagsInput 的部件要放在 XhTagsInputRoot 里')
  return ctx
}

export function useTagsInputItemContext(): TagsInputItemProps {
  const item = useContext(ItemCtx)
  if (!item)
    throw new Error('标签的子部件要放在 XhTagsInputItem 里')
  return item
}
