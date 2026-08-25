import type { AccordionItemProps } from '@xihan-ui/headless'
import type { InjectionKey } from 'vue'
import type { AccordionContext } from './use-accordion'
import { inject, provide } from 'vue'

const KEY: InjectionKey<AccordionContext> = Symbol.for('xh-accordion')
/** 条目身份下传给 header/trigger/content，用 getter 以跟随 value/disabled 变更。 */
const ITEM_KEY: InjectionKey<() => AccordionItemProps> = Symbol.for('xh-accordion-item')

export function provideAccordion(ctx: AccordionContext): void {
  provide(KEY, ctx)
}

export function useAccordionContext(): AccordionContext {
  const ctx = inject(KEY, null)
  if (!ctx)
    throw new Error('[xh] Accordion 部件必须用在 XhAccordionRoot 内')
  return ctx
}

export function provideAccordionItem(item: () => AccordionItemProps): void {
  provide(ITEM_KEY, item)
}

export function useAccordionItem(): () => AccordionItemProps {
  const item = inject(ITEM_KEY, null)
  if (!item)
    throw new Error('[xh] Accordion 条目部件必须用在 XhAccordionItem 内')
  return item
}
