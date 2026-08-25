import type { NavIntent } from '@xihan-ui/behavior'
import type { NormalizeProps, PropTypes } from '@xihan-ui/kernel'
import type { Service } from '@xihan-ui/machine'
import type { TreeApi, TreeNode, TreeNodeMeta, TreeSchema, TreeVisibleNode } from './tree.types'
import { cascadeState, focusItem, indexOfValue, isItemDisabled, ITEM_VALUE_ATTR, itemValue, matchTypeahead, navigateItems, navIntentFromKey, queryItems } from '@xihan-ui/behavior'
import { contains, dataAttr } from '@xihan-ui/kernel'
import { treeAnatomy, treeBranchQuery, treeItemQuery } from './tree.anatomy'
import { flattenTree, indexTree, treeSelectionMode } from './tree.machine'

const parts = treeAnatomy.build()

/**
 * 子节点全是叶子的那些分支——横排只开给它们。
 *
 * 判据是「这一层不再往下分」而不是「深度等于几」：同一棵树里各枝深浅不一，
 * 按深度判会把浅枝的中间层也横过来。
 */
function collectLeafOnlyBranches(nodes: TreeNode[]): Set<string> {
  const out = new Set<string>()
  const walk = (list: TreeNode[]): void => {
    for (const node of list) {
      if (!node.children)
        continue
      if (node.children.length > 0 && node.children.every(child => !child.children))
        out.add(node.value)
      walk(node.children)
    }
  }
  walk(nodes)
  return out
}


