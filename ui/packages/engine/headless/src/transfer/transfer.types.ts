import type { Direction, PropTypes } from '@xihan-ui/kernel'
import type { MachineSchema } from '@xihan-ui/machine'

/**
 * 哪一侧。source 是还没选进来的，target 是已经选进来的；
 * value 这个 prop 说的就是 target 侧那一批，与两侧的勾选（selection）是两回事。
 */
export type TransferSide = 'source' | 'target'

/** 一侧的整体勾选态：全选 / 半选 / 一个没勾。select-all-trigger 的 aria-checked 由它翻译。 */
export type TransferCheckState = 'checked' | 'indeterminate' | 'unchecked'

/**
 * 条目全集里的一条，是元信息的唯一事实源：标签与禁用都从这里读，作者的标记只管长相。
 * value 必须全集唯一：它同时是 DOM 身份（data-value）、value / selection 集合的元素，
 * 以及连接层按值找节点的键。
 */
export interface TransferItem {
  value: string
  /** 展示名，也是搜索过滤的取字处。 */
  label: string
  /** 条目禁用：勾不动、也搬不动，但它仍可聚焦、仍是方向键的起点。 */
  disabled?: boolean
}

/**
 * 搜索过滤谓词。过滤由组件做：作者只给怎么算匹配这一条规则，
 * 哪些条目隐去、方向键怎么走、全选与搬运算哪些全部由组件收口。
 * query 传进来时已 trim 过，且保证非空串（空搜索不调用谓词）。
 */
export type TransferFilter = (item: TransferItem, query: string) => boolean

export interface TransferValueChangeDetails {
  /** 落在 target 侧的值。 */
  value: string[]
}

export interface TransferSelectionChangeDetails {
  /** 两侧合起来被勾中的值（一个值只可能在一侧，因此一个扁平集合就够了）。 */
  value: string[]
}

/** 面板级部件自报身份：它归哪一侧。两侧共用一套 part 名，靠这个值分开。 */
export interface TransferPanelProps {
  side: TransferSide
}

/**
 * 条目自报家门：值 + 它挂在哪一侧的面板里；禁用与标签一律回 collection 里查。
 * 两侧面板各挂一份全集，不属于本侧的条目由连接层打上 hidden 而非卸载，
 * 所以同一个 value 会有两个节点，side 就是它们各自的身份。
 */
export interface TransferItemProps {
  value: string
  side: TransferSide
}

export interface TransferSchema extends MachineSchema {
  props: {
    /** 条目全集，元信息的唯一事实源。缺省为空。 */
    collection?: TransferItem[]
    /**
     * 落在 target 侧的值。给定即受控：cell 直读 prop，写只发 onValueChange 不落内部值。
     */
    value?: string[]
    defaultValue?: string[]
    /** 两侧合起来被勾中的值（用于搬运）。给定即受控，语义同上。 */
    selection?: string[]
    defaultSelection?: string[]
    /** 每侧带一个搜索框；关掉时搜索框仍在 DOM 里但带 hidden，且搜索串一律按空处理。 */
    searchable?: boolean
    /** 自定义匹配规则；缺省是标签大小写不敏感包含。 */
    filter?: TransferFilter
    /** 整个控件禁用：条目转 aria-disabled，三个按钮与搜索框用原生 disabled。 */
    disabled?: boolean
    /** 只能往右不能往回：往回搬那条路整个封死，target 侧也不再接受勾选。 */
    oneWay?: boolean
    /** 列表内方向键走到尽头是否回绕，默认 true。 */
    loop?: boolean
    /** 文字方向，默认 ltr；决定列表内哪个横向方向键是"搬向对面"。 */
    dir?: Direction
    onValueChange?: (details: TransferValueChangeDetails) => void
    onSelectionChange?: (details: TransferSelectionChangeDetails) => void
  }
  context: {
    /** target 侧的值，恒为数组。受控（value 给定）时 cell 直读 prop。 */
    value: string[]
    /** 被勾中的值，恒为数组。受控（selection 给定）时 cell 直读 prop。 */
    selection: string[]
    /** 范围选的起点。Shift 那一段从它算起，跨到另一侧时作废。 */
    selectionAnchor: string | null
    /** 按住 Shift 之前的那份勾选，每一下都从它重算，往回点才收得回来。 */
    selectionBaseline: string[] | null
    /** 两侧各自的搜索串。不受控、不对外通知：它只影响"看得见什么"。 */
    sourceQuery: string
    targetQuery: string
    /**
     * 两侧各自的焦点锚点，焦点离开该侧即清空。
     * 必须分两份：两个列表各是一个独立的 roving 分组，各自要留一个 Tab 停靠点。
     */
    sourceFocusedValue: string | null
    targetFocusedValue: string | null
  }
  computed: Record<string, never>
  refs: Record<string, never>
  /** 没有开合、没有异步，机器只有一个状态，逻辑全在 context 与 actions。 */
  state: 'idle'
  event:
    /** 整体改写 target 侧集合（外部 setValue 走它）。 */
    | { type: 'VALUE.SET', value: string[] }
    /** 整体改写勾选集合。 */
    | { type: 'SELECTION.SET', value: string[] }
    /** 切换一个条目的勾选态。 */
    | { type: 'ITEM.TOGGLE', value: string, extend?: boolean }
    /** 全选/取消全选某一侧（只动该侧可见且未禁用的那些）。 */
    | { type: 'SIDE.TOGGLE_ALL', side: TransferSide }
    /** 把对面勾中的条目搬到 to 侧。 */
    | { type: 'ITEMS.MOVE', to: TransferSide }
    | { type: 'SEARCH.SET', side: TransferSide, query: string }
    | { type: 'ITEM.FOCUS', side: TransferSide, value: string }
    /** 焦点离开某一侧的列表，或持有焦点的条目被移出 DOM（浏览器此时不派 focusout）。 */
    | { type: 'LIST.BLUR', side: TransferSide }
  tag: never
  guard: never
  action:
    | 'setValue'
    | 'setSelection'
    | 'toggleItem'
    | 'toggleAll'
    | 'moveItems'
    | 'setQuery'
    | 'setFocusedValue'
    | 'clearFocusedValue'
  effect: never
}

