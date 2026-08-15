import type { Direction, PropTypes, Size } from '@xihan-ui/kernel'
import type { MachineSchema } from '@xihan-ui/machine'

/**
 * 焦点模型：**行级** roving tabindex。
 *
 * 表体里只有锚点行 tabindex=0，其余一律 -1；锚点 = focusedRow ?? 首个选中的数据行。
 * 焦点不在表体里时由 body 兜底进 Tab 序列，它的 onFocus 再把焦点转投给某一行。
 * 左右方向键的语义是展开/收起当前行，因此不做单元格级导航与 F2 编辑模式。
 */
export type TableFocusModel = 'row-roving-tabindex'

/**
 * 选择模式：
 * - none：整套选择机制关停。行不报 aria-selected，两个选择把手都转 aria-disabled，
 *   Space 也不再被表体吞掉；
 * - single：一次只中一行，再点一次可取消（把手是复选框形态，不是单选钮）；
 * - multiple：复选，root 报 aria-multiselectable=true，全选把手才生效。
 */
export type TableSelectionMode = 'none' | 'single' | 'multiple'

export type TableSortDirection = 'asc' | 'desc'

/** 排序链的一环。链是**有序**的：下标即优先级，第一个是主排序字段。 */
export interface TableSortDescriptor {
  id: string
  direction: TableSortDirection
}

/**
 * 选中集合。裸 'all' 表示全都选中，含服务端分页下的跨页全选。
 * 用户一动手即摊成显式 id 数组，基准是**当前可选行**，跨页那部分选中随之丢失。
 */
export type TableSelection = string[] | 'all'

/** 全选把手的三态。some 对应 aria-checked='mixed'。 */
export type TableSelectionState = 'none' | 'some' | 'all'

/**
 * 列定义。列号（aria-colindex）与列总数（aria-colcount）的唯一事实源，不从 DOM 反推。
 * 选择列、展开列这类只有把手的列也必须在此声明一条，否则右侧所有列的列号串位。
 */
export interface TableColumnDef {
  /** 全表唯一：既是 DOM 身份（data-value），也是排序链与列号索引的键。 */
  id: string
  /** 展示名。只供调用方渲染，不作为可及名字。 */
  label?: string
  /** 可排序：给了才产出 aria-sort，排序把手也才认按键与点击。 */
  sortable?: boolean
  /** 横向吸附（左右滚动时这一列钉住）。只落 data-sticky，位置由皮肤给。 */
  sticky?: boolean
  /** 列宽。数字按 px 处理，字符串原样写进内联 inline-size。 */
  width?: string | number
}

/**
 * 行定义。行序、行号（aria-rowindex）与行总数（aria-rowcount）的唯一事实源；
 * 标记里有而 rows 里没有的行报不出行号，也进不了方向键序列。
 */
export interface TableRowDef {
  /** 全表唯一：DOM 身份（data-value）、选中/展开集合的元素、连接层查行的键。 */
  id: string
  /** 行禁用：选不动也展不开，但仍可聚焦、仍是方向键的起点，也不算进全选基数。 */
  disabled?: boolean
  /**
   * 可展开：给了才报 aria-expanded，左右方向键与展开把手也才认这一行。
   * 只要有一行给了，root 就从 role=grid 换成 role=treegrid。
   */
  expandable?: boolean
}

/** 可见行序列的元素。展开摊平的产物，数据行与详情行都在其中。 */
export interface TableVisibleRow {
  /** 数据行与它的详情行共用同一个 id。 */
  id: string
  /** data = 数据行；expanded = 紧跟其后的详情行，只在展开时出现。 */
  kind: 'data' | 'expanded'
  disabled: boolean
  expandable: boolean
  /** 详情行恒为 true；数据行为「可展开且在展开集合里」。 */
  expanded: boolean
  /** 可见序，0 起算。连接层加上表头偏移即 aria-rowindex。 */
  index: number
}

