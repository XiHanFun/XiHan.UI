/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 navigation menu 相关实现。

import type { NavIntent, NormalizeProps, PressHandlers, PropTypes, Service } from '@xihan-ui/core'
import type { NavigationMenuApi, NavigationMenuNode, NavigationMenuNodeMeta, NavigationMenuPressedPart, NavigationMenuSchema, NavigationMenuTriggerProps } from './navigation-menu.types'
import { contains, createPressTracker, dataAttr, focusItem, ITEM_VALUE_ATTR, itemValue, navigateItems, navIntentFromKey, queryItems } from '@xihan-ui/core'
import { NAVIGATION_MENU_EN_US } from '../locale/en-US'
import { resolveTranslations } from '../shared/translations'
import { navigationMenuAnatomy, navigationMenuPartId, navigationMenuTriggerQuery } from './navigation-menu.anatomy'
import { branchTriggerHoldingFocus } from './navigation-menu.dom'

const parts = navigationMenuAnatomy.build()

/**
 * collection 推出的元信息，逐层校验，不合法的组合当场报错、不静默修正：
 * 直达链接没有下一层；面板里的条目要么是链接、要么带一枝子级；子级里只放链接、不再往下嵌套；
 * value 全树唯一——入口、面板与子级按它逐对互指，重了两处就指到同一个 id 上。
 * depth 0 是入口，1 是面板条目，2 是子级条目。
 */
function toMeta(nodes: readonly NavigationMenuNode[], depth: number, seen: Set<string>): NavigationMenuNodeMeta[] {
  return nodes.map((node) => {
    const name = JSON.stringify(node.value)
    if (seen.has(node.value))
      throw new RangeError(`[xh] navigation-menu collection 的 value ${name} 重复：入口、面板与子级按 value 逐对互指，须全树唯一`)
    seen.add(node.value)
    const children = node.children ?? []
    if (node.href != null && children.length > 0)
      throw new RangeError(`[xh] navigation-menu 条目 ${name} 同时给了 href 与 children：直达链接没有下一层`)
    if (depth === 1 && node.href == null && children.length === 0)
      throw new RangeError(`[xh] navigation-menu 面板条目 ${name} 既没有 href 也没有 children：面板里的条目要么是链接、要么带一枝子级`)
    if (depth === 2 && node.href == null)
      throw new RangeError(`[xh] navigation-menu 子级条目 ${name} 没有 href：子级只展开一层，里面的条目都是链接`)
    return {
      value: node.value,
      label: node.label ?? node.value,
      disabled: !!node.disabled,
      href: node.href,
      current: !!node.current,
      children: toMeta(children, depth + 1, seen),
    }
  })
}

