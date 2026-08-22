import type { NavIntent } from '@xihan-ui/behavior'
import type { NormalizeProps, PropTypes } from '@xihan-ui/kernel'
import type { Service } from '@xihan-ui/machine'
import type { SideNavApi, SideNavNode, SideNavSchema } from './side-nav.types'
import { focusItem, itemValue, navigateItems, navIntentFromKey, queryItems } from '@xihan-ui/behavior'
import { dataAttr } from '@xihan-ui/kernel'
import { overlayPositioned } from '../shared/overlay'
import { flattenTree, indexTree } from '../tree'
import { sideNavAnatomy, sideNavLinkQuery, sideNavTriggerQuery } from './side-nav.anatomy'

const parts = sideNavAnatomy.build()

// 悬停弹出的延时句柄：整页同时只有一个指针，单句柄即可
let popoutHoverTimer: ReturnType<typeof setTimeout> | undefined

// 落定那一侧的可用高度。贴边时引擎会回报 0，直接写进 min() 会把面板压成零高，
// 所以低于这个下限就当作没算出来：空串撤掉声明，退回皮肤 positioner 上那档 100vh
const AVAILABLE_H_FLOOR = 96

function availableHeightVar(available: number | undefined): Record<string, string> {
  return {
    '--xh-_side-nav-available-h':
      available != null && available >= AVAILABLE_H_FLOOR ? `${available}px` : '',
  }
}

