import type { MentionItemProps } from '@xihan-ui/headless'
import type { MentionContext } from './use-mention'
import { createContext, useContext } from 'react'

const Ctx = createContext<MentionContext | undefined>(undefined)
const ItemCtx = createContext<MentionItemProps | undefined>(undefined)

export const MentionProvider = Ctx
export const MentionItemProvider = ItemCtx

export function useMentionContext(): MentionContext {
  const ctx = useContext(Ctx)
  if (!ctx)
    throw new Error('XhMention 的部件要放在 XhMentionRoot 里')
  return ctx
}

export function useMentionItemContext(): MentionItemProps {
  const item = useContext(ItemCtx)
  if (!item)
    throw new Error('候选的子部件要放在 XhMentionItem 里')
  return item
}
