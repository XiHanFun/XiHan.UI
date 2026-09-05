import type { NavIntent, NormalizeProps, PropTypes, Service } from '@xihan-ui/core'
import type { NavigationMenuApi, NavigationMenuNodeMeta, NavigationMenuSchema, NavigationMenuTriggerProps } from './navigation-menu.types'
import { contains, dataAttr, focusItem, ITEM_VALUE_ATTR, itemValue, navigateItems, navIntentFromKey, queryItems } from '@xihan-ui/core'
import { navigationMenuAnatomy, navigationMenuTriggerQuery } from './navigation-menu.anatomy'

const parts = navigationMenuAnatomy.build()

export function connectNavigationMenu<T extends PropTypes>(
  service: Service<NavigationMenuSchema>,
  normalize: NormalizeProps<T>,
): NavigationMenuApi<T> {
  const { context, prop, send, scope } = service
  // cell 初值可能是 undefined，这里归一成 null
  const value = context.get('value') ?? null
  const indicator = context.get('indicator')
  const orientation = prop('orientation') ?? 'horizontal'
  const dir = prop('dir')
  const loop = prop('loop') ?? true
  const label = prop('translations')?.root ?? 'Main navigation'
  const open = value != null

  // collection 推出的入口元信息：入口文本、禁用与直达去处都在这里定案，trigger 部件只报 value
  const collection: NavigationMenuNodeMeta[] = (prop('collection') ?? []).map(node => ({
    value: node.value,
    label: node.label ?? node.value,
    disabled: !!node.disabled,
    href: node.href,
    current: !!node.current,
  }))
  const metaOf = new Map(collection.map(meta => [meta.value, meta]))

  /** 入口禁用：部件上写的优先，没写就回 collection 里查。 */
  const triggerDisabled = (item: NavigationMenuTriggerProps): boolean =>
    item.disabled ?? metaOf.get(item.value)?.disabled ?? false

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
        // 不做 roving tabindex，每个 trigger 都留在 Tab 序列里
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
        'onKeydown': (event: KeyboardEvent) => {
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
            send({ type: 'TRIGGER.TOGGLE', value: item.value })
          }
        },
      })
    },

    /** 面板常挂，靠 hidden 显隐。 */
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
        'hidden': !isOpen || undefined,
      })
    },

    // 面板里的链接不拦默认行为，只把导航收起
    getLinkProps: link => normalize.element({
      ...parts.link.attrs,
      // 非当前项省略 aria-current，不写 "false"
      'aria-current': link.current ? 'page' : undefined,
      'data-current': dataAttr(link.current),
      'onClick': () => send({ type: 'DISMISS' }),
    }),

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

    // 可选的共享面板外壳，供样式层使用，不带 aria
    getViewportProps: () => normalize.element({
      ...parts.viewport.attrs,
      'data-state': stateAttr(open),
      'data-orientation': orientation,
      'hidden': !open || undefined,
    }),
  }
}