export function connectNavigationMenu<T extends PropTypes>(
  service: Service<NavigationMenuSchema>,
  normalize: NormalizeProps<T>,
): NavigationMenuApi<T> {
  const { context, prop, refs, send, scope } = service
  // cell 初值可能是 undefined，这里归一成 null
  const value = context.get('value') ?? null
  const indicator = context.get('indicator')
  const indicatorStretch = context.get('indicatorStretch')
  const orientation = prop('orientation') ?? 'horizontal'
  const dir = prop('dir')
  const loop = prop('loop') ?? true
  const label = resolveTranslations(NAVIGATION_MENU_EN_US, prop('translations')).root
  const open = value != null
  const exitPending = context.get('exitPending') ?? false
  const switching = context.get('switching')
  const openedAtMount = context.get('openedAtMount')
  const branchValue = context.get('branchValue') ?? null
  // 受控 value 的新值先参与宿主渲染，机器 tracker 随后才会写 exitPending。
  // 旧 Layer 尚在即是关闭提交的第一帧；先保住 viewport，动画探测才不会被祖先 display:none 截断。
  const closingCommit = !open && refs.get('layerValue') != null && refs.get('layerDispose') != null

  // collection 推出的入口元信息：入口文本、禁用与直达去处都在这里定案，trigger / branch-trigger 部件只报 value
  const collection = toMeta(prop('collection') ?? [], 0, new Set())
  const metaOf = new Map<string, NavigationMenuNodeMeta>()
  const index = (metas: readonly NavigationMenuNodeMeta[]): void => {
    for (const meta of metas) {
      metaOf.set(meta.value, meta)
      index(meta.children)
    }
  }
  index(collection)

  const navDisabled = !!prop('disabled')

  /** 入口与子级开关的禁用：整套禁用一票通过，否则部件上写的优先，没写就回 collection 里查。 */
  const triggerDisabled = (item: NavigationMenuTriggerProps): boolean =>
    navDisabled || (item.disabled ?? metaOf.get(item.value)?.disabled ?? false)

  // 按压通道：真源是机器 context 里「正被按住的那一个」（入口与链接各按 value 记、分开认），各自合成一份
  // 跟踪器；Space / Enter 与触屏按住投影 data-pressed，指针按住由 :active 表出，家族配方两者同一档。
  // 入口自身的禁用只有 connect 知道，随 PRESS.START 带给机器的 canPress 守卫
  const pressedPart = context.get('pressedPart')
  const pressedValue = context.get('pressedValue')
  const press = (part: NavigationMenuPressedPart, value: string, disabled = false): PressHandlers => createPressTracker({
    isPressed: () => context.get('pressedPart') === part && context.get('pressedValue') === value,
    onChange: down => send(down ? { type: 'PRESS.START', part, value, disabled } : { type: 'PRESS.END', part, value }),
  })

  const triggerId = (target: string): string => navigationMenuPartId(scope, 'trigger', target)
  const contentId = (target: string): string => navigationMenuPartId(scope, 'content', target)
  const branchTriggerId = (target: string): string => navigationMenuPartId(scope, 'branch-trigger', target)
  const branchContentId = (target: string): string => navigationMenuPartId(scope, 'branch-content', target)
  const stateAttr = (isOpen: boolean): 'open' | 'closed' => (isOpen ? 'open' : 'closed')

  /** 在同组 trigger 之间走一步，集合现查不缓存。 */
  const navigate = (trigger: HTMLElement, from: string, intent: NavIntent): void => {
    const list = trigger.closest<HTMLElement>(parts.list.selector)
    focusItem(navigateItems(queryItems(list, navigationMenuTriggerQuery), from, intent, { loop }))
  }

  return {
    value,
    collection,
    open,
    isOpen: target => target === value,
    branchValue,
    isBranchOpen: target => target === branchValue,
    setValue: next => send({ type: 'VALUE.SET', value: next }),

    // 根节点是 nav 地标，指针离开、焦点离场与 Escape 三条收起出口都在这里
    getRootProps: () => normalize.element({
      ...parts.root.attrs,
      'aria-label': label,
      'data-orientation': orientation,
      'data-state': stateAttr(open),
      'data-tone': prop('tone'),
      'data-size': prop('size'),
      // 仅作者显式给出时才写，避免切断从祖先继承的方向
      'dir': prop('dir'),
      'onPointerleave': (event: PointerEvent) => {
        const root = event.currentTarget as HTMLElement
        // 焦点还在导航内时指针移出不收起，交给 focusout
        if (contains(root, scope.getActiveElement()))
          return
        send({ type: 'DISMISS' })
      },
      'onFocusout': (event: FocusEvent) => {
        const root = event.currentTarget as HTMLElement
        const related = event.relatedTarget as Node | null
        // 焦点在导航内部换落点不算离场
        if (related && root.contains(related))
          return
        send({ type: 'DISMISS' })
      },
      // 层在场时 Escape 由消解层按层栈仲裁（机器的 syncLayer）；这一条是没有 DOM 环境、层没入栈时的兜底，
      // 覆盖焦点在子级里、在面板内或仍在 trigger 上三种情形。层在场时这里不再动：冒泡上来的同一下
      // 再处理一遍，会越过刚收起的子级把整张面板也收掉
      'onKeydown': (event: KeyboardEvent) => {
        if (event.key !== 'Escape' || value == null || refs.get('layerDispose') != null)
          return
        // 焦点在展开的子级里：只收这一枝、焦点还给它的开关，面板仍开着
        const branchTrigger = branchTriggerHoldingFocus(scope, context.get('branchValue') ?? null)
        if (branchTrigger) {
          send({ type: 'BRANCH.DISMISS' })
          focusItem(branchTrigger)
          return
        }
        const root = event.currentTarget as HTMLElement
        const list = root.querySelector<HTMLElement>(parts.list.selector)
        const trigger = queryItems(list, navigationMenuTriggerQuery).find(el => itemValue(el) === value)
        send({ type: 'DISMISS' })
        // 焦点归还给刚被收起的那个 trigger
        focusItem(trigger ?? null)
      },
    }),

    // list 须是 ul，轴向只用 data-orientation 表达
    getListProps: () => normalize.element({
      ...parts.list.attrs,
      'data-orientation': orientation,
    }),

    getItemProps: () => normalize.element({
      ...parts.item.attrs,
    }),

    /** 键盘处理挂在 trigger 上，而非 list。 */
    getTriggerProps: (item) => {
      const isOpen = item.value === value
      const disabled = triggerDisabled(item)
      const handlers = press('trigger', item.value, disabled)
      return normalize.button({
        ...parts.trigger.attrs,
        [ITEM_VALUE_ATTR]: item.value,
        'id': triggerId(item.value),
        'type': 'button',
        'aria-expanded': isOpen ? 'true' : 'false',
        'aria-controls': contentId(item.value),
        // 用 aria-disabled 而非原生 disabled，禁用项仍可聚焦、仍留在方向键行程里
        'aria-disabled': disabled ? 'true' : 'false',
        'data-state': stateAttr(isOpen),
        'data-orientation': orientation,
        'data-disabled': dataAttr(disabled),
        // 入口归 Collection Item 展开路径 / 打开中：面、字色、字重、光标与按压时间线由家族按 nav
        // 语境给；展开着的那一张投影 data-in-path（与 menubar 同法），家族按它给与 hover 同档的中性面。
        // data-state open / closed 仍保留给箭头、positioner 与 viewport
        'data-xh-collection-item': '',
        'data-xh-collection-size': prop('size') ?? 'md',
        'data-xh-collection-context': 'nav',
        'data-in-path': dataAttr(isOpen),
        // Space / Enter 与触屏按住投影 data-pressed，家族的按下面同时认它与指针 :active
        'data-pressed': dataAttr(pressedPart === 'trigger' && pressedValue === item.value),
        // 不做 roving tabindex，每个 trigger 都留在 Tab 序列里
        'onPointerDown': handlers.onPointerDown,
        'onPointerUp': handlers.onPointerUp,
        'onPointerCancel': handlers.onPointerCancel,
        'onKeyUp': handlers.onKeyUp,
        'onBlur': handlers.onBlur,
        'onPointerenter': () => {
          if (!disabled)
            send({ type: 'TRIGGER.POINTER', value: item.value })
        },
        'onFocus': () => {
          if (!disabled)
            send({ type: 'TRIGGER.FOCUS', value: item.value })
        },
        'onClick': () => {
          if (!disabled)
            send({ type: 'TRIGGER.TOGGLE', value: item.value })
        },
        // 同一个 keydown 先过跟踪器再走导航：React 把 onKeydown 与 onKeyDown 归成同一个合成事件，两个键会互相覆盖
        'onKeydown': (event: KeyboardEvent) => {
          handlers.onKeyDown(event)
          if (disabled)
            return
          // 轴跟随 orientation，异轴按键不拦默认行为
          const intent = navIntentFromKey(event, { axis: orientation, dir })
          if (intent) {
            event.preventDefault()
            navigate(event.currentTarget as HTMLElement, item.value, intent)
            return
          }
          // 吞掉 Enter/Space，避免按钮默认行为再合成一次 click
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault()
            // 按住不放会连发 keydown，这是开合切换：重复执行会来回翻转；按压面由跟踪器在首次 keydown 记下
            if (event.repeat)
              return
            send({ type: 'TRIGGER.TOGGLE', value: item.value })
          }
        },
      })
    },

    // 入口里的方向标记是纯装饰，开合状态由 trigger 的 aria-expanded 念出来
    getTriggerIndicatorProps: item => normalize.element({
      ...parts['trigger-indicator'].attrs,
      'aria-hidden': true,
      'data-state': stateAttr(item.value === value),
      'data-orientation': orientation,
      'data-disabled': dataAttr(triggerDisabled(item)),
    }),

    /** 面板常挂；逻辑关闭立即交给 Presence 退场，并退出交互与可访问树。 */
    getContentProps: (item) => {
      const isOpen = item.value === value
      return normalize.element({
        ...parts.content.attrs,
        'id': contentId(item.value),
        // 有 role 才能让 aria-labelledby 生效
        'role': 'group',
        'aria-labelledby': triggerId(item.value),
        'data-state': stateAttr(isOpen),
        // 换张时两侧都不播进退场，瞬时换张；挂载时就展开着的那一项直接呈现。首开与末收照常播
        'data-instant': dataAttr(switching || (isOpen && openedAtMount)),
        'data-orientation': orientation,
        'inert': !isOpen || undefined,
        'aria-hidden': !isOpen || undefined,
        'hidden': !isOpen || undefined,
      })
    },

    /**
     * 面板里一枝子级的开关：原生按钮，aria-expanded / aria-controls 指向紧跟其后的子级容器（APG 的
     * disclosure 导航：子级是面板里再展开一层的链接列表，Tab 顺着文档序走进去）。行归 Collection Item
     * 导航当前（nav 语境），与面板里的链接同一种行：悬停 / 键盘聚焦 / 按下面由家族给；展开不换面、不算
     * 打开中，由行尾转向的箭头与下面展开的子级说明
     */
    getBranchTriggerProps: (item) => {
      const isOpen = item.value === branchValue
      const disabled = triggerDisabled(item)
      const handlers = press('branch-trigger', item.value, disabled)
      return normalize.button({
        ...parts['branch-trigger'].attrs,
        [ITEM_VALUE_ATTR]: item.value,
        'id': branchTriggerId(item.value),
        'type': 'button',
        'aria-expanded': isOpen ? 'true' : 'false',
        'aria-controls': branchContentId(item.value),
        // 与入口同一取法：aria-disabled 而非原生 disabled，禁用的开关仍留在 Tab 序列里、仍念得出来
        'aria-disabled': disabled ? 'true' : 'false',
        'data-state': stateAttr(isOpen),
        'data-disabled': dataAttr(disabled),
        'data-xh-collection-item': '',
        'data-xh-collection-size': prop('size') ?? 'md',
        'data-xh-collection-context': 'nav',
        // Space / Enter 与触屏按住投影 data-pressed，家族的按下面同时认它与指针 :active
        'data-pressed': dataAttr(pressedPart === 'branch-trigger' && pressedValue === item.value),
        'onPointerDown': handlers.onPointerDown,
        'onPointerUp': handlers.onPointerUp,
        'onPointerCancel': handlers.onPointerCancel,
        'onKeyUp': handlers.onKeyUp,
        'onBlur': handlers.onBlur,
        'onClick': () => {
          if (!disabled)
            send({ type: 'BRANCH.TOGGLE', value: item.value })
        },
        // 同一个 keydown 先过跟踪器再开合：React 把 onKeydown 与 onKeyDown 归成同一个合成事件，两个键会互相覆盖
        'onKeydown': (event: KeyboardEvent) => {
          handlers.onKeyDown(event)
          if (disabled || (event.key !== 'Enter' && event.key !== ' '))
            return
          // 吞掉按钮的默认激活，开合只走这一处；按住不放会连发 keydown，这是开合切换，重复执行会来回翻转
          event.preventDefault()
          if (!event.repeat)
            send({ type: 'BRANCH.TOGGLE', value: item.value })
        },
      })
    },

    // 开关里的展开方向标记是纯装饰，开合由开关的 aria-expanded 念出来
    getBranchIndicatorProps: item => normalize.element({
      ...parts['branch-indicator'].attrs,
      'aria-hidden': true,
      'data-state': stateAttr(item.value === branchValue),
    }),

    // 子级容器紧跟在开关之后，收着时 hidden：整段跳出 Tab 序列与可访问树。
    // 密集披露，不动高度，刻意瞬时；只有开关里的箭头转向
    getBranchContentProps: (item) => {
      const isOpen = item.value === branchValue
      return normalize.element({
        ...parts['branch-content'].attrs,
        'id': branchContentId(item.value),
        // 有 role 才能让 aria-labelledby 生效
        'role': 'group',
        'aria-labelledby': branchTriggerId(item.value),
        'data-state': stateAttr(isOpen),
        'hidden': !isOpen || undefined,
      })
    },

    // 面板里的链接不拦默认行为，只把导航收起。
    // 链接归 Collection Item 导航当前：走 nav 语境，悬停 / 键盘高亮 / 按下面与当前页的
    // 字色字重（data-current：透明面 + brand-strong + medium）都由家族给；nav 不读 aria-selected
    getLinkProps: (link) => {
      const handlers = press('link', link.value)
      return normalize.element({
        ...parts.link.attrs,
        'data-xh-collection-item': '',
        'data-xh-collection-size': prop('size') ?? 'md',
        'data-xh-collection-context': 'nav',
        // 非当前项省略 aria-current，不写 "false"
        'aria-current': link.current ? 'page' : undefined,
        'data-current': dataAttr(link.current),
        // Space / Enter 与触屏按住投影 data-pressed，家族的按下面同时认它与指针 :active；
        // 按住 Enter 激活后面板收起，链接藏进 inert 的面板里不会再来 keyup，由机器随 value 变化撤下
        'data-pressed': dataAttr(pressedPart === 'link' && pressedValue === link.value),
        'onClick': () => send({ type: 'DISMISS' }),
        'onKeyDown': handlers.onKeyDown,
        'onKeyUp': handlers.onKeyUp,
        'onBlur': handlers.onBlur,
        'onPointerDown': handlers.onPointerDown,
        'onPointerUp': handlers.onPointerUp,
        'onPointerCancel': handlers.onPointerCancel,
      })
    },

    // 指示条是纯装饰
    getIndicatorProps: () => normalize.element({
      ...parts.indicator.attrs,
      'aria-hidden': true,
      // 首次落位与同一项的重量直接到位：皮肤在它身上撤掉几何过渡，只有换项才滑
      'data-instant': dataAttr(context.get('indicatorInstant')),
      'data-state': stateAttr(open),
      'data-orientation': orientation,
      'data-value': value ?? undefined,
      'hidden': indicator == null || undefined,
      // 量测结果铺成四个私有槽，皮肤按排布取主轴那两支，交叉轴交给样式层
      'style': indicator
        ? {
            '--xh-_navigation-menu-indicator-x': `${indicator.inlineStart}px`,
            '--xh-_navigation-menu-indicator-y': `${indicator.blockStart}px`,
            '--xh-_navigation-menu-indicator-w': `${indicator.inlineSize}px`,
            '--xh-_navigation-menu-indicator-h': `${indicator.blockSize}px`,
            // 液态档下两沿走弹簧时被拉长的比例，皮肤据它压扁；标准档恒为 0
            '--xh-_navigation-menu-indicator-stretch': String(indicatorStretch),
          }
        : undefined,
    }),

    // 可选的共享面板外壳：退场期间保留渲染，但逻辑关闭即撤出交互与可访问树
    getViewportProps: () => normalize.element({
      ...parts.viewport.attrs,
      'data-state': stateAttr(open),
      // 外壳承担首开与末收的进退场；挂载时就展开着的那一段直接呈现
      'data-instant': dataAttr(open && openedAtMount),
      'data-orientation': orientation,
      'inert': !open || undefined,
      'aria-hidden': !open || undefined,
      'hidden': !(open || exitPending || closingCommit) || undefined,
    }),
  }
}
