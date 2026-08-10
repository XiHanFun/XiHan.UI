import type { ItemQuery, NavIntent } from '@xihan-ui/behavior'
import type { NormalizeProps, PropTypes } from '@xihan-ui/kernel'
import type { Service } from '@xihan-ui/machine'
import type { TabsApi, TabsNodeMeta, TabsSchema, TabsTriggerProps } from './tabs.types'
import { focusItem, isItemDisabled, ITEM_VALUE_ATTR, itemValue, navigateItems, navIntentFromKey, queryItems } from '@xihan-ui/behavior'
import { dataAttr } from '@xihan-ui/kernel'
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
  const dir = prop('dir')
  const loop = prop('loop') ?? true

  // collection 推出的条目元信息：标签文本与禁用都在这里定案，trigger 部件只报 value
  const collection: TabsNodeMeta[] = (prop('collection') ?? []).map(node => ({
    value: node.value,
    label: node.label ?? node.value,
    disabled: !!node.disabled,
  }))
  const metaOf = new Map(collection.map(meta => [meta.value, meta]))

  /** 条目禁用：部件上写的优先，没写就回 collection 里查。 */
  const itemDisabled = (item: TabsTriggerProps): boolean =>
    item.disabled ?? metaOf.get(item.value)?.disabled ?? false

  const triggerId = (target: string): string => scope.partId(tabsAnatomy.name, `trigger:${target}`)
  const contentId = (target: string): string => scope.partId(tabsAnatomy.name, `content:${target}`)
  const stateAttr = (target: string): 'active' | 'inactive' => (target === value ? 'active' : 'inactive')

  const setValue = (next: string | null): void => {
    send({ type: 'VALUE.SET', value: next })
  }

  /** 方向键落点：条目集合只在事件那一刻读活 DOM，顺序即文档序；起点用锚点。 */
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
    collection,
    focusedValue,
    setValue,
    // 三个视觉轴只写在 root 上，子部件靠继承私有槽消费
    getRootProps: () => normalize.element({
      ...parts.root.attrs,
      'data-orientation': orientation,
      'data-variant': prop('variant'),
      'data-tone': prop('tone'),
      'data-size': prop('size'),
    }),
    // 键盘全在 list 上收口：条目只管声明自己，一次冒泡一个处理器
    getListProps: () => normalize.element({
      ...parts.list.attrs,
      'role': 'tablist',
      'aria-orientation': orientation,
      // 焦点在组外时容器兜底进 Tab 序列，由 onFocus 转投给条目。
      // 判据用 focusedValue 而非 anchor：anchor 可能指向已不存在的值，那时无人认领 tabindex=0。
      // 焦点已在组内时容器让位（-1），Tab 才能正常离开本组。
      'tabindex': focusedValue == null ? 0 : -1,
      'onKeydown': (event: KeyboardEvent) => {
        // 轴跟随 orientation；不归导航管的键绝不 preventDefault。dir 只作用于水平轴
        const intent = navIntentFromKey(event, { axis: orientation, dir })
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
      // 集合条目一律 aria-disabled，不用原生 disabled：原生 disabled 不可聚焦、不派 click
      'aria-disabled': itemDisabled(item) ? 'true' : 'false',
      // roving tabindex：整组只有锚点条目留在 Tab 序列内
      'tabindex': anchor === item.value ? 0 : -1,
      'data-state': stateAttr(item.value),
      'data-disabled': dataAttr(itemDisabled(item)),
      'onClick': () => {
        if (!itemDisabled(item))
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
  }
}
