import type { ItemQuery } from '@xihan-ui/behavior'
import type { NormalizeProps, PropTypes } from '@xihan-ui/core'
import type { Service } from '@xihan-ui/machine'
import type { AccordionApi, AccordionItemProps, AccordionSchema } from './accordion.types'
import { focusItem, ITEM_VALUE_ATTR, navigateItems, navIntentFromKey, queryItems } from '@xihan-ui/behavior'
import { dataAttr } from '@xihan-ui/core'
import { accordionAnatomy } from './accordion.anatomy'

const parts = accordionAnatomy.build()

const ITEM_QUERY: ItemQuery = { scope: accordionAnatomy.name, part: 'item' }

/**
 * 取同一台手风琴内全部 trigger，文档序。**只在事件处理器里调用**：
 * 那一刻两个适配器看到的是同一份活 DOM，顺序天然一致，也无需记账。
 *
 * 查 item 而不是直接查 trigger：trigger 最近的 data-scope 祖先是 header，
 * 按归属过滤会把集合切成每组一个；item 直属 root，归属判断才成立。
 */
function collectTriggers(root: HTMLElement | null): HTMLElement[] {
  const out: HTMLElement[] = []
  for (const item of queryItems(root, ITEM_QUERY)) {
    const trigger = item.querySelector<HTMLElement>(parts.trigger.selector)
    // 嵌套手风琴：只认归属本条目的 trigger
    if (trigger && trigger.closest(parts.item.selector) === item)
      out.push(trigger)
  }
  return out
}

export function connectAccordion<T extends PropTypes>(
  service: Service<AccordionSchema>,
  normalize: NormalizeProps<T>,
): AccordionApi<T> {
  const { context, prop, send, scope } = service
  const value = context.get('value')
  const orientation = prop('orientation') ?? 'vertical'

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
    const intent = navIntentFromKey(event, { axis: orientation })
    // null = 这个键不归导航管，必须放行给页面滚动与读屏，绝不能 preventDefault
    if (!intent)
      return
    event.preventDefault()
    const root = (event.currentTarget as HTMLElement).closest<HTMLElement>(parts.root.selector)
    // loop 默认 false：首尾不回绕；禁用条目按集合默认策略跳过
    focusItem(navigateItems(collectTriggers(root), item.value, intent, { loop: false }))
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
