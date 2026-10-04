/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 side nav 相关实现。

import type { NavIntent, NormalizeProps, PressHandlers, PropTypes, Service } from '@xihan-ui/core'
import type { TooltipSchema } from '../tooltip'
import type { SideNavApi, SideNavNode, SideNavPressedPart, SideNavSchema } from './side-nav.types'
import { createPressTracker, dataAttr, focusItem, isComposingEvent, itemValue, navigateItems, navIntentFromKey, normalizeProps, queryItems } from '@xihan-ui/core'
import { SIDE_NAV_EN_US } from '../locale/en-US'
import { overlayAvailableSpaceVars, overlayFixedStyle, overlayPositioned } from '../shared/overlay'
import { resolveTranslations } from '../shared/translations'
import { connectTooltip } from '../tooltip'
import { flattenTree, indexTree } from '../tree'
import { sideNavAnatomy, sideNavLinkQuery, sideNavTriggerQuery } from './side-nav.anatomy'
import { resolveSideNavSearch } from './side-nav.search'

const parts = sideNavAnatomy.build()

/**
 * tooltip 是图标栏名称提示的那台内嵌 Tooltip 机器（props 取 sideNavTooltipProps）：适配器在作者放了 tooltip 部件时交进来，
 * 行上的指针与焦点据此转给它；不交即没有名称提示。
 */