export function connectSideNav<T extends PropTypes>(
  service: Service<SideNavSchema>,
  normalize: NormalizeProps<T>,
): SideNavApi<T> {
  const { context, prop, send, scope, state } = service
  const collection = prop('collection') ?? []
  const value = context.get('value')
  const expandedValue = context.get('expandedValue')
  const collapsed = !!prop('collapsed')
  const disabled = !!prop('disabled')
  const loop = prop('loop') ?? false
  const dir = prop('dir') ?? 'ltr'
  // 折叠态下顶层分支换装浮层弹出；collapsedPopout 关掉即回到纯图标栏。
  // 弹出与否看状态位：context 里的 popoutValue 在关闭后留给效应拆除用，不外露
  const popoutEnabled = collapsed && (prop('collapsedPopout') ?? true)
  const popoutValue = popoutEnabled && state.get() === 'popout' ? context.get('popoutValue') : null
  const popoutPosition = context.get('popoutPosition')
  /** 事件回调里现读的弹出分支；渲染期快照失效后仍然准确。 */
  const livePopout = (): string | null =>
    state.get() === 'popout' ? context.get('popoutValue') ?? null : null

  // 摊平与索引都是纯函数；折叠成图标栏时内嵌展开整体收起，可见行只剩顶层
  const rows = flattenTree(collection, collapsed ? [] : expandedValue)
  const metaIndex = indexTree(collection)
  const visible = new Map(rows.map(row => [row.value, row]))

  // 焦点锚点投影成可见的：祖先收起后的行不再认领 tabindex=0
  const rawFocused = context.get('focusedValue')
  const focusedValue = rawFocused != null && visible.has(rawFocused) ? rawFocused : null

  const metaOf = (v: string): ReturnType<typeof metaIndex.get> => metaIndex.get(v)
  const isSelected = (v: string): boolean => value === v
  const isExpanded = (v: string): boolean => !collapsed && expandedValue.includes(v)
  const isDisabled = (v: string): boolean => disabled || !!metaOf(v)?.disabled

  // 选中项的祖先链：侧栏要一直亮着「当前在哪一枝」
  const activeChain = new Set<string>()
  for (let cursor = value != null ? metaOf(value)?.parent ?? null : null; cursor != null; cursor = metaOf(cursor)?.parent ?? null)
    activeChain.add(cursor)
  const isActiveBranch = (v: string): boolean => activeChain.has(v)

  // roving tabindex 的唯一锚点：焦点在侧栏里跟焦点走，否则落在可见的选中项/首行上
  const anchor = focusedValue
    ?? (value != null && visible.has(value) ? value : null)
    ?? rows[0]?.value
    ?? null

  const translations = prop('translations')
  const rootLabel = translations?.root ?? 'Sidebar'

  // 配对 id 由 scope 派生，同页多实例不相撞
  const groupLabelId = (v: string): string => scope.partId('side-nav', `group-label-${v}`)
  const contentId = (v: string): string => scope.partId('side-nav', `content-${v}`)
  const positionerId = (v: string): string => scope.partId('side-nav', `positioner-${v}`)
  const triggerId = (v: string): string => scope.partId('side-nav', `trigger-${v}`)

  const isTopLevel = (v: string): boolean => (metaOf(v)?.parent ?? null) == null
  /** 该分支行在折叠态下是弹出面板的触发按钮。 */
  const isPopoutTrigger = (v: string): boolean => popoutEnabled && isTopLevel(v)
  /** 该子层容器在折叠态下渲染成弹出面板（顶层）；面板内的嵌套子层静态常开。 */
  const isPopoutPanel = isPopoutTrigger

  /** 面板里的行集合：分支按钮与链接按文档序混排。 */
  const panelRows = (panel: HTMLElement): HTMLElement[] =>
    [...panel.querySelectorAll<HTMLElement>(
      '[data-scope="side-nav"][data-part="branch-trigger"], [data-scope="side-nav"][data-part="link"]',
    )]

  /** 弹出某顶层分支：开着别的分支时先关再开，效应随状态重挂换锚。 */
  const openPopout = (v: string, focus: 'first' | 'none'): void => {
    if (disabled)
      return
    const current = livePopout()
    if (current != null && current !== v)
      send({ type: 'POPOUT.CLOSE' })
    send({ type: 'POPOUT.OPEN', value: v, focus })
  }

  /** 可见行对应的行元素，按可见序排列，只在事件那一刻读活 DOM。 */
  const visibleEls = (root: HTMLElement): HTMLElement[] => {
    const byValue = new Map<string, HTMLElement>()
    for (const el of [...queryItems(root, sideNavTriggerQuery), ...queryItems(root, sideNavLinkQuery)]) {
      const v = itemValue(el)
      if (v != null && !byValue.has(v))
        byValue.set(v, el)
    }
    return rows
      .map(row => byValue.get(row.value))
      .filter((el): el is HTMLElement => el != null)
  }

  const rootElOf = (el: HTMLElement): HTMLElement | null => el.closest<HTMLElement>(parts.root.selector)

  const focusValue = (el: HTMLElement | null): void => {
    const next = itemValue(el)
    if (next == null)
      return
    focusItem(el)
    send({ type: 'NODE.FOCUS', value: next })
  }

  const focusBy = (root: HTMLElement, intent: NavIntent): void => {
    focusValue(navigateItems(visibleEls(root), anchor, intent, { loop }))
  }

  const focusOn = (root: HTMLElement, v: string): void => {
    focusValue(visibleEls(root).find(el => itemValue(el) === v) ?? null)
  }

  /** 分支行与链接共用的方向键：上下走行、Home/End 到两端、左右管层级。 */
  const onNodeKeydown = (event: KeyboardEvent, v: string): void => {
    if (event.defaultPrevented)
      return
    const meta = metaOf(v)
    const branch = !!meta?.branch
    // rtl 下左右方向键的展开/收起语义对调
    const expandKey = dir === 'rtl' ? 'ArrowLeft' : 'ArrowRight'
    const collapseKey = dir === 'rtl' ? 'ArrowRight' : 'ArrowLeft'

    // 折叠态：弹出面板内的行走面板内序列，收起键把面板收回（焦点归还触发按钮）。
    // 这一段必须排在取侧栏根之前：面板已搬到浮层落点，从它里面往上找不到 root
    if (popoutEnabled && !isTopLevel(v)) {
      const panel = (event.currentTarget as HTMLElement).closest<HTMLElement>('[data-part="branch-content"][data-popout]')
      if (panel) {
        if (event.key === collapseKey) {
          event.preventDefault()
          send({ type: 'POPOUT.CLOSE', src: 'keyboard' })
          return
        }
        const intent = navIntentFromKey(event, { axis: 'vertical', dir })
        if (intent) {
          event.preventDefault()
          focusItem(navigateItems(panelRows(panel), itemValue(event.currentTarget as HTMLElement), intent, { loop: false }))
        }
        return
      }
    }

    const root = rootElOf(event.currentTarget as HTMLElement)
    if (!root)
      return

    // 折叠态：顶层分支的确认/展开键弹出面板并落焦第一行，收起键收面板
    if (branch && isPopoutTrigger(v)) {
      if (event.key === expandKey || event.key === 'Enter' || event.key === ' ') {
        event.preventDefault()
        if (popoutValue !== v) {
          openPopout(v, 'first')
          return
        }
        // 已开着再按：进面板第一行
        const panel = root.ownerDocument.getElementById(contentId(v))
        if (panel)
          focusItem(navigateItems(panelRows(panel), null, 'first'))
        return
      }
      if (event.key === collapseKey && popoutValue === v) {
        event.preventDefault()
        send({ type: 'POPOUT.CLOSE', src: 'keyboard' })
        return
      }
    }

    if (event.key === expandKey) {
      event.preventDefault()
      if (branch && !isExpanded(v)) {
        send({ type: 'BRANCH.EXPAND', value: v })
        return
      }
      if (branch && isExpanded(v)) {
        // 已展开再按：进第一个子行
        const firstChild = rows.find(row => row.parent === v)
        if (firstChild)
          focusOn(root, firstChild.value)
      }
      return
    }
    if (event.key === collapseKey) {
      event.preventDefault()
      if (branch && isExpanded(v)) {
        send({ type: 'BRANCH.COLLAPSE', value: v })
        return
      }
      const parent = meta?.parent
      if (parent != null)
        focusOn(root, parent)
      return
    }
    const intent = navIntentFromKey(event, { axis: 'vertical', dir })
    if (intent) {
      event.preventDefault()
      focusBy(root, intent)
    }
  }

  return {
    value,
    expandedValue: collapsed ? [] : expandedValue,
    collapsed,
    popoutValue,
    focusedValue,
    isSelected,
    isExpanded,
    isActiveBranch,
    select: v => send({ type: 'LINK.SELECT', value: v }),
    setValue: next => send({ type: 'VALUE.SET', value: next }),
    setExpandedValue: next => send({ type: 'EXPANDED.SET', value: next }),
    expand: v => send({ type: 'BRANCH.EXPAND', value: v }),
    collapse: v => send({ type: 'BRANCH.COLLAPSE', value: v }),
    openPopout: (v) => {
      if (isPopoutTrigger(v))
        openPopout(v, 'none')
    },
    closePopout: () => send({ type: 'POPOUT.CLOSE' }),

    getRootProps: () => normalize.element({
      ...parts.root.attrs,
      'role': 'navigation',
      'aria-label': rootLabel,
      'data-collapsed': dataAttr(collapsed),
      'data-disabled': dataAttr(disabled),
      'dir': dir === 'rtl' ? 'rtl' : undefined,
    }),

    getListProps: () => normalize.element({
      ...parts.list.attrs,
      'data-collapsed': dataAttr(collapsed),
    }),

    getGroupProps: ({ value: v }) => normalize.element({
      ...parts.group.attrs,
      'role': 'group',
      'aria-labelledby': groupLabelId(v),
    }),

    getGroupLabelProps: ({ value: v }) => normalize.element({
      ...parts['group-label'].attrs,
      'id': groupLabelId(v),
      'data-collapsed': dataAttr(collapsed),
    }),

    getBranchProps: ({ value: v }) => normalize.element({
      ...parts.branch.attrs,
      'data-state': isExpanded(v) ? 'open' : 'closed',
      'data-in-path': dataAttr(isActiveBranch(v)),
      'data-disabled': dataAttr(isDisabled(v)),
    }),

    getBranchTriggerProps: ({ value: v }) => {
      // 折叠态三种形态：顶层分支=弹出触发按钮；面板内嵌套分支=静态展开的组头；平铺照旧
      const popoutTrigger = isPopoutTrigger(v)
      const staticOpen = popoutEnabled && !isTopLevel(v)
      const expandedAttr = popoutTrigger ? popoutValue === v : (staticOpen || isExpanded(v))
      return normalize.button({
        ...parts['branch-trigger'].attrs,
        'type': 'button',
        'id': triggerId(v),
        'data-value': v,
        'aria-expanded': expandedAttr ? 'true' : 'false',
        'aria-controls': contentId(v),
        'data-state': expandedAttr ? 'open' : 'closed',
        'data-in-path': dataAttr(isActiveBranch(v)),
        'data-disabled': dataAttr(isDisabled(v)),
        'disabled': isDisabled(v) || undefined,
        'tabindex': anchor === v ? 0 : -1,
        'onClick': () => {
          if (popoutTrigger) {
            if (popoutValue === v)
              send({ type: 'POPOUT.CLOSE', src: 'select' })
            else
              openPopout(v, 'none')
            return
          }
          if (staticOpen)
            return
          send({ type: 'BRANCH.TOGGLE', value: v })
        },
        // 悬停延时弹出；触摸没有悬停，tap 走 click
        'onPointerenter': (event: PointerEvent) => {
          if (!popoutTrigger || event.pointerType === 'touch' || isDisabled(v))
            return
          clearTimeout(popoutHoverTimer)
          if (livePopout() === v)
            return
          popoutHoverTimer = setTimeout(() => {
            if (livePopout() !== v)
              openPopout(v, 'none')
          }, 100)
        },
        'onPointerleave': () => {
          if (popoutTrigger)
            clearTimeout(popoutHoverTimer)
        },
        'onFocus': () => send({ type: 'NODE.FOCUS', value: v }),
        'onKeydown': (event: KeyboardEvent) => onNodeKeydown(event, v),
      })
    },

    getBranchTextProps: () => normalize.element({
      ...parts['branch-text'].attrs,
    }),

    getBranchIndicatorProps: ({ value: v }) => normalize.element({
      ...parts['branch-indicator'].attrs,
      'aria-hidden': 'true',
      'data-state': (popoutEnabled && !isTopLevel(v)) || isExpanded(v) ? 'open' : 'closed',
    }),

    isPopoutPanel,

    // 定位层单独一节：坐标与层号都落在它身上，作者把它搬到浮层落点即可逃开
    // 祖先的层叠上下文。面板本身只管内容，不再自己写 fixed 坐标
    getPopoutPositionerProps: ({ value: v }) => {
      const open = isPopoutPanel(v) && popoutValue === v
      return normalize.element({
        ...parts.positioner.attrs,
        'id': positionerId(v),
        // 定位层被搬到 portal 落点，继承不到作者子树上的方向；作者没给就不写，交给落点处的继承
        'dir': prop('dir'),
        'data-state': open ? 'open' : 'closed',
        'data-placement': popoutPosition?.placement ?? (dir === 'rtl' ? 'left-start' : 'right-start'),
        // 落位才露：展开或换枝后坐标已清，引擎量完之前藏着
        'data-positioned': dataAttr(overlayPositioned(popoutPosition)),
        'hidden': !open || undefined,
        'style': open
          ? {
              position: 'fixed',
              left: `${popoutPosition?.x ?? 0}px`,
              top: `${popoutPosition?.y ?? 0}px`,
              ...availableHeightVar(popoutPosition?.availableHeight),
            }
          // 逐属性清而非摘掉整个 style：折叠开关来回切换时不残留 fixed 坐标，
          // 作者写的其他内联样式不受波及
          : { 'position': '', 'left': '', 'top': '', '--xh-_side-nav-available-h': '' },
      })
    },

    getBranchContentProps: ({ value: v }) => {
      // 折叠态：顶层子层是弹出面板的内容层，定位归 positioner；
      // 面板内的嵌套子层静态常开
      if (isPopoutPanel(v)) {
        const open = popoutValue === v
        return normalize.element({
          ...parts['branch-content'].attrs,
          'id': contentId(v),
          'data-popout': '',
          'data-state': open ? 'open' : 'closed',
          // 面板自己也收起：定位层已经整层让位，这条是给「只查面板」的作者与读屏留的同一个事实
          'hidden': !open || undefined,
        })
      }
      if (popoutEnabled && !isTopLevel(v)) {
        return normalize.element({
          ...parts['branch-content'].attrs,
          'id': contentId(v),
          'data-state': 'open',
        })
      }
      return normalize.element({
        ...parts['branch-content'].attrs,
        'id': contentId(v),
        'data-state': isExpanded(v) ? 'open' : 'closed',
        'hidden': !isExpanded(v) || undefined,
      })
    },

    getLinkProps: ({ value: v }) => normalize.element({
      ...parts.link.attrs,
      'data-value': v,
      'href': metaOf(v) ? (collectionHref(collection, v) ?? undefined) : undefined,
      // 选中的那条就是「当前页」，读屏与皮肤都认它
      'aria-current': isSelected(v) ? 'page' : undefined,
      'data-current': dataAttr(isSelected(v)),
      'data-disabled': dataAttr(isDisabled(v)),
      'aria-disabled': isDisabled(v) ? 'true' : undefined,
      'tabindex': anchor === v ? 0 : -1,
      'onClick': (event: MouseEvent) => {
        if (isDisabled(v)) {
          event.preventDefault()
          return
        }
        send({ type: 'LINK.SELECT', value: v })
      },
      'onFocus': () => send({ type: 'NODE.FOCUS', value: v }),
      'onKeydown': (event: KeyboardEvent) => {
        // 链接上按 Enter 走原生激活；方向键交给共用处理
        onNodeKeydown(event, v)
      },
    }),

    getLinkTextProps: () => normalize.element({
      ...parts['link-text'].attrs,
    }),
  }
}

/** 从原始树里取某条叶子的 href；索引层不带它，就地找一次。 */
function collectionHref(collection: readonly SideNavNode[], target: string): string | undefined {
  for (const node of collection) {
    if (node.value === target)
      return node.href
    if (node.children) {
      const hit = collectionHref(node.children, target)
      if (hit !== undefined)
        return hit
    }
  }
  return undefined
}
