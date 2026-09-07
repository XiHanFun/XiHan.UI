import type { AccordionItemProps } from '@xihan-ui/headless'
import type { AccordionContext } from './use-accordion'
import { createContext, useContext } from 'react'

const Ctx = createContext<AccordionContext | undefined>(undefined)
/** 条目身份下传给 header / trigger / content / indicator。 */
const ItemCtx = createContext<AccordionItemProps | undefined>(undefined)

export const AccordionProvider = Ctx
export const AccordionItemProvider = ItemCtx

export function useAccordionContext(): AccordionContext {
  const ctx = useContext(Ctx)
  if (!ctx)
    throw new Error('XhAccordion 的部件要放在 XhAccordionRoot 里')
  return ctx
}

export function useAccordionItemContext(): AccordionItemProps {
  const item = useContext(ItemCtx)
  if (!item)
    throw new Error('条目的子部件要放在 XhAccordionItem 里')
  return item
}
