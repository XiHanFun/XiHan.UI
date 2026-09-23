/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 navigation menu 相关实现。

import type { NavIntent, NormalizeProps, PressHandlers, PropTypes, Service } from '@xihan-ui/core'
import type { NavigationMenuApi, NavigationMenuNodeMeta, NavigationMenuPressedPart, NavigationMenuSchema, NavigationMenuTriggerProps } from './navigation-menu.types'
import { contains, createPressTracker, dataAttr, focusItem, ITEM_VALUE_ATTR, itemValue, navigateItems, navIntentFromKey, queryItems } from '@xihan-ui/core'
import { navigationMenuAnatomy, navigationMenuTriggerQuery } from './navigation-menu.anatomy'

const parts = navigationMenuAnatomy.build()

export function connectNavigationMenu<T extends PropTypes>(
  service: Service<NavigationMenuSchema>,
  normalize: NormalizeProps<T>,
): NavigationMenuApi<T> {
  const { context, prop, refs, send, scope } = service
  // cell 初值可能是 undefined，这里归一成 null
  const value = context.get('value') ?? null
  const indicator = context.get('indicator')
  const orientation = prop('orientation') ?? 'horizontal'
  const dir = prop('dir')
  const loop = prop('loop') ?? true
  const label = prop('translations')?.root ?? 'Main navigation'
  const open = value != null
  const exitPending = context.get('exitPending') ?? false
  // 受控 value 的新值先参与宿主渲染，机器 tracker 随后才会写 exitPending。
  // 旧 Layer 尚在即是关闭提交的第一帧；先保住 viewport，动画探测才不会被祖先 display:none 截断。
  const closingCommit = !open && refs.get('layerValue') != null && refs.get('layerDispose') != null

  // collection 推出的入口元信息：入口文本、禁用与直达去处都在这里定案，trigger 部件只报 value
  const collection: NavigationMenuNodeMeta[] = (prop('collection') ?? []).map(node => ({
    value: node.value,
    label: node.label ?? node.value,
    disabled: !!node.disabled,
    href: node.href,
    current: !!node.current,
  }))
  const metaOf = new Map(collection.map(meta => [meta.value, meta]))

  const navDisabled = !!prop('disabled')

  /** 入口禁用：整套禁用一票通过，否则部件上写的优先，没写就回 collection 里查。 */
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

  const triggerId = (target: string): string => scope.partId(navigationMenuAnatomy.name, `trigger:${target}`)
  const contentId = (target: string): string => scope.partId(navigationMenuAnatomy.name, `content:${target}`)
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
      // 层在场时 Escape 由消解层按层栈仲裁；这一条是没有 DOM 环境时的兜底，
      // 覆盖焦点在面板内或仍在 trigger 上两种情形
      'onKeydown': (event: KeyboardEvent) => {
        if (event.key !== 'Escape' || value == null)
          return
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
        'data-orientation': orientation,
        'inert': !isOpen || undefined,
        'aria-hidden': !isOpen || undefined,
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
      'data-state': stateAttr(open),
      'data-orientation': orientation,
      'data-value': value ?? undefined,
      'hidden': indicator == null || undefined,
      // 只写主轴那一条，交叉轴交给样式层
      'style': indicator
        ? (orientation === 'vertical'
            ? { insetBlockStart: `${indicator.blockStart}px`, blockSize: `${indicator.blockSize}px` }
            : { insetInlineStart: `${indicator.inlineStart}px`, inlineSize: `${indicator.inlineSize}px` })
        : undefined,
    }),

    // 可选的共享面板外壳：退场期间保留渲染，但逻辑关闭即撤出交互与可访问树
    getViewportProps: () => normalize.element({
      ...parts.viewport.attrs,
      'data-state': stateAttr(open),
      'data-orientation': orientation,
      'inert': !open || undefined,
      'aria-hidden': !open || undefined,
      'hidden': !(open || exitPending || closingCommit) || undefined,
    }),
  }
}
