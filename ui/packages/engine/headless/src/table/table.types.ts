/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 定义 table 类型契约。

import type { ControlVariant, Direction, MachineSchema, PropTypes, Size } from '@xihan-ui/core'
import type { DragRect, DragTranslations, DropTarget } from '../shared/drag'

/**
 * 焦点模型：行级 roving tabindex。
 *
 * 表体中只有锚点行 tabindex=0，其余一律 -1；锚点 = focusedRow ?? 首个选中的数据行。
 * 焦点不在表体中时由 body 兜底进入 Tab 序列，它的 onFocus 再把焦点转交给某一行。
 * 左右方向键的语义是展开 / 收起当前行，因此不做单元格级导航与 F2 编辑模式。
 */
export type TableFocusModel = 'row-roving-tabindex'

/**
 * 选择模式：
 * - none：整套选择机制关闭。行不报告 aria-selected，两个选择把手都为 aria-disabled，
 *   Space 也不再被表体拦截；
 * - single：一次只选中一行，再次点击可取消（把手是复选框形态，不是单选按钮）；
 * - multiple：复选，root 报告 aria-multiselectable=true，全选把手才生效。
 */
export type TableSelectionMode = 'none' | 'single' | 'multiple'

export type TableSortDirection = 'asc' | 'desc'

/** 排序链的一环。链是有序的：下标即优先级，第一个是主排序字段。 */
export interface TableSortDescriptor {
  id: string
  direction: TableSortDirection
}

/**
 * 选中集合。裸 'all' 表示全部选中，含服务端分页下的跨页全选。
 * 用户一经操作即展开为显式 id 数组，基准是当前可选行，跨页部分的选中随之丢失。
 */
export type TableSelection = string[] | 'all'

/** 全选把手的三态。some 对应 aria-checked='mixed'。 */
export type TableSelectionState = 'unchecked' | 'indeterminate' | 'checked'

/**
 * 列定义。列号（aria-colindex）与列总数（aria-colcount）的唯一事实源，不从 DOM 反推。
 * 选择列、展开列这类只有把手的列也必须在此声明一条，否则右侧所有列的列号错位。
 */
/**
 * 列的用途。data 是作者定义的数据列，其余三种由库按需插在最前面。
 *
 * 它们必须占用列号空间：不占用时右侧所有列的 aria-colindex 会整体错位，
 * 这正是使用者手工向 columns 中添加假列的原因。
 */
export type TableColumnKind = 'index' | 'select' | 'expand' | 'data'

/**
 * 列偏好：一份可序列化的状态，描述该表本次的列显示方式。
 *
 * 库只负责把它计算进生效列，存储位置归使用者：存 localStorage、存后端、
 * 随用户设置同步，都是应用的事，把存储通道固化进组件库只会绑定一种后端。
 *
 * 只作用于作者定义的列；前缀列是结构性的，由 `prefixColumns` 决定。
 */
export interface TableColumnPreference {
  /**
   * 列序。列在此处的按此顺序排在前面，未列出的按原顺序跟在后面：
   * 只需把某一列移到最前时不必把全表列一遍。
   */
  order?: string[]
  /** 隐藏的列。隐藏的列整体不进入网格，列号也随之重排（隐藏列不占列号）。 */
  hidden?: string[]
  /** 列宽覆盖，按列 id 取，优先于 `TableColumnDef.width`。 */
  widths?: Record<string, number | string>
  /** 冻结覆盖，优先于 `TableColumnDef.sticky`。 */
  sticky?: Record<string, boolean | 'start' | 'end'>
}

export interface TableColumnPreferenceChangeDetails {
  value: TableColumnPreference
}

/**
 * 列设置区中的一行：列偏好计算之后的列，隐藏的列也在其中。
 *
 * 生效列（`TableApi.columns`）已过滤隐藏的列，而设置区正是把它们放回来的位置；
 * 前缀列不在其中：它们是结构性的，由 `prefixColumns` 决定，不由用户调整。
 */
