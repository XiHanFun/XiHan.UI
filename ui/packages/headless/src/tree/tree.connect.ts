import type { NavIntent } from '@xihan-ui/behavior'
import type { NormalizeProps, PropTypes } from '@xihan-ui/core'
import type { Service } from '@xihan-ui/machine'
import type { TreeApi, TreeNodeMeta, TreeSchema, TreeVisibleNode } from './tree.types'
import { focusItem, indexOfValue, isItemDisabled, ITEM_VALUE_ATTR, itemValue, matchTypeahead, navigateItems, navIntentFromKey, queryItems } from '@xihan-ui/behavior'
import { contains, dataAttr } from '@xihan-ui/core'
import { treeAnatomy, treeBranchQuery, treeItemQuery } from './tree.anatomy'
import { flattenTree, indexTree, treeSelectionMode } from './tree.machine'

const parts = treeAnatomy.build()

export function connectTree<T extends PropTypes>(
  service: Service<TreeSchema>,
  normalize: NormalizeProps<T>,
): TreeApi<T> {
  const { context, prop, send, refs, scope } = service
  const collection = prop('collection') ?? []
  const expandedValue = context.get('expandedValue')
  const selectedValue = context.get('selectedValue')
  const treeDisabled = !!prop('disabled')
  const dir = prop('dir') ?? 'ltr'
  // 树不像列表那样天然成环：上键停在首行、下键停在末行才符合"层级里有上下文"的直觉
  const loop = prop('loop') ?? false
  const typeaheadOn = prop('typeahead') ?? true
  const expandOnClick = prop('expandOnClick') ?? true
  const mode = treeSelectionMode(prop('selectionMode'))
  const multiselectable = mode === 'multiple'
  const ids = scope.ids('tree', 'label', 'tree')

  // 摊平与索引都是 (collection, 展开集合) 的纯函数，一行 DOM 都不碰：
  // Vue 在 render 期求值 connect，那一刻 DOM 还不存在。
  const rows = flattenTree(collection, expandedValue)
  const metaIndex = indexTree(collection)
  const visible = new Map(rows.map(row => [row.value, row]))

  // 焦点锚点投影成"可见的"：祖先分支被收起后，节点仍在 DOM 里但已 hidden、不可聚焦。
  // 让它继续认领 tabindex=0，而容器又判自己"焦点在树内"让了位，整棵树就一个 Tab 停靠点都没有。
  const rawFocused = context.get('focusedValue')
  const focusedValue = rawFocused != null && visible.has(rawFocused) ? rawFocused : null

  const metaOf = (value: string): TreeNodeMeta | undefined => metaIndex.get(value)
  const isExpanded = (value: string): boolean => expandedValue.includes(value)
  const isSelected = (value: string): boolean => selectedValue.includes(value)
  // 整棵树禁用向下传导到每个节点；节点也能在 collection 里单独禁用
  const isDisabled = (value: string): boolean => treeDisabled || !!metaOf(value)?.disabled

  // roving tabindex 的唯一锚点：焦点在树内跟焦点走，否则落在首个"可见的"选中节点上。
  // 取可见序里的第一个而不是选中集合里的第一个：后者可能藏在收起的分支里，
  // hidden 元素不可聚焦，认领了 tabindex=0 也等于没有停靠点。
  const anchor = focusedValue ?? rows.find(row => selectedValue.includes(row.value))?.value ?? null

  /** 节点（item 与 branch）共用的 ARIA 与身份属性。 */
  const nodeAttrs = (value: string): Record<string, string | number | undefined> => {
    const meta = metaOf(value)
    return {
      // 导航、检索、选中与展开都以此为节点身份
      [ITEM_VALUE_ATTR]: value,
      'role': 'treeitem',
      // 层级三件套的事实源是 collection，不是 DOM 嵌套深度：
      // 不在 collection 里的节点没有层级可言，宁可不报，也不能报一个编出来的 1/1
      'aria-level': meta?.level,
      'aria-posinset': meta?.posInSet,
      'aria-setsize': meta?.setSize,
      // 未选中必须显式输出 false，省略会让读屏无从区分"未选中"与"不是可选节点"
      'aria-selected': isSelected(value) ? 'true' : 'false',
      // 集合条目一律 aria-disabled，绝不输出原生 disabled：原生 disabled 不可聚焦、
      // 也不派发 click，禁用节点就再也当不成方向键的起点
      'aria-disabled': isDisabled(value) ? 'true' : 'false',
      // roving tabindex：整棵树只有锚点节点留在 Tab 序列内
      'tabindex': anchor === value ? 0 : -1,
    }
  }

  /** 叶子一系（item / item-text / item-indicator）共用的状态标记，样式层各处一致。 */
  const itemState = (value: string): Record<string, string | undefined> => ({
    'data-selected': dataAttr(isSelected(value)),
    'data-disabled': dataAttr(isDisabled(value)),
    // 焦点所在与选中互相独立：可以停在一个没被选中的节点上
    'data-highlighted': dataAttr(focusedValue === value),
  })

  /** 分支一系再多一个展开态，箭头旋转与子树收起都看它。 */
  const branchState = (value: string): Record<string, string | undefined> => ({
    ...itemState(value),
    'data-state': isExpanded(value) ? 'open' : 'closed',
  })

  /**
   * 可见行对应的节点元素，按**可见序**排列。只在事件那一刻读活 DOM。
   *
   * 顺序刻意不取文档序：收起分支的子节点仍留在文档里（内容常挂 + hidden，不卸载作者节点），
   * 按文档序走方向键会一头扎进看不见的子树。摊平序才是用户眼里的行序。
   */
  const visibleEls = (tree: HTMLElement): HTMLElement[] => {
    const byValue = new Map<string, HTMLElement>()
    for (const el of [...queryItems(tree, treeBranchQuery), ...queryItems(tree, treeItemQuery)]) {
      const value = itemValue(el)
      if (value != null && !byValue.has(value))
        byValue.set(value, el)
    }
    return rows
      .map(row => byValue.get(row.value))
      .filter((el): el is HTMLElement => el != null)
  }

  /** 节点级处理器拿不到 branch 容器，只能就地往上找最近的那个（嵌套分支各认各的）。 */
  const branchElOf = (el: HTMLElement): HTMLElement | null => el.closest<HTMLElement>(parts.branch.selector)

  const focusValue = (el: HTMLElement | null): string | null => {
    const next = itemValue(el)
    if (next == null)
      return null
    focusItem(el)
    send({ type: 'NODE.FOCUS', value: next })
    return next
  }

  /** 方向键落点：起点用锚点，终点在可见行上算，禁用节点自动跳过。 */
  const focusBy = (tree: HTMLElement, intent: NavIntent): void => {
    focusValue(navigateItems(visibleEls(tree), anchor, intent, { loop }))
  }

  /** 按值把焦点搬到某一行（进子节点、回父节点用）。 */
  const focusOn = (tree: HTMLElement, value: string): void => {
    focusValue(visibleEls(tree).find(el => itemValue(el) === value) ?? null)
  }

  /**
   * 连打检索的取字处是 collection 里的 label，不是节点 textContent：
   * 分支节点裹着整棵子树，textContent 会把所有子孙的文字一并算进去，检索立刻被带跑。
   */
  const nodeText = (el: HTMLElement): string => {
    const value = itemValue(el)
    if (value == null)
      return ''
    return metaOf(value)?.label ?? value
  }

  /** 连打检索落点：从当前锚点的下一个绕一圈找，禁用节点跳过；未命中保持原状。 */
  const focusMatch = (tree: HTMLElement, query: string): void => {
    const list = visibleEls(tree)
    focusValue(matchTypeahead(list, indexOfValue(list, anchor), query, {
      text: nodeText,
      skip: isItemDisabled,
    }))
  }

  /**
   * 确认键的落点：先选中，分支再按 expandOnClick 顺带切换展开态（与点分支行同义）。
   * 焦点此刻就在这一行上，收起子树不会把焦点困在里面，因此无需额外把焦点捞回来。
   */
  const activate = (row: TreeVisibleNode): void => {
    if (row.disabled || treeDisabled)
      return
    send({ type: 'NODE.SELECT', value: row.value })
    if (row.branch && expandOnClick)
      send({ type: 'BRANCH.TOGGLE', value: row.value })
  }

  return {
    collection,
    visibleNodes: rows,
    expandedValue,
    selectedValue,
    focusedValue,
    selectionMode: mode,
    disabled: treeDisabled,
    isExpanded,
    isSelected,
    setExpandedValue: next => send({ type: 'EXPANDED.SET', value: next }),
    setSelectedValue: next => send({ type: 'SELECTED.SET', value: next }),
    expand: value => send({ type: 'BRANCH.EXPAND', value }),
    collapse: value => send({ type: 'BRANCH.COLLAPSE', value }),
    select: value => send({ type: 'NODE.SELECT', value }),

    getRootProps: () => normalize.element({
      ...parts.root.attrs,
      'data-disabled': dataAttr(treeDisabled),
    }),

    getLabelProps: () => normalize.element({
      ...parts.label.attrs,
      'id': ids.label,
      'data-disabled': dataAttr(treeDisabled),
    }),

    // 键盘全在 tree 上收口：节点只管声明自己，一次冒泡一个处理器
    getTreeProps: () => normalize.element({
      ...parts.tree.attrs,
      'id': ids.tree,
      'role': 'tree',
      'aria-labelledby': ids.label,
      // 复选与否必须显式说：省略只是"没说"，读屏无从区分单选树与"作者忘了标"
      'aria-multiselectable': multiselectable ? 'true' : 'false',
      'aria-disabled': treeDisabled ? 'true' : 'false',
      // 焦点在树外时容器兜底进 Tab 序列，由 onFocus 转投给节点。
      // 判据用 focusedValue 而非 anchor：anchor 可能指向一个已删掉、已隐藏或压根不在树里的值，
      // 那时没有任何节点认领 tabindex=0，容器再一让位，整棵树对键盘用户永久不可达
      'tabindex': focusedValue == null ? 0 : -1,
      'data-disabled': dataAttr(treeDisabled),
      'onKeyDown': (event: KeyboardEvent) => {
        if (treeDisabled)
          return
        const tree = event.currentTarget as HTMLElement
        const key = event.key
        // 带 Ctrl/Cmd/Alt 的组合一律不归树管（Ctrl+Home 之类归浏览器与读屏），也不进连打检索
        if (event.ctrlKey || event.metaKey || event.altKey)
          return

        // 上下键与 Home/End 走可见行。轴固定 vertical：左右键在树里另有展开/收起的语义，
        // 不能被当成同轴导航吃掉
        const intent = navIntentFromKey(event, { axis: 'vertical' })
        if (intent) {
          event.preventDefault()
          focusBy(tree, intent)
          return
        }

        const row = focusedValue != null ? visible.get(focusedValue) : undefined
        // rtl 下左右键整体对调：展开永远是"往子层去"的那个方向
        const forward = dir === 'rtl' ? 'ArrowLeft' : 'ArrowRight'
        const backward = dir === 'rtl' ? 'ArrowRight' : 'ArrowLeft'

        if (key === forward) {
          if (!row?.branch)
            return
          if (!row.expanded) {
            // 禁用分支展不开，这个键也就不归树管，放行给页面
            if (row.disabled)
              return
            event.preventDefault()
            send({ type: 'BRANCH.EXPAND', value: row.value })
            return
          }
          // 已展开：进入首个子节点。禁用的分支照样能进——移动焦点不是对节点的操作
          const child = rows.find(r => r.parent === row.value)
          if (!child)
            return
          event.preventDefault()
          focusOn(tree, child.value)
          return
        }

        if (key === backward) {
          if (row?.branch && row.expanded) {
            if (row.disabled)
              return
            event.preventDefault()
            send({ type: 'BRANCH.COLLAPSE', value: row.value })
            return
          }
          // 收起的分支与叶子都是"跳回父节点"；根层的行没有父，什么也不做
          if (row?.parent == null)
            return
          event.preventDefault()
          focusOn(tree, row.parent)
          return
        }

        if (key === 'Enter') {
          if (!row)
            return
          event.preventDefault()
          activate(row)
          return
        }

        // '*' 展开当前层全部同级分支。要抢在连打检索之前判：它也是可打印字符，
        // 落到检索里就再也走不到这条
        if (key === '*') {
          if (!row)
            return
          const siblings = rows
            .filter(r => r.parent === row.parent && r.branch && !r.expanded && !r.disabled)
            .map(r => r.value)
          // 同级已经全展开了就什么也没发生，这个键也就不该被吞掉
          if (!siblings.length)
            return
          event.preventDefault()
          send({ type: 'EXPANDED.SET', value: [...expandedValue, ...siblings] })
          return
        }

        // 连打检索只搬焦点、不改选中。缓冲区空时空格不算字符（push 返回 null），
        // 落到下面按确认键处理；缓冲区非空时它是词中间的空格，归检索。
        // 这个键既已被检索吞掉就一律拦下默认行为——词中间的空格若放行，页面会跟着滚一屏
        const query = typeaheadOn ? refs.get('typeahead').push(key) : null
        if (query != null) {
          event.preventDefault()
          focusMatch(tree, query)
          return
        }
        if (key === ' ') {
          if (!row)
            return
          event.preventDefault()
          activate(row)
        }
      },
      'onFocus': (event: FocusEvent) => {
        const tree = event.currentTarget as HTMLElement
        // 只接管从树外进来的焦点：树内 Shift+Tab 往外退时转投会把人困在树里
        if (contains(tree, event.relatedTarget as Node | null))
          return
        const list = visibleEls(tree)
        // 焦点进入树应当落在选中节点上；它不可停留（禁用、被收起、或压根不在树里）时
        // 退回首个可停留的行。整棵树禁用时两路都取不到，焦点就留在容器上
        const selected = list.find((el) => {
          const value = itemValue(el)
          return value != null && isSelected(value) && !isItemDisabled(el)
        })
        // 落点节点自己的 onFocus 会把锚点接过去
        focusItem(selected ?? navigateItems(list, null, 'first'))
      },
      'onFocusOut': (event: FocusEvent) => {
        const tree = event.currentTarget as HTMLElement
        if (contains(tree, event.relatedTarget as Node | null))
          return
        send({ type: 'TREE.BLUR' })
      },
    }),

    getItemProps: node => normalize.element({
      ...parts.item.attrs,
      ...nodeAttrs(node.value),
      ...itemState(node.value),
      onClick: (event: MouseEvent) => {
        if (isDisabled(node.value))
          return
        // 点击即把焦点交给这一行：叶子本身就是 treeitem，直接认 currentTarget
        focusValue(event.currentTarget as HTMLElement)
        send({ type: 'NODE.SELECT', value: node.value })
      },
      // 焦点是事实不是许可：禁用节点被点到也记锚点，方向键才知道从哪儿起步
      onFocus: () => send({ type: 'NODE.FOCUS', value: node.value }),
    }),

    getItemTextProps: node => normalize.element({
      ...parts['item-text'].attrs,
      ...itemState(node.value),
    }),

    getItemIndicatorProps: node => normalize.element({
      ...parts['item-indicator'].attrs,
      ...itemState(node.value),
      'aria-hidden': 'true',
    }),

    getBranchProps: node => normalize.element({
      ...parts.branch.attrs,
      ...nodeAttrs(node.value),
      ...branchState(node.value),
      'aria-expanded': isExpanded(node.value) ? 'true' : 'false',
      // 分支的可及名字必须显式给：它裹着整棵子树，"从内容算名字"会把所有子孙的
      // 文字一并念出来。名字取 collection 里的 label（缺省退回 value），
      // 与作者渲染在 branch-text 里的文字同源
      'aria-label': metaOf(node.value)?.label,
      'onFocus': () => send({ type: 'NODE.FOCUS', value: node.value }),
    }),

    getBranchControlProps: node => normalize.element({
      ...parts['branch-control'].attrs,
      ...branchState(node.value),
      onClick: (event: MouseEvent) => {
        if (isDisabled(node.value))
          return
        // 分支行只是 treeitem 里的一层内容，焦点该落在 branch 上
        const branchEl = branchElOf(event.currentTarget as HTMLElement)
        if (branchEl)
          focusValue(branchEl)
        send({ type: 'NODE.SELECT', value: node.value })
        if (expandOnClick)
          send({ type: 'BRANCH.TOGGLE', value: node.value })
      },
    }),

    getBranchTriggerProps: node => normalize.element({
      ...parts['branch-trigger'].attrs,
      ...branchState(node.value),
      // 展开箭头只是重复了 branch 自己已有的左右方向键与点行语义，对读屏是纯噪音；
      // tabindex=-1 让它退出 Tab 序列——作者把它写成 <button> 也照样退出，
      // 否则每条分支都会多占一个 Tab 位，roving tabindex 当场失效
      'aria-hidden': 'true',
      'tabindex': -1,
      'onClick': (event: MouseEvent) => {
        // 箭头长在 branch-control 里面：不掐断冒泡就会再跑一遍"点行"，
        // 展开态一次点击被切两回等于没切
        event.stopPropagation()
        if (isDisabled(node.value))
          return
        const branchEl = branchElOf(event.currentTarget as HTMLElement)
        // tabindex=-1 的节点是点得到焦点的：不显式接管，焦点会停在这个 aria-hidden 的箭头上。
        // 顺带也把"焦点原本停在这条分支的子树里、收起后掉进隐藏节点"那一路一并解决了
        if (branchEl)
          focusValue(branchEl)
        send({ type: 'BRANCH.TOGGLE', value: node.value })
      },
    }),

    getBranchIndicatorProps: node => normalize.element({
      ...parts['branch-indicator'].attrs,
      ...branchState(node.value),
      'aria-hidden': 'true',
    }),

    getBranchTextProps: node => normalize.element({
      ...parts['branch-text'].attrs,
      ...branchState(node.value),
    }),

    getBranchContentProps: node => normalize.element({
      ...parts['branch-content'].attrs,
      ...branchState(node.value),
      // 子层是 treeitem 的下一级分组，role=group 是 tree 结构的必需环节
      role: 'group',
      // 收起只加 hidden，不卸载作者节点：子树里的业务 DOM（输入框、滚动位置）得留着
      hidden: !isExpanded(node.value) || undefined,
    }),
  }
}
