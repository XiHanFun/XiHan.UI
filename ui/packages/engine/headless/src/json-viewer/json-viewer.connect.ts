/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 json viewer 相关实现。

import type { NavIntent, NormalizeProps, PressHandlers, PropTypes, Service } from '@xihan-ui/core'
import type { HighlightSegment } from '../highlight/highlight.split'
import type { JsonViewerApi, JsonViewerNode, JsonViewerSchema, JsonViewerToolTrigger } from './json-viewer.types'
import { contains, createPressTracker, dataAttr, focusItem, ITEM_VALUE_ATTR, itemValue, navigateItems, navIntentFromKey, queryItems, readDirection } from '@xihan-ui/core'
import { splitHighlight } from '../highlight/highlight.split'
import { JSON_VIEWER_EN_US } from '../locale/en-US'
import { resolveTranslations } from '../shared/translations'
import { jsonViewerAnatomy, jsonViewerBranchQuery, jsonViewerItemQuery } from './json-viewer.anatomy'
import { flattenJson, jsonExpandedPathsToDepth, jsonSearch, jsonSearchQuery, jsonSeedExpanded, jsonViewerText, resolveJsonViewerTools, tokenizeJsonText } from './json-viewer.machine'

const parts = jsonViewerAnatomy.build()

export function connectJsonViewer<T extends PropTypes>(
  service: Service<JsonViewerSchema>,
  normalize: NormalizeProps<T>,
): JsonViewerApi<T> {
  const { context, prop, send, scope, state } = service
  // null = 还没人碰过展开集合，按当下的数据现算：value 可能晚于机器启动才到
  const expandedValue = context.get('expandedValue') ?? jsonSeedExpanded(prop)
  const loop = prop('loop') ?? false

  // 摊平是 (value, 展开集合) 的纯函数；connect 在渲染期求值，此时 DOM 尚不存在
  const rows = flattenJson(prop('value'), {
    expandedValue,
    maxItems: prop('maxItems'),
    maxStringLength: prop('maxStringLength'),
    sortKeys: prop('sortKeys'),
  })
  const byPath = new Map(rows.map(row => [row.value, row]))

  const label = resolveTranslations(JSON_VIEWER_EN_US, prop('translations'))

  // 焦点锚点投影成可见的：分支一收起，它底下的行就不在 DOM 里了，
  // 让一个已消失的路径继续认领 tabindex=0 会让整棵树没有 Tab 停靠点
  const rawFocused = context.get('focusedValue')
  const anchor = rawFocused != null && byPath.has(rawFocused) ? rawFocused : null
  // 锚点跨 Tab 往返留着（回来落回上次那一行），高亮只跟当下的焦点走
  const isFocusWithin = context.get('focusWithin')
  const highlighted = isFocusWithin ? anchor : null

  const view = context.get('view')
  // 原文档：树的展开 / 收起两颗钮收起，换行开关出现，原文开关报按下
  const textView = view === 'text'
  const wrap = context.get('wrap')
  // 形态恒有值：缺省 outline，读一眼 DOM 就知道这块有没有外框
  const variant = prop('variant') ?? 'outline'
  // 顶层没给值就一行也摊不出来，这时候容器里空空如也，交给空态部件说话
  const isEmpty = rows.length === 0
  // 给了原文就重排原文（字面量一字不改）；否则由 value 序列化，键序与环路记号跟树同源
  const text = jsonViewerText(prop)

  // 工具条：tools 归一成条上要铺的几项，非法的工具名在这里抛出
  const tools = resolveJsonViewerTools(prop('tools'))
  const copyStatus = state.get()
  const copied = copyStatus === 'copied'
  // 播报区只在成功那一档有话说；平时是空串，读屏不会念一段旧文案
  const announcement = copied ? label.copied : ''
  const walk = { maxItems: prop('maxItems'), sortKeys: prop('sortKeys') }
  // 全部展开：每一层的分支都进展开集合（折掉的成员与循环引用本来就不是分支）
  const allBranches = (): string[] => jsonExpandedPathsToDepth(prop('value'), Number.POSITIVE_INFINITY, walk)
  const expandAll = (): void => send({ type: 'EXPANDED.SET', value: allBranches() })
  // 收起到顶层：根行留着展开，否则整份数据只剩一行摘要，什么也看不到
  const collapseAll = (): void => send({ type: 'EXPANDED.SET', value: jsonExpandedPathsToDepth(prop('value'), 1, walk) })
  // 展开 / 收起钮看的是此刻的事实：每一层分支都开着才算全部展开。只在树档走一遍整份数据，原文档用不上。
  // 只有根一层分支时没有可展开的子层，钮无事可做
  const branches = textView ? [] : allBranches()
  const expandedSet = new Set(expandedValue)
  const allExpanded = branches.length > 1 && branches.every(path => expandedSet.has(path))
  const canToggleExpand = branches.length > 1
  const copy = (): void => send({ type: 'COPY.TRIGGER' })
  // 工具钮的尺寸比视图低一档、最低 sm：它们是从属的钮，不该与正文的行争高
  const toolSize = prop('size') === 'lg' ? 'md' : 'sm'
  const pressedTool = context.get('pressedTool')

  /**
   * 工具钮的按压通道：Space / Enter 与触屏按住投影 data-pressed，指针按住由 :active 表出，皮肤两者同一副面。
   * 禁用的钮是原生 disabled，收不到按键与指针；按住途中变成禁用时按压面跟着撤下。
   */
  const toolPress = (part: JsonViewerToolTrigger, disabled: boolean): Record<string, unknown> => {
    const handlers = createPressTracker({
      isPressed: () => context.get('pressedTool') === part,
      onChange: down => send(down ? { type: 'TOOL.PRESS.START', part } : { type: 'TOOL.PRESS.END', part }),
    })
    return {
      'data-pressed': dataAttr(!disabled && pressedTool === part),
      'onKeyDown': handlers.onKeyDown,
      'onKeyUp': handlers.onKeyUp,
      'onBlur': handlers.onBlur,
      'onPointerDown': handlers.onPointerDown,
      'onPointerUp': handlers.onPointerUp,
      'onPointerCancel': handlers.onPointerCancel,
    }
  }

  /**
   * 工具钮共用的骨架：type、可及名、禁用与出没一次给齐。没有数据时整条钮都禁用：没有可复制、可展开的东西；
   * 某颗钮另有无事可做的时候（只有根一层分支时的展开 / 收起）由 inert 再禁一层。
   * Action Control 的档位（data-xh-action-*）由各 getter 自己写：门禁按 getter 切片认家族归属与投影。
   */
  const toolButton = (part: JsonViewerToolTrigger, aria: string, onClick: () => void, hidden: boolean, extra: Record<string, unknown>, inert = isEmpty): T['button'] =>
    normalize.button({
      ...parts[part].attrs,
      'type': 'button',
      'aria-label': aria,
      'hidden': hidden || undefined,
      'disabled': inert || undefined,
      'data-disabled': dataAttr(inert),
      ...toolPress(part, inert),
      ...extra,
      onClick,
    })

  const isExpanded = (value: string): boolean => expandedValue.includes(value)
  const nodeOf = (value: string): JsonViewerNode | undefined => byPath.get(value)

  // 搜索：命中在整棵树里找（收起的分支里也找得到），祖先分支由机器在搜索词变化时展开
  const query = jsonSearchQuery(prop('search'))
  const { matches } = jsonSearch(prop('value'), prop('search'), {
    maxItems: prop('maxItems'),
    maxStringLength: prop('maxStringLength'),
    sortKeys: prop('sortKeys'),
  })
  const matchSet = new Set(matches)
  /** 按搜索词切段；search 为假时整段一个不命中的片段。 */
  const segmentsOf = (text: string, search = true): readonly HighlightSegment[] => splitHighlight(text, search && query ? [query] : [], false)
  const activeMatch = context.get('activeMatch')
  const stepMatch = (delta: 1 | -1): void => {
    if (!matches.length)
      return
    const at = activeMatch == null ? -1 : matches.indexOf(activeMatch)
    const next = at < 0
      ? (delta > 0 ? 0 : matches.length - 1)
      : (at + delta + matches.length) % matches.length
    send({ type: 'MATCH.SET', value: matches[next]! })
  }

  const previewText = (node: JsonViewerNode): string => {
    if (!node.branch)
      return ''
    return node.type === 'array' ? label.arrayPreview(node.count) : label.objectPreview(node.count)
  }
  const valueText = (node: JsonViewerNode): string => (node.truncated ? label.moreItems(node.count) : node.text)

  /**
   * 分支的可及名字：整份数据的最外层没有键名，得给它一个称呼；
   * 收起时再把成员数念进来——括号摘要那个部件对读屏是隐藏的。
   */
  const branchLabel = (node: JsonViewerNode): string => {
    const name = node.key ?? label.root
    return isExpanded(node.value) ? name : label.collapsedBranchLabel(name, node.count)
  }

  /** 两类行部件（item / branch）共用的 ARIA 与身份属性。 */
  const nodeAttrs = (node: JsonViewerNode | undefined, value: string): Record<string, string | number | undefined> => ({
    // 导航与展开都以此为行身份
    [ITEM_VALUE_ATTR]: value,
    'role': 'treeitem',
    'aria-level': node?.level,
    'aria-posinset': node?.posInSet,
    'aria-setsize': node?.setSize,
    // roving tabindex：整棵树只有锚点行留在 Tab 序列内
    'tabindex': anchor === value ? 0 : -1,
  })

  /** 行内各部件共用的状态标记，逐类型上色与循环/截断标注都读它。 */
  const nodeState = (node: JsonViewerNode | undefined, value: string): Record<string, string | undefined> => ({
    'data-value-type': node?.type,
    'data-circular': dataAttr(!!node?.circular),
    'data-truncated': dataAttr(!!node?.truncated),
    // 焦点落在哪一行是事实，与展开态互相独立
    'data-highlighted': dataAttr(highlighted === value),
    // 这一行命中了搜索词；在命中之间逐个走时停在这一行另投 data-current
    'data-match': dataAttr(matchSet.has(value)),
    'data-current': dataAttr(activeMatch != null && activeMatch === value),
  })

  /** 分支一系再多一个展开态：箭头旋转与子层露面都看它。 */
  const branchState = (node: JsonViewerNode | undefined, value: string): Record<string, string | undefined> => ({
    ...nodeState(node, value),
    'data-state': isExpanded(value) ? 'open' : 'closed',
  })

  /**
   * 可见行对应的行元素，按可见序排列，只在事件那一刻读活 DOM。
   * 收起分支的子行不进 DOM，所以文档序与可见序本就一致；仍按 rows 映射，
   * 免得作者在中间插了别的东西时顺序对不上。
   */
  const rowEls = (tree: HTMLElement): HTMLElement[] => {
    const byValue = new Map<string, HTMLElement>()
    for (const el of [...queryItems(tree, jsonViewerBranchQuery), ...queryItems(tree, jsonViewerItemQuery)]) {
      const value = itemValue(el)
      if (value != null && !byValue.has(value))
        byValue.set(value, el)
    }
    return rows
      .map(row => byValue.get(row.value))
      .filter((el): el is HTMLElement => el != null)
  }

  /** 行部件里的处理器拿不到 branch 容器，就地往上找最近的那个（嵌套分支各认各的）。 */
  const branchElOf = (el: HTMLElement): HTMLElement | null => el.closest<HTMLElement>(parts.branch.selector)

  // 按压通道：真源是机器 context 里「正被按住的那一行」的路径，每个分支行各自合成一份跟踪器；
  // Space / Enter 与触屏按住投影 data-pressed，指针按住由 :active 表出，皮肤两者同一档（行只换面）。
  // 键盘在 tree 容器上收口（切换展开态），按压只记事实、不拦键；视图没有禁用态，没有守卫
  const pressedValue = context.get('pressedValue')
  const press = (value: string): PressHandlers => createPressTracker({
    isPressed: () => context.get('pressedValue') === value,
    onChange: down => send(down ? { type: 'PRESS.START', value } : { type: 'PRESS.END', value }),
  })
  /** 只认落在自己身上的事件：branch 裹着整棵子层，子行上的按键与失焦会冒泡（React 的 onBlur 挂 focusout）上来。 */
  const onSelf = <E extends Event>(handler: (event: E) => void) => (event: E): void => {
    if (event.target === event.currentTarget)
      handler(event)
  }

  const focusValue = (el: HTMLElement | null): void => {
    const next = itemValue(el)
    if (next == null)
      return
    focusItem(el)
    send({ type: 'NODE.FOCUS', value: next })
  }

  /** 方向键落点：起点用锚点，终点在事件那一刻的活 DOM 上算。 */
  const focusBy = (tree: HTMLElement, intent: NavIntent): void => {
    focusValue(navigateItems(rowEls(tree), anchor, intent, { loop }))
  }

  /** 按路径把焦点搬到某一行（进子层、回父层用）。 */
  const focusOn = (tree: HTMLElement, value: string): void => {
    focusValue(rowEls(tree).find(el => itemValue(el) === value) ?? null)
  }

  return {
    visibleNodes: rows,
    view,
    wrap,
    tools,
    copyStatus,
    copied,
    announcement,
    setView: next => send({ type: 'VIEW.SET', view: next }),
    setWrap: next => send({ type: 'WRAP.SET', wrap: next }),
    expandAll,
    collapseAll,
    allExpanded,
    copy,
    isEmpty,
    emptyText: label.empty,
    text,
    // 只在原文档切段：树档用不上，不白走一遍原文
    textSegments: textView ? tokenizeJsonText(text) : [],
    expandedValue,
    focusedValue: anchor,
    isFocusWithin,
    isExpanded,
    previewText,
    valueText,
    searchMatches: matches,
    activeMatch: activeMatch != null && matchSet.has(activeMatch) ? activeMatch : null,
    nextMatch: () => stepMatch(1),
    prevMatch: () => stepMatch(-1),
    setActiveMatch: value => send({ type: 'MATCH.SET', value }),
    keySegments: node => segmentsOf(node.key ?? ''),
    valueSegments: node => (node.truncated ? segmentsOf(valueText(node), false) : segmentsOf(valueText(node))),
    setExpandedValue: next => send({ type: 'EXPANDED.SET', value: next }),
    expand: value => send({ type: 'BRANCH.EXPAND', value }),
    collapse: value => send({ type: 'BRANCH.COLLAPSE', value }),
    toggle: value => send({ type: 'BRANCH.TOGGLE', value }),

    getRootProps: () => normalize.element({
      ...parts.root.attrs,
      'data-size': prop('size'),
      'data-view': view,
      'data-variant': variant,
    }),

    // 原文档：一整块可框选的文本。这一档没有行、没有展开态，键盘只需要能滚，
    // 所以进 Tab 序列但不接任何按键处理器
    getTextProps: () => normalize.element({
      ...parts.text.attrs,
      'role': 'region',
      'aria-label': label.text,
      'tabindex': 0,
      // 自动换行：长行折到下一行而不是横向滚动；缺省不折，缩进与层级对得齐
      'data-wrap': dataAttr(wrap),
    }),

    // 原文里有类别的一段：只报类别，皮肤按它取树档同一套颜色；读屏照常连着念，不另报身份
    getTokenProps: props => normalize.element({
      ...parts.token.attrs,
      'data-kind': props.kind,
    }),

    // 键盘全在 tree 上收口：行只管声明自己，一次冒泡一个处理器
    getTreeProps: () => normalize.element({
      ...parts.tree.attrs,
      // 机器按 id 找到它，把停住的那一条命中滚进视野
      'id': scope.partId('json-viewer', 'tree'),
      'role': 'tree',
      // 这一片行没有可见标题，不给名字读屏只会念「树」
      'aria-label': label.tree,
      // 没有锚点行时容器兜底进 Tab 序列，由 onFocus 转投给行
      'tabindex': anchor == null ? 0 : -1,
      'onKeyDown': (event: KeyboardEvent) => {
        const tree = event.currentTarget as HTMLElement
        // 带 Ctrl/Cmd/Alt 的组合一律不归树管（Ctrl+Home 之类归浏览器与读屏）
        if (event.ctrlKey || event.metaKey || event.altKey)
          return

        // 上下键与 Home/End 走可见行；左右键另有展开/收起语义，不进同轴导航
        const intent = navIntentFromKey(event, { axis: 'vertical' })
        if (intent) {
          event.preventDefault()
          focusBy(tree, intent)
          return
        }

        const row = anchor != null ? byPath.get(anchor) : undefined
        // 方向由 DOM 现读：整页 dir=rtl 而作者没传 dir 时，视觉已经翻转、按键语义也得跟着翻
        const dir = prop('dir') ?? readDirection(tree)
        const forward = dir === 'rtl' ? 'ArrowLeft' : 'ArrowRight'
        const backward = dir === 'rtl' ? 'ArrowRight' : 'ArrowLeft'
        const key = event.key
        // 层级键与确认键只认不带 Shift 的那一下：Shift+方向键在别处是扩选，本视图没有选中语义。
        // 这个守卫不能提到上面去，'*' 在多数键盘布局上就得按住 Shift 才打得出来
        const plain = !event.shiftKey

        if (plain && key === forward) {
          if (!row?.branch)
            return
          if (!isExpanded(row.value)) {
            event.preventDefault()
            send({ type: 'BRANCH.EXPAND', value: row.value })
            return
          }
          // 已展开：进入首个子行
          const child = rows.find(r => r.parent === row.value)
          if (!child)
            return
          event.preventDefault()
          focusOn(tree, child.value)
          return
        }

        if (plain && key === backward) {
          if (row?.branch && isExpanded(row.value)) {
            event.preventDefault()
            send({ type: 'BRANCH.COLLAPSE', value: row.value })
            return
          }
          // 收起的分支与叶子都是跳回父行；根行没有父，什么也不做
          if (row?.parent == null)
            return
          event.preventDefault()
          focusOn(tree, row.parent)
          return
        }

        if (plain && (key === 'Enter' || key === ' ')) {
          // 叶子上没有可切换的东西，这两个键放行给页面（空格要滚页）
          if (!row?.branch)
            return
          event.preventDefault()
          // 按住不放会连发 keydown，这是切换：重复执行会来回翻转
          if (event.repeat)
            return
          send({ type: 'BRANCH.TOGGLE', value: row.value })
          return
        }

        if (key === '*') {
          if (!row)
            return
          const siblings = rows
            .filter(r => r.parent === row.parent && r.branch && !isExpanded(r.value))
            .map(r => r.value)
          // 同级已经全展开就什么也不做，这个键不吞
          if (!siblings.length)
            return
          event.preventDefault()
          send({ type: 'EXPANDED.SET', value: [...expandedValue, ...siblings] })
        }
      },
      'onFocus': (event: FocusEvent) => {
        const tree = event.currentTarget as HTMLElement
        // 只接管从树外进来的焦点：树内 Shift+Tab 往外退时转投会把人困在树里
        if (contains(tree, event.relatedTarget as Node | null))
          return
        // 回到上次那一行；没有锚点（第一次进来，或锚点随分支收起而消失）才落首行。
        // 落点行自己的 onFocus 会把锚点接过去
        const els = rowEls(tree)
        const anchorEl = anchor != null ? els.find(el => itemValue(el) === anchor) : undefined
        focusItem(anchorEl ?? navigateItems(els, null, 'first', { loop }))
      },
      'onFocusOut': (event: FocusEvent) => {
        const tree = event.currentTarget as HTMLElement
        if (contains(tree, event.relatedTarget as Node | null))
          return
        send({ type: 'VIEWER.BLUR' })
      },
    }),

    getItemProps: (props) => {
      const node = nodeOf(props.value)
      return normalize.element({
        ...parts.item.attrs,
        ...nodeAttrs(node, props.value),
        ...nodeState(node, props.value),
        // 名字从内容算：键名与值就写在这一行里，读屏念得出「name "曦寒"」。
        // 不另给 aria-label：那会盖掉值本身，只剩一个键名念出来
        // 点叶子只把焦点交给这一行，没有可切换的状态
        onClick: (event: MouseEvent) => focusValue(event.currentTarget as HTMLElement),
        onFocus: () => send({ type: 'NODE.FOCUS', value: props.value }),
      })
    },

    getItemKeyProps: props => normalize.element({
      ...parts['item-key'].attrs,
      ...nodeState(nodeOf(props.value), props.value),
    }),

    getItemValueProps: props => normalize.element({
      ...parts['item-value'].attrs,
      ...nodeState(nodeOf(props.value), props.value),
    }),

    getBranchProps: (props) => {
      const node = nodeOf(props.value)
      // 焦点落在 branch 上、按压面画在 branch-control 上：键盘那一路由这里替行代发，
      // 只认落在自己身上的按键与失焦（子层里的会冒泡上来）
      const handlers = press(props.value)
      return normalize.element({
        ...parts.branch.attrs,
        ...nodeAttrs(node, props.value),
        ...branchState(node, props.value),
        'aria-expanded': isExpanded(props.value) ? 'true' : 'false',
        // 分支裹着整棵子层，从内容算名字会把所有子孙的文字一并念出来，必须显式给
        'aria-label': node ? branchLabel(node) : undefined,
        'onFocus': () => send({ type: 'NODE.FOCUS', value: props.value }),
        'onKeyDown': onSelf(handlers.onKeyDown),
        'onKeyUp': onSelf(handlers.onKeyUp),
        'onBlur': onSelf<FocusEvent>(handlers.onBlur),
      })
    },

    getBranchControlProps: (props) => {
      const handlers = press(props.value)
      return normalize.element({
        ...parts['branch-control'].attrs,
        ...branchState(nodeOf(props.value), props.value),
        // 触屏按住投影 data-pressed，皮肤的按下面同时认它与指针 :active；
        // 键盘那一路由 branch 代发（焦点落在它身上），行自己只接触屏。与展开态互相独立
        'data-pressed': dataAttr(pressedValue === props.value),
        'onPointerDown': handlers.onPointerDown,
        'onPointerUp': handlers.onPointerUp,
        'onPointerCancel': handlers.onPointerCancel,
        'onClick': (event: MouseEvent) => {
          // 分支行只是 treeitem 里的一层内容，焦点该落在 branch 上
          const branchEl = branchElOf(event.currentTarget as HTMLElement)
          if (branchEl)
            focusValue(branchEl)
          send({ type: 'BRANCH.TOGGLE', value: props.value })
        },
      })
    },

    getBranchTriggerProps: props => normalize.element({
      ...parts['branch-trigger'].attrs,
      ...branchState(nodeOf(props.value), props.value),
      // 展开箭头重复了分支自己的左右方向键与点行语义，对读屏隐藏。
      // 不给 tabindex：两个适配器都把它铺成 span，本来就不在 Tab 序列里，
      // 写上 -1 只会把一个 aria-hidden 的节点变成可编程聚焦的节点
      'aria-hidden': true,
      'onClick': (event: MouseEvent) => {
        // 箭头长在 branch-control 里，不掐断冒泡会再跑一遍点行，展开态被切两回
        event.stopPropagation()
        const branchEl = branchElOf(event.currentTarget as HTMLElement)
        // 焦点该落在 treeitem 上，不能停在箭头这一层
        if (branchEl)
          focusValue(branchEl)
        send({ type: 'BRANCH.TOGGLE', value: props.value })
      },
    }),

    getBranchIndicatorProps: props => normalize.element({
      ...parts['branch-indicator'].attrs,
      ...branchState(nodeOf(props.value), props.value),
      'aria-hidden': true,
    }),

    getBranchTextProps: props => normalize.element({
      ...parts['branch-text'].attrs,
      ...branchState(nodeOf(props.value), props.value),
    }),

    getBranchContentProps: props => normalize.element({
      ...parts['branch-content'].attrs,
      ...branchState(nodeOf(props.value), props.value),
      // 子层是 treeitem 的下一级分组，role=group 是 tree 结构的必需环节
      role: 'group',
    }),

    getPreviewProps: props => normalize.element({
      ...parts.preview.attrs,
      ...branchState(nodeOf(props.value), props.value),
      // 摘要是括号加省略号的排版记号，念出来只有噪音；里头的成员数已折进分支的可及名字
      'aria-hidden': true,
    }),

    // 空态由组件自己收起：有行可摊时它不该占位置。文案由作者写在部件里
    getEmptyProps: () => normalize.element({
      ...parts.empty.attrs,
      hidden: !isEmpty || undefined,
    }),

    // 命中片段：只是同一段文字里的一截，读屏照常连着念，不另报身份
    getMarkProps: () => normalize.element(parts.mark.attrs),

    // 工具条报 group 不报 toolbar：toolbar 角色承诺条内靠方向键移动，这里每颗钮各占一个 Tab 位
    getToolbarProps: () => normalize.element({
      ...parts.toolbar.attrs,
      'role': 'group',
      'aria-label': label.toolbar,
      'data-view': view,
    }),

    // 展开 / 收起全部是一颗切换钮：名字与字形随这一下要做的事变（名字随动作走，不再报 aria-pressed）。
    // 只对树有意义，原文档里收起来；没有可展开的子层时禁用
    getExpandTriggerProps: () => toolButton('expand-trigger', allExpanded ? label.collapseAll : label.expandAll, allExpanded ? collapseAll : expandAll, textView, {
      'data-state': allExpanded ? 'open' : 'closed',
      // 工具条里的图标钮：接 Action Control icon 档、ghost 面，按压与命中区由配方给；比视图低一档、最低 sm
      'data-xh-action-control': '',
      'data-xh-action-profile': 'icon',
      'data-xh-action-display': 'always',
      'data-xh-action-size': toolSize,
      'data-xh-action-variant': 'ghost',
    }, isEmpty || !canToggleExpand),

    // 换行只对原文有意义，树档里收起来。开没开由 aria-pressed 报，名字不跟着变
    getWrapTriggerProps: () => toolButton('wrap-trigger', label.wrap, () => send({ type: 'WRAP.SET', wrap: !wrap }), !textView, {
      'aria-pressed': wrap ? 'true' : 'false',
      'data-state': wrap ? 'on' : 'off',
      // 无滑块开关：开着的选中面（品牌淡底）由皮肤在 data-state='on' 上桥接
      'data-xh-action-control': '',
      'data-xh-action-profile': 'icon',
      'data-xh-action-display': 'always',
      'data-xh-action-size': toolSize,
      'data-xh-action-variant': 'ghost',
    }),

    // 复制的是原文档那一份，不论此刻在哪一档。成功回执换成对钩并由播报区念出；
    // 写入在途不接第二次（机器不收），钮不禁用：禁用会把焦点踢出去
    getCopyTriggerProps: () => toolButton('copy-trigger', label.copy, copy, false, {
      'data-state': copyStatus,
      'data-copied': dataAttr(copied),
      'data-xh-action-control': '',
      'data-xh-action-profile': 'icon',
      'data-xh-action-display': 'always',
      'data-xh-action-size': toolSize,
      'data-xh-action-variant': 'ghost',
    }),

    // 形态钮：在树与原文之间来回切，名字与字形取这一下要切去的那一档（名字随动作走，不报 aria-pressed）。
    // 钉在条的末端，两档切过去它不挪位置
    getViewTriggerProps: () => toolButton('view-trigger', textView ? label.showTree : label.showText, () => send({ type: 'VIEW.SET', view: textView ? 'tree' : 'text' }), false, {
      'data-view': view,
      'data-xh-action-control': '',
      'data-xh-action-profile': 'icon',
      'data-xh-action-display': 'always',
      'data-xh-action-size': toolSize,
      'data-xh-action-variant': 'ghost',
    }),

    // 复制成功的文字回执：换成对钩读屏拿不到，这一处是唯一的通道
    getStatusProps: () => normalize.element({
      ...parts.status.attrs,
      'role': 'status',
      'aria-live': 'polite',
      'aria-atomic': 'true',
      'data-state': copyStatus,
    }),
  }
}
