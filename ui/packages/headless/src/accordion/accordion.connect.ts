import type { ItemQuery } from '@xihan-ui/behavior'
import type { NormalizeProps, PropTypes } from '@xihan-ui/core'
import type { Service } from '@xihan-ui/machine'
import type { AccordionApi, AccordionItemProps, AccordionSchema } from './accordion.types'
import { focusItem, ITEM_VALUE_ATTR, navigateItems, navIntentFromKey, queryItems } from '@xihan-ui/behavior'
import { dataAttr } from '@xihan-ui/core'
import { accordionAnatomy } from './accordion.anatomy'

const parts = accordionAnatomy.build()

// 导航集合就是 trigger 本身：queryItems 的归属判据取容器自己的 data-part，
// trigger 与 root 之间隔着 item/header 也照样只收本台手风琴的 trigger（嵌套互不吞并）。
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

  // 方向键：只在 header 之间搬焦点，永不进 content，也不改展开集合。
  // 起点用条目自报的 value（无需反查 DOM），终点用事件那一刻的活 DOM 算。
  const onTriggerKeydown = (item: AccordionItemProps) => (event: KeyboardEvent): void => {
    // 整个事件对象喂进去：带 Ctrl/Meta/Alt/Shift 的组合一律不归导航管，
    // 否则 Ctrl+Home 之类的浏览器/读屏组合会被这一组吞掉
    const intent = navIntentFromKey(event, { axis: orientation, dir })
    // null = 这个键不归导航管，必须放行给页面滚动与读屏，绝不能 preventDefault
    if (!intent)
      return
    event.preventDefault()
    const root = (event.currentTarget as HTMLElement).closest<HTMLElement>(parts.root.selector)
    // 集合只在事件那一刻读活 DOM，顺序天然是文档序，增删无需记账；
    // loop 默认 false：首尾不回绕；禁用条目按集合默认策略跳过
    focusItem(navigateItems(queryItems(root, TRIGGER_QUERY), item.value, intent, { loop: false }))
  }

  return {
    value,
    setValue,
    isOpen,
    getRootProps: () => normalize.element({
      ...parts.root.attrs,
      'data-orientation': orientation,
    }),
    getItemProps: item => normalize.element({
      ...parts.item.attrs,
      'data-state': stateAttr(item),
      'data-disabled': dataAttr(item.disabled),
    }),
    // APG 要求 trigger 外裹一层带 heading 语义且标了级别的元素；
    // 语义由 connect 给足，适配器渲染什么标签都一致。
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
      // 集合条目一律 aria-disabled，绝不输出原生 disabled：原生 disabled 不可聚焦、
      // 也不派发 click，会让禁用条目脱离 Tab 序，禁用策略与样式就此分裂。
      // 与 Switch/Checkbox 相反——那两个是单体控件，用原生 disabled。
      'aria-disabled': item.disabled ? 'true' : 'false',
      'data-state': stateAttr(item),
      'data-disabled': dataAttr(item.disabled),
      // 不输出 tabindex：手风琴不用 roving tabindex，每个 trigger 都是独立的
      // Tab 停靠点，交给作者的 button 保持原生行为。
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
