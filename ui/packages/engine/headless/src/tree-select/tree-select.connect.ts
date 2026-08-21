import { overlayUnplaced } from '../shared/overlay'
import type { NavIntent } from '@xihan-ui/behavior'
import type { NormalizeProps, PropTypes } from '@xihan-ui/kernel'
import type { Service } from '@xihan-ui/machine'
import type { TreeNodeMeta, TreeVisibleNode } from '../tree'
import type { TreeSelectApi, TreeSelectSchema } from './tree-select.types'
import { cascadeState, focusItem, indexOfValue, isItemDisabled, ITEM_VALUE_ATTR, itemValue, matchTypeahead, navigateItems, navIntentFromKey } from '@xihan-ui/behavior'
import { dataAttr } from '@xihan-ui/kernel'
import { flattenTree, indexTree } from '../tree'
import { treeSelectAnatomy } from './tree-select.anatomy'
import { TREE_SELECT_DEFAULT_PLACEMENT, treeSelectNodeEls } from './tree-select.machine'

const parts = treeSelectAnatomy.build()

// 落定那一侧的可用高度。贴边时引擎会回报 0，直接写进 min() 会把面板压成零高，
// 所以低于这个下限就当作没算出来：空串撤掉声明，退回皮肤 positioner 上那档 100vh
const AVAILABLE_H_FLOOR = 96