export interface TableColumnSetting {
  id: string
  label?: string
  /** 在设置区中的位次，0 起算。移位时的落点用它计算。 */
  index: number
  /** 该列当前隐藏。 */
  hidden: boolean
  /** 生效的冻结档：偏好中的覆盖优先，没有则为列定义中的值。 */
  sticky?: boolean | 'start' | 'end'
  /** 生效的列宽：偏好中的覆盖优先，没有则为列定义中的值。 */
  width?: string | number
  sortable: boolean
  resizable: boolean
  reorderable: boolean
  /** 该列当前的排序方向；不参与排序时为 null。 */
  sortDirection: TableSortDirection | null
  /** 该列在排序链里的优先级，1 起算；不参与排序时为 0。 */
  sortPriority: number
  /**
   * 该列的显隐是否仍可修改。
   *
   * 只剩最后一列显示时它为 false：全部隐藏的表是一张没有列的网格，
   * 用户从那里无法再点击任何把手把列放回来。
   */
  toggleable: boolean
}

/** 生效的列：作者定义的列，加上库插在最前面的前缀列。 */
export interface TableColumn extends TableColumnDef {
  kind: TableColumnKind
}

export interface TableColumnDef {
  /** 全表唯一：既是 DOM 身份（data-value），也是排序链与列号索引的键。 */
  id: string
  /** 展示名。只供调用方渲染，不作为可及名。 */
  label?: string
  /** 可排序：提供后才产出 aria-sort，排序把手也才响应按键与点击。 */
  sortable?: boolean
  /**
   * 横向冻结（左右滚动时该列固定），写为条目上的 data-frozen。true 等于 'start'（固定在行首侧），'end' 固定在行尾侧。
   * 与表头吸顶的 data-fixed 是两件事：那是布尔，这个带方向，同名会使 [data-fixed] 一条选择器命中两种语义。
   * 同侧有多列吸附时，连接层按前面各列的数字列宽累加出偏移，写入 --xh-table-sticky-inset；
   * 有一列宽度不是数字时无法计算，该侧从该列起都回退为贴边。
   */
  sticky?: boolean | 'start' | 'end'
  /** 列宽。数字按 px 处理，字符串原样写入内联 inline-size。 */
  width?: string | number
  /** 拖动改列宽时的下限（px）。未提供时使用 TABLE_COLUMN_MIN_WIDTH。 */
  minWidth?: number
  /** 拖动改列宽时的上限（px）。未提供时不封顶。 */
  maxWidth?: number
  /** 该列的宽度可以拖动修改。提供后才产出改宽把手。 */
  resizable?: boolean
  /**
   * 该列可以拖动换位。提供后才产出拖拽把手：每个把手都是一个 Tab 位，
   * 未声明的表格不承担该代价。
   *
   * 不可拖动的列与冻结列一样是屏障：跨过它落下会把它挤走，而作者已声明该列不动。
   */
  reorderable?: boolean
}

/**
 * 行定义。行序、行号（aria-rowindex）与行总数（aria-rowcount）的唯一事实源；
 * 标记中有而 rows 中没有的行报告不出行号，也进入不了方向键序列。
 */
export interface TableRowDef {
  /** 全表唯一：DOM 身份（data-value）、选中 / 展开集合的元素、连接层查询行的键。 */
  id: string
  /** 行禁用：不可选中也不可展开，但仍可聚焦、仍是方向键的起点，也不计入全选基数。 */
  disabled?: boolean
  /**
   * 可展开：提供后才报告 aria-expanded，左右方向键与展开把手也才识别该行。
   * 只要有一行提供，root 就从 role=grid 改为 role=treegrid。
   */
  expandable?: boolean
  /**
   * 父行 id。提供后该行即为该父行的子行，收起父行时它随之隐藏。
   *
   * 有子行的行不再产出详情行：一行不可能同时既展开出子行、又展开出一块详情。
   * 指向不存在的父行时按根行处理，不丢弃该行。
   */
  parentId?: string
}

