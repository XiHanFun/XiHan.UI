/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 tree select 相关实现。

import type { NavIntent, NormalizeProps, PressHandlers, PropTypes, Service } from '@xihan-ui/core'
import type { TreeNodeMeta, TreeVisibleNode } from '../tree'
import type { TreeSelectApi, TreeSelectBranchLoadSnapshot, TreeSelectPressedPart, TreeSelectSchema, TreeSelectTranslations } from './tree-select.types'
import { cascadeState, createPressTracker, dataAttr, focusItem, indexOfValue, isComposingEvent, isItemDisabled, ITEM_VALUE_ATTR, itemValue, matchTypeahead, navigateItems, navIntentFromKey } from '@xihan-ui/core'
import { overlayPositioned } from '../shared/overlay'
import { connectSelectionTags } from '../shared/selection-tags'
import { assertCollectionVirtualizer, virtualCollectionMatch, virtualCollectionTarget } from '../shared/virtual-collection'
import { flattenTree, indexTree } from '../tree'
import { treeSelectAnatomy } from './tree-select.anatomy'
import { findTreeSelectNode, isTreeSelectLazyBranch, resolveTreeSelectCollection, TREE_SELECT_DEFAULT_PLACEMENT, TREE_SELECT_NODE_SELECTOR, treeSelectNodeEls } from './tree-select.machine'
import { resolveTreeSelectSearch } from './tree-select.search'

const parts = treeSelectAnatomy.build()

// 落定那一侧的可用高度。贴边时引擎会回报 0，直接写进 min() 会把面板压成零高，
// 所以低于这个下限就当作没算出来：空串撤掉声明，退回皮肤 positioner 上那档 100vh
const AVAILABLE_H_FLOOR = 96

// 行内轴同理：贴边时引擎回报 0，写进 min() 会把面板压成零宽
const AVAILABLE_W_FLOOR = 96

/** 引擎回报的可用尺寸转成 CSS 长度；低于下限当作没算出来，空串撤掉声明。 */
function availablePx(available: number | undefined, floor: number): string {
  return available != null && available >= floor ? `${available}px` : ''
}

function availableSpaceVars(
  placed: { availableWidth?: number, availableHeight?: number } | null | undefined,
): Record<string, string> {
  return {
    '--xh-_tree-select-available-w': availablePx(placed?.availableWidth, AVAILABLE_W_FLOOR),
    '--xh-_tree-select-available-h': availablePx(placed?.availableHeight, AVAILABLE_H_FLOOR),
  }
}

// 锚点实测宽度。content 拿它做最小宽的下界，浮层因此不窄于触发器；
// 引擎没算出来时空串撤掉声明，退回皮肤 positioner 上那档 0
function anchorWidthVar(width: number | undefined): Record<string, string> {
  return {
    '--xh-_tree-select-anchor-w': width != null ? `${width}px` : '',
  }
}