export function connectTree<T extends PropTypes>(
  service: Service<TreeSchema>,
  normalize: NormalizeProps<T>,
): TreeApi<T> {
  const { context, prop, send, refs, scope } = service
  const collection = prop('collection') ?? []
  const expandedValue = context.get('expandedValue')
  const selection = context.get('selection')
  const treeDisabled = !!prop('disabled')
  const dir = prop('dir') ?? 'ltr'
  // 横排只开给末端那一层；其余一律竖排，层级得靠竖排读出来
  const leafOrientation = prop('leafOrientation') ?? 'vertical'
  // 树不回绕：上键停在首行、下键停在末行
  const loop = prop('loop') ?? false
  const typeaheadOn = prop('typeahead') ?? true
  const expandOnClick = prop('expandOnClick') ?? true
  const mode = treeSelectionMode(prop('selectionMode'), prop('multiple'))
  const multiselectable = mode === 'multiple'
  const ids = scope.ids('tree', 'label', 'tree')

  // 摊平与索引都是 (collection, 展开集合) 的纯函数；connect 在 Vue 的 render 期求值，此时 DOM 尚不存在。
  const rows = flattenTree(collection, expandedValue)
  const metaIndex = indexTree(collection)
  const leafOnlyBranches = collectLeafOnlyBranches(collection)
  const visible = new Map(rows.map(row => [row.value, row]))

  // 焦点锚点投影成可见的：祖先分支收起后节点仍在 DOM 里但 hidden、不可聚焦，
  // 让它继续认领 tabindex=0 会让整棵树没有 Tab 停靠点
  const rawFocused = context.get('focusedValue')
  const focusedValue = rawFocused != null && visible.has(rawFocused) ? rawFocused : null

  const metaOf = (value: string): TreeNodeMeta | undefined => metaIndex.get(value)
  const isExpanded = (value: string): boolean => expandedValue.includes(value)
  // 级联模式下选中态从值集聚合得出：父随子勾、部分勾中半选
  const cascade = mode === 'multiple' && !!prop('cascade')
  const cascaded = cascade ? cascadeState(collection, selection) : null
  const isSelected = (value: string): boolean => (cascaded ? cascaded.checked.has(value) : selection.includes(value))
  const isIndeterminate = (value: string): boolean => cascaded?.indeterminate.has(value) ?? false
  // 整棵树禁用向下传导到每个节点；节点也能在 collection 里单独禁用
  const isDisabled = (value: string): boolean => treeDisabled || !!metaOf(value)?.disabled

  // roving tabindex 的唯一锚点：焦点在树内跟焦点走，否则落在首个可见的选中节点上。
  // 取可见序而非选中集合的第一个，后者可能藏在收起的分支里、hidden 不可聚焦。
  const anchor = focusedValue ?? rows.find(row => selection.includes(row.value))?.value ?? null

  /** 节点（item 与 branch）共用的 ARIA 与身份属性。 */
  const nodeAttrs = (value: string): Record<string, string | number | undefined> => {
    const meta = metaOf(value)
    return {
      // 导航、检索、选中与展开都以此为节点身份
      [ITEM_VALUE_ATTR]: value,
      'role': 'treeitem',
      // 层级三件套的事实源是 collection，不是 DOM 嵌套深度；不在 collection 里的节点不报层级
      'aria-level': meta?.level,
      'aria-posinset': meta?.posInSet,
      'aria-setsize': meta?.setSize,
      // 未选中必须显式输出 false，省略会让读屏无从区分未选中与不是可选节点
      'aria-selected': isSelected(value) ? 'true' : 'false',
      // 级联勾选是三态：读屏靠 aria-checked 报半选，非级联不输出该属性
      'aria-checked': cascade ? (isSelected(value) ? 'true' : isIndeterminate(value) ? 'mixed' : 'false') : undefined,
      // 集合条目一律 aria-disabled，不用原生 disabled：原生 disabled 不可聚焦、不派 click
      'aria-disabled': isDisabled(value) ? 'true' : 'false',
      // roving tabindex：整棵树只有锚点节点留在 Tab 序列内
      'tabindex': anchor === value ? 0 : -1,
    }
  }

  /** 叶子一系（item / item-text / item-indicator）共用的状态标记，样式层各处一致。 */
  const itemState = (value: string): Record<string, string | undefined> => ({
    'data-selected': dataAttr(isSelected(value)),
    'data-indeterminate': dataAttr(isIndeterminate(value)),
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
   * 可见行对应的节点元素，按可见序排列，只在事件那一刻读活 DOM。
   * 顺序不取文档序：收起分支的子节点仍留在文档里，按文档序走会走进看不见的子树。
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

  /** 把手所在的那一行：叶子是 item，分支是 branch，两类都自报 data-value。 */
  const rowElOf = (el: HTMLElement): HTMLElement | null =>
    el.closest<HTMLElement>(`${parts.item.selector}, ${parts.branch.selector}`)

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
   * 分支节点裹着整棵子树，textContent 会把所有子孙的文字一并算进去。
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
   * 确认键的落点：先选中，分支再按 expandOnClick 顺带切换展开态。
   * 焦点此刻就在这一行上，收起子树不会把焦点困在里面。
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
    selection,
    focusedValue,
    multiple: mode === 'multiple',
    selectionMode: mode,
    disabled: treeDisabled,
    isExpanded,
    isSelected,
    isIndeterminate,
    setExpandedValue: next => send({ type: 'EXPANDED.SET', value: next }),
    setSelection: next => send({ type: 'SELECTION.SET', value: next }),
    expand: value => send({ type: 'BRANCH.EXPAND', value }),
    collapse: value => send({ type: 'BRANCH.COLLAPSE', value }),
    select: value => send({ type: 'NODE.SELECT', value }),

    getRootProps: () => normalize.element({
      ...parts.root.attrs,
      'data-orientation': 'vertical',
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
      'aria-orientation': 'vertical',
      // 复选与否必须显式说，省略只是没说
      'aria-multiselectable': multiselectable ? 'true' : 'false',
      'aria-disabled': treeDisabled ? 'true' : 'false',
      'data-orientation': 'vertical',
      // 焦点在树外时容器兜底进 Tab 序列，由 onFocus 转投给节点。
      // 判据用 focusedValue 而非 anchor：anchor 可能指向已删掉、已隐藏或不在树里的值，那时无人认领 tabindex=0
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

        // 上下键与 Home/End 走可见行；轴固定 vertical，左右键另有展开/收起语义
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
            // 禁用分支展不开，这个键放行给页面
            if (row.disabled)
              return
            event.preventDefault()
            send({ type: 'BRANCH.EXPAND', value: row.value })
            return
          }
          // 已展开：进入首个子节点；禁用的分支照样能进，移动焦点不是对节点的操作
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
          // 收起的分支与叶子都是跳回父节点；根层的行没有父，什么也不做
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

        // '*' 展开当前层全部同级分支，要抢在连打检索之前判，它也是可打印字符
        if (key === '*') {
          if (!row)
            return
          const siblings = rows
            .filter(r => r.parent === row.parent && r.branch && !r.expanded && !r.disabled)
            .map(r => r.value)
          // 同级已经全展开就什么也不做，这个键不吞
          if (!siblings.length)
            return
          event.preventDefault()
          send({ type: 'EXPANDED.SET', value: [...expandedValue, ...siblings] })
          return
        }

        // 连打检索只搬焦点、不改选中；缓冲区空时空格不算字符，落到下面按确认键处理。
        // 被检索吞掉的键一律拦下默认行为，否则空格会滚页
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
        // 焦点进入树落在选中节点上；不可停留时退回首个可停留行，两路都取不到则留在容器上
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
      'aria-hidden': true,
    }),

    getBranchProps: node => normalize.element({
      ...parts.branch.attrs,
      ...nodeAttrs(node.value),
      ...branchState(node.value),
      'aria-expanded': isExpanded(node.value) ? 'true' : 'false',
      // 分支的可及名字必须显式给：它裹着整棵子树，从内容算名字会把子孙的文字一并念出来。
      // 名字取 collection 里的 label（缺省退回 value）
      'aria-label': metaOf(node.value)?.label,
      'onFocus': () => send({ type: 'NODE.FOCUS', value: node.value }),
    }),

    // 勾选把手：把「勾这一项」与「点这一行」分成两个可点区域。
    // 点行的语义（单选替换、分支展开）归 item / branch-control，把手只管勾选。
    getItemCheckboxProps: node => normalize.element({
      ...parts['item-checkbox'].attrs,
      ...itemState(node.value),
      // 勾选态由所在的 treeitem 用 aria-selected / aria-checked 报，把手自己不重复一遍
      'aria-hidden': true,
      'tabindex': -1,
      // 拦掉指针的默认聚焦：本部件对读屏隐藏，焦点落上去即是 aria-hidden 违规。
      // 焦点归属在 mousedown 的默认动作里定，onClick 再接管已经晚一拍
      'onPointerDown': (event: PointerEvent) => {
        if (event.button === 0)
          event.preventDefault()
      },
      // 拦掉指针的默认聚焦：本部件对读屏隐藏，焦点落上去即是 aria-hidden 违规。
      // 焦点归属在 mousedown 的默认动作里定，onClick 再接管已经晚一拍
      'onClick': (event: MouseEvent) => {
        // 把手长在条目里面，不掐断冒泡会再跑一遍点行
        event.stopPropagation()
        if (isDisabled(node.value))
          return
        // 指针聚焦被上面拦掉了，焦点得由把手交给所在的那一行：
        // 不接管则 roving tabindex 的锚点跟不上，treeitem 的 onFocus 也不触发
        focusValue(rowElOf(event.currentTarget as HTMLElement))
        send({ type: 'NODE.SELECT', value: node.value })
      },
    }),

    getBranchCheckboxProps: node => normalize.element({
      ...parts['branch-checkbox'].attrs,
      ...branchState(node.value),
      'aria-hidden': true,
      'tabindex': -1,
      // 拦掉指针的默认聚焦：本部件对读屏隐藏，焦点落上去即是 aria-hidden 违规。
      // 焦点归属在 mousedown 的默认动作里定，onClick 再接管已经晚一拍
      'onPointerDown': (event: PointerEvent) => {
        if (event.button === 0)
          event.preventDefault()
      },
      'onClick': (event: MouseEvent) => {
        // 不掐断冒泡会顺带把这一枝展开或收起
        event.stopPropagation()
        if (isDisabled(node.value))
          return
        // 同 item-checkbox：指针聚焦被拦掉后由把手把焦点交给所在的那一行
        focusValue(rowElOf(event.currentTarget as HTMLElement))
        send({ type: 'NODE.SELECT', value: node.value })
      },
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
      // 展开箭头重复了 branch 已有的左右方向键与点行语义，对读屏隐藏；
      // tabindex=-1 让它退出 Tab 序列，否则每条分支多占一个 Tab 位会让 roving tabindex 失效
      'aria-hidden': true,
      'tabindex': -1,
      // 拦掉指针的默认聚焦：本部件对读屏隐藏，焦点落上去即是 aria-hidden 违规。
      // 焦点归属在 mousedown 的默认动作里定，onClick 再接管已经晚一拍
      'onPointerDown': (event: PointerEvent) => {
        if (event.button === 0)
          event.preventDefault()
      },
      'onClick': (event: MouseEvent) => {
        // 箭头长在 branch-control 里面，不掐断冒泡会再跑一遍点行，展开态被切两回
        event.stopPropagation()
        if (isDisabled(node.value))
          return
        const branchEl = branchElOf(event.currentTarget as HTMLElement)
        // tabindex=-1 的节点是点得到焦点的，不显式接管焦点会停在这个 aria-hidden 的箭头上；
        // 也一并解决了焦点原在子树里、收起后掉进隐藏节点那一路
        if (branchEl)
          focusValue(branchEl)
        send({ type: 'BRANCH.TOGGLE', value: node.value })
      },
    }),

    getBranchIndicatorProps: node => normalize.element({
      ...parts['branch-indicator'].attrs,
      ...branchState(node.value),
      'aria-hidden': true,
    }),

    getBranchTextProps: node => normalize.element({
      ...parts['branch-text'].attrs,
      ...branchState(node.value),
    }),

    getBranchContentProps: node => normalize.element({
      ...parts['branch-content'].attrs,
      ...branchState(node.value),
      // 子层是 treeitem 的下一级分组，role=group 是 tree 结构的必需环节
      'role': 'group',
      // group 不收 aria-orientation，排布方向只以 data 形式交给皮肤。
      // 只有子节点全是叶子的那一层才吃 leafOrientation，中间层恒竖排
      'data-orientation': leafOnlyBranches.has(node.value) ? leafOrientation : 'vertical',
      // 收起只加 hidden，不卸载作者节点，子树里的输入框与滚动位置得留着
      'hidden': !isExpanded(node.value) || undefined,
    }),
  }
}