export interface TableSortChangeDetails {
  value: TableSortDescriptor[]
}

export interface TableSelectionChangeDetails {
  value: TableSelection
}

export interface TableExpandedChangeDetails {
  value: string[]
}

/** 行系部件自报家门：只报行 id，禁用、可展开与行号一律回 rows 里查。 */
export interface TableRowProps {
  value: string
}

/** 列系部件自报家门：只报列 id。可排序、吸附与列宽都回 columns 里查。 */
export interface TableColumnProps {
  value: string
}

/**
 * 单元格自报家门：value 是**列** id（列号由它算出）。
 * row 只在表体单元格上给，用来跟着行画选中底色；表头与脚注的格子省略即可。
 */
export interface TableCellProps {
  value: string
  row?: string
  /** 跨列数，从 value 那一列往后算；详情行里那格整行铺开就靠它。1 与省略同义。 */
  colSpan?: number
}

export interface TableSchema extends MachineSchema {
  props: {
    /** 列定义，列号与列总数的唯一事实源。缺省为空表。 */
    columns?: TableColumnDef[]
    /** 行定义，行序与行号的唯一事实源。缺省为空表。 */
    rows?: TableRowDef[]
    /** 排序链。给定即受控：cell 直读 prop，写只发 onSortChange 不落内部值。 */
    sort?: TableSortDescriptor[]
    defaultSort?: TableSortDescriptor[]
    /** 选中集合。给定即受控，语义同上。 */
    selection?: TableSelection
    defaultSelection?: TableSelection
    /** 展开集合。给定即受控，语义同上。 */
    expanded?: string[]
    defaultExpanded?: string[]
    /** 默认 none：不声明则没有选择机制，行也不报 aria-selected。 */
    selectionMode?: TableSelectionMode
    /** 数据在路上：root 报 aria-busy，表体为空时加载态节点显形。 */
    loading?: boolean
    /** 显式声明表体为空；缺省按 rows 是否为空推导。 */
    empty?: boolean
    /** 表头吸顶：只落 data-sticky，钉住的实现归皮肤。 */
    stickyHeader?: boolean
    /** 表格带脚注行。行号空间的最后一行留给它，aria-rowcount 也把它算进去。 */
    footer?: boolean
    /** 上下键走到首尾是否回绕，默认 false。 */
    loop?: boolean
    /** 文字方向，默认 ltr；只对调左右方向键的「展开/收起」语义。 */
    dir?: Direction
    /** 密度：sm / md / lg。只换单元格的纵向内边距与字号，列宽算法不受影响。 */
    size?: Size
    onSortChange?: (details: TableSortChangeDetails) => void
    onSelectionChange?: (details: TableSelectionChangeDetails) => void
    onExpandedChange?: (details: TableExpandedChangeDetails) => void
  }
  context: {
    /** 排序链，有序且按 id 去重。受控（sort 给定）时 cell 直读 prop。 */
    sort: TableSortDescriptor[]
    /** 选中集合，可能是裸 'all'。单选时长度 ≤ 1。 */
    selection: TableSelection
    /** 展开集合，恒为数组。 */
    expanded: string[]
    /** 焦点位于表体时的瞬态锚点，焦点离开即清空。 */
    focusedRow: string | null
  }
  computed: Record<string, never>
  refs: Record<string, never>
  /** 排序、选中与展开都不编码进状态，机器只有一个状态。 */
  state: 'idle'
  event:
    /** 整体改写排序链（外部 setSort 走它）。 */
    | { type: 'SORT.SET', value: TableSortDescriptor[] }
    /** 点一次排序把手：append 为真表示追加到链尾而不是替换整条链。 */
    | { type: 'SORT.TOGGLE', value: string, append: boolean }
    /** 整体改写选中集合。 */
    | { type: 'SELECTION.SET', value: TableSelection }
    /** 切换单行选中（单选替换、复选增删）。 */
    | { type: 'ROW.SELECT', value: string }
    /** 全选把手：全选着就清空，否则把当前可选行全部纳入。 */
    | { type: 'SELECTION.ALL_TOGGLE' }
    /** 整体改写展开集合。 */
    | { type: 'EXPANDED.SET', value: string[] }
    | { type: 'ROW.EXPAND', value: string }
    | { type: 'ROW.COLLAPSE', value: string }
    | { type: 'ROW.EXPAND_TOGGLE', value: string }
    | { type: 'ROW.FOCUS', value: string }
    /** 焦点离开表体，或持有焦点的行被移出 DOM（此时浏览器不派 focusout，由适配器上报）。 */
    | { type: 'TABLE.BLUR' }
  tag: never
  guard: never
  action:
    | 'setSort'
    | 'toggleSort'
    | 'setSelection'
    | 'selectRow'
    | 'toggleSelectAll'
    | 'setExpanded'
    | 'expandRow'
    | 'collapseRow'
    | 'toggleExpandRow'
    | 'setFocusedRow'
    | 'clearFocusedRow'
  effect: never
}

