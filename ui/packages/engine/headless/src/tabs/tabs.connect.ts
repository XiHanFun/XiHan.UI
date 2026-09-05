import type { ItemQuery, NavIntent, NormalizeProps, PropTypes, Service } from '@xihan-ui/core'
import type { DragRect } from '../shared/drag'
import type { TabsApi, TabsNodeMeta, TabsSchema, TabsTriggerProps } from './tabs.types'
import { anchorItem, dataAttr, focusItem, isItemDisabled, ITEM_VALUE_ATTR, itemValue, navigateItems, navIntentFromKey, queryItems } from '@xihan-ui/core'
import { flatMoveCommand, flatMoveIntentFromKey } from '../shared/drag'
import { VISUALLY_HIDDEN_STYLE } from '../shared/visually-hidden'
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
  const horizontal = orientation === 'horizontal'

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

  const reorderable = !!prop('reorderable')
  const draggingTab = context.get('draggingTab') ?? null
  const dropTarget = context.get('dropTarget') ?? null
  /** 这个标签此刻是不是落点，是的话落在它的哪一侧。 */
  const dropSide = (value: string): 'before' | 'after' | undefined =>
    dropTarget?.targetValue === value && dropTarget.position !== 'inside'
      ? dropTarget.position
      : undefined

  /**
   * 量出标签此刻沿主轴的位置。横排量横轴，竖排量纵轴。
   *
   * 禁用的标签照量：它挪不动，但别人可以落在它前后——把它从快照里摘掉的话，
   * 指针划过它那一段会没有落点，指示线一闪一闪。
   */
  function measureTabs(list: HTMLElement): DragRect[] {
    const out: DragRect[] = []
    for (const el of queryItems(list, ITEM_QUERY)) {
      const value = itemValue(el)
      if (!value)
        continue
      const rect = el.getBoundingClientRect()
      out.push(horizontal
        ? { value, start: rect.left, size: rect.width }
        : { value, start: rect.top, size: rect.height })
    }
    return out
  }

  /**
   * 按在标签上。整个标签都是拖动源，没有把手。
   *
   * 触屏不认——拖动方向与页面滚动同轴时手势在按下那一刻就归了浏览器，
   * touch-action 事后改不回来。
   */
  function onTabDragStart(event: PointerEvent, item: TabsTriggerProps): void {
    // 禁用的标签不是拖动源：它自己动不了，别人仍可以落在它前后
    if (!reorderable || itemDisabled(item) || event.button !== 0 || event.pointerType === 'touch')
      return
    const value = item.value
    const el = event.currentTarget as HTMLElement | null
    const list = el?.closest<HTMLElement>(parts.list.selector)
    const session = service.refs.get('gesture')
    if (!list || !session || session.points().length > 0)
      return
    session.add({ pointerId: event.pointerId, clientX: event.clientX, clientY: event.clientY })
    send({
      type: 'TAB_DRAG.START',
      value,
      rects: measureTabs(list),
      origin: horizontal ? event.clientX : event.clientY,
      source: el,
    })
  }
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
    dropTarget,
    announcement: context.get('announcement'),
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
    /**
     * 拖动过程只说给读屏听。放在 root 里、与 list 部件平级即可——
     * root 自己不带角色，role=tablist 在 list 上，活动区域落不进它的子节点集合。
     *
     * 它必须在拖动开始之前就在 DOM 上——读屏不播报后插入的节点。
     */
    getTabDragTriggerProps: (item) => {
      const draggable = reorderable && !itemDisabled(item)
      return normalize.element({
        ...parts['tab-drag-trigger'].attrs,
        // 把手对读屏隐藏、也不占 Tab 位：键盘那一路由标签带上的 Alt + 方向键承担
        'aria-hidden': true,
        'tabindex': -1,
        'data-disabled': dataAttr(!draggable),
        'data-dragging': dataAttr(draggingTab === item.value),
        // 手势从按下那一刻就归拖动。整块起手在触屏上做不到这件事
        'style': { touchAction: draggable ? 'none' : undefined },
        'onPointerDown': (event: PointerEvent) => {
          if (!draggable || event.button !== 0)
            return
          const el = event.currentTarget as HTMLElement | null
          const list = el?.closest<HTMLElement>(parts.list.selector)
          const session = service.refs.get('gesture')
          if (!list || !session || session.points().length > 0)
            return
          session.add({ pointerId: event.pointerId, clientX: event.clientX, clientY: event.clientY })
          event.preventDefault()
          send({
            type: 'TAB_DRAG.START',
            value: item.value,
            rects: measureTabs(list),
            origin: horizontal ? event.clientX : event.clientY,
            // 拖动源取把手所属的那个标签：把手跟着它一起挪
            source: el?.closest<HTMLElement>(parts.trigger.selector) ?? null,
            // 把手是专门的拖动入口，意图无歧义：按下即拖，不等激活距离
            activate: true,
          })
        },
      })
    },

    getLiveRegionProps: () => normalize.element({
      ...parts['live-region'].attrs,
      'role': 'status',
      'aria-live': 'polite',
      'aria-atomic': 'true',
      'style': VISUALLY_HIDDEN_STYLE,
    }),

    getListProps: () => normalize.element({
      ...parts.list.attrs,
      'role': 'tablist',
      'aria-orientation': orientation,
      // 焦点在组外时容器兜底进 Tab 序列，由 onFocus 转投给条目。
      // 判据用 focusedValue 而非 anchor：anchor 可能指向已不存在的值，那时无人认领 tabindex=0。
      // 焦点已在组内时容器让位（-1），Tab 才能正常离开本组。
      'tabindex': focusedValue == null ? 0 : -1,
      'onKeydown': (event: KeyboardEvent) => {
        // Alt + 主轴方向键换位。一按就是一次完整提交，不进拖动态——
        // 裸方向键是导航、Enter/Space 是确认，模态拾起在这条标签带上无处落脚
        if (event.altKey && !event.ctrlKey && !event.metaKey && reorderable && focusedValue != null
          && !metaOf.get(focusedValue)?.disabled) {
          const moveIntent = flatMoveIntentFromKey(event.key, orientation, dir === 'rtl')
          if (moveIntent) {
            // Alt + 方向键在部分浏览器是前进后退，认了就得挡住
            event.preventDefault()
            const target = flatMoveCommand(collection.map(node => node.value), focusedValue, moveIntent)
            if (target)
              send({ type: 'TAB.MOVE_BY', value: focusedValue, target })
            return
          }
        }

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
        // 落在锚点上：组内有焦点历史就是它，否则是选中项。锚点缺席或被禁用才退回首个。
        // 落点条目自己的 onFocus 会把锚点接过去
        const items = queryItems(list, ITEM_QUERY)
        focusItem(anchorItem(items, anchor) ?? navigateItems(items, null, 'first', { loop }))
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
      'data-dragging': dataAttr(draggingTab === item.value),
      'data-drop': dropSide(item.value),
      'data-draggable': dataAttr(reorderable && !itemDisabled(item)),
      'onPointerDown': (event: PointerEvent) => onTabDragStart(event, item),
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
