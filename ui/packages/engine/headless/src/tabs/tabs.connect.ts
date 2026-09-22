/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 tabs 相关实现。

import type { ItemQuery, NavIntent, NormalizeProps, PressHandlers, PropTypes, Service } from '@xihan-ui/core'
import type { DragRect } from '../shared/drag'
import type { TabsApi, TabsNodeMeta, TabsOverflow, TabsSchema, TabsTriggerProps } from './tabs.types'
import { anchorItem, createPressTracker, dataAttr, focusItem, isItemDisabled, ITEM_VALUE_ATTR, itemValue, navigateItems, navIntentFromKey, queryItems } from '@xihan-ui/core'
import { flatMoveCommand, flatMoveIntentFromKey } from '../shared/drag'
import { VISUALLY_HIDDEN_STYLE } from '../shared/visually-hidden'
import { tabsAnatomy } from './tabs.anatomy'

const parts = tabsAnatomy.build()

// 集合容器是 list 不是 root：trigger 直属 list，按归属过滤才切得干净（嵌套 Tabs 互不吞并）
const ITEM_QUERY: ItemQuery = { scope: tabsAnatomy.name, part: 'trigger' }

/** deltaMode 按行 / 按页计量时的换算：浏览器不给像素值，按常见的行高与一页的量级估。 */
const WHEEL_LINE_PX = 16
const WHEEL_PAGE_PX = 400

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
  const closable = !!prop('closable')
  const indicator = context.get('indicator')
  // 标签带放不放得下由位移与上限推出：上限为 0 就是放得下
  const scroll = context.get('scroll')
  const scrollMax = context.get('scrollMax')
  const overflow: TabsOverflow | null = scrollMax > 0 ? { start: scroll > 0, end: scroll < scrollMax } : null
  const rtl = dir === 'rtl'

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

  // 按压通道：真源是机器 context 里「正被按住的那一个」（按 value 记），每个 trigger 各自合成一份跟踪器；
  // Space / Enter 与触屏按住投影 data-pressed，指针按住由 :active 表出，家族配方两者同一档。
  // 选中（aria-selected / data-current）与按压互相独立；条目自身的禁用只有 connect 知道，随 PRESS.START
  // 带给机器的守卫
  const pressedValue = context.get('pressedValue')
  const press = (item: TabsTriggerProps): PressHandlers => createPressTracker({
    isPressed: () => context.get('pressedValue') === item.value,
    onChange: down => send(down
      ? { type: 'PRESS.START', value: item.value, disabled: itemDisabled(item) }
      : { type: 'PRESS.END', value: item.value }),
  })

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

  // 变体不写时显式落 line：皮肤基础规则即 line 取值，root 上始终带 data-variant 供子部件与自定义皮肤判定
  const variant = prop('variant') ?? 'line'
  // 只有 line 档的页签归 Collection Item 导航当前（真源 §4.1）：card 是自成一张卡片的选中面、segment 是
  // 有滑块开关，都不投家族角色；写成布尔再取值，'line' 不会被当成语境枚举
  const nav = variant === 'line'

  return {
    value,
    dropTarget,
    announcement: context.get('announcement'),
    overflow,
    collection,
    focusedValue,
    setValue,
    // 三个视觉轴只写在 root 上，子部件靠继承私有槽消费
    getRootProps: () => normalize.element({
      ...parts.root.attrs,
      'data-orientation': orientation,
      'data-variant': variant,
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
      // 放不下时标签整体沿主轴位移：位移量写成私有槽，标签带里的孩子读它做 translate（皮肤 tabs.css）。
      // translate 是物理方向：横排 LTR 往左挪、RTL 往右挪，竖排往上挪
      'style': { '--xh-_tabs-scroll': `${horizontal && rtl ? scroll : -scroll}px` },
      // 标签带不是滚动容器（放不下时靠位移露出，皮肤只裁主轴），滚轮在这里接成位移：
      // 横排只认横向滚轮（触控板两指横划、Shift + 滚轮），竖滚轮留给页面；挪到头就把事件放行
      'onWheel': (event: WheelEvent) => {
        if (overflow == null)
          return
        const raw = horizontal ? (event.deltaX || (event.shiftKey ? event.deltaY : 0)) : event.deltaY
        if (raw === 0)
          return
        // 按行 / 按页计量的滚轮换算成像素：一行按一行字高、一页按一页可见长度的量级估
        const unit = event.deltaMode === 1 ? WHEEL_LINE_PX : event.deltaMode === 2 ? WHEEL_PAGE_PX : 1
        // 横排 RTL 下往左滚是朝结束端，逻辑方向翻过来
        const delta = raw * unit * (horizontal && rtl ? -1 : 1)
        if ((delta > 0 && !overflow.end) || (delta < 0 && !overflow.start))
          return
        event.preventDefault()
        send({ type: 'SCROLL.BY', delta })
      },
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
        // 可关闭时 Delete / Backspace 关掉焦点所在那一条，只发意图不改标签序
        if (closable && (event.key === 'Delete' || event.key === 'Backspace') && focusedValue != null
          && !metaOf.get(focusedValue)?.disabled) {
          event.preventDefault()
          send({
            type: 'TAB.CLOSE',
            value: focusedValue,
            values: collection.map(node => node.value).filter(v => v !== focusedValue),
          })
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
    getTriggerProps: (item) => {
      const handlers = press(item)
      return normalize.button({
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
        // 导航当前页由家族按 data-current 给面与字；activation 族 data-state 与 aria-selected 保留给 content 与
        // card / segment 皮肤
        'data-current': dataAttr(item.value === value),
        'data-xh-collection-item': dataAttr(nav),
        'data-xh-collection-size': nav ? (prop('size') ?? 'md') : undefined,
        'data-xh-collection-context': nav ? 'nav' : undefined,
        'data-disabled': dataAttr(itemDisabled(item)),
        'data-dragging': dataAttr(draggingTab === item.value),
        'data-drop': dropSide(item.value),
        'data-draggable': dataAttr(reorderable && !itemDisabled(item)),
        'data-closable': dataAttr(closable && !itemDisabled(item)),
        // Space / Enter 与触屏按住投影 data-pressed，家族的按下面同时认它与指针 :active；与选中互相独立
        'data-pressed': dataAttr(pressedValue === item.value),
        // 同一个 pointerdown 先过跟踪器再判拖动起手：触屏归按压（拖动不认触屏），鼠标归拖动（按压不认鼠标）
        'onPointerDown': (event: PointerEvent) => {
          handlers.onPointerDown(event)
          onTabDragStart(event, item)
        },
        'onPointerUp': handlers.onPointerUp,
        'onPointerCancel': handlers.onPointerCancel,
        // 确认键本身仍在 list 上收口，trigger 只记按住的那一帧
        'onKeyDown': handlers.onKeyDown,
        'onKeyUp': handlers.onKeyUp,
        'onBlur': handlers.onBlur,
        'onClick': () => {
          if (!itemDisabled(item))
            send({ type: 'TRIGGER.SELECT', value: item.value })
        },
        'onFocus': () => send({ type: 'TRIGGER.FOCUS', value: item.value }),
      })
    },
    // 选中标签的四个几何量由机器量好写成私有槽（它量得到，样式表量不到）：
    // line 档只取主轴那两支画一条线，segment 档四支都取、整块抬起面跟着滑；
    // 交叉轴的贴边、粗细与长什么样归皮肤
    getIndicatorProps: () => normalize.element({
      ...parts.indicator.attrs,
      'aria-hidden': true,
      'data-orientation': orientation,
      // 部件自带形态：line 档是一条线、segment 档是整块抬起面，皮肤按它换身份，不必回溯到 root
      'data-variant': variant,
      'data-value': value ?? undefined,
      'hidden': indicator == null || undefined,
      'style': indicator
        ? {
            '--xh-_tabs-indicator-x': `${indicator.inlineStart}px`,
            '--xh-_tabs-indicator-y': `${indicator.blockStart}px`,
            '--xh-_tabs-indicator-w': `${indicator.inlineSize}px`,
            '--xh-_tabs-indicator-h': `${indicator.blockSize}px`,
          }
        : undefined,
    }),

    // 标签之间的细线纯装饰
    getSeparatorProps: () => normalize.element({
      ...parts.separator.attrs,
      'aria-hidden': true,
      'data-orientation': orientation,
    }),

    // 翻页钮：只在放不下时露面，挪到头的那一侧禁用（皮肤把禁用的那一只收起，别盖住边上的标签）。
    // 鼠标专用的辅助入口——不占 Tab 位、对读屏隐藏：键盘用户用方向键在标签间移动，焦点落到被裁掉的标签上时
    // 标签带自己挪过去，tablist 里也不该多出两个非 tab 的可达节点。贴在标签带两端（皮肤绝对定位），
    // 接 Action Control icon 档 ghost 面，字形由皮肤兜底
    getPrevTriggerProps: () => normalize.button({
      ...parts['prev-trigger'].attrs,
      'type': 'button',
      'tabIndex': -1,
      'aria-hidden': true,
      'hidden': overflow == null || undefined,
      'disabled': (overflow == null || !overflow.start) || undefined,
      'data-disabled': dataAttr(overflow == null || !overflow.start),
      'data-orientation': orientation,
      'data-xh-action-control': '',
      'data-xh-action-profile': 'icon',
      'data-xh-action-variant': 'ghost',
      'data-xh-action-display': 'always',
      'data-xh-action-size': prop('size') ?? 'md',
      'onClick': () => send({ type: 'SCROLL.PREV' }),
    }),

    getNextTriggerProps: () => normalize.button({
      ...parts['next-trigger'].attrs,
      'type': 'button',
      'tabIndex': -1,
      'aria-hidden': true,
      'hidden': overflow == null || undefined,
      'disabled': (overflow == null || !overflow.end) || undefined,
      'data-disabled': dataAttr(overflow == null || !overflow.end),
      'data-orientation': orientation,
      'data-xh-action-control': '',
      'data-xh-action-profile': 'icon',
      'data-xh-action-variant': 'ghost',
      'data-xh-action-display': 'always',
      'data-xh-action-size': prop('size') ?? 'md',
      'onClick': () => send({ type: 'SCROLL.NEXT' }),
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
