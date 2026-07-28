import type { NavIntent } from '@xihan-ui/behavior'
import type { NormalizeProps, PropTypes } from '@xihan-ui/core'
import type { Service } from '@xihan-ui/machine'
import type { TreeNodeMeta, TreeVisibleNode } from '../tree'
import type { TreeSelectApi, TreeSelectSchema } from './tree-select.types'
import { focusItem, indexOfValue, isItemDisabled, ITEM_VALUE_ATTR, itemValue, matchTypeahead, navigateItems, navIntentFromKey } from '@xihan-ui/behavior'
import { contains, dataAttr } from '@xihan-ui/core'
import { flattenTree, indexTree } from '../tree'
import { treeSelectAnatomy } from './tree-select.anatomy'
import { TREE_SELECT_DEFAULT_PLACEMENT, treeSelectNodeEls } from './tree-select.machine'

const parts = treeSelectAnatomy.build()

export function connectTreeSelect<T extends PropTypes>(
  service: Service<TreeSelectSchema>,
  normalize: NormalizeProps<T>,
): TreeSelectApi<T> {
  const { state, prop, send, context, refs, scope } = service
  const open = state.get() === 'open'
  const ids = scope.ids('tree-select', 'label', 'trigger', 'value-text', 'content', 'tree')

  const collection = prop('collection') ?? []
  const expandedValue = context.get('expandedValue')
  const value = context.get('value')
  const multiple = !!prop('multiple')
  const disabled = !!prop('disabled')
  const readOnly = !!prop('readOnly')
  const invalid = !!prop('invalid')
  // 只读与禁用都改不了选中值；两者的区别在于禁用连浮层都展不开
  const interactive = !disabled && !readOnly
  // 树不像列表那样天然成环：上键停在首行、下键停在末行才符合「层级里有上下文」的直觉
  const loop = prop('loop') ?? false
  const dir = prop('dir') ?? 'ltr'
  const placeholder = prop('placeholder') ?? null
  const stateAttr = open ? 'open' : 'closed'
  // 位置由引擎写进 context；这里只读结果，不量 DOM、不调引擎，保持纯函数
  const position = context.get('position')
  const placement = position?.placement ?? prop('placement') ?? TREE_SELECT_DEFAULT_PLACEMENT

  // 摊平与索引都是 (collection, 展开集合) 的纯函数，一行 DOM 都不碰：
  // Vue 在 render 期求值 connect，那一刻 DOM 还不存在。两者与 Tree 共用同一份实现。
  const rows = flattenTree(collection, expandedValue)
  const metaIndex = indexTree(collection)
  const visible = new Map(rows.map(row => [row.value, row]))

  // 焦点锚点投影成「可见的」：祖先分支被收起后，节点仍在 DOM 里但已 hidden、不可聚焦。
  // 让它继续认领 tabindex=0，而树容器又判自己「焦点在树内」让了位，整棵树就一个停靠点都没有。
  const rawFocused = context.get('focusedValue')
  const focusedValue = rawFocused != null && visible.has(rawFocused) ? rawFocused : null

  const metaOf = (v: string): TreeNodeMeta | undefined => metaIndex.get(v)
  const isSelected = (v: string): boolean => value.includes(v)
  const isExpanded = (v: string): boolean => expandedValue.includes(v)
  // 整个控件禁用向下传导到每个节点；节点也能在 collection 里单独禁用
  const isDisabled = (v: string): boolean => disabled || !!metaOf(v)?.disabled

  // 显示文字直接从 collection 的 label 取，不必像 Select 那样去活 DOM 里现查条目文本：
  // 树数据本来就带着标签，连收起子树里的选中值也报得出名字
  const labelOf = (v: string): string => metaOf(v)?.label ?? v
  const valueText = value.length ? value.map(labelOf).join(', ') : null
  const displayText = valueText ?? placeholder ?? ''
  const canClear = interactive && value.length > 0

  /** 节点（item 与 branch）共用的 ARIA 与身份属性。 */
  const nodeAttrs = (v: string): Record<string, string | number | undefined> => {
    const meta = metaOf(v)
    return {
      // 导航、检索、选中与展开都以此为节点身份
      [ITEM_VALUE_ATTR]: v,
      'role': 'treeitem',
      // 层级三件套的事实源是 collection，不是 DOM 嵌套深度：
      // 不在 collection 里的节点没有层级可言，宁可不报，也不能报一个编出来的 1/1
      'aria-level': meta?.level,
      'aria-posinset': meta?.posInSet,
      'aria-setsize': meta?.setSize,
      // 未选中必须显式输出 false，省略会让读屏无从区分「未选中」与「不是可选节点」
      'aria-selected': isSelected(v) ? 'true' : 'false',
      // 集合条目一律 aria-disabled，绝不输出原生 disabled：原生 disabled 不可聚焦、
      // 也不派发 click，禁用节点就再也当不成方向键的起点
      'aria-disabled': isDisabled(v) ? 'true' : 'false',
      // roving tabindex：整棵树只有锚点节点留在 Tab 序列内。收起态无锚点——
      // 此时节点连同 content 一起 hidden，本就不可达
      'tabindex': focusedValue === v ? 0 : -1,
    }
  }

  /** 叶子一系（item / item-text / item-indicator）共用的状态标记，样式层各处一致。 */
  const nodeState = (v: string): Record<string, string | undefined> => ({
    'data-selected': dataAttr(isSelected(v)),
    'data-disabled': dataAttr(isDisabled(v)),
    // 焦点所在与选中互相独立：可以停在一个没被选中的节点上
    'data-highlighted': dataAttr(focusedValue === v),
  })

  /** 分支一系再多一个展开态，箭头旋转与子树收起都看它。 */
  const branchState = (v: string): Record<string, string | undefined> => ({
    ...nodeState(v),
    'data-state': isExpanded(v) ? 'open' : 'closed',
  })

  /** 节点级处理器拿不到 branch 容器，只能就地往上找最近的那个（嵌套分支各认各的）。 */
  const branchElOf = (el: HTMLElement): HTMLElement | null => el.closest<HTMLElement>(parts.branch.selector)

  const focusValue = (el: HTMLElement | null): void => {
    const next = itemValue(el)
    if (next == null)
      return
    focusItem(el)
    send({ type: 'NODE.FOCUS', value: next })
  }

  /** 方向键落点：起点用锚点，终点在可见行上算，禁用节点自动跳过。 */
  const focusBy = (tree: HTMLElement, intent: NavIntent): void => {
    focusValue(navigateItems(treeSelectNodeEls(tree, rows), focusedValue, intent, { loop }))
  }

  /** 按值把焦点搬到某一行（进子节点、回父节点用）。 */
  const focusOn = (tree: HTMLElement, v: string): void => {
    focusValue(treeSelectNodeEls(tree, rows).find(el => itemValue(el) === v) ?? null)
  }

  /**
   * 连打检索的取字处是 collection 里的 label，不是节点 textContent：
   * 分支节点裹着整棵子树，textContent 会把所有子孙的文字一并算进去，检索立刻被带跑。
   */
  const nodeText = (el: HTMLElement): string => {
    const v = itemValue(el)
    return v == null ? '' : labelOf(v)
  }

  /** 连打检索落点：从当前锚点的下一个绕一圈找，禁用节点跳过；未命中保持原状。 */
  const focusMatch = (tree: HTMLElement, query: string): void => {
    const list = treeSelectNodeEls(tree, rows)
    focusValue(matchTypeahead(list, indexOfValue(list, focusedValue), query, {
      text: nodeText,
      skip: isItemDisabled,
    }))
  }

  /** 确认键与点行的落点：只改选中值，展开态归左右方向键与 branch-trigger 管。 */
  const activate = (row: TreeVisibleNode): void => {
    if (!interactive || row.disabled)
      return
    send({ type: 'NODE.SELECT', value: row.value })
  }

  return {
    open,
    collection,
    visibleNodes: rows,
    value,
    expandedValue,
    valueText,
    displayText,
    focusedValue,
    multiple,
    disabled,
    readOnly,
    invalid,
    canClear,
    isSelected,
    isExpanded,
    setOpen: (next) => {
      if (next !== open)
        send(next ? { type: 'OPEN', focus: 'selected' } : { type: 'CLOSE' })
    },
    setValue: next => send({ type: 'VALUE.SET', value: next }),
    setExpandedValue: next => send({ type: 'EXPANDED.SET', value: next }),
    expand: v => send({ type: 'BRANCH.EXPAND', value: v }),
    collapse: v => send({ type: 'BRANCH.COLLAPSE', value: v }),
    select: v => send({ type: 'NODE.SELECT', value: v }),
    clear: () => send({ type: 'VALUE.CLEAR' }),

    getRootProps: () => normalize.element({
      ...parts.root.attrs,
      'data-state': stateAttr,
      'data-disabled': dataAttr(disabled),
      'data-readonly': dataAttr(readOnly),
      'data-invalid': dataAttr(invalid),
    }),

    getLabelProps: () => normalize.element({
      ...parts.label.attrs,
      'id': ids.label,
      'data-disabled': dataAttr(disabled),
    }),

    getTriggerProps: () => normalize.button({
      ...parts.trigger.attrs,
      'id': ids.trigger,
      'type': 'button',
      // trigger 是单体控件（与集合节点相反）：用原生 disabled，不可聚焦也不派 click，
      // 禁用的选择器本就不该有任何键盘入口。只读则相反——仍可聚焦、仍能展开来看
      'disabled': disabled || undefined,
      // 按钮扮演 combobox：展开的是一棵树，读屏据此播报「折叠的树」而不是「按钮」
      'role': 'combobox',
      'aria-haspopup': 'tree',
      'aria-expanded': open ? 'true' : 'false',
      // 指向真正被展开的那个部件（role=tree），而不是它外面那层浮层壳
      'aria-controls': ids.tree,
      // 名字 = 标签 + 当前值。只指 label 的话读屏永远念不出用户选了什么——
      // accname 里 aria-labelledby 的优先级高于元素内容，会把内嵌的 value-text 挤掉。
      // 作者没写 label 时那一段是悬空 IDREF，按 accname 规则跳过，名字回落成当前值
      'aria-labelledby': `${ids.label} ${ids['value-text']}`,
      'aria-invalid': invalid ? 'true' : 'false',
      'aria-readonly': readOnly ? 'true' : 'false',
      'data-state': stateAttr,
      'data-disabled': dataAttr(disabled),
      'data-readonly': dataAttr(readOnly),
      'data-invalid': dataAttr(invalid),
      'data-placeholder': dataAttr(value.length === 0),
      // 只读仍开得了浮层：树能浏览、分支能展开收起，改不动的只是选中值。
      // 禁用那一路根本走不到这里（原生 disabled 既不可聚焦也不派 click），
      // 守卫留着是防程序化派发
      'onClick': () => {
        if (!disabled)
          send({ type: 'TOGGLE', focus: 'selected' })
      },
      'onKeydown': (event: KeyboardEvent) => {
        if (disabled)
          return
        // 纵向轴 + 不收 Home/End：收起态的上下键既展开又把焦点落到选中行的相邻行；
        // 返回 null（左右键、带修饰键的组合）不归导航管，此时绝不 preventDefault
        const intent = navIntentFromKey(event, { axis: 'vertical', home: false })
        if (intent) {
          event.preventDefault()
          send({ type: 'OPEN', focus: intent })
          return
        }
        // Enter 与空格都必须吞掉：按钮的默认激活会再合成一次 click，
        // 展开随即被那次 TOGGLE 关掉，看起来就是「按了没反应」
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault()
          send({ type: 'OPEN', focus: 'selected' })
        }
      },
    }),

    getValueTextProps: () => normalize.element({
      ...parts['value-text'].attrs,
      // trigger 的 aria-labelledby 指过来，当前值才进得了可及名字
      'id': ids['value-text'],
      // 无选中：样式据此把占位文字画淡
      'data-placeholder': dataAttr(value.length === 0),
      'data-disabled': dataAttr(disabled),
    }),

    getIndicatorProps: () => normalize.element({
      ...parts.indicator.attrs,
      'aria-hidden': 'true',
      'data-state': stateAttr,
      'data-disabled': dataAttr(disabled),
    }),

    getClearTriggerProps: () => normalize.button({
      ...parts['clear-trigger'].attrs,
      'type': 'button',
      // 整个控件只占一个 Tab 位（就是 trigger）：键盘用户走不到这个按钮，
      // 暴露给读屏等于把「可以清空」报两遍，还会在 Tab 序里多出一站
      'tabindex': -1,
      'aria-hidden': true,
      'disabled': !canClear || undefined,
      'data-disabled': dataAttr(!canClear),
      // 不拦的话浏览器会把焦点从 trigger 挪到这个按钮上，清完焦点就落在一个隐身节点里
      'onPointerDown': (event: PointerEvent) => {
        if (event.button === 0)
          event.preventDefault()
      },
      'onClick': () => {
        if (!canClear)
          return
        send({ type: 'VALUE.CLEAR' })
        // pointerdown 已拦掉默认聚焦，键盘/程序化激活这一路则要主动把焦点送回 trigger
        refs.get('getAnchorEl')()?.focus()
      },
    }),

    getPositionerProps: () => normalize.element({
      ...parts.positioner.attrs,
      'data-state': stateAttr,
      'data-placement': placement,
      // 锚点被滚出可视区时引擎会置 hidden，样式据此收起浮层
      'data-hidden': dataAttr(position?.hidden),
      'style': {
        position: 'absolute',
        insetInlineStart: `${position?.x ?? 0}px`,
        insetBlockStart: `${position?.y ?? 0}px`,
      },
    }),

    getContentProps: () => normalize.element({
      ...parts.content.attrs,
      'id': ids.content,
      // 浮层壳既不是 tree 也不是 listbox，只是焦点域与消解层的根节点。
      // 写 -1 而不是整个不给：它是可滚动容器，某些浏览器会把可滚动区域自动塞进 Tab 序列
      'tabindex': -1,
      'data-state': stateAttr,
      'data-placement': placement,
      // 收起时留在 DOM 只隐藏，不卸载作者节点
      'hidden': !open || undefined,
    }),

    // 键盘全在 tree 上收口：节点只管声明自己，一次冒泡一个处理器。
    // Escape 不在这里收——它归消解层管（只有栈顶层响应，嵌套浮层才能逐层关闭）
    getTreeProps: () => normalize.element({
      ...parts.tree.attrs,
      'id': ids.tree,
      'role': 'tree',
      'aria-labelledby': ids.label,
      // 复选与否必须显式说：省略只是「没说」，读屏无从区分单选树与「作者忘了标」
      'aria-multiselectable': multiple ? 'true' : 'false',
      'aria-disabled': disabled ? 'true' : 'false',
      // 有锚点时 Tab 位归锚点节点；展开着却没有锚点（树是空的、或首帧还没挑出锚点）时
      // 由容器兜底，否则整棵树一个停靠点都没有、焦点域也无处可落。
      // 判据用 focusedValue 而非「锚点元素」：锚点可能指向一个已删掉或已隐藏的值
      'tabindex': open && focusedValue == null ? 0 : -1,
      'data-state': stateAttr,
      'data-disabled': dataAttr(disabled),
      'onKeyDown': (event: KeyboardEvent) => {
        // 收起态树是 hidden 的，按键不该改任何东西（程序化派发照样送得到）
        if (!open || disabled)
          return
        const tree = event.currentTarget as HTMLElement
        const key = event.key
        // 带 Ctrl/Cmd/Alt 的组合一律不归树管（Ctrl+Home 之类归浏览器与读屏），也不进连打检索
        if (event.ctrlKey || event.metaKey || event.altKey)
          return

        // 不 preventDefault：浮层让开，焦点按 Tab 序列自然离开
        if (key === 'Tab') {
          send({ type: 'CLOSE', src: 'tab' })
          return
        }

        // 上下键与 Home/End 走可见行。轴固定 vertical：左右键在树里另有展开/收起的语义，
        // 不能被当成同轴导航吃掉
        const intent = navIntentFromKey(event, { axis: 'vertical' })
        if (intent) {
          event.preventDefault()
          focusBy(tree, intent)
          return
        }

        const row = focusedValue != null ? visible.get(focusedValue) : undefined
        // rtl 下左右键整体对调：展开永远是「往子层去」的那个方向
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
          // 收起的分支与叶子都是「跳回父节点」；根层的行没有父，什么也不做
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
        const query = refs.get('typeahead').push(key)
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
        const list = treeSelectNodeEls(tree, rows)
        // 焦点落到容器上说明锚点还没挑出来（首帧、或节点刚被删光）：
        // 就地补一次，优先停在选中行上，它不可停留时退回首个可停留行
        const selected = list.find((el) => {
          const v = itemValue(el)
          return v != null && isSelected(v) && !isItemDisabled(el)
        })
        // 落点节点自己的 onFocus 会把锚点接过去
        focusItem(selected ?? navigateItems(list, null, 'first'))
      },
    }),

    getItemProps: node => normalize.element({
      ...parts.item.attrs,
      ...nodeAttrs(node.value),
      ...nodeState(node.value),
      onClick: (event: MouseEvent) => {
        if (!interactive || isDisabled(node.value))
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
      ...nodeState(node.value),
    }),

    getItemIndicatorProps: node => normalize.element({
      ...parts['item-indicator'].attrs,
      ...nodeState(node.value),
      'aria-hidden': 'true',
    }),

    getBranchProps: node => normalize.element({
      ...parts.branch.attrs,
      ...nodeAttrs(node.value),
      ...branchState(node.value),
      'aria-expanded': isExpanded(node.value) ? 'true' : 'false',
      // 分支的可及名字必须显式给：它裹着整棵子树，「从内容算名字」会把所有子孙的
      // 文字一并念出来。名字取 collection 里的 label（缺省退回 value），
      // 与作者渲染在 branch-text 里的文字同源
      'aria-label': metaOf(node.value)?.label,
      'onFocus': () => send({ type: 'NODE.FOCUS', value: node.value }),
    }),

    getBranchControlProps: node => normalize.element({
      ...parts['branch-control'].attrs,
      ...branchState(node.value),
      onClick: (event: MouseEvent) => {
        if (!interactive || isDisabled(node.value))
          return
        // 分支行只是 treeitem 里的一层内容，焦点该落在 branch 上
        const branchEl = branchElOf(event.currentTarget as HTMLElement)
        if (branchEl)
          focusValue(branchEl)
        // 点行只选中不展开：单选选完浮层就收起了，顺带切一下展开态用户根本看不见，
        // 下次再开还得从那个被切过的状态里找回来。展开归箭头与左右方向键
        send({ type: 'NODE.SELECT', value: node.value })
      },
    }),

    getBranchTriggerProps: node => normalize.element({
      ...parts['branch-trigger'].attrs,
      ...branchState(node.value),
      // 展开箭头只是重复了 branch 自己已有的左右方向键语义，对读屏是纯噪音；
      // tabindex=-1 让它退出 Tab 序列——作者把它写成 <button> 也照样退出，
      // 否则每条分支都会多占一个 Tab 位，roving tabindex 当场失效
      'aria-hidden': 'true',
      'tabindex': -1,
      'onClick': (event: MouseEvent) => {
        // 箭头长在 branch-control 里面：不掐断冒泡就会再跑一遍「点行」，
        // 一次点击既展开又选中（单选还会顺手把浮层关掉）
        event.stopPropagation()
        // 展开收起是浏览，不是改值：只读照样能展，只有整控件禁用与节点自身禁用才拦
        if (isDisabled(node.value))
          return
        const branchEl = branchElOf(event.currentTarget as HTMLElement)
        // tabindex=-1 的节点是点得到焦点的：不显式接管，焦点会停在这个 aria-hidden 的箭头上。
        // 顺带也把「焦点原本停在这条分支的子树里、收起后掉进隐藏节点」那一路一并解决了
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

    // 表单出口：选中值靠这份隐藏输入随表单提交。它对键盘与读屏都不存在，
    // 交互全部由 trigger 与节点承担
    getHiddenInputProps: () => normalize.input({
      // type 先于 value 写入：改 type 会重置输入的值
      type: 'hidden',
      ...parts['hidden-input'].attrs,
      // name 缺省即不产出该属性，此时这份输入不参与提交
      name: prop('name'),
      // 多选按逗号拼成一串；单选下就是那一个值本身
      value: value.join(','),
      // 单体控件用原生 disabled（与节点的 aria-disabled 相反）：禁用的控件不该提交出值
      disabled: disabled || undefined,
    }),
  }
}