function availableHeightVar(available: number | undefined): Record<string, string> {
  return {
    '--xh-_tree-select-available-h':
      available != null && available >= AVAILABLE_H_FLOOR ? `${available}px` : '',
  }
}

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
  // 只读与禁用都改不了选中值，禁用还额外禁止展开浮层
  const interactive = !disabled && !readOnly
  // 缺省不成环（与列表类组件相反）：树有层级，上键停在首行、下键停在末行才不丢上下文
  const loop = prop('loop') ?? false
  const dir = prop('dir') ?? 'ltr'
  const placeholder = prop('placeholder') ?? null
  const stateAttr = open ? 'open' : 'closed'
  // 位置由引擎写进 context，这里只读结果
  const position = context.get('position')
  const placement = position?.placement ?? prop('placement') ?? TREE_SELECT_DEFAULT_PLACEMENT

  // 摊平与索引是 (collection, 展开集合) 的纯函数，不访问 DOM
  const rows = flattenTree(collection, expandedValue)
  const metaIndex = indexTree(collection)
  const visible = new Map(rows.map(row => [row.value, row]))

  // 焦点锚点投影成可见节点，祖先收起后的节点不再认领 tabindex=0
  const rawFocused = context.get('focusedValue')
  const focusedValue = rawFocused != null && visible.has(rawFocused) ? rawFocused : null

  const metaOf = (v: string): TreeNodeMeta | undefined => metaIndex.get(v)
  // 级联模式下选中态从值集聚合得出：父随子勾、部分勾中半选
  const cascade = multiple && !!prop('cascade')
  const cascaded = cascade ? cascadeState(collection, value) : null
  const isSelected = (v: string): boolean => (cascaded ? cascaded.checked.has(v) : value.includes(v))
  const isIndeterminate = (v: string): boolean => cascaded?.indeterminate.has(v) ?? false
  const isExpanded = (v: string): boolean => expandedValue.includes(v)
  // 控件级禁用向下传导，节点也可在 collection 里单独禁用
  const isDisabled = (v: string): boolean => disabled || !!metaOf(v)?.disabled

  // 显示文字取自 collection 的 label，收起子树里的选中值也报得出名字
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
      // 层级三件套取自 collection，不在 collection 里的节点不输出
      'aria-level': meta?.level,
      'aria-posinset': meta?.posInSet,
      'aria-setsize': meta?.setSize,
      // 未选中也显式输出 false
      'aria-selected': isSelected(v) ? 'true' : 'false',
      // 级联勾选是三态：读屏靠 aria-checked 报半选，非级联不输出该属性
      'aria-checked': cascade ? (isSelected(v) ? 'true' : isIndeterminate(v) ? 'mixed' : 'false') : undefined,
      // 集合条目用 aria-disabled 而非原生 disabled，禁用节点仍可作为方向键起点
      'aria-disabled': isDisabled(v) ? 'true' : 'false',
      // roving tabindex：只有锚点节点留在 Tab 序列内
      'tabindex': focusedValue === v ? 0 : -1,
    }
  }

  /** 叶子一系（item / item-text / item-indicator）共用的状态标记。 */
  const nodeState = (v: string): Record<string, string | undefined> => ({
    'data-selected': dataAttr(isSelected(v)),
    'data-indeterminate': dataAttr(isIndeterminate(v)),
    'data-disabled': dataAttr(isDisabled(v)),
    'data-highlighted': dataAttr(focusedValue === v),
  })

  /** 分支一系在叶子状态基础上追加展开态。 */
  const branchState = (v: string): Record<string, string | undefined> => ({
    ...nodeState(v),
    'data-state': isExpanded(v) ? 'open' : 'closed',
  })

  /** 从节点内的元素向上找最近的 branch 容器。 */
  const branchElOf = (el: HTMLElement): HTMLElement | null => el.closest<HTMLElement>(parts.branch.selector)

  const focusValue = (el: HTMLElement | null): void => {
    const next = itemValue(el)
    if (next == null)
      return
    focusItem(el)
    send({ type: 'NODE.FOCUS', value: next })
  }

  /** 方向键落点：起点用锚点，终点在可见行上算，禁用节点自动跳过。 */
  const focusBy = (container: HTMLElement, intent: NavIntent): void => {
    focusValue(navigateItems(treeSelectNodeEls(container, rows), focusedValue, intent, { loop }))
  }

  /** 按值把焦点搬到某一行。 */
  const focusOn = (container: HTMLElement, v: string): void => {
    focusValue(treeSelectNodeEls(container, rows).find(el => itemValue(el) === v) ?? null)
  }

  /** 连打检索的取字处是 collection 里的 label，不是节点 textContent。 */
  const nodeText = (el: HTMLElement): string => {
    const v = itemValue(el)
    return v == null ? '' : labelOf(v)
  }

  /** 连打检索落点：从当前锚点的下一个绕一圈找，禁用节点跳过；未命中保持原状。 */
  const focusMatch = (container: HTMLElement, query: string): void => {
    const list = treeSelectNodeEls(container, rows)
    focusValue(matchTypeahead(list, indexOfValue(list, focusedValue), query, {
      text: nodeText,
      skip: isItemDisabled,
    }))
  }

  /** 确认键与点行的落点：只改选中值，展开态另由左右方向键与 branch-trigger 处理。 */
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
    isIndeterminate,
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
      // 三个视觉轴打在根与 positioner 上，皮肤由这两处往下派发；其余子部件不重复标注
      'data-variant': prop('variant'),
      'data-tone': prop('tone'),
      'data-size': prop('size'),
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
      // 单体控件用原生 disabled；只读仍可聚焦与展开
      'disabled': disabled || undefined,
      // 按钮扮演 combobox，展开的是一棵树
      'role': 'combobox',
      'aria-haspopup': 'tree',
      'aria-expanded': open ? 'true' : 'false',
      // 指向 role=tree 的部件，而非外层浮层壳
      'aria-controls': ids.tree,
      // 名字 = 标签 + 当前值；未写 label 时该段为悬空 IDREF，名字回落成当前值
      'aria-labelledby': `${ids.label} ${ids['value-text']}`,
      'aria-invalid': invalid ? 'true' : 'false',
      'aria-readonly': readOnly ? 'true' : 'false',
      'data-state': stateAttr,
      'data-disabled': dataAttr(disabled),
      'data-readonly': dataAttr(readOnly),
      'data-invalid': dataAttr(invalid),
      'data-placeholder': dataAttr(value.length === 0),
      // 只读仍可展开浮层；禁用守卫防程序化派发
      'onClick': () => {
        if (!disabled)
          send({ type: 'TOGGLE', focus: 'selected' })
      },
      'onKeydown': (event: KeyboardEvent) => {
        if (disabled)
          return
        // 纵向轴且不收 Home/End；返回 null 时不 preventDefault
        const intent = navIntentFromKey(event, { axis: 'vertical', home: false })
        if (intent) {
          event.preventDefault()
          send({ type: 'OPEN', focus: intent })
          return
        }
        // 吞掉 Enter 与空格，避免按钮默认激活再合成一次 click。
        // 键盘打开要有可见落点：无选中值时锚定首行，有选中仍定位到选中节点
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault()
          send({ type: 'OPEN', focus: value.length ? 'selected' : 'first' })
        }
      },
    }),

    getValueTextProps: () => normalize.element({
      ...parts['value-text'].attrs,
      // 供 trigger 的 aria-labelledby 引用
      'id': ids['value-text'],
      'data-placeholder': dataAttr(value.length === 0),
      'data-disabled': dataAttr(disabled),
    }),

    getIndicatorProps: () => normalize.element({
      // 有值时清空钮顶上来，箭头让位：两个图标并排堆在框里，用户分不清点哪个
      'data-clearable': dataAttr(canClear),
      ...parts.indicator.attrs,
      'aria-hidden': 'true',
      'data-state': stateAttr,
      'data-disabled': dataAttr(disabled),
    }),

    getClearTriggerProps: () => normalize.button({
      ...parts['clear-trigger'].attrs,
      'type': 'button',
      // 整个控件只占一个 Tab 位（trigger），此按钮不入 Tab 序列也不暴露给读屏
      'tabindex': -1,
      'aria-hidden': true,
      // 没值就整个收起，不是禁用：清空钮与下拉钮并排时，一个灰着一个亮着，
      // 用户分不清哪个能点。有值才出现，出现即可用
      'hidden': !canClear || undefined,
      'disabled': !canClear || undefined,
      'data-disabled': dataAttr(!canClear),
      // 拦掉默认聚焦，避免焦点从 trigger 挪到本按钮
      'onPointerDown': (event: PointerEvent) => {
        if (event.button === 0)
          event.preventDefault()
      },
      'onClick': () => {
        if (!canClear)
          return
        send({ type: 'VALUE.CLEAR' })
        // 键盘/程序化激活这一路主动把焦点送回 trigger
        refs.get('getAnchorEl')()?.focus()
      },
    }),

    getPositionerProps: () => normalize.element({
      ...parts.positioner.attrs,
      // 视觉轴在浮层这一侧再打一次：positioner 被搬到 portal 落点，继承不到根上的私有槽
      'data-variant': prop('variant'),
      'data-tone': prop('tone'),
      'data-size': prop('size'),
      'data-state': stateAttr,
      'data-placement': placement,
      // 锚点滚出可视区时引擎置 hidden
      // 展开那一帧引擎还没量完，坐标是兜底的 0——不藏的话浮层会先在视口左上角闪一下
      'data-hidden': dataAttr(overlayUnplaced(open, position)),
      'style': {
        position: 'fixed',
        left: `${position?.x ?? 0}px`,
        top: `${position?.y ?? 0}px`,
        // content 继承这个高度上限，超出的条目在浮层内部滚
        ...availableHeightVar(position?.availableHeight),
      },
    }),

    // 键盘全在 content 上收口，与 select / cascader 同一落点：content 自带内边距又可被点中
    // （tabindex=-1），焦点歇在它身上时按键从这里发出，挂在里层 tree 上收不到。
    // 节点集合按部件归属过滤，查询容器传 content 与传 tree 等价。
    // Escape 归消解层管，不在这里收
    getContentProps: () => normalize.element({
      ...parts.content.attrs,
      'id': ids.content,
      // 浮层壳只是焦点域与消解层的根节点，写 -1 避免可滚动区域被自动纳入 Tab 序列
      'tabindex': -1,
      'data-state': stateAttr,
      'data-placement': placement,
      // 收起时留在 DOM 只隐藏
      'hidden': !open || undefined,
      'onKeyDown': (event: KeyboardEvent) => {
        // 收起态不响应按键
        if (!open || disabled)
          return
        const container = event.currentTarget as HTMLElement
        const key = event.key
        // 带 Ctrl/Cmd/Alt 的组合不归树管，也不进连打检索
        if (event.ctrlKey || event.metaKey || event.altKey)
          return

        // 不 preventDefault，焦点按 Tab 序列自然离开
        if (key === 'Tab') {
          send({ type: 'CLOSE', src: 'tab' })
          return
        }

        // 上下键与 Home/End 走可见行；轴固定 vertical，左右键另有展开/收起语义
        const intent = navIntentFromKey(event, { axis: 'vertical' })
        if (intent) {
          event.preventDefault()
          focusBy(container, intent)
          return
        }

        const row = focusedValue != null ? visible.get(focusedValue) : undefined
        // rtl 下左右键对调，展开始终是「往子层去」的方向
        const forward = dir === 'rtl' ? 'ArrowLeft' : 'ArrowRight'
        const backward = dir === 'rtl' ? 'ArrowRight' : 'ArrowLeft'

        if (key === forward) {
          if (!row?.branch)
            return
          if (!row.expanded) {
            // 禁用分支展不开，放行给页面
            if (row.disabled)
              return
            event.preventDefault()
            send({ type: 'BRANCH.EXPAND', value: row.value })
            return
          }
          // 已展开：进入首个子节点，禁用分支也可进入
          const child = rows.find(r => r.parent === row.value)
          if (!child)
            return
          event.preventDefault()
          focusOn(container, child.value)
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
          // 收起的分支与叶子都跳回父节点；根层无父则不动作
          if (row?.parent == null)
            return
          event.preventDefault()
          focusOn(container, row.parent)
          return
        }

        if (key === 'Enter') {
          if (!row)
            return
          event.preventDefault()
          activate(row)
          return
        }

        // '*' 展开当前层全部同级分支，须抢在连打检索之前判定
        if (key === '*') {
          if (!row)
            return
          const siblings = rows
            .filter(r => r.parent === row.parent && r.branch && !r.expanded && !r.disabled)
            .map(r => r.value)
          // 同级已全部展开则不吞掉该键
          if (!siblings.length)
            return
          event.preventDefault()
          send({ type: 'EXPANDED.SET', value: [...expandedValue, ...siblings] })
          return
        }

        // 连打检索只搬焦点、不改选中；缓冲区空时空格落到下方按确认键处理
        const query = refs.get('typeahead').push(key)
        if (query != null) {
          event.preventDefault()
          focusMatch(container, query)
          return
        }
        if (key === ' ') {
          if (!row)
            return
          event.preventDefault()
          activate(row)
        }
      },
    }),

    getTreeProps: () => normalize.element({
      ...parts.tree.attrs,
      'id': ids.tree,
      'role': 'tree',
      // 名字与 trigger 同源（标签 + 当前值）：无锚点时焦点歇在这儿，读屏只报得出容器的名字与角色。
      // 作者没渲染 label / value-text 时两段都是悬空 IDREF，按 accname 规则整条落空，
      // 名字退回下面那个可写的兜底
      'aria-labelledby': `${ids.label} ${ids['value-text']}`,
      'aria-label': prop('translations')?.tree ?? 'Tree options',
      // 复选与否显式输出
      'aria-multiselectable': multiple ? 'true' : 'false',
      'aria-disabled': disabled ? 'true' : 'false',
      // 展开但无锚点时由容器兜底承担 Tab 位；判据用 focusedValue 而非锚点元素
      'tabindex': open && focusedValue == null ? 0 : -1,
      'data-state': stateAttr,
      'data-disabled': dataAttr(disabled),
    }),

    getItemProps: node => normalize.element({
      ...parts.item.attrs,
      ...nodeAttrs(node.value),
      ...nodeState(node.value),
      onClick: (event: MouseEvent) => {
        if (!interactive || isDisabled(node.value))
          return
        // 叶子本身就是 treeitem，直接认 currentTarget
        focusValue(event.currentTarget as HTMLElement)
        send({ type: 'NODE.SELECT', value: node.value })
      },
      // 禁用节点被点到也记锚点，供方向键起步
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
      // 分支裹着整棵子树，可及名字显式取 collection 的 label（缺省退回 value）
      'aria-label': metaOf(node.value)?.label,
      'onFocus': () => send({ type: 'NODE.FOCUS', value: node.value }),
    }),

    getBranchControlProps: node => normalize.element({
      ...parts['branch-control'].attrs,
      ...branchState(node.value),
      onClick: (event: MouseEvent) => {
        if (!interactive || isDisabled(node.value))
          return
        // 分支行只是 treeitem 里的一层内容，焦点落在 branch 上
        const branchEl = branchElOf(event.currentTarget as HTMLElement)
        if (branchEl)
          focusValue(branchEl)
        // 点行只选中不展开，展开归箭头与左右方向键
        send({ type: 'NODE.SELECT', value: node.value })
      },
    }),

    getBranchTriggerProps: node => normalize.element({
      ...parts['branch-trigger'].attrs,
      ...branchState(node.value),
      // 箭头与 branch 的左右方向键语义重复，退出可及树与 Tab 序列
      'aria-hidden': 'true',
      'tabindex': -1,
      'onClick': (event: MouseEvent) => {
        // 箭头位于 branch-control 内，掐断冒泡以免再跑一遍「点行」
        event.stopPropagation()
        // 展开收起不改值，只读也可展开
        if (isDisabled(node.value))
          return
        const branchEl = branchElOf(event.currentTarget as HTMLElement)
        // 显式接管焦点，避免停在 aria-hidden 的箭头或收起后的隐藏子树上
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
      // 子层是 treeitem 的下一级分组
      role: 'group',
      // 收起只加 hidden，不卸载作者节点
      hidden: !isExpanded(node.value) || undefined,
    }),

    // 表单出口：选中值随表单提交，对键盘与读屏不存在
    getHiddenInputProps: () => normalize.input({
      // type 先于 value 写入：改 type 会重置输入的值
      type: 'hidden',
      ...parts['hidden-input'].attrs,
      // name 缺省即不产出该属性，此时不参与提交
      name: prop('name'),
      // 多选按逗号拼成一串
      value: value.join(','),
      // 单体控件用原生 disabled，禁用时不提交值
      disabled: disabled || undefined,
    }),
  }
}
