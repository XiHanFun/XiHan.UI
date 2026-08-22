import type { ItemQuery } from '@xihan-ui/behavior'
import type { NormalizeProps, PropTypes } from '@xihan-ui/kernel'
import type { Service } from '@xihan-ui/machine'
import type { AccordionApi, AccordionItemProps, AccordionNodeMeta, AccordionSchema } from './accordion.types'
import { focusItem, ITEM_VALUE_ATTR, navigateItems, navIntentFromKey, queryItems } from '@xihan-ui/behavior'
import { dataAttr } from '@xihan-ui/kernel'
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

  // collection 推出的条目元信息：标题文本、正文与禁用都在这里定案，条目部件只报 value
  const collection: AccordionNodeMeta[] = (prop('collection') ?? []).map(node => ({
    value: node.value,
    label: node.label ?? node.value,
    content: node.content,
    disabled: !!node.disabled,
  }))
  const metaOf = new Map(collection.map(meta => [meta.value, meta]))

  /** 条目禁用：部件上写的优先，没写就回 collection 里查。 */
  const itemDisabled = (item: AccordionItemProps): boolean =>
    item.disabled ?? metaOf.get(item.value)?.disabled ?? false

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
    collection,
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
      'data-disabled': dataAttr(itemDisabled(item)),
    }),
    getHeaderProps: item => normalize.element({
      ...parts.header.attrs,
      'role': 'heading',
      'aria-level': 3,
      'data-state': stateAttr(item),
      'data-disabled': dataAttr(itemDisabled(item)),
    }),
    getTriggerProps: item => normalize.button({
      ...parts.trigger.attrs,
      [ITEM_VALUE_ATTR]: item.value,
      'id': triggerId(item.value),
      'type': 'button',
      'aria-controls': contentId(item.value),
      'aria-expanded': isOpen(item.value) ? 'true' : 'false',
      // 用 aria-disabled，禁用条目仍可聚焦
      'aria-disabled': itemDisabled(item) ? 'true' : 'false',
      'data-state': stateAttr(item),
      'data-disabled': dataAttr(itemDisabled(item)),
      // 不输出 tabindex：手风琴不做 roving tabindex，每个 trigger 都是独立的 Tab 停靠点
      'onClick': () => {
        if (!itemDisabled(item))
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
      // 收起动画播完之前 content 还在渲染，此时 hidden 已被皮肤的 display 盖掉，
      // 靠 inert 把这一段窗口里的内容挡在读屏与 Tab 序之外
      'inert': !isOpen(item.value) || undefined,
    }),
    getIndicatorProps: item => normalize.element({
      ...parts.indicator.attrs,
      'aria-hidden': true,
      'data-state': stateAttr(item),
      'data-disabled': dataAttr(itemDisabled(item)),
    }),
  }
}
