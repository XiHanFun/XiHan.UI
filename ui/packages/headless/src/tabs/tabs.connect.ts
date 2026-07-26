import type { ItemQuery, NavIntent } from '@xihan-ui/behavior'
import type { NormalizeProps, PropTypes } from '@xihan-ui/core'
import type { Service } from '@xihan-ui/machine'
import type { TabsApi, TabsSchema } from './tabs.types'
import { focusItem, isItemDisabled, ITEM_VALUE_ATTR, itemValue, navigateItems, navIntentFromKey, queryItems } from '@xihan-ui/behavior'
import { dataAttr } from '@xihan-ui/core'
import { tabsAnatomy } from './tabs.anatomy'

const parts = tabsAnatomy.build()

// 集合容器是 list 不是 root：trigger 直属 list，按归属过滤才切得干净（嵌套 Tabs 互不吞并）
const ITEM_QUERY: ItemQuery = { scope: tabsAnatomy.name, part: 'trigger' }

export function connectTabs<T extends PropTypes>(
  service: Service<TabsSchema>,
  normalize: NormalizeProps<T>,
): TabsApi<T> {
  const { context, prop, send, scope } = service
  // value 与 defaultValue 皆缺省时 cell 初值是 undefined，这里归一成 null
  const value = context.get('value') ?? null
  const focusedValue = context.get('focusedValue') ?? null
  // roving tabindex 的唯一锚点：焦点在组内时跟着焦点光标走，否则落在选中项
  const anchor = focusedValue ?? value
  const orientation = prop('orientation') ?? 'horizontal'
  const loop = prop('loop') ?? true

  const triggerId = (target: string): string => scope.partId(tabsAnatomy.name, `trigger:${target}`)
  const contentId = (target: string): string => scope.partId(tabsAnatomy.name, `content:${target}`)
  const stateAttr = (target: string): 'active' | 'inactive' => (target === value ? 'active' : 'inactive')

  const setValue = (next: string): void => {
    send({ type: 'VALUE.SET', value: next })
  }

  /**
   * 方向键落点：条目集合只在事件那一刻读，两个适配器此时看到的是同一份活 DOM，
   * 顺序即文档序。起点用锚点（作者声明的 value），终点用活 DOM 算。
   */
  const navigate = (list: HTMLElement, intent: NavIntent): void => {
    const target = navigateItems(queryItems(list, ITEM_QUERY), anchor, intent, { loop })
    const next = itemValue(target)
    if (next == null)
      return
    focusItem(target)
    send({ type: 'TRIGGER.NAVIGATE', value: next })
  }

  /** 确认键：认焦点当下所在的 trigger，自报禁用的条目不认。 */
  const activate = (event: KeyboardEvent): void => {
    const trigger = (event.target as HTMLElement).closest<HTMLElement>(parts.trigger.selector)
    const next = itemValue(trigger)
    if (!trigger || next == null || isItemDisabled(trigger))
      return
    event.preventDefault()
    send({ type: 'TRIGGER.SELECT', value: next })
  }

  return {
    value,
    focusedValue,
    setValue,
    getRootProps: () => normalize.element({
      ...parts.root.attrs,
      'data-orientation': orientation,
    }),
    // 键盘全在 list 上收口：条目只管声明自己，一次冒泡一个处理器
    getListProps: () => normalize.element({
      ...parts.list.attrs,
      'role': 'tablist',
      'aria-orientation': orientation,
      // 焦点在组外时容器一律兜底进 Tab 序列，由 onFocus 转投给条目。
      // 判据用 focusedValue 而非 anchor：anchor 可能指向一个已不存在的值
      // （受控值不在选项里、或 tab 被关掉），那时没有任何条目会认领 tabindex=0，
      // 若容器也退出 Tab 序列，整组对键盘用户永久不可达（panel 此时也全是 hidden）。
      // 焦点已在组内时容器让位（-1），Tab 才能正常离开本组。
      'tabindex': focusedValue == null ? 0 : -1,
      'onKeydown': (event: KeyboardEvent) => {
        // 轴跟随 orientation：横向 tablist 里的上下键返回 null，
        // 不归导航管就绝不 preventDefault，放行给页面滚动与读屏
        const intent = navIntentFromKey(event, { axis: orientation })
        if (intent) {
          event.preventDefault()
          navigate(event.currentTarget as HTMLElement, intent)
          return
        }
        // manual 模式的确认键；automatic 下焦点已带着选中一起走，这里是幂等的
        if (event.key === 'Enter' || event.key === ' ')
          activate(event)
      },
      'onFocus': (event: FocusEvent) => {
        const list = event.currentTarget as HTMLElement
        const related = event.relatedTarget as Node | null
        // 只有从组外进入才转投；组内往外退（Shift+Tab）时转投会把人困在组里
        if (related && list.contains(related))
          return
        // 落点条目自己的 onFocus 会把锚点接过去
        focusItem(navigateItems(queryItems(list, ITEM_QUERY), anchor, 'first', { loop }))
      },
      'onFocusout': (event: FocusEvent) => {
        const list = event.currentTarget as HTMLElement
        const related = event.relatedTarget as Node | null
        if (related && list.contains(related))
          return
        send({ type: 'LIST.BLUR' })
      },
    }),
    getTriggerProps: item => normalize.button({
      ...parts.trigger.attrs,
      [ITEM_VALUE_ATTR]: item.value,
      'id': triggerId(item.value),
      'type': 'button',
      'role': 'tab',
      'aria-selected': item.value === value ? 'true' : 'false',
      'aria-controls': contentId(item.value),
      // 集合条目一律 aria-disabled，绝不输出原生 disabled：原生 disabled 不可聚焦、
      // 也不派发 click，禁用策略与样式会就此分裂。与 Switch/Checkbox 相反——
      // 那两个是单体控件，用原生 disabled。
      'aria-disabled': item.disabled ? 'true' : 'false',
      // roving tabindex：整组只有锚点条目留在 Tab 序列内
      'tabindex': anchor === item.value ? 0 : -1,
      'data-state': stateAttr(item.value),
      'data-disabled': dataAttr(item.disabled),
      'onClick': () => {
        if (!item.disabled)
          send({ type: 'TRIGGER.SELECT', value: item.value })
      },
      'onFocus': () => send({ type: 'TRIGGER.FOCUS', value: item.value }),
    }),
    // 全部 panel 常挂，靠 hidden 显隐：不做懒挂载，panel 内的滚动位置与表单态才留得住
    getContentProps: item => normalize.element({
      ...parts.content.attrs,
      'id': contentId(item.value),
      'role': 'tabpanel',
      'aria-labelledby': triggerId(item.value),
      'tabindex': 0,
      'hidden': item.value !== value || undefined,
      'data-state': stateAttr(item.value),
    }),
    getIndicatorProps: () => normalize.element({
      ...parts.indicator.attrs,
      'aria-hidden': 'true',
      'data-orientation': orientation,
    }),
  }
}
