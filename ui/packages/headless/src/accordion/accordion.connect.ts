import type { ItemQuery } from '@xihan-ui/behavior'
import type { NormalizeProps, PropTypes } from '@xihan-ui/core'
import type { Service } from '@xihan-ui/machine'
import type { AccordionApi, AccordionItemProps, AccordionSchema } from './accordion.types'
import { focusItem, ITEM_VALUE_ATTR, navigateItems, navIntentFromKey, queryItems } from '@xihan-ui/behavior'
import { dataAttr } from '@xihan-ui/core'
import { accordionAnatomy } from './accordion.anatomy'

const parts = accordionAnatomy.build()

// 导航集合：本手风琴 root 下的 trigger
const TRIGGER_QUERY: ItemQuery = { scope: accordionAnatomy.name, part: 'trigger' }

export function connectAccordion<T extends PropTypes>(
  service: Service<AccordionSchema>,
  normalize: NormalizeProps<T>,
): AccordionApi<T> {
  const { context, prop, send, scope } = service
  const value = context.get('value')
  const orientation = prop('orientation') ?? 'vertical'
  const dir = prop('dir')

  const isOpen = (target: string): boolean => value.includes(target)
  const stateAttr = (item: AccordionItemProps): 'open' | 'closed' => (isOpen(item.value) ? 'open' : 'closed')
  const triggerId = (target: string): string => scope.partId(accordionAnatomy.name, `trigger:${target}`)
  const contentId = (target: string): string => scope.partId(accordionAnatomy.name, `content:${target}`)

  const setValue = (next: string[]): void => {
    send({ type: 'VALUE.SET', value: next })
  }

  // 方向键在 trigger 之间移动焦点，不改展开集合
  const onTriggerKeydown = (item: AccordionItemProps) => (event: KeyboardEvent): void => {
    const intent = navIntentFromKey(event, { axis: orientation, dir })
    // 返回 null 表示该键不归导航管，此时绝不 preventDefault
    if (!intent)
      return
    event.preventDefault()
    const root = (event.currentTarget as HTMLElement).closest<HTMLElement>(parts.root.selector)
    focusItem(navigateItems(queryItems(root, TRIGGER_QUERY), item.value, intent, { loop: false }))
  }

  return {
    value,
    setValue,
    isOpen,
    getRootProps: () => normalize.element({
      ...parts.root.attrs,
      'data-orientation': orientation,
      'data-tone': prop('tone'),
      'data-size': prop('size'),
    }),
    getItemProps: item => normalize.element({
      ...parts.item.attrs,
      'data-state': stateAttr(item),
      'data-disabled': dataAttr(item.disabled),
    }),
    getHeaderProps: item => normalize.element({
      ...parts.header.attrs,
      'role': 'heading',
      'aria-level': 3,
      'data-state': stateAttr(item),
      'data-disabled': dataAttr(item.disabled),
    }),
    getTriggerProps: item => normalize.button({
      ...parts.trigger.attrs,
      [ITEM_VALUE_ATTR]: item.value,
      'id': triggerId(item.value),
      'type': 'button',
      'aria-controls': contentId(item.value),
      'aria-expanded': isOpen(item.value) ? 'true' : 'false',
      // 用 aria-disabled，禁用条目仍可聚焦
      'aria-disabled': item.disabled ? 'true' : 'false',
      'data-state': stateAttr(item),
      'data-disabled': dataAttr(item.disabled),
      // 不输出 tabindex：手风琴不做 roving tabindex，每个 trigger 都是独立的 Tab 停靠点
      'onClick': () => {
        if (!item.disabled)
          send({ type: 'ITEM.TOGGLE', value: item.value })
      },
      'onKeydown': onTriggerKeydown(item),
    }),
    getContentProps: item => normalize.element({
      ...parts.content.attrs,
      'id': contentId(item.value),
      'role': 'region',
      'aria-labelledby': triggerId(item.value),
      'data-state': stateAttr(item),
      'hidden': !isOpen(item.value) || undefined,
    }),
    getIndicatorProps: item => normalize.element({
      ...parts.indicator.attrs,
      'aria-hidden': 'true',
      'data-state': stateAttr(item),
      'data-disabled': dataAttr(item.disabled),
    }),
  }
}