/** 可见行序列的元素。展开展平的产物，数据行与详情行都在其中。 */
export interface TableVisibleRow {
  /** 数据行与它的详情行共用同一个 id。 */
  id: string
  /** data = 数据行；expanded = 紧跟其后的详情行，只在展开时出现。 */
  kind: 'data' | 'expanded'
  disabled: boolean
  expandable: boolean
  /** 详情行恒为 true；数据行为可展开且在展开集合中。 */
  expanded: boolean
  /** 可见序，0 起算。连接层加上表头偏移即 aria-rowindex。 */
  index: number
  /** 父行 id；根行为 null。指向不存在的行时按根行计算，与展平的口径一致。 */
  parentId: string | null
  /** 层级，1 起算，直接写入 aria-level。平表恒为 1。 */
  level: number
  /** 同层内序号，1 起算，直接写入 aria-posinset。 */
  posInSet: number
  /** 同层总数，直接写入 aria-setsize。 */
  setSize: number
  /**
   * 大纲编号，如 `1.2.3`。
   *
   * 取的是在父的 children 中的下标而不是可见序：收起某一枝时，
   * 仍在场的行编号一个都不变。取可见序时收起一枝，其后所有行的编号会整体前移。
   */
  outline: string
}

/**
 * 行不可拖动的原因，null 表示可拖动。
 *
 * 三条都是拖动没有意义而不是拖动会出错：
 * - `sorted`：排序链非空时顺序由排序键决定，拖出的新序下一帧就被覆盖；
 * - `virtualized`：只渲染窗口内一段时，窗口外的行不在 DOM 中，落点无法计算。
 */
export type TableRowReorderReason = 'sorted' | 'virtualized'

export interface TableRowMoveDetails {
  /** 被移动的行。 */
  id: string
  /**
   * 新的父行 id；根层为 null。
   *
   * 表格的树是带 parentId 的扁平数组：结构由 parentId 决定，同层次序由数组先后决定。
   * 因此写回需要两件事：按 ids 重排，再把该行的 parentId 设为该值。
   * 平表下它恒为 null。
   */
  parent: string | null
  /** 在新层级中的位次，0 起算。已经过先移除后插入的修正。 */
  index: number
  /** 已重排的整份行序，可直接写回数据源。 */
  ids: string[]
}

export interface TableSortChangeDetails {
  value: TableSortDescriptor[]
}

export interface TableSelectionChangeDetails {
  value: TableSelection
}

export interface TableExpandedValueChangeDetails {
  value: string[]
}

/** 行系部件的声明：只声明行 id，禁用、可展开与行号一律从 rows 查询。 */
export interface TableRowProps {
  value: string
}

/** 列系部件的声明：只声明列 id。可排序、吸附与列宽都从 columns 查询。 */
export interface TableColumnProps {
  value: string
}

/**
 * 单元格的声明：value 是列 id（列号由它计算）。
 * row 只在表体单元格上提供，用于跟随行绘制选中底色；表头与脚注的格子省略即可。
 */
export interface TableCellProps {
  value: string
  row?: string
  /** 跨列数，从 value 所在列向后计算；详情行中的格子整行铺开依靠它。1 与省略同义。 */
  colSpan?: number
}

/**
 * 接了按压通道的部件键：单颗的记部件名，逐行 / 逐列的带上行 id 或列 id。
 * 多部件共用一个机器，同一时刻只有一个在按着，按键比对投影。
 */
export type TablePressedKey
  = | 'select-all'
    | 'load-more'
    | `row-select:${string}`
    | `column-visibility:${string}`
    | `expand:${string}`
    | `row:${string}`
    | `sort:${string}`