export interface TransferApi<T extends PropTypes = PropTypes> {
  /** 条目全集（作者给的那份，原样透出）。 */
  collection: readonly TransferItem[]
  /** 落在 target 侧的值。 */
  value: string[]
  /** 两侧合起来被勾中的值。 */
  selection: string[]
  disabled: boolean
  oneWay: boolean
  searchable: boolean
  /** 某一侧当下看得见的条目（分侧 + 搜索之后），顺序恒为 collection 原序。 */
  visibleItems: (side: TransferSide) => readonly TransferItem[]
  /** 某一侧此刻真正勾中的值（只算可见且未禁用的那些，与三态、搬运同一口径）。 */
  checkedValues: (side: TransferSide) => string[]
  checkState: (side: TransferSide) => TransferCheckState
  query: (side: TransferSide) => string
  /** 往 to 侧搬此刻可不可行：对面有勾中的可操作条目，且这条路没被 oneWay 封死。 */
  canMove: (to: TransferSide) => boolean
  isChecked: (value: string) => boolean
  sideOf: (value: string) => TransferSide
  setValue: (next: string[]) => void
  setSelection: (next: string[]) => void
  setQuery: (side: TransferSide, query: string) => void
  /** 切换某一项的勾选。extend 为真时选中锚点到这一项那一段（同侧才成立）。 */
  toggle: (value: string, options?: { extend?: boolean }) => void
  toggleAll: (side: TransferSide) => void
  /** 程序化搬运；焦点安排不在这里做，那要知道是哪个节点触发的。 */
  move: (to: TransferSide) => void
  getRootProps: () => T['element']
  getPanelProps: (props: TransferPanelProps) => T['element']
  getPanelHeaderProps: (props: TransferPanelProps) => T['element']
  getPanelTitleProps: (props: TransferPanelProps) => T['element']
  getPanelCountProps: (props: TransferPanelProps) => T['element']
  getSearchProps: (props: TransferPanelProps) => T['input']
  getListProps: (props: TransferPanelProps) => T['element']
  getSelectAllTriggerProps: (props: TransferPanelProps) => T['button']
  getItemProps: (props: TransferItemProps) => T['element']
  getItemTextProps: (props: TransferItemProps) => T['element']
  getItemCheckboxProps: (props: TransferItemProps) => T['element']
  getToTargetTriggerProps: () => T['button']
  getToSourceTriggerProps: () => T['button']
}

/** 读屏用的文案。本组件目前没有需要外露的文案，位先留着。 */
export interface TransferTranslations {}