export interface TableApi<T extends PropTypes = PropTypes> {
  /** 作者给的列定义。 */
  columns: readonly TableColumnDef[]
  /** 作者给的行定义。 */
  rows: readonly TableRowDef[]
  /** 展开摊平后的可见行序列（详情行插在它所属数据行之后）。 */
  visibleRows: readonly TableVisibleRow[]
  sort: TableSortDescriptor[]
  selection: TableSelection
  /** 全选把手的三态，只按**可选行**（未禁用）算。 */
  selectionState: TableSelectionState
  selectionMode: TableSelectionMode
  expandedValue: string[]
  /** 焦点锚点；焦点不在表体里时为 null。 */
  focusedRow: string | null
  loading: boolean
  /** 表体为空（显式声明或 rows 为空）。 */
  empty: boolean
  /** aria-rowcount：表头行 + 可见行 + 脚注行。 */
  rowCount: number
  /** aria-colcount：列定义的条数。 */
  columnCount: number
  isSelected: (value: string) => boolean
  isExpanded: (value: string) => boolean
  /** 该列当前的排序方向；不参与排序时为 null。 */
  sortDirection: (value: string) => TableSortDirection | null
  /** 该列在排序链里的优先级，1 起算；不参与排序时为 0。 */
  sortPriority: (value: string) => number
  setSort: (next: TableSortDescriptor[]) => void
  toggleSort: (value: string, options?: { append?: boolean }) => void
  setSelection: (next: TableSelection) => void
  selectRow: (value: string) => void
  toggleSelectAll: () => void
  setExpandedValue: (next: string[]) => void
  expandRow: (value: string) => void
  collapseRow: (value: string) => void
  toggleExpandRow: (value: string) => void
  getRootProps: () => T['element']
  getCaptionProps: () => T['element']
  getHeaderProps: () => T['element']
  getBodyProps: () => T['element']
  getFooterProps: () => T['element']
  /** 表头那一行：恒占行号空间的第 1 行。 */
  getHeaderRowProps: () => T['element']
  /** 脚注那一行：占行号空间的最后一行。 */
  getFooterRowProps: () => T['element']
  getRowProps: (props: TableRowProps) => T['element']
  getColumnHeaderProps: (props: TableColumnProps) => T['element']
  getCellProps: (props: TableCellProps) => T['element']
  getSelectAllTriggerProps: () => T['element']
  getRowSelectTriggerProps: (props: TableRowProps) => T['element']
  getSortTriggerProps: (props: TableColumnProps) => T['element']
  getExpandTriggerProps: (props: TableRowProps) => T['element']
  getExpandedRowProps: (props: TableRowProps) => T['element']
  getEmptyProps: () => T['element']
  getLoadingStateProps: () => T['element']
}

/** 读屏用的文案。本组件目前没有需要外露的文案，位先留着。 */
export interface TableTranslations {}