export interface TableSchema extends MachineSchema {
  props: {
    /** 列定义，列号与列总数的唯一事实源。默认为空表。 */
    columns?: TableColumnDef[]
    /** 行定义，行序与行号的唯一事实源。默认为空表。 */
    rows?: TableRowDef[]
    /** 排序链。提供即受控：cell 直读 prop，写入只发 onSortChange 不落内部值。 */
    sort?: TableSortDescriptor[]
    defaultSort?: TableSortDescriptor[]
    /** 选中集合。提供即受控，语义同上。 */
    selection?: TableSelection
    defaultSelection?: TableSelection
    /** 展开集合。提供即受控，语义同上。 */
    expandedValue?: string[]
    defaultExpandedValue?: string[]
    /** 默认 none：未声明则没有选择机制，行也不报告 aria-selected。 */
    selectionMode?: TableSelectionMode
    /**
     * 需要的前缀列，按给定顺序插在最前面，默认不插入任何列。
     *
     * 它们由库插入并占用列号：不占用时右侧所有列的 aria-colindex 会整体错位，
     * 这正是使用者手工向 columns 中添加假列的原因。作者按 `api.columns` 渲染即可，
     * 每一项都声明 `kind`。
     */
    prefixColumns?: TableColumnKind[]
    /**
     * 列偏好。提供即受控：内部不自行修改，写入只发 onColumnPreferenceChange。
     * 持久化归使用者：库只负责把它计算进生效列。
     */
    columnPreference?: TableColumnPreference
    defaultColumnPreference?: TableColumnPreference
    /**
     * 当前页码与每页条数，只用于计算序号，不参与切片：切片归调用方
     * （或分页组件的 `api.slice`）。都未提供时序号回退为可见序。
     */
    page?: number
    pageSize?: number
    /** 数据加载中：root 报告 aria-busy，表体为空时加载态节点显示。 */
    loading?: boolean
    /** 显式声明表体为空；未提供时按 rows 是否为空推导。 */
    empty?: boolean
    /** 表头吸顶：只写 data-fixed（布尔），固定的实现归皮肤。列冻结使用 data-frozen，两者不同名。 */
    stickyHeader?: boolean
    /** 斑马纹：表体偶数行换一层浅底。 */
    striped?: boolean
    /** 形态：outline 画外框与圆角（默认），ghost 去掉外框只留行间横线，subtle 淡底。默认 outline。 */
    variant?: ControlVariant
    /** 列与列之间加竖分隔线，写为 root 上的 data-split。 */
    ruled?: boolean
    /** 表格带脚注行。行号空间的最后一行留给它，aria-rowcount 也把它计入。 */
    footer?: boolean
    /** 上下键到达首尾是否回绕，默认 false。 */
    loop?: boolean
    /** 文字方向，默认 ltr；只对调左右方向键的展开 / 收起语义。 */
    dir?: Direction
    /** 密度：sm / md / lg。只影响单元格的纵向内边距与字号，列宽算法不受影响。 */
    size?: Size
    translations?: Partial<TableTranslations>
    /**
     * 行可以拖动换位。整行都是拖动源；另有一个不占 Tab 位的拖动把手，
     * 触屏路径只经它（见 getRowDragTriggerProps）。
     */
    rowReorderable?: boolean
    onRowMove?: (details: TableRowMoveDetails) => void
    /**
     * 本次移动是否允许。收到的是折算后的落点。
     * 未提供时全部允许：落进自身后代与落在禁用行上两条由库自行拦截。
     */
    allowRowDrop?: (move: TableRowMoveDetails) => boolean
    onColumnPreferenceChange?: (details: TableColumnPreferenceChangeDetails) => void
    onSortChange?: (details: TableSortChangeDetails) => void
    onSelectionChange?: (details: TableSelectionChangeDetails) => void
    onExpandedValueChange?: (details: TableExpandedValueChangeDetails) => void
  }
  context: {
    /** 排序链，有序且按 id 去重。受控（sort 提供）时 cell 直读 prop。 */
    sort: TableSortDescriptor[]
    /** 选中集合，可能是裸 'all'。单选时长度 ≤ 1。 */
    selection: TableSelection
    /** 展开集合，恒为数组。 */
    expandedValue: string[]
    /** 焦点位于表体时的瞬态锚点，焦点离开即清空。 */
    focusedRow: string | null
    /**
     * 范围选的起点。与 focusedRow 是两个概念：那个跟随焦点、离场即清除，
     * 这个只在选中发生时移动，Shift 的范围从它计算。
     */
    selectionAnchor: string | null
    /**
     * 按住 Shift 之前的选中集。
     *
     * 每一次 Shift 都从它重新计算基线 ∪ 本段，而不是在上一次的结果上继续合并：
     * 只合并时连续按 Shift 只能把选区越拉越大，向回点击无法收回。
     * 任何非 Shift 的选中操作都会使它作废。
     */
    selectionBaseline: string[] | null
    /** 列偏好。受控（columnPreference 提供）时 cell 直读 prop。 */
    columnPreference: TableColumnPreference
    /** 正在拖动改宽的列；未拖动时为 null。 */
    resizingColumn: string | null
    /** 正在拖动换位的列；未拖动时为 null。 */
    draggingColumn: string | null
    /**
     * 正在拖动换位的行；未拖动时为 null。
     *
     * 按下不视为拖动：整行可拖动没有把手表明意图，需要移动够激活距离（笔与鼠标）
     * 或按满长按时长（触屏）才视为拖动，在此之前恒为 null。
     */
    draggingRow: string | null
    /** 行不可拖动的原因；可拖动时为 null。虚拟滚动那一条需要按下测量后才能确定。 */
    rowReorderBlocked: TableRowReorderReason | null
    /**
     * 当前的落点：松手即落在此处。指针不在任何可拖动列上时为 null，
     * 指示线随之消失：没有合法落点是一档真实状态，不应夹到最近的一端。
     */
    dropTarget: TableDropTarget | null
    /** 读屏播报文本。写入视觉隐藏的活动区域，不进入视觉版面。 */
    announcement: string
    /**
     * 按压通道：正被 Space / Enter 或触屏按住的那一个，按部件键记（见 TablePressedKey）；
     * 没有按住时为 null。抬起、失焦或指针取消即清空，加载中由机器自行松开。
     */
    pressed: TablePressedKey | null
  }
  computed: Record<string, never>
  refs: {
    /** 正在拖动的列：按下时的列宽与指针横坐标。 */
    resize: { columnId: string, startWidth: number, originX: number } | null
    /**
     * 正在拖动换位的列：按下时测得的可拖动列矩形与指针横坐标。
     *
     * 矩形是一次性快照，全程不重新测量：重新测量会使让位之后再判落点自激振荡。
     */
    columnDrag: {
      columnId: string
      rects: DragRect[]
      originX: number
      pointerId: number
      /** 拖动源节点。拖动中用它测量版面整体移动的距离，见 snapshotDrift。 */
      source: HTMLElement | null
    } | null
    /**
     * 正在拖动换位的行。activated 之前只是按住，还不是拖动：
     * 整行可拖动没有把手表明意图，需要移动够激活距离才视为拖动。
     */
    rowDrag: {
      rowId: string
      rects: DragRect[]
      originY: number
      pointerId: number
      activated: boolean
      /** 拖动源节点。拖动中用它测量版面整体移动的距离，见 snapshotDrift。 */
      source: HTMLElement | null
    } | null
  }
  /**
   * 排序、选中、展开与列偏好都不编码进状态：它们是随时可读可写的事实，不是过程。
   * 改列宽与换列位是过程：有始有终、进行中要跟随指针、收尾要发一次通知，各有自己的状态。
   *
   * 键盘换位不进入拖动态：按一次即一次已过守卫的完整提交，没有进行中的阶段。
   */
  state: 'idle' | 'resizing' | 'columnDragging' | 'rowDragging'
  event:
    /** 整体改写排序链（外部 setSort 经过它）。 */
    | { type: 'SORT.SET', value: TableSortDescriptor[] }
    /** 点击一次排序把手：append 为真表示追加到链尾而不是替换整条链。 */
    | { type: 'SORT.TOGGLE', value: string, append: boolean }
    /** 整体改写列偏好；value 缺席即清空，回到作者定义的原样。 */
    | { type: 'COLUMN_PREF.SET', value?: TableColumnPreference }
    /**
     * 按住改宽把手。宽度由连接层在按下时测量，状态机不涉及 DOM。
     * `snapshot` 是全部列当前的实际宽度：不把它们一起固定时，
     * 修改一列会使其余列重新分配剩余空间，表现为整排列宽错乱。
     */
    | { type: 'COLUMN_RESIZE.START', columnId: string, startWidth: number, originX: number, snapshot: Record<string, number> }
    | { type: 'COLUMN_RESIZE.MOVE', clientX: number }
    | { type: 'COLUMN_RESIZE.END' }
    | { type: 'COLUMN_RESIZE.CANCEL' }
    /** 键盘改宽：一次一步。 */
    | { type: 'COLUMN_RESIZE.STEP', columnId: string, delta: number }
    /** 按下拖拽把手：矩形快照与起点横坐标由连接层测量后传入。 */
    | { type: 'COLUMN_DRAG.START', columnId: string, rects: DragRect[], originX: number, pointerId: number, source: HTMLElement | null }
    | { type: 'COLUMN_DRAG.MOVE', clientX: number }
    | { type: 'COLUMN_DRAG.END' }
    | { type: 'COLUMN_DRAG.CANCEL' }
    /** 键盘换位：按一次即一次完整提交，不进入拖动态。 */
    | { type: 'COLUMN.MOVE_BY', columnId: string, target: DropTarget }
    /** 按在行上：矩形快照与起点纵坐标由连接层测量后传入。此时只是按住，不视为拖动。 */
    /**
     * 从专用的拖动把手开始：按下即拖动，不再等待激活距离。
     * 把手是不占 Tab 位的独立可触区域，意图无歧义，触屏路径也只经它。
     */
    | { type: 'ROW_DRAG.START', rowId: string, rects: DragRect[], originY: number, pointerId: number, activate?: boolean, source: HTMLElement | null }
    | { type: 'ROW_DRAG.MOVE', clientY: number }
    | { type: 'ROW_DRAG.END' }
    | { type: 'ROW_DRAG.CANCEL' }
    | { type: 'ROW.MOVE_BY', rowId: string, target: DropTarget }
    /**
     * 按下测量之后如实写回：不可拖动时附带原因，可拖动时写 null。
     *
     * 必须能写回 null：虚拟滚动那一条只有测量后才能确定，判定一次即锁定的话，
     * 宿主把整份渲染出来之后也无法恢复。
     */
    | { type: 'ROW.REORDER_BLOCKED', reason: TableRowReorderReason | null }
    /** 修改一列的显隐 / 位置 / 宽度 / 冻结。 */
    | { type: 'COLUMN_PREF.PATCH', columnId: string, hidden?: boolean, toIndex?: number, width?: number | string, sticky?: boolean | 'start' | 'end' }
    /** 整体改写选中集合。 */
    | { type: 'SELECTION.SET', value: TableSelection }
    /** 切换单行选中（单选替换、复选增删）。 */
    | { type: 'ROW.SELECT', value: string, extend?: boolean }
    /** 全选把手：已全选则清空，否则把当前可选行全部纳入。 */
    | { type: 'SELECTION.ALL_TOGGLE' }
    /** 整体改写展开集合。 */
    | { type: 'EXPANDED.SET', value: string[] }
    | { type: 'ROW.EXPAND', value: string }
    | { type: 'ROW.COLLAPSE', value: string }
    | { type: 'ROW.EXPAND_TOGGLE', value: string }
    | { type: 'ROW.FOCUS', value: string }
    /** 焦点离开表体，或持有焦点的行被移出 DOM（此时浏览器不派发 focusout，由适配器上报）。 */
    | { type: 'TABLE.BLUR' }
    /**
     * 某个可按部件被 Space / Enter 或触屏按住。disabled 是该部件自身的禁用事实（行禁用、列不可排序、
     * 全选无基数等），由 connect 判定后随事件带入。
     */
    | { type: 'PRESS.START', key: TablePressedKey, disabled?: boolean }
    /** 按住的部件抬起、失焦或指针取消；只松开键对应的那一个。 */
    | { type: 'PRESS.END', key: TablePressedKey }
  tag: never
  guard: 'canPress'
  action:
    | 'setColumnPreference'
    | 'patchColumnPreference'
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
    | 'startColumnResize'
    | 'trackColumnResize'
    | 'stepColumnWidth'
    | 'endColumnResize'
    | 'cancelColumnResize'
    | 'startColumnDrag'
    | 'trackColumnDrag'
    | 'endColumnDrag'
    | 'cancelColumnDrag'
    | 'moveColumnBy'
    | 'startRowDrag'
    | 'trackRowDrag'
    | 'endRowDrag'
    | 'cancelRowDrag'
    | 'moveRowBy'
    | 'blockRowReorder'
    | 'startPress'
    | 'endPress'
    | 'releaseWhenInert'
  effect: 'trackResizePointer' | 'trackColumnDragPointer' | 'trackRowDragPointer'
}