export function connectTreeSelect<T extends PropTypes>(
  service: Service<TreeSelectSchema>,
  normalize: NormalizeProps<T>,
): TreeSelectApi<T> {
  const { state, prop, send, context, refs, scope } = service
  const open = state.get() === 'open'
  const ids = scope.ids('tree-select', 'label', 'trigger', 'value-text', 'content', 'tree', 'input')

  const sourceCollection = prop('collection') ?? []
  // 异步分支的成功结果只活在 headless context；所有派生状态必须看这份有效树，
  // 不能让适配器各自拼 children，否则级联、键盘与三端首帧会分叉。
  const fullCollection = resolveTreeSelectCollection(sourceCollection, context.get('loadedChildren'))
  const expandedValue = context.get('expandedValue')
  // 浮层内搜索：开了 searchable 且检索词非空时，摊平、导航与空态都按裁剪后的树算，展开集合换成搜索视图自己那一份；
  // 选中语义（级联、标签文字）仍按整棵树算
  const searchable = !!prop('searchable')
  const inputValue = context.get('inputValue')
  const search = resolveTreeSelectSearch(fullCollection, { searchable, inputValue, filter: prop('filter') })
  const searching = search != null
  const collection = search?.nodes ?? fullCollection
  const viewExpanded = search ? context.get('searchExpanded') : expandedValue
  const value = context.get('value')
  const multiple = !!prop('multiple')
  const disabled = !!prop('disabled')
  const readOnly = !!prop('readOnly')
  const invalid = !!prop('invalid')
  const loading = !!prop('loading')
  // collection 与手写部件的节点事实来源不同，但空态判据只在这里汇合。
  const counted = prop('collection') != null
  const renderedNodeCount = context.get('renderedNodeCount')
  const empty = (counted ? collection.length : renderedNodeCount) === 0
  const translations: TreeSelectTranslations = {
    tree: prop('translations')?.tree ?? 'Tree options',
    clearTrigger: prop('translations')?.clearTrigger ?? 'Clear',
    empty: prop('translations')?.empty ?? 'No data',
    loading: prop('translations')?.loading ?? 'Loading',
    branchError: prop('translations')?.branchError ?? 'Could not load children',
    retry: prop('translations')?.retry ?? 'Retry',
    branchEmpty: prop('translations')?.branchEmpty ?? 'No children',
    searchInput: prop('translations')?.searchInput ?? 'Search',
    noMatch: prop('translations')?.noMatch ?? 'No matches',
    deleteItem: prop('translations')?.deleteItem ?? ((label: string) => `Delete ${label}`),
    overflowTag: prop('translations')?.overflowTag ?? ((count: number) => `+${count}`),
  }
  // 形态默认落 outline：不写时 root 与 positioner 如实投影同一常量，皮肤不再依赖缺省档
  const variant = prop('variant') ?? 'outline'
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
  const rows = flattenTree(collection, viewExpanded)
  // 虚拟窗口：键盘与检索按这份可见行算，DOM 只承载窗口里那几行。搜索视图的可见行由组件自己裁，
  // 外部 Virtualizer 的 count 对不上，两者不能同开
  const virtualizer = prop('virtualizer')
  if (virtualizer && searchable)
    throw new Error('[xh] TreeSelect 的 virtualizer 与 searchable 不能同时开启：搜索视图的可见行由组件裁剪，Virtualizer.count 无从对齐')
  assertCollectionVirtualizer('TreeSelect', virtualizer, rows.length, prop('collection') != null)
  const rowIndex = new Map(rows.map((row, index) => [row.value, index]))
  // 标签、禁用与语气按整棵树查；层级三件套按此刻摊平的那棵树给，搜索视图里的位次与同级数才对得上
  const metaIndex = indexTree(fullCollection)
  const viewIndex = search ? indexTree(collection) : metaIndex
  // 搜索视图里不在裁剪后那棵树上的节点：手写整棵树的结构里它们照样在 DOM 上，连接层替作者收起。
  // 只在搜索时才发 hidden 这一位，平时不碰作者自己写的 hidden
  const outOfView = (v: string): Record<string, true | undefined> =>
    search ? { hidden: viewIndex.has(v) ? undefined : true } : {}
  const visible = new Map(rows.map(row => [row.value, row]))

  // 焦点锚点投影成可见节点，祖先收起后的节点不再认领 tabindex=0
  const rawFocused = context.get('focusedValue')
  const focusedValue = rawFocused != null && visible.has(rawFocused) ? rawFocused : null

  const metaOf = (v: string): TreeNodeMeta | undefined => metaIndex.get(v)
  // 级联模式下选中态从值集聚合得出：父随子勾、部分勾中半选
  const cascade = multiple && !!prop('cascade')
  const cascaded = cascade ? cascadeState(fullCollection, value) : null
  const isSelected = (v: string): boolean => (cascaded ? cascaded.checked.has(v) : value.includes(v))
  const isIndeterminate = (v: string): boolean => cascaded?.indeterminate.has(v) ?? false
  const isExpanded = (v: string): boolean => viewExpanded.includes(v)
  const branchLoadState = (v: string): TreeSelectBranchLoadSnapshot | null => {
    const node = findTreeSelectNode(sourceCollection, v, context.get('loadedChildren'))
    if (!node || !isTreeSelectLazyBranch(node))
      return null
    return context.get('branchLoads')[v] ?? { status: 'idle' as const }
  }
  const branchLoadedEmpty = (v: string): boolean => {
    const snapshot = branchLoadState(v)
    return snapshot?.status === 'loaded' && snapshot.empty
  }
  // 控件级禁用向下传导，节点也可在 collection 里单独禁用
  const isDisabled = (v: string): boolean => disabled || !!metaOf(v)?.disabled

  /**
   * 节点语气：只认 collection 里这一层自己写的那族色，不从父节点继承。
   * 没写时返回 undefined，作者直接写在部件上的 data-tone 原样留着。
   */
  const nodeTone = (v: string): string | undefined => metaOf(v)?.tone ?? undefined

  // 显示文字取自 collection 的 label，收起子树里的选中值也报得出名字
  const labelOf = (v: string): string => metaOf(v)?.label ?? v
  const valueText = value.length ? value.map(labelOf).join(', ') : null
  const displayText = valueText ?? placeholder ?? ''
  const canClear = interactive && value.length > 0

  // 多选的已选项在触发器里排成标签：套的是库里的 tag，截断与 +N 的做法与 Select 同一套。
  // 删除钮摘值回到机器：只读与禁用由 tag 挡在钮上
  const selectionTags = connectSelectionTags({
    entries: value.map(v => ({ key: v, label: labelOf(v) })),
    maxTagCount: prop('maxTagCount'),
    overflowTag: translations.overflowTag,
    deleteItem: translations.deleteItem,
    variant,
    tone: prop('tone'),
    size: prop('size'),
    disabled,
    readOnly,
    onDelete: v => send({ type: 'VALUE.SET', value: value.filter(x => x !== v) }),
  }, normalize)
  const tags = selectionTags.visible.map(tag => ({ value: tag.key, label: tag.label }))
  const { overflowCount, overflowText } = selectionTags

  /** 节点（item 与 branch）共用的 ARIA 与身份属性。 */
  const nodeAttrs = (v: string): Record<string, string | number | undefined> => {
    const meta = viewIndex.get(v)
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
    'data-loading': dataAttr(branchLoadState(v)?.status === 'loading'),
    'data-error': dataAttr(branchLoadState(v)?.status === 'error'),
    'data-empty': dataAttr(branchLoadedEmpty(v)),
    'data-load-state': branchLoadState(v)?.status,
  })

  /** 从节点内的元素向上找最近的 branch 容器。 */
  const branchElOf = (el: HTMLElement): HTMLElement | null => el.closest<HTMLElement>(parts.branch.selector)

  // 按压通道：真源是机器 context 里「正被按住的那一个」（节点按 value 记、叶子行与分支行分开认，清空按钮只记部件），
  // 各自合成一份跟踪器；Space / Enter 与触屏按住投影 data-pressed，指针按住由 :active 表出，家族配方两者同一档。
  // 节点自身的禁用只有 connect 知道，随 PRESS.START 带给机器的 canPress 守卫
  const pressedPart = context.get('pressedPart')
  const pressedValue = context.get('pressedValue')
  const press = (part: TreeSelectPressedPart, value?: string, disabled?: boolean): PressHandlers => createPressTracker({
    isPressed: () => context.get('pressedPart') === part && context.get('pressedValue') === (value ?? null),
    onChange: down => send(down ? { type: 'PRESS.START', part, value, disabled } : { type: 'PRESS.END', part, value }),
  })
  /** 只认落在自己身上的事件：branch 裹着整棵子树，子节点上的按键与失焦会冒泡（React 的 onBlur 挂 focusout）上来。 */
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

  /** 虚拟窗口里的落点：先记锚点，再由桥把那一行滚进窗口、挂上后交接焦点。 */
  const focusVirtualTarget = (target: { index: number, value: string } | null): void => {
    if (!target || !virtualizer)
      return
    send({ type: 'NODE.FOCUS', value: target.value })
    virtualizer.focusIndex(target.index, { align: 'auto', selector: TREE_SELECT_NODE_SELECTOR })
  }

  /** 方向键落点：起点用锚点，终点在可见行上算，禁用节点自动跳过。 */
  const focusBy = (container: HTMLElement, intent: NavIntent): void => {
    if (virtualizer) {
      focusVirtualTarget(virtualCollectionTarget(rows, focusedValue, intent, {
        value: row => row.value,
        disabled: row => isDisabled(row.value),
        loop,
      }))
      return
    }
    focusValue(navigateItems(treeSelectNodeEls(container, rows), focusedValue, intent, { loop }))
  }

  /** 按值把焦点搬到某一行。 */
  const focusOn = (container: HTMLElement, v: string): void => {
    if (virtualizer) {
      const index = rowIndex.get(v)
      focusVirtualTarget(index == null ? null : { index, value: v })
      return
    }
    focusValue(treeSelectNodeEls(container, rows).find(el => itemValue(el) === v) ?? null)
  }

  /** 连打检索的取字处是 collection 里的 label，不是节点 textContent。 */
  const nodeText = (el: HTMLElement): string => {
    const v = itemValue(el)
    return v == null ? '' : labelOf(v)
  }

  /** 连打检索落点：从当前锚点的下一个绕一圈找，禁用节点跳过；未命中保持原状。 */
  const focusMatch = (container: HTMLElement, query: string): void => {
    if (virtualizer) {
      focusVirtualTarget(virtualCollectionMatch(rows, focusedValue, query, {
        value: row => row.value,
        text: row => labelOf(row.value),
        disabled: row => isDisabled(row.value),
        loop: true,
      }))
      return
    }
    const list = treeSelectNodeEls(container, rows)
    focusValue(matchTypeahead(list, indexOfValue(list, focusedValue), query, {
      text: nodeText,
      skip: isItemDisabled,
    }))
  }

  /** 确认键与点行的落点：只改选中值，展开态另由左右方向键与 branch-trigger 处理。 */
  const activate = (row: TreeVisibleNode): void => {
    if (disabled || row.disabled)
      return
    if (row.branch && branchLoadState(row.value)?.status === 'error') {
      send({ type: 'BRANCH.RETRY', value: row.value })
      return
    }
    if (readOnly)
      return
    send({ type: 'NODE.SELECT', value: row.value })
  }

  /** 从浮层里任一节点找到搜索框：键盘在壳上收口，焦点换去搜索框时现查。 */
  const inputElOf = (el: HTMLElement): HTMLInputElement | null =>
    el.closest<HTMLElement>(parts.content.selector)?.querySelector<HTMLInputElement>(parts.input.selector) ?? null

  return {
    open,
    collection,
    visibleNodes: rows,
    value,
    expandedValue,
    valueText,
    displayText,
    focusedValue,
    empty,
    loading,
    searching,
    inputValue,
    translations,
    multiple,
    disabled,
    readOnly,
    invalid,
    canClear,
    tags,
    overflowCount,
    overflowText,
    isSelected,
    isIndeterminate,
    isExpanded,
    branchLoadState,
    setOpen: (next) => {
      if (next !== open)
        send(next ? { type: 'OPEN', focus: 'selected' } : { type: 'CLOSE' })
    },
    setValue: next => send({ type: 'VALUE.SET', value: next }),
    setExpandedValue: next => send({ type: 'EXPANDED.SET', value: next }),
    setInputValue: next => send({ type: 'INPUT.CHANGE', value: next }),
    expand: v => send({ type: 'BRANCH.EXPAND', value: v }),
    collapse: v => send({ type: 'BRANCH.COLLAPSE', value: v }),
    retryBranch: v => send({ type: 'BRANCH.RETRY', value: v }),
    select: v => send({ type: 'NODE.SELECT', value: v }),
    clear: () => send({ type: 'VALUE.CLEAR' }),
    deselect: v => send({ type: 'VALUE.SET', value: value.filter(x => x !== v) }),

    getRootProps: () => normalize.element({
      ...parts.root.attrs,
      'data-state': stateAttr,
      // 三个视觉轴打在根与 positioner 上，皮肤由这两处往下派发；其余子部件不重复标注
      'data-variant': variant,
      'data-tone': prop('tone'),
      'data-size': prop('size'),
      'data-disabled': dataAttr(disabled),
      'data-readonly': dataAttr(readOnly),
      'data-invalid': dataAttr(invalid),
      'data-loading': dataAttr(loading),
    }),

    getLabelProps: () => normalize.element({
      ...parts.label.attrs,
      'id': ids.label,
      'data-disabled': dataAttr(disabled),
    }),

    /**
     * 触发按钮与清空按钮的收纳容器，也是描边、底色与聚焦环所在的那一层：
     * 由 Field Chrome 家族画在它身上，size 缺省 md，variant 与 root 同源。
     */
    getControlProps: () => normalize.element({
      ...parts.control.attrs,
      'data-xh-field-chrome': '',
      'data-xh-field-size': prop('size') ?? 'md',
      'data-variant': variant,
      'data-state': stateAttr,
      'data-disabled': dataAttr(disabled),
      'data-readonly': dataAttr(readOnly),
      'data-invalid': dataAttr(invalid),
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
        // 清空钮不占 Tab 位，键盘在 trigger 上清值：Delete 清空全部，Backspace 单选清空、多选去掉最后一个
        if (canClear && (event.key === 'Delete' || event.key === 'Backspace')) {
          event.preventDefault()
          if (event.key === 'Delete' || !multiple)
            send({ type: 'VALUE.CLEAR' })
          else
            send({ type: 'VALUE.SET', value: value.slice(0, -1) })
          return
        }
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

    // 标签行：无选中时整个收起，皮肤据此让 value-text 回来显示占位文字；行怎么排归标签行家族配方
    getTagListProps: () => normalize.element({
      ...parts['tag-list'].attrs,
      'data-xh-tag-list': '',
      // 列表动效接上之前，首帧的标签直接呈现
      'data-instant': dataAttr(!context.get('tagListTracked')),
      'hidden': value.length === 0 || undefined,
      'data-disabled': dataAttr(disabled),
    }),

    // 标签本体就是 tag 的 root（data-scope="tag"），只多一个 data-value 记它代表哪个选中值
    getTagProps: ({ value: v }) => ({
      ...selectionTags.tag(v).getRootProps() as Record<string, unknown>,
      'data-value': v,
    }) as T['element'],

    // 折起来的那些合成一枚：也是 tag 的 root，data-count 记折了几枚；没有折起的就整个收起，不留空位
    getOverflowTagProps: () => ({
      ...selectionTags.overflow.getRootProps() as Record<string, unknown>,
      'data-count': String(overflowCount),
    }) as T['element'],

    // 两种标签的文字都落在 tag 的 label 上，截断规则挂在那一层
    getTagLabelProps: () => selectionTags.overflow.getLabelProps(),

    // 删除钮就是所在标签那份 tag 的 close-trigger：可及名、禁用与点按都由 tag 给
    getItemDeleteTriggerProps: ({ value: v }) => selectionTags.tag(v).getCloseTriggerProps(),

    getIndicatorProps: () => normalize.element({
      // 有值时清空钮顶上来，箭头让位：两个图标并排堆在框里，用户分不清点哪个
      'data-clearable': dataAttr(canClear),
      ...parts.indicator.attrs,
      'aria-hidden': true,
      'data-state': stateAttr,
      'data-disabled': dataAttr(disabled),
    }),

    // 清空钮走 Action Control 的 field-inset ghost 档：字段底是 canvas，透明 → 悬停 100 → 按下 200，按 has-value 显隐
    getClearTriggerProps: () => {
      const handlers = press('clear-trigger')
      return normalize.button({
        ...parts['clear-trigger'].attrs,
        'data-xh-action-control': '',
        'data-xh-action-profile': 'field-inset',
        'data-xh-action-variant': 'ghost',
        'data-xh-action-display': 'has-value',
        'data-xh-action-size': prop('size') ?? 'md',
        'data-xh-action-has-value': dataAttr(canClear),
        // Space / Enter 与触屏按住投影 data-pressed，家族的按下面同时认它与指针 :active
        'data-pressed': dataAttr(pressedPart === 'clear-trigger'),
        'type': 'button',
        // 整个控件只占一个 Tab 位（trigger），此按钮不入 Tab 序列；读屏按虚拟光标仍找得到它
        'tabindex': -1,
        'aria-label': translations.clearTrigger,
        // 没值就整个收起，不是禁用：清空钮与下拉钮并排时，一个灰着一个亮着，
        // 用户分不清哪个能点。有值才出现，出现即可用
        'hidden': !canClear || undefined,
        // 拦掉默认聚焦，避免焦点从 trigger 挪到本按钮；触屏按下仍要进按压通道
        'onPointerDown': (event: PointerEvent) => {
          if (event.button === 0)
            event.preventDefault()
          handlers.onPointerDown(event)
        },
        'onPointerUp': handlers.onPointerUp,
        'onPointerCancel': handlers.onPointerCancel,
        'onKeyDown': handlers.onKeyDown,
        'onKeyUp': handlers.onKeyUp,
        'onBlur': handlers.onBlur,
        'onClick': () => {
          if (!canClear)
            return
          send({ type: 'VALUE.CLEAR' })
          // 键盘/程序化激活这一路主动把焦点送回 trigger
          refs.get('getTriggerEl')()?.focus()
        },
      })
    },

    getPositionerProps: () => normalize.element({
      ...parts.positioner.attrs,
      // 定位层被搬到 portal 落点，继承不到作者子树上的方向；作者没给就不写，交给落点处的继承
      'dir': prop('dir'),
      // 视觉轴在浮层这一侧再打一次：positioner 被搬到 portal 落点，继承不到根上的私有槽
      'data-variant': variant,
      'data-tone': prop('tone'),
      'data-size': prop('size'),
      'data-state': stateAttr,
      'data-placement': placement,
      // 锚点滚出可视区时引擎置 hidden
      // 锚点被滚出可视区时引擎置 hidden，样式据此收起浮层
      'data-hidden': dataAttr(position?.hidden),
      // 落位才露：皮肤基线把定位层藏着，带这个才显示。展开那几帧坐标还没算出来时就是藏的
      'data-positioned': dataAttr(overlayPositioned(position)),
      'style': {
        position: 'fixed',
        left: `${position?.x ?? 0}px`,
        top: `${position?.y ?? 0}px`,
        // content 继承这个高度上限，超出的条目在浮层内部滚
        ...availableSpaceVars(position),
        // content 继承这个宽度下界，浮层至少与触发器同宽
        ...anchorWidthVar(position?.anchorWidth),
      },
    }),

    // 键盘全在 content 上收口，与 select / cascader 同一落点：content 自带内边距又可被点中
    // （tabindex=-1），焦点歇在它身上时按键从这里发出，挂在里层 tree 上收不到。
    // 节点集合按部件归属过滤，查询容器传 content 与传 tree 等价。
    // Escape 归消解层管，不在这里收
    getContentProps: () => normalize.element({
      ...parts.content.attrs,
      // 锚定瞬态浮层的内容面：皮肤按材质家族配方画 frosted 四件套与 1px 顶光
      'data-xh-material': 'frosted',
      'id': ids.content,
      // 浮层壳只是焦点域与消解层的根节点，写 -1 避免可滚动区域被自动纳入 Tab 序列
      'tabindex': -1,
      'data-state': stateAttr,
      // 挂载时就开着的这一段直接呈现，不播进场
      'data-instant': dataAttr(context.get('openedAtMount')),
      'data-placement': placement,
      // Presence 保留视觉节点期间，逻辑关闭立即撤出交互与可访问树。
      'inert': !open || undefined,
      'aria-hidden': !open || undefined,
      // 收起时留在 DOM 只隐藏
      'hidden': !open || undefined,
      'onKeyDown': (event: KeyboardEvent) => {
        // 收起态不响应按键
        if (!open || disabled)
          return
        // 搜索框里的按键归它自己的处理器，壳上不再接
        if ((event.target as HTMLElement | null)?.matches?.(parts.input.selector))
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
          // 搜索视图里逐个展开：改的是它自己的展开集合，不动作者的 expandedValue
          if (searching) {
            for (const sibling of siblings)
              send({ type: 'BRANCH.EXPAND', value: sibling })
            return
          }
          send({ type: 'EXPANDED.SET', value: [...expandedValue, ...siblings] })
          return
        }

        // 开了搜索：可打印字符接到检索词末尾、焦点回到搜索框，不做连打检索；空格仍是确认键
        if (searchable && key.length === 1 && key !== ' ') {
          const input = inputElOf(container)
          if (input) {
            event.preventDefault()
            send({ type: 'INPUT.CHANGE', value: inputValue + key })
            input.focus()
            return
          }
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

    // 浮层内搜索框：content 里、tree 之前；没开 searchable 就整个藏掉，作者不必条件渲染
    getInputProps: () => normalize.input({
      ...parts.input.attrs,
      'id': ids.input,
      'type': 'text',
      'value': inputValue,
      'disabled': disabled || undefined,
      'hidden': !searchable || undefined,
      'autocomplete': 'off',
      'autocapitalize': 'none',
      // 字段标签名的是整个控件（trigger 指着它），浮层里这个框只能自带一句
      'aria-label': translations.searchInput,
      // 面板内嵌的搜索框：重置与占位前景走字段家族，下划线与高度由皮肤给
      'data-xh-field-input': '',
      'aria-controls': ids.tree,
      'onInput': (event: Event) => {
        send({ type: 'INPUT.CHANGE', value: (event.target as HTMLInputElement).value })
      },
      'onKeyDown': (event: KeyboardEvent) => {
        // 组合期间的按键属于输入法候选框，组件一律不接；带修饰键的组合归浏览器
        if (isComposingEvent(event) || event.ctrlKey || event.metaKey || event.altKey)
          return
        // 壳让开了搜索框里的按键，Tab 收起只能在这里收口；不 preventDefault，焦点按 Tab 序列自然离开
        if (event.key === 'Tab') {
          send({ type: 'CLOSE', src: 'tab' })
          return
        }
        if (event.key === 'Escape') {
          // 词非空就先清词回整棵树。消解层在 document 上按同一判据分过一次岔，这一支管没挂消解层的宿主
          if (inputValue !== '') {
            event.stopPropagation()
            send({ type: 'INPUT.CHANGE', value: '' })
          }
          return
        }
        // 下方向键与 Enter 把焦点交给树：有锚点落回锚点，没有就落首个可用行；Enter 不落到表单上
        if (event.key === 'ArrowDown' || event.key === 'Enter') {
          event.preventDefault()
          const container = (event.currentTarget as HTMLElement).closest<HTMLElement>(parts.content.selector)
          if (!container)
            return
          if (focusedValue != null)
            focusOn(container, focusedValue)
          else
            focusBy(container, 'first')
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
      'aria-label': translations.tree,
      // 复选与否显式输出
      'aria-multiselectable': multiple ? 'true' : 'false',
      'aria-disabled': disabled ? 'true' : 'false',
      // 取数在途的播报归树本体：两个相位占位自己不带这一位
      'aria-busy': loading ? 'true' : undefined,
      // 展开但无锚点时由容器兜底承担 Tab 位；判据用 focusedValue 而非锚点元素
      'tabindex': open && focusedValue == null ? 0 : -1,
      'data-state': stateAttr,
      'data-disabled': dataAttr(disabled),
      'data-empty': dataAttr(empty && !loading),
    }),

    // 空态占位：放在 content 里、tree 的兄弟（role=tree 只许拥有 treeitem 与 group）。
    // collection 与手写节点都用上方统一空态；取数在途时让位。
    getEmptyProps: () => normalize.element({
      ...parts.empty.attrs,
      'role': 'status',
      'data-state': stateAttr,
      'hidden': loading || !empty || undefined,
    }),

    // 在途占位：与空态占位同一个位置、同一套收放判据，只是条件相反
    getLoadingProps: () => normalize.element({
      ...parts.loading.attrs,
      'role': 'status',
      // 首次加载的那枚环由加载环配方画，随 data-loading 淡入淡出
      'data-xh-loading-ring': '',
      'data-loading': dataAttr(loading),
      'data-state': stateAttr,
      'hidden': !loading || !empty || undefined,
    }),

    // 浮层底部的操作区：作者往里放「全部展开」「清空」这类按钮。
    // 它是 content 的子节点、tree 的兄弟，故不在 role=tree 的拥有关系里，方向键与连打检索也不认它
    getFooterProps: () => normalize.element({
      ...parts.footer.attrs,
      'data-state': stateAttr,
    }),

    // 叶子行走 Collection Item 的 overlay 语境：悬停 / 高亮 100、按下 200 由家族给，选中只留行尾对号
    getItemProps: (node) => {
      const handlers = press('item', node.value, isDisabled(node.value))
      return normalize.element({
        ...parts.item.attrs,
        ...nodeAttrs(node.value),
        ...nodeState(node.value),
        ...outOfView(node.value),
        'data-xh-collection-item': '',
        'data-xh-collection-size': prop('size') ?? 'md',
        'data-xh-collection-context': 'overlay',
        // 该节点自身的性质；家族据此换字与悬停 / 按下的面，选中与禁用压过它
        'data-tone': nodeTone(node.value),
        // Space / Enter 与触屏按住投影 data-pressed，家族的按下面同时认它与指针 :active
        'data-pressed': dataAttr(pressedPart === 'item' && pressedValue === node.value),
        'onClick': (event: MouseEvent) => {
          if (!interactive || isDisabled(node.value))
            return
          // 叶子本身就是 treeitem，直接认 currentTarget
          focusValue(event.currentTarget as HTMLElement)
          send({ type: 'NODE.SELECT', value: node.value })
        },
        // 禁用节点被点到也记锚点，供方向键起步
        'onFocus': () => send({ type: 'NODE.FOCUS', value: node.value }),
        'onKeyDown': handlers.onKeyDown,
        'onKeyUp': handlers.onKeyUp,
        'onBlur': handlers.onBlur,
        'onPointerDown': handlers.onPointerDown,
        'onPointerUp': handlers.onPointerUp,
        'onPointerCancel': handlers.onPointerCancel,
      })
    },

    getItemTextProps: node => normalize.element({
      ...parts['item-text'].attrs,
      ...nodeState(node.value),
      'data-xh-collection-slot': 'text',
    }),

    // 节点的第 2 行：跨 text 槽、走 muted 档，不跟语气
    getItemDescriptionProps: node => normalize.element({
      ...parts['item-description'].attrs,
      ...nodeState(node.value),
      'data-xh-collection-slot': 'description',
    }),

    // 行尾那一格：内容由作者给（计数、徽标）。行首归勾选框与展开箭头，这一格才是作者的
    getItemSuffixProps: node => normalize.element({
      ...parts['item-suffix'].attrs,
      ...nodeState(node.value),
      'data-xh-collection-slot': 'suffix',
    }),

    // 对号落在家族网格的 indicator 列（叶子与分支行共用）
    getItemIndicatorProps: node => normalize.element({
      ...parts['item-indicator'].attrs,
      ...nodeState(node.value),
      'data-xh-collection-slot': 'indicator',
      'aria-hidden': true,
    }),

    getBranchProps: (node) => {
      // 焦点落在 branch 上、按压面画在 branch-control 上：键盘那一路由这里替行代发，
      // 只认落在自己身上的按键与失焦（子树里的会冒泡上来）
      const handlers = press('branch-control', node.value, isDisabled(node.value))
      return normalize.element({
        ...parts.branch.attrs,
        ...nodeAttrs(node.value),
        ...branchState(node.value),
        ...outOfView(node.value),
        'aria-expanded': isExpanded(node.value) ? 'true' : 'false',
        'aria-busy': branchLoadState(node.value)?.status === 'loading' ? 'true' : undefined,
        // 分支裹着整棵子树，可及名字显式取 collection 的 label（缺省退回 value）
        'aria-label': metaOf(node.value)?.label,
        'onFocus': () => send({ type: 'NODE.FOCUS', value: node.value }),
        'onKeyDown': onSelf(handlers.onKeyDown),
        'onKeyUp': onSelf(handlers.onKeyUp),
        'onBlur': onSelf<FocusEvent>(handlers.onBlur),
      })
    },

    // 分支行同走 Collection Item 的 overlay 语境；aria-selected 在 branch 上，选中对号的显隐由皮肤按 data-selected 给
    getBranchControlProps: (node) => {
      const handlers = press('branch-control', node.value, isDisabled(node.value))
      return normalize.element({
        ...parts['branch-control'].attrs,
        ...branchState(node.value),
        'data-xh-collection-item': '',
        'data-xh-collection-size': prop('size') ?? 'md',
        'data-xh-collection-context': 'overlay',
        // 该节点自身的性质；家族据此换字与悬停 / 按下的面，选中与禁用压过它
        'data-tone': nodeTone(node.value),
        // 触屏按住投影 data-pressed，家族的按下面同时认它与指针 :active；
        // 键盘那一路由 branch 代发（焦点落在它身上），行自己只接触屏。与叶子行分开认：同一个值按住行时叶子不亮
        'data-pressed': dataAttr(pressedPart === 'branch-control' && pressedValue === node.value),
        'onPointerDown': handlers.onPointerDown,
        'onPointerUp': handlers.onPointerUp,
        'onPointerCancel': handlers.onPointerCancel,
        'onClick': (event: MouseEvent) => {
          if (!interactive || isDisabled(node.value))
            return
          // 分支行只是 treeitem 里的一层内容，焦点落在 branch 上
          const branchEl = branchElOf(event.currentTarget as HTMLElement)
          if (branchEl)
            focusValue(branchEl)
          // 点行只选中不展开，展开归箭头与左右方向键
          send({ type: 'NODE.SELECT', value: node.value })
        },
      })
    },

    // 展开箭头落在家族网格的首列（prefix），叶子行用占位对齐
    getBranchTriggerProps: node => normalize.element({
      ...parts['branch-trigger'].attrs,
      ...branchState(node.value),
      'data-xh-collection-slot': 'prefix',
      // 箭头与 branch 的左右方向键语义重复，退出可及树与 Tab 序列
      'aria-hidden': true,
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
      'data-xh-collection-slot': 'prefix',
      'aria-hidden': true,
    }),

    getBranchTextProps: node => normalize.element({
      ...parts['branch-text'].attrs,
      ...branchState(node.value),
      'data-xh-collection-slot': 'text',
    }),

    getBranchContentProps: node => normalize.element({
      ...parts['branch-content'].attrs,
      ...branchState(node.value),
      // 子层是 treeitem 的下一级分组
      role: 'group',
    }),

    getBranchLoadingProps: node => normalize.element({
      ...parts['branch-loading'].attrs,
      ...branchState(node.value),
      'role': 'status',
      // 分支首次取子项：文案前一枚加载环，由加载环配方画
      'data-xh-loading-ring': '',
      'data-loading': dataAttr(branchLoadState(node.value)?.status === 'loading'),
      'hidden': (!isExpanded(node.value) || branchLoadState(node.value)?.status !== 'loading') || undefined,
    }),

    getBranchErrorProps: node => normalize.element({
      ...parts['branch-error'].attrs,
      ...branchState(node.value),
      role: 'alert',
      hidden: (!isExpanded(node.value) || branchLoadState(node.value)?.status !== 'error') || undefined,
    }),

    getBranchRetryTriggerProps: node => normalize.button({
      ...parts['branch-retry-trigger'].attrs,
      ...branchState(node.value),
      'type': 'button',
      'tabindex': -1,
      'aria-label': translations.retry,
      'disabled': disabled || undefined,
      'hidden': (!isExpanded(node.value) || branchLoadState(node.value)?.status !== 'error') || undefined,
      'onPointerDown': (event: PointerEvent) => {
        if (event.button === 0)
          event.preventDefault()
      },
      'onClick': (event: MouseEvent) => {
        event.stopPropagation()
        if (!disabled)
          send({ type: 'BRANCH.RETRY', value: node.value })
      },
    }),

    getBranchEmptyProps: node => normalize.element({
      ...parts['branch-empty'].attrs,
      ...branchState(node.value),
      role: 'status',
      hidden: (!isExpanded(node.value) || !branchLoadedEmpty(node.value)) || undefined,
    }),

    // 表单出口：选中值随表单提交，对键盘与读屏不存在
    getHiddenInputProps: input => normalize.input({
      // type 先于 value 写入：改 type 会重置输入的值
      type: 'hidden',
      ...parts['hidden-input'].attrs,
      // name 缺省即不产出该属性，此时不参与提交
      name: prop('name'),
      form: prop('form'),
      // 每个选中值对应一个同名原生控件，值内的逗号保持原样。
      value: input.value,
      // 单体控件用原生 disabled，禁用时不提交值
      disabled: disabled || undefined,
    }),
  }
}