export function connectSideNav<T extends PropTypes>(
  service: Service<SideNavSchema>,
  normalize: NormalizeProps<T>,
  tooltip?: Service<TooltipSchema>,
): SideNavApi<T> {
  const { context, prop, send, scope, state } = service
  const collection = prop('collection') ?? []
  const value = context.get('value')
  const expandedValue = context.get('expandedValue')
  const collapsed = !!prop('collapsed')
  const disabled = !!prop('disabled')
  const loop = prop('loop') ?? false
  const dir = prop('dir') ?? 'ltr'
  // 落定的排布：折叠开关翻了之后，整栏宽度的过渡播完才换过来；两者不一致的那一段即折叠进行中
  const railed = context.get('railed')
  const collapsing = railed !== collapsed
  // 排布落成图标栏之后顶层分支换装浮层弹出；collapsedPopout 关掉即回到纯图标栏。
  // 弹出与否看状态位：context 里的 popoutValue 在关闭后留给效应拆除用，不外露
  const popoutEnabled = railed && (prop('collapsedPopout') ?? true)
  const popoutValue = popoutEnabled && state.get() === 'popout' ? context.get('popoutValue') : null
  const popoutPlacements = context.get('popoutPlacements')
  /** 事件回调里现读的弹出分支；渲染期快照失效后仍然准确。 */
  const livePopout = (): string | null =>
    state.get() === 'popout' ? context.get('popoutValue') ?? null : null

  // 搜索视图：检索词非空时树裁到只剩命中的那几枝，展开取搜索视图自己的那份；落成图标栏时暂停
  const inputValue = context.get('inputValue')
  const search = resolveSideNavSearch(collection, { inputValue, filter: prop('filter'), railed })
  const searching = search != null
  // 裁剪后还留在树里的入口；不在搜索视图时为 null，一条都不藏
  const shown = search ? new Set(indexTree(search.nodes).keys()) : null
  const isShown = (v: string): boolean => shown == null || shown.has(v)
  const empty = searching && search.nodes.length === 0
  const viewExpanded = railed ? [] : searching ? context.get('searchExpanded') : expandedValue

  // 摊平与索引都是纯函数；排布落成图标栏时内嵌展开整体收起，可见行只剩顶层。
  // 索引始终取整棵树：禁用、语气、链接地址与层级不因裁剪而变
  const rows = flattenTree(search?.nodes ?? collection, viewExpanded)
  const metaIndex = indexTree(collection)
  const visible = new Map(rows.map(row => [row.value, row]))

  // 焦点锚点投影成可见的：祖先收起后的行不再认领 tabindex=0
  const rawFocused = context.get('focusedValue')
  const focusedValue = rawFocused != null && visible.has(rawFocused) ? rawFocused : null

  const metaOf = (v: string): ReturnType<typeof metaIndex.get> => metaIndex.get(v)
  const isSelected = (v: string): boolean => value === v
  const isExpanded = (v: string): boolean => viewExpanded.includes(v)
  const isDisabled = (v: string): boolean => disabled || !!metaOf(v)?.disabled

  /**
   * 入口语气：只认 collection 里这一层自己写的那族色，不从父级继承。
   * 没写时返回 undefined，作者直接写在部件上的 data-tone 原样留着。
   */
  const nodeTone = (v: string): string | undefined => metaOf(v)?.tone ?? undefined

  // 按压通道：真源是机器 context 里「正被按住的那一个」（入口按 value 记、链接行与分支行分开认），各自合成
  // 一份跟踪器；Space / Enter 与触屏按住投影 data-pressed，指针按住由 :active 表出，家族配方两者同一档。
  // 导航当前（aria-current）与按压互相独立；入口自身的禁用只有 connect 知道，随 PRESS.START 带给机器的守卫
  const pressedPart = context.get('pressedPart')
  const pressedValue = context.get('pressedValue')
  const press = (part: SideNavPressedPart, value: string): PressHandlers => createPressTracker({
    isPressed: () => context.get('pressedPart') === part && context.get('pressedValue') === value,
    onChange: down => send(down
      ? { type: 'PRESS.START', part, value, disabled: isDisabled(value) }
      : { type: 'PRESS.END', part, value }),
  })

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

  const translations = resolveTranslations(SIDE_NAV_EN_US, prop('translations'))

  // 配对 id 由 scope 派生，同页多实例不相撞
  const listId = scope.partId('side-nav', 'list')
  const groupLabelId = (v: string): string => scope.partId('side-nav', `group-label-${v}`)
  const contentId = (v: string): string => scope.partId('side-nav', `content-${v}`)
  const positionerId = (v: string): string => scope.partId('side-nav', `positioner-${v}`)
  const triggerId = (v: string): string => scope.partId('side-nav', `trigger-${v}`)

  const isTopLevel = (v: string): boolean => (metaOf(v)?.parent ?? null) == null
  /** 该分支行在折叠态下是弹出面板的触发按钮。 */
  const isPopoutTrigger = (v: string): boolean => popoutEnabled && isTopLevel(v)
  /** 该子层容器在折叠态下渲染成弹出面板（顶层）；面板内的嵌套子层静态常开。 */
  const isPopoutPanel = isPopoutTrigger

  // 名称提示：落成图标栏后只剩图标的那几行（顶层叶子；弹出关掉时也含顶层分支）悬停或聚焦时显示行的标签。
  // 弹出分支的面板自己就是去处，不再叠一层提示；折叠进行中（宽度还在过渡）文字还在，也不提示
  const tooltipValue = context.get('tooltipValue')
  const tooltipText = tooltipValue != null ? metaOf(tooltipValue)?.label ?? tooltipValue : ''
  const hintable = (v: string): boolean =>
    tooltip != null && collapsed && railed && isTopLevel(v) && !(metaOf(v)?.branch && isPopoutTrigger(v))

  /** 行上的指针与焦点转给内嵌提示机，与 Tooltip 的 trigger 同一套事件；换行时先改对着的那一行，开着就原地换锚。 */
  interface RowHint {
    enter: () => void
    leave: () => void
    down: () => void
    focus: () => void
    blur: () => void
    keydown: (event: KeyboardEvent) => void
  }
  const rowHint = (v: string): RowHint | null => {
    if (!tooltip || !hintable(v))
      return null
    const target = (): void => {
      if (context.get('tooltipValue') === v)
        return
      send({ type: 'TOOLTIP.TARGET', value: v })
      if (tooltip.state.matches('visible'))
        tooltip.refs.get('reanchor')?.()
    }
    return {
      enter: () => {
        target()
        tooltip.send({ type: 'POINTER.ENTER' })
      },
      leave: () => tooltip.send({ type: 'POINTER.LEAVE' }),
      // 按下即让位给真正的操作
      down: () => tooltip.send({ type: 'POINTER.DOWN' }),
      focus: () => {
        const shown = tooltip.state.matches('visible')
        target()
        tooltip.send({ type: 'FOCUS' })
        // 焦点从上一行挪过来：那一行失焦刚报了收起，宿主把受控值写回之前提示还开着、不再认这次聚焦；
        // 这里接着报「开」，提示原地换到这一行，不在两行之间收一下又开
        if (shown)
          send({ type: 'TOOLTIP.OPEN_CHANGE', open: true })
      },
      blur: () => tooltip.send({ type: 'BLUR' }),
      // 提示露面之后 Escape 归消解层按层栈仲裁；这里只管还在等延时的那一段
      keydown: (event) => {
        if (event.key === 'Escape' && tooltip.state.matches('opening'))
          tooltip.send({ type: 'ESCAPE' })
      },
    }
  }

  // 内嵌提示机的两个部件取 Tooltip 连接层的原样产出，再改成对读屏隐藏
  const tooltipParts = tooltip ? connectTooltip(tooltip, normalizeProps) : null
  const requireTooltip = (): NonNullable<typeof tooltipParts> => {
    if (!tooltipParts)
      throw new Error('[xh] SideNav 的名称提示需要内嵌的提示机：connectSideNav 的第三个参数没给')
    return tooltipParts
  }

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
    inputValue,
    setInputValue: next => send({ type: 'INPUT.CHANGE', value: next }),
    searching,
    empty,
    translations,

    getRootProps: () => normalize.element({
      ...parts.root.attrs,
      // 折叠落定要等它身上的宽度过渡播完，机器按 id 现取
      'id': scope.partId('side-nav', 'root'),
      'role': 'navigation',
      'aria-label': translations.root,
      'data-collapsed': dataAttr(collapsed),
      // 折叠进行中：宽度在过渡，行文字只淡出、还在行里，落定之后才裁成图标栏（展开时落定之后才淡入）
      'data-animating': dataAttr(collapsing),
      'data-disabled': dataAttr(disabled),
      'data-tone': prop('tone'),
      'data-size': prop('size'),
      'dir': dir === 'rtl' ? 'rtl' : undefined,
    }),

    getListProps: () => normalize.element({
      ...parts.list.attrs,
      // 搜索框按 id 指着它：框里的检索词改的就是这一列
      'id': listId,
      'data-collapsed': dataAttr(collapsed),
    }),

    // 面板内嵌的搜索框：不画字段外壳，重置与占位前景走字段家族，下划线与高度由皮肤给
    getInputProps: () => normalize.input({
      ...parts.input.attrs,
      'type': 'text',
      'value': inputValue,
      'disabled': disabled || undefined,
      'autocomplete': 'off',
      'autocapitalize': 'none',
      // 框里没有可见标签，只能自带一句
      'aria-label': translations.input,
      'aria-controls': listId,
      'data-xh-field-input': '',
      'data-collapsed': dataAttr(collapsed),
      'data-disabled': dataAttr(disabled),
      'onInput': (event: Event) => {
        send({ type: 'INPUT.CHANGE', value: (event.target as HTMLInputElement).value })
      },
      'onKeyDown': (event: KeyboardEvent) => {
        // 组合期间的按键属于输入法候选框，组件一律不接；带修饰键的组合归浏览器
        if (isComposingEvent(event) || event.ctrlKey || event.metaKey || event.altKey)
          return
        if (event.key === 'Escape') {
          // 词非空就先清词回整棵树；拦下默认行为，外层的抽屉之类不跟着这一下收起。词已空就放行
          if (inputValue !== '') {
            event.preventDefault()
            send({ type: 'INPUT.CHANGE', value: '' })
          }
          return
        }
        // 下方向键与 Enter 把焦点交给导航行：搜索中落在剩下的第一行，否则落回 Tab 锚点；Enter 不落到表单上
        if (event.key === 'ArrowDown' || event.key === 'Enter') {
          event.preventDefault()
          const root = rootElOf(event.currentTarget as HTMLElement)
          if (!root)
            return
          if (searching)
            focusBy(root, 'first')
          else if (anchor != null)
            focusOn(root, anchor)
        }
      },
    }),

    // 空态占位：list 的兄弟（ul 只许装列表项）。只在搜索一条都没命中时露面，露面即播报
    getEmptyProps: () => normalize.element({
      ...parts.empty.attrs,
      role: 'status',
      hidden: !empty || undefined,
    }),

    // 身份取它包着的那条链接：搜索时没命中就整行收起，不在列表里留一格空行
    getItemProps: props => normalize.element({
      ...parts.item.attrs,
      hidden: (props?.value != null && !isShown(props.value)) || undefined,
    }),

    // 分组是上一层列表里的一条（li），不另挂角色：列表的直接子节点只能是列表项。
    // 搜索时一个成员都没命中就整组收起，标题不孤零零地留着
    getGroupProps: ({ members }) => normalize.element({
      ...parts.group.attrs,
      hidden: (searching && members != null && !members.some(isShown)) || undefined,
    }),

    getGroupLabelProps: ({ value: v }) => normalize.element({
      ...parts['group-label'].attrs,
      'id': groupLabelId(v),
      'data-collapsed': dataAttr(collapsed),
    }),

    // 组内的行挂在这一层列表里，列表以组标题命名。不写 role=group：列表项的父节点必须是列表
    getGroupListProps: ({ value: v }) => normalize.element({
      ...parts['group-list'].attrs,
      'aria-labelledby': groupLabelId(v),
    }),

    getBranchProps: ({ value: v }) => normalize.element({
      ...parts.branch.attrs,
      'data-state': isExpanded(v) ? 'open' : 'closed',
      'data-in-path': dataAttr(isActiveBranch(v)),
      'data-disabled': dataAttr(isDisabled(v)),
      // 搜索时自己没命中、子孙也一个没命中的分支整枝收起
      'hidden': !isShown(v) || undefined,
    }),

    getBranchTriggerProps: ({ value: v }) => {
      // 折叠态三种形态：顶层分支=弹出触发按钮；面板内嵌套分支=静态展开的组头；平铺照旧
      const popoutTrigger = isPopoutTrigger(v)
      const staticOpen = popoutEnabled && !isTopLevel(v)
      const expandedAttr = popoutTrigger ? popoutValue === v : (staticOpen || isExpanded(v))
      const handlers = press('branch-trigger', v)
      // 弹出关掉的图标栏里，分支行同样只剩图标，名称提示与叶子同一套
      const hint = rowHint(v)
      return normalize.button({
        ...parts['branch-trigger'].attrs,
        // 分支行走 Collection Item 的 page 语境（页内持久集合）：悬停 / 高亮 / 按下面与展开路径的中性面
        // （data-in-path 与 hover 同档）由家族给出；箭头是行尾的后缀，不是选中标记
        'data-xh-collection-item': '',
        'data-xh-collection-size': prop('size') ?? 'md',
        'data-xh-collection-context': 'page',
        // 该入口自身的性质；家族据此换字与悬停 / 按下的面，当前项与禁用压过它
        'data-tone': nodeTone(v),
        'type': 'button',
        'id': triggerId(v),
        'data-value': v,
        'aria-expanded': expandedAttr ? 'true' : 'false',
        'aria-controls': contentId(v),
        'data-state': expandedAttr ? 'open' : 'closed',
        'data-in-path': dataAttr(isActiveBranch(v)),
        // 方向键锚定的那一行：皮肤据此画高亮
        'data-highlighted': dataAttr(focusedValue === v),
        'data-disabled': dataAttr(isDisabled(v)),
        // 原生 disabled 之外再报一遍 aria-disabled：家族的禁用面按它给
        'aria-disabled': isDisabled(v) ? 'true' : 'false',
        'disabled': isDisabled(v) || undefined,
        // Space / Enter 与触屏按住投影 data-pressed，家族的按下面同时认它与指针 :active
        'data-pressed': dataAttr(pressedPart === 'branch-trigger' && pressedValue === v),
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
        // 悬停延时弹出，等待归机器；触摸没有悬停，tap 走 click
        'onPointerenter': (event: PointerEvent) => {
          hint?.enter()
          if (!popoutTrigger || event.pointerType === 'touch' || isDisabled(v))
            return
          send({ type: 'POPOUT.HOVER', value: v })
        },
        'onPointerleave': () => {
          hint?.leave()
          if (popoutTrigger)
            send({ type: 'POPOUT.HOVER_END' })
        },
        'onFocus': () => {
          send({ type: 'NODE.FOCUS', value: v })
          hint?.focus()
        },
        // 同一个 keydown 先过跟踪器再走导航：React 把 onKeydown 与 onKeyDown 归成同一个合成事件，两个键会互相覆盖
        'onKeydown': (event: KeyboardEvent) => {
          handlers.onKeyDown(event)
          hint?.keydown(event)
          onNodeKeydown(event, v)
        },
        'onKeyUp': handlers.onKeyUp,
        'onBlur': () => {
          handlers.onBlur()
          hint?.blur()
        },
        'onPointerDown': (event: PointerEvent) => {
          handlers.onPointerDown(event)
          hint?.down()
        },
        'onPointerUp': handlers.onPointerUp,
        'onPointerCancel': handlers.onPointerCancel,
      })
    },

    getBranchTextProps: () => normalize.element({
      ...parts['branch-text'].attrs,
      'data-xh-collection-slot': 'text',
    }),

    // 展开箭头落在行尾：家族网格的 suffix 列
    getBranchIndicatorProps: ({ value: v }) => normalize.element({
      ...parts['branch-indicator'].attrs,
      'data-xh-collection-slot': 'suffix',
      'aria-hidden': true,
      'data-state': (popoutEnabled && !isTopLevel(v)) || isExpanded(v) ? 'open' : 'closed',
    }),

    isPopoutPanel,

    // 定位层单独一节：坐标与层号都落在它身上，作者把它搬到浮层落点即可逃开
    // 祖先的层叠上下文。面板本身只管内容，不再自己写 fixed 坐标
    getPopoutPositionerProps: ({ value: v }) => {
      const open = isPopoutPanel(v) && popoutValue === v
      // 坐标取这一枝名下的那份：换枝时新枝的账已清、旧枝的账还在，
      // 旧面板据此留在原地播退场，新面板藏到拿到自己的坐标为止
      const placed = popoutPlacements[v]
      return normalize.element({
        ...parts.positioner.attrs,
        'id': positionerId(v),
        // 定位层被搬到 portal 落点，继承不到作者子树上的方向；作者没给就不写，交给落点处的继承
        'dir': prop('dir'),
        'data-state': open ? 'open' : 'closed',
        // 浮层被搬去落点、继承不到根上的私有槽，视觉轴在这里再打一遍
        'data-tone': prop('tone'),
        'data-size': prop('size'),
        'data-placement': placed?.placement ?? (dir === 'rtl' ? 'left-start' : 'right-start'),
        // 落位才露：展开或换枝后这一枝的坐标已清，引擎量完之前藏着
        'data-positioned': dataAttr(overlayPositioned(placed)),
        // 锚点被滚出可视区时引擎置 hidden，样式据此收起浮层。
        // 这条与皮肤的 [data-hidden] 规则是一对：少了它，锚点滚出视区后面板会继续悬在原坐标
        'data-hidden': dataAttr(placed?.hidden),
        // Presence 延留定位层；逻辑关闭后立即退出交互与可访问树。
        'inert': !open || undefined,
        'aria-hidden': !open || undefined,
        'hidden': !open || undefined,
        // 收起后坐标留到这一枝下一次展开才作废：退场动画在原位播
        'style': placed
          ? {
              ...overlayFixedStyle(placed),
              ...overlayAvailableSpaceVars('side-nav', placed),
            }
          // 逐属性清而非摘掉整个 style：折叠开关来回切换时不残留 fixed 坐标，
          // 作者写的其他内联样式不受波及
          : { 'position': '', 'left': '', 'top': '', '--xh-_side-nav-available-w': '', '--xh-_side-nav-available-h': '' },
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
          'inert': !open || undefined,
          'aria-hidden': !open || undefined,
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

    // 链接行走 Collection Item 的 page 语境：当前页（data-current）由家族给品牌淡底行面 + 淡底前景 +
    // 起始侧 2px 指示条，悬停 / 高亮 / 按下面与禁用面按 aria-disabled 给
    getLinkProps: ({ value: v }) => {
      const handlers = press('link', v)
      // 没有 href 就不写这个键：asChild 把属性合到路由链接上时，一个值为空的 href 会盖掉它自己算出的地址
      const href = metaOf(v) ? collectionHref(collection, v) : undefined
      const hint = rowHint(v)
      return normalize.element({
        ...parts.link.attrs,
        'data-xh-collection-item': '',
        'data-xh-collection-size': prop('size') ?? 'md',
        'data-xh-collection-context': 'page',
        // 该入口自身的性质；家族据此换字与悬停 / 按下的面，当前项与禁用压过它
        'data-tone': nodeTone(v),
        'data-value': v,
        ...(href == null ? {} : { href }),
        // 选中的那条就是「当前页」，读屏与皮肤都认它
        'aria-current': isSelected(v) ? 'page' : undefined,
        'data-current': dataAttr(isSelected(v)),
        // 方向键锚定的那一行：皮肤据此画高亮
        'data-highlighted': dataAttr(focusedValue === v),
        'data-disabled': dataAttr(isDisabled(v)),
        'aria-disabled': isDisabled(v) ? 'true' : undefined,
        // Space / Enter 与触屏按住投影 data-pressed，家族的按下面同时认它与指针 :active；与当前页互相独立
        'data-pressed': dataAttr(pressedPart === 'link' && pressedValue === v),
        'tabindex': anchor === v ? 0 : -1,
        'onClick': (event: MouseEvent) => {
          if (isDisabled(v)) {
            event.preventDefault()
            return
          }
          send({ type: 'LINK.SELECT', value: v })
        },
        // 图标栏里只剩图标的叶子：悬停或聚焦显示名称提示
        'onPointerenter': () => hint?.enter(),
        'onPointerleave': () => hint?.leave(),
        'onFocus': () => {
          send({ type: 'NODE.FOCUS', value: v })
          hint?.focus()
        },
        // 同一个 keydown 先过跟踪器再走导航：React 把 onKeydown 与 onKeyDown 归成同一个合成事件，两个键会互相覆盖
        'onKeydown': (event: KeyboardEvent) => {
          handlers.onKeyDown(event)
          hint?.keydown(event)
          // 链接上按 Enter 走原生激活；方向键交给共用处理
          onNodeKeydown(event, v)
        },
        'onKeyUp': handlers.onKeyUp,
        'onBlur': () => {
          handlers.onBlur()
          hint?.blur()
        },
        'onPointerDown': (event: PointerEvent) => {
          handlers.onPointerDown(event)
          hint?.down()
        },
        'onPointerUp': handlers.onPointerUp,
        'onPointerCancel': handlers.onPointerCancel,
      })
    },

    getLinkTextProps: () => normalize.element({
      ...parts['link-text'].attrs,
      'data-xh-collection-slot': 'text',
    }),

    tooltipText,

    // 定位层原样取 Tooltip 的：坐标、落定朝向、落位才露与锚点滚出视区时收起都由它给
    getTooltipPositionerProps: () => normalize.element(requireTooltip().getPositionerProps() as Record<string, unknown>),

    // 提示本体原样取 Tooltip 的（反白面、进退场、接替时不播进场都随它），只改两处：
    // 不当 role=tooltip、整块对读屏隐藏——行上的文字已是可及名，提示只给看得见的人补上被裁掉的那段字
    getTooltipContentProps: () => normalize.element({
      ...requireTooltip().getContentProps() as Record<string, unknown>,
      'role': undefined,
      'aria-hidden': true,
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