export interface TableApi<T extends PropTypes = PropTypes> {
  /**
   * 生效的列：前缀列在前、数据列在后，各自声明 kind。
   * 列号、渲染顺序都以它为准；不需要前缀列时它与作者提供的一致。
   */
  columns: readonly TableColumn[]
  /**
   * 可以拖动换位的列 id 段。声明了 `reorderable`、不是冻结列、且彼此相连。
   *
   * 冻结列与不可拖动的列是屏障，把可拖动范围切分为段；这里给出的是最长的一段。
   * 用它决定是否渲染把手，与库内部判定能否落下的口径是同一份。
   */
  draggableColumns: readonly string[]
  /**
   * 行不可拖动的原因，可拖动时为 null。声明了 rowReorderable 才可能非空。
   * 库不自行弹出提示：是否把原因显示给用户由使用者决定。
   */
  rowReorderDisabledReason: TableRowReorderReason | null
  /** 当前的落点；松手即落在此处。没有合法落点时为 null，指示线随之消失。 */
  dropTarget: TableDropTarget | null
  /** 读屏播报文本。渲染进 live-region，不进入视觉版面。 */
  announcement: string
  /** 作者提供的行定义。 */
  rows: readonly TableRowDef[]
  /** 展开展平后的可见行序列（详情行插在所属数据行之后）。 */
  visibleRows: readonly TableVisibleRow[]
  sort: TableSortDescriptor[]
  selection: TableSelection
  /** 全选把手的三态，只按可选行（未禁用）计算。 */
  selectionState: TableSelectionState
  selectionMode: TableSelectionMode
  expandedValue: string[]
  /** 焦点锚点；焦点不在表体中时为 null。 */
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
  /** 选中某一行。extend 为真时选中锚点到该行的范围（仅复选）。 */
  selectRow: (value: string, options?: { extend?: boolean }) => void
  toggleSelectAll: () => void
  setExpandedValue: (next: string[]) => void
  expandRow: (value: string) => void
  collapseRow: (value: string) => void
  toggleExpandRow: (value: string) => void
  getRootProps: () => T['element']
  getCaptionProps: () => T['element']
  /**
   * 工具条：搜索、筛选、密度与列设置这些作用于整张表的控件放置在此。
   *
   * 它是 root 的兄弟不是子节点：root 是 grid 系角色，子节点只能是 row 与 rowgroup。
   * 不提供 role：一条控件带是否需要 role=toolbar（连同该套方向键 roving）由作者决定，
   * 需要时向其中放置一个 Toolbar 组件。
   */
  getToolbarProps: () => T['element']
  /**
   * 列设置区：一列一行，行中放显隐把手、列名与作者自行编写的宽度 / 冻结 / 排序控件。
   * 渲染内容按 `columnSettings`。
   */
  getColumnListProps: () => T['element']
  /** 一列的显隐把手（复选形态）。最后一列显示时它为 aria-disabled。 */
  getColumnVisibilityTriggerProps: (props: TableColumnProps) => T['element']
  getHeaderProps: () => T['element']
  getBodyProps: () => T['element']
  getFooterProps: () => T['element']
  /** 表头行：恒占行号空间的第 1 行。 */
  getHeaderRowProps: () => T['element']
  /** 脚注行：占行号空间的最后一行。 */
  getFooterRowProps: () => T['element']
  /**
   * 该行显示的序号。平表是分页全局序号，树形是大纲编号。
   * 不显示序号列时仍可调用：它是纯计算，不依赖是否有该列。
   */
  rowNumber: (rowId: string) => string
  /** 当前的列偏好。原样交出即可存储。 */
  columnPreference: TableColumnPreference
  /**
   * 列设置区按它渲染：作者定义的列，按偏好排序，隐藏的也在其中。
   * 每条自带显隐、冻结、宽度与排序，足以渲染一整行设置项而不必回头比对两份数组。
   */
  columnSettings: readonly TableColumnSetting[]
  /** 隐藏 / 显示一列。 */
  setColumnHidden: (columnId: string, hidden: boolean) => void
  /** 修改一列的冻结档。false 为不冻结，true 等于 'start'。 */
  setColumnSticky: (columnId: string, sticky: boolean | 'start' | 'end') => void
  /** 把一列移到某个位次（只在作者定义的列之间计算，0 起算）。 */
  moveColumn: (columnId: string, toIndex: number) => void
  /** 修改一列的宽度。 */
  setColumnWidth: (columnId: string, width: number | string) => void
  /** 整份偏好替换；未提供时清空，回到作者定义的原样。 */
  setColumnPreference: (next?: TableColumnPreference) => void
  getRowProps: (props: TableRowProps) => T['element']
  getColumnHeaderProps: (props: TableColumnProps) => T['element']
  getCellProps: (props: TableCellProps) => T['element']
  getSelectAllTriggerProps: () => T['element']
  getRowSelectTriggerProps: (props: TableRowProps) => T['element']
  getSortTriggerProps: (props: TableColumnProps) => T['element']
  /** 列宽把手。只有 resizable 的列才渲染它。 */
  getColumnResizeTriggerProps: (props: TableColumnProps) => T['element']
  /** 列拖拽把手。只有 reorderable 的列才渲染它。 */
  getColumnDragTriggerProps: (props: TableColumnProps) => T['element']
  /**
   * 行拖动把手。触屏路径唯一的入口，不占 Tab 位。
   *
   * 常驻即可：rowReorderable 关闭或该表不可拖动时它声明 data-disabled、也不再让出滚动，
   * 渲染不会出错。按是否可拖动决定是否渲染，会使 DOM 结构随状态变化。
   */
  getRowDragTriggerProps: (props: TableRowProps) => T['element']
  getExpandTriggerProps: (props: TableRowProps) => T['element']
  getExpandedRowProps: (props: TableRowProps) => T['element']
  getEmptyProps: () => T['element']
  getLoadingProps: () => T['element']
  /**
   * 取下一页的入口：是否还有下一页、点击后的行为都由作者决定，
   * 连接层只保证取数在途期间不可点击。
   */
  getLoadMoreTriggerProps: () => T['element']
  /**
   * 拖动过程的读屏播报区。视觉隐藏，文本取自 `announcement`。
   * 它必须在拖动开始之前就在 DOM 上：读屏不播报后插入的节点。
   */
  getLiveRegionProps: () => T['element']
}

/** 读屏文案，默认英文。列拖拽的播报文案从共用的一份并入。 */
export interface TableTranslations extends Partial<DragTranslations> {
  /** 列宽把手的名字。表头文字是列名，把手自身需要说明用途。 */
  columnResize: (columnLabel: string) => string
  /** 列拖拽把手的名字。同一个列头中有两个把手，两个都需要说明各自的身份。 */
  columnDrag: (columnLabel: string) => string
  /**
   * 全选把手的名字。它是默认为空的角色节点，行内的把手又是 aria-hidden 的，
   * 这里是整张表的选择功能对读屏唯一的入口，因此该文案总会发出。
   */
  selectAll: string
  /** 工具条的名字。它是 root 之外的一块区域，没有名字时只是页面上一组散落的按钮。 */
  toolbar: string
  /** 列设置区的名字。 */
  columnList: string
  /** 一列的显隐把手的名字。把手自身默认没有内容，名字是它对读屏唯一的自述。 */
  columnVisibility: (columnLabel: string) => string
}

/** 列拖拽的落点：落在哪一列的哪一侧。 */
export type TableDropTarget = DropTarget
