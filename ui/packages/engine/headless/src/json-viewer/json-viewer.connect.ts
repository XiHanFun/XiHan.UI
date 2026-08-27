import type { NavIntent } from '@xihan-ui/behavior'
import type { NormalizeProps, PropTypes } from '@xihan-ui/kernel'
import type { Service } from '@xihan-ui/machine'
import type { JsonViewerApi, JsonViewerNode, JsonViewerSchema } from './json-viewer.types'
import { focusItem, ITEM_VALUE_ATTR, itemValue, navigateItems, navIntentFromKey, queryItems, readDirection } from '@xihan-ui/behavior'
import { contains, dataAttr } from '@xihan-ui/kernel'
import { jsonViewerAnatomy, jsonViewerBranchQuery, jsonViewerItemQuery } from './json-viewer.anatomy'
import { flattenJson, jsonSeedExpanded, jsonText } from './json-viewer.machine'

const parts = jsonViewerAnatomy.build()

export function connectJsonViewer<T extends PropTypes>(
  service: Service<JsonViewerSchema>,
  normalize: NormalizeProps<T>,
): JsonViewerApi<T> {
  const { context, prop, send } = service
  // null = 还没人碰过展开集合，按当下的数据现算：value 可能晚于机器启动才到
  const expandedValue = context.get('expandedValue') ?? jsonSeedExpanded(prop)
  const loop = prop('loop') ?? false

  // 摊平是 (value, 展开集合) 的纯函数；connect 在渲染期求值，此时 DOM 尚不存在
  const rows = flattenJson(prop('value'), {
    expanded: expandedValue,
    maxItems: prop('maxItems'),
    maxStringLength: prop('maxStringLength'),
    sortKeys: prop('sortKeys'),
  })
  const byPath = new Map(rows.map(row => [row.value, row]))

  const translations = prop('translations')
  const label = {
    tree: translations?.tree ?? 'JSON',
    text: translations?.text ?? 'JSON source',
    root: translations?.root ?? 'root',
    objectPreview: translations?.objectPreview ?? ((count: number) => `{…} ${count}`),
    arrayPreview: translations?.arrayPreview ?? ((count: number) => `[…] ${count}`),
    collapsedBranchLabel: translations?.collapsedBranchLabel
      ?? ((name: string, count: number) => `${name}, ${count === 1 ? '1 item' : `${count} items`}`),
    moreItems: translations?.moreItems ?? ((count: number) => `… ${count} more`),
  }

  // 焦点锚点投影成可见的：分支一收起，它底下的行就不在 DOM 里了，
  // 让一个已消失的路径继续认领 tabindex=0 会让整棵树没有 Tab 停靠点
  const rawFocused = context.get('focusedValue')
  const anchor = rawFocused != null && byPath.has(rawFocused) ? rawFocused : null
  // 锚点跨 Tab 往返留着（回来落回上次那一行），高亮只跟当下的焦点走
  const isFocusWithin = context.get('focusWithin')
  const highlighted = isFocusWithin ? anchor : null

  const view = prop('view') ?? 'tree'
  // 键序与环路记号跟树同源，两档切过去内容对得上
  const text = jsonText(prop('value'), !!prop('sortKeys'))

  const isExpanded = (value: string): boolean => expandedValue.includes(value)
  const nodeOf = (value: string): JsonViewerNode | undefined => byPath.get(value)

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
    'data-type': node?.type,
    'data-circular': dataAttr(!!node?.circular),
    'data-truncated': dataAttr(!!node?.truncated),
    // 焦点落在哪一行是事实，与展开态互相独立
    'data-highlighted': dataAttr(highlighted === value),
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
    text,
    expandedValue,
    focusedValue: anchor,
    isFocusWithin,
    isExpanded,
    previewText,
    valueText,
    setExpandedValue: next => send({ type: 'EXPANDED.SET', value: next }),
    expand: value => send({ type: 'BRANCH.EXPAND', value }),
    collapse: value => send({ type: 'BRANCH.COLLAPSE', value }),
    toggle: value => send({ type: 'BRANCH.TOGGLE', value }),

    getRootProps: () => normalize.element({
      ...parts.root.attrs,
      'data-size': prop('size'),
      'data-view': view,
    }),

    // 原文档：一整块可框选的文本。这一档没有行、没有展开态，键盘只需要能滚，
    // 所以进 Tab 序列但不接任何按键处理器
    getTextProps: () => normalize.element({
      ...parts.text.attrs,
      'role': 'region',
      'aria-label': label.text,
      'tabindex': 0,
    }),

    // 键盘全在 tree 上收口：行只管声明自己，一次冒泡一个处理器
    getTreeProps: () => normalize.element({
      ...parts.tree.attrs,
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
      return normalize.element({
        ...parts.branch.attrs,
        ...nodeAttrs(node, props.value),
        ...branchState(node, props.value),
        'aria-expanded': isExpanded(props.value) ? 'true' : 'false',
        // 分支裹着整棵子层，从内容算名字会把所有子孙的文字一并念出来，必须显式给
        'aria-label': node ? branchLabel(node) : undefined,
        'onFocus': () => send({ type: 'NODE.FOCUS', value: props.value }),
      })
    },

    getBranchControlProps: props => normalize.element({
      ...parts['branch-control'].attrs,
      ...branchState(nodeOf(props.value), props.value),
      onClick: (event: MouseEvent) => {
        // 分支行只是 treeitem 里的一层内容，焦点该落在 branch 上
        const branchEl = branchElOf(event.currentTarget as HTMLElement)
        if (branchEl)
          focusValue(branchEl)
        send({ type: 'BRANCH.TOGGLE', value: props.value })
      },
    }),

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
  }
}
