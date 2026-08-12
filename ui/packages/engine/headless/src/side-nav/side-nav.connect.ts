import type { NavIntent } from '@xihan-ui/behavior'
import type { NormalizeProps, PropTypes } from '@xihan-ui/kernel'
import type { Service } from '@xihan-ui/machine'
import type { SideNavApi, SideNavNode, SideNavSchema } from './side-nav.types'
import { focusItem, itemValue, navigateItems, navIntentFromKey, queryItems } from '@xihan-ui/behavior'
import { dataAttr } from '@xihan-ui/kernel'
import { flattenTree, indexTree } from '../tree'
import { sideNavAnatomy, sideNavLinkQuery, sideNavTriggerQuery } from './side-nav.anatomy'

const parts = sideNavAnatomy.build()

export function connectSideNav<T extends PropTypes>(
  service: Service<SideNavSchema>,
  normalize: NormalizeProps<T>,
): SideNavApi<T> {
  const { context, prop, send, scope } = service
  const collection = prop('collection') ?? []
  const value = context.get('value')
  const expandedValue = context.get('expandedValue')
  const collapsed = !!prop('collapsed')
  const disabled = !!prop('disabled')
  const loop = prop('loop') ?? false
  const dir = prop('dir') ?? 'ltr'

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
    const root = rootElOf(event.currentTarget as HTMLElement)
    if (!root)
      return
    const meta = metaOf(v)
    const branch = !!meta?.branch
    // rtl 下左右方向键的展开/收起语义对调
    const expandKey = dir === 'rtl' ? 'ArrowLeft' : 'ArrowRight'
    const collapseKey = dir === 'rtl' ? 'ArrowRight' : 'ArrowLeft'

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
    focusedValue,
    isSelected,
    isExpanded,
    isActiveBranch,
    select: v => send({ type: 'LINK.SELECT', value: v }),
    setValue: next => send({ type: 'VALUE.SET', value: next }),
    setExpandedValue: next => send({ type: 'EXPANDED.SET', value: next }),
    expand: v => send({ type: 'BRANCH.EXPAND', value: v }),
    collapse: v => send({ type: 'BRANCH.COLLAPSE', value: v }),

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
      'data-active': dataAttr(isActiveBranch(v)),
      'data-disabled': dataAttr(isDisabled(v)),
    }),

    getBranchTriggerProps: ({ value: v }) => normalize.button({
      ...parts['branch-trigger'].attrs,
      'type': 'button',
      'data-value': v,
      'aria-expanded': isExpanded(v) ? 'true' : 'false',
      'aria-controls': contentId(v),
      'data-state': isExpanded(v) ? 'open' : 'closed',
      'data-active': dataAttr(isActiveBranch(v)),
      'data-disabled': dataAttr(isDisabled(v)),
      'disabled': isDisabled(v) || undefined,
      'tabindex': anchor === v ? 0 : -1,
      'onClick': () => send({ type: 'BRANCH.TOGGLE', value: v }),
      'onFocus': () => send({ type: 'NODE.FOCUS', value: v }),
      'onKeydown': (event: KeyboardEvent) => onNodeKeydown(event, v),
    }),

    getBranchIndicatorProps: ({ value: v }) => normalize.element({
      ...parts['branch-indicator'].attrs,
      'aria-hidden': 'true',
      'data-state': isExpanded(v) ? 'open' : 'closed',
    }),

    getBranchContentProps: ({ value: v }) => normalize.element({
      ...parts['branch-content'].attrs,
      'id': contentId(v),
      'data-state': isExpanded(v) ? 'open' : 'closed',
      'hidden': !isExpanded(v) || undefined,
    }),

    getLinkProps: ({ value: v }) => normalize.element({
      ...parts.link.attrs,
      'data-value': v,
      'href': metaOf(v) ? (collectionHref(collection, v) ?? undefined) : undefined,
      // 选中的那条就是「当前页」，读屏与皮肤都认它
      'aria-current': isSelected(v) ? 'page' : undefined,
      'data-selected': dataAttr(isSelected(v)),
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
