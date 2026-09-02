import type { Direction, PropTypes, Size } from '@xihan-ui/kernel'
import type { MachineSchema } from '@xihan-ui/machine'
import type { DragRect, DragTranslations, DropTarget } from '../shared/drag'

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
export type TableSelectionState = 'unchecked' | 'indeterminate' | 'checked'

/**
 * 列定义。列号（aria-colindex）与列总数（aria-colcount）的唯一事实源，不从 DOM 反推。
 * 选择列、展开列这类只有把手的列也必须在此声明一条，否则右侧所有列的列号串位。
 */
/**
 * 一列是干什么的。data 是作者定义的数据列，其余三种由库按需插在最前面。
 *
 * 它们必须占列号空间：不占的话右侧所有列的 aria-colindex 会整体串位，
 * 而这正是使用者手工往 columns 里塞假列的原因。
 */
export type TableColumnKind = 'index' | 'select' | 'expand' | 'data'

/**
 * 列偏好：一份可序列化的状态，说的是「这张表这次要怎么显示列」。
 *
 * 库只负责把它算进生效列，**存到哪儿归使用者**——存 localStorage、存后端、
 * 跟着用户设置同步，都是应用的事，把存储通道焊进组件库只会让它绑死一种后端。
 *
 * 只作用于作者定义的那些列；前缀列是结构性的，由 `prefixColumns` 说了算。
 */
export interface TableColumnPreference {
  /**
   * 列序。列在这里的按此顺序排在前面，没列到的按原顺序跟在后面——
   * 只想把某一列挪到最前时不必把全表列一遍。
   */
  order?: string[]
  /** 藏起来的列。藏掉的列整个不进网格，列号也跟着重排（隐藏列不占列号）。 */
  hidden?: string[]
  /** 列宽覆盖，按列 id 取，盖过 `TableColumnDef.width`。 */
  widths?: Record<string, number | string>
  /** 冻结覆盖，盖过 `TableColumnDef.sticky`。 */
  sticky?: Record<string, boolean | 'start' | 'end'>
}

export interface TableColumnPreferenceChangeDetails {
  value: TableColumnPreference
}

/** 生效的列：作者定义的那些，加上库插在最前面的前缀列。 */
export interface TableColumn extends TableColumnDef {
  kind: TableColumnKind
}

export interface TableColumnDef {
  /** 全表唯一：既是 DOM 身份（data-value），也是排序链与列号索引的键。 */
  id: string
  /** 展示名。只供调用方渲染，不作为可及名字。 */
  label?: string
  /** 可排序：给了才产出 aria-sort，排序把手也才认按键与点击。 */
  sortable?: boolean
  /**
   * 横向冻结（左右滚动时这一列钉住），落成条目上的 data-frozen。true 等于 'start'（钉在行首侧），'end' 钉在行尾侧。
   * 与表头吸顶的 data-sticky 是两件事：那个是布尔，这个带方向，同名会让 [data-sticky] 一条选择器命中两种语义。
   * 同侧有多列吸附时，连接层按前面各列的数字列宽累加出偏移，写进 --xh-table-sticky-inset；
   * 有一列宽度不是数字就算不出来，那一侧从这列起都退回贴边。
   */
  sticky?: boolean | 'start' | 'end'
  /** 列宽。数字按 px 处理，字符串原样写进内联 inline-size。 */
  width?: string | number
  /** 拖动改列宽时的下限（px）。不给用 TABLE_COLUMN_MIN_WIDTH。 */
  minWidth?: number
  /** 拖动改列宽时的上限（px）。不给即不封顶。 */
  maxWidth?: number
  /** 这一列的宽度可以拖着改。给了才产出改宽把手。 */
  resizable?: boolean
  /**
   * 这一列可以拖着换位。给了才产出拖拽把手——每个把手都是一个 Tab 位，
   * 不声明的表格不白担这份代价。
   *
   * 不可拖的列与冻结列一样是屏障：跨过它去落会把它挤走，而作者说过这一列不动。
   */
  reorderable?: boolean
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
  /**
   * 父行 id。给了它这一行就是那一行的子行，收起父行时它跟着藏起来。
   *
   * 有子行的行**不再产出详情行**：一行不可能同时既展开出子行、又展开出一块详情。
   * 指向不存在的父行时按根行处理，不吞掉这一行。
   */
  parentId?: string
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
  /** 父行 id；根行为 null。指向不存在的行时按根行算，与摊平的口径一致。 */
  parentId: string | null
  /** 层级，1 起算，直接落 aria-level。平表恒为 1。 */
  level: number
  /** 同层内序号，1 起算，直接落 aria-posinset。 */
  posInSet: number
  /** 同层总数，直接落 aria-setsize。 */
  setSize: number
  /**
   * 大纲编号，如 `1.2.3`。
   *
   * 取的是「在父的 children 里的下标」而不是可见序：收起某一枝时，
   * 仍在场的行编号一个都不变。取可见序的话收起一枝，其后所有行的号会整体前移。
   */
  outline: string
}

/**
 * 行拖不动的原因，null 表示能拖。
 *
 * 三条都是「拖了也没意义」而不是「拖了会崩」：
 * - `sorted`：排序链非空时顺序由排序键决定，拖出来的新序下一帧就被覆盖；
 * - `virtualized`：只渲窗口内那一段时，窗口外的行不在 DOM 里，落点算不出来。
 */
export type TableRowReorderReason = 'sorted' | 'virtualized'

export interface TableRowMoveDetails {
  /** 被搬的那一行。 */
  id: string
  /**
   * 新的父行 id；根层为 null。
   *
   * 表格的树是**带 parentId 的扁平数组**：结构由 parentId 定，同层次序由数组先后定。
   * 所以写回要两件事——按 ids 重排，再把这一行的 parentId 设成这个值。
   * 平表下它恒为 null。
   */
  parent: string | null
  /** 在新那一层的第几位，0 起算。已经算过「先摘后插」的修正。 */
  index: number
  /** 已经重排好的整份行序，可直接拿去写回数据源。 */
  ids: string[]
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
    /**
     * 要哪几列前缀列，按给定顺序插在最前面，默认一列都不插。
     *
     * 它们由库插入并**占住列号**——不占的话右侧所有列的 aria-colindex 会整体串位，
     * 而这正是使用者手工往 columns 里塞假列的原因。作者照 `api.columns` 渲染即可，
     * 每一项都自报 `kind`。
     */
    prefixColumns?: TableColumnKind[]
    /**
     * 列偏好。给定即受控：内部不自改，写只发 onColumnPreferenceChange。
     * 持久化归使用者——库只负责把它算进生效列。
     */
    columnPreference?: TableColumnPreference
    defaultColumnPreference?: TableColumnPreference
    /**
     * 当前页码与每页条数，只用来算序号，不参与切片——切片归调用方
     * （或分页组件的 `api.slice`）。都不给时序号退回可见序。
     */
    page?: number
    pageSize?: number
    /** 数据在路上：root 报 aria-busy，表体为空时加载态节点显形。 */
    loading?: boolean
    /** 显式声明表体为空；缺省按 rows 是否为空推导。 */
    empty?: boolean
    /** 表头吸顶：只落 data-sticky（布尔），钉住的实现归皮肤。列冻结走 data-frozen，两者不同名。 */
    stickyHeader?: boolean
    /** 斑马纹：表体偶数行换一层浅底。 */
    striped?: boolean
    /** 去掉外框，只留行间横线。 */
    borderless?: boolean
    /** 列与列之间加竖分隔线。 */
    ruled?: boolean
    /** 表格带脚注行。行号空间的最后一行留给它，aria-rowcount 也把它算进去。 */
    footer?: boolean
    /** 上下键走到首尾是否回绕，默认 false。 */
    loop?: boolean
    /** 文字方向，默认 ltr；只对调左右方向键的「展开/收起」语义。 */
    dir?: Direction
    /** 密度：sm / md / lg。只换单元格的纵向内边距与字号，列宽算法不受影响。 */
    size?: Size
    translations?: Partial<TableTranslations>
    /**
     * 行可以拖着换位。整行都是拖动源；另有一个不占 Tab 位的拖动把手，
     * 触屏那一路只走它（见 getRowDragTriggerProps）。
     */
    rowReorderable?: boolean
    onRowMove?: (details: TableRowMoveDetails) => void
    /**
     * 这一次搬家许不许。收到的是折算好的落点。
     * 不给即都许——「落进自己的后代」与「落在禁用行上」两条库自己会拦。
     */
    allowRowDrop?: (move: TableRowMoveDetails) => boolean
    onColumnPreferenceChange?: (details: TableColumnPreferenceChangeDetails) => void
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
    /**
     * 范围选的起点。与 focusedRow 是两回事：那个跟着焦点跑、离场即清，
     * 这个只在选中发生时挪，Shift 那一段从它算起。
     */
    selectionAnchor: string | null
    /**
     * 按住 Shift 之前的那份选中集。
     *
     * 每一下 Shift 都从它重算「基线 ∪ 这一段」，而不是在上一次的结果上继续并——
     * 只并的话连着按 Shift 就只能把选区越拉越大，往回点收不回来。
     * 任何非 Shift 的选中操作都会把它作废。
     */
    selectionBaseline: string[] | null
    /** 列偏好。受控（columnPreference 给定）时 cell 直读 prop。 */
    columnPreference: TableColumnPreference
    /** 正在拖着改宽的那一列；没在拖是 null。 */
    resizingColumn: string | null
    /** 正在拖着换位的那一列；没在拖是 null。 */
    draggingColumn: string | null
    /**
     * 正在拖着换位的那一行；没在拖是 null。
     *
     * 按下还不算拖：整行可拖没有把手表明意图，要走够激活距离（笔与鼠标）
     * 或按满长按时长（触屏）才算，在那之前这里恒是 null。
     */
    draggingRow: string | null
    /** 行拖不动的原因；能拖时是 null。虚拟滚动那一条要按下量过才知道。 */
    rowReorderBlocked: TableRowReorderReason | null
    /**
     * 此刻的落点：松手就落在这儿。指针不在任何可拖列上时是 null，
     * 指示线跟着消失——「没有合法落点」是一档真实状态，不该夹到最近的一端。
     */
    dropTarget: TableDropTarget | null
    /** 读屏播报文本。写进视觉隐藏的活动区域，不进视觉版面。 */
    announcement: string
  }
  computed: Record<string, never>
  refs: {
    /** 正在拖的那一列：按下那一刻的列宽与指针横坐标。 */
    resize: { columnId: string, startWidth: number, originX: number } | null
    /**
     * 正在拖着换位的那一列：按下那一刻量到的可拖列矩形与指针横坐标。
     *
     * 矩形是一次性快照，全程不重量——重量会让「让位之后再判落点」自激振荡。
     */
    columnDrag: {
      columnId: string
      rects: DragRect[]
      originX: number
      pointerId: number
      /** 拖动源节点。拖动中拿它量版面整体挪了多远，见 snapshotDrift。 */
      source: HTMLElement | null
    } | null
    /**
     * 正在拖着换位的那一行。activated 之前只是「按住了」，还不是拖动——
     * 整行可拖没有把手表明意图，要走够激活距离才算。
     */
    rowDrag: {
      rowId: string
      rects: DragRect[]
      originY: number
      pointerId: number
      activated: boolean
      /** 拖动源节点。拖动中拿它量版面整体挪了多远，见 snapshotDrift。 */
      source: HTMLElement | null
    } | null
  }
  /**
   * 排序、选中、展开与列偏好都不编码进状态——它们是随时可读可写的事实，不是过程。
   * 改列宽与换列位是过程：有始有终、进行中要跟指针、收尾要发一次通知，各有自己的状态。
   *
   * 键盘换位不进拖动态：按一下就是一次已过守卫的完整提交，没有「进行中」这回事。
   */
  state: 'idle' | 'resizing' | 'columnDragging' | 'rowDragging'
  event:
    /** 整体改写排序链（外部 setSort 走它）。 */
    | { type: 'SORT.SET', value: TableSortDescriptor[] }
    /** 点一次排序把手：append 为真表示追加到链尾而不是替换整条链。 */
    | { type: 'SORT.TOGGLE', value: string, append: boolean }
    /** 整体改写列偏好；value 缺席即清空，回到作者定义的原样。 */
    | { type: 'COLUMN_PREF.SET', value?: TableColumnPreference }
    /**
     * 按住改宽把手。宽度由连接层在按下那一刻量出来，机器不碰 DOM。
     * `snapshot` 是**全部列**此刻的实际宽度：不把它们一起钉住的话，
     * 改一列会让其余列重新分配剩余空间，看起来像整排列宽都乱了。
     */
    | { type: 'COLUMN_RESIZE.START', columnId: string, startWidth: number, originX: number, snapshot: Record<string, number> }
    | { type: 'COLUMN_RESIZE.MOVE', clientX: number }
    | { type: 'COLUMN_RESIZE.END' }
    | { type: 'COLUMN_RESIZE.CANCEL' }
    /** 键盘改宽：一次一步。 */
    | { type: 'COLUMN_RESIZE.STEP', columnId: string, delta: number }
    /** 按下拖拽把手：矩形快照与起点横坐标由连接层量好交进来。 */
    | { type: 'COLUMN_DRAG.START', columnId: string, rects: DragRect[], originX: number, pointerId: number, source: HTMLElement | null }
    | { type: 'COLUMN_DRAG.MOVE', clientX: number }
    | { type: 'COLUMN_DRAG.END' }
    | { type: 'COLUMN_DRAG.CANCEL' }
    /** 键盘换位：一按就是一次完整提交，不进拖动态。 */
    | { type: 'COLUMN.MOVE_BY', columnId: string, target: DropTarget }
    /** 按在行上：矩形快照与起点纵坐标由连接层量好交进来。此刻只是按住，还不算拖。 */
    /**
     * 从专门的拖动把手起手：按下即拖，不再等激活距离。
     * 把手是不占 Tab 位的独立可触区域，意图无歧义，触屏那一路也只走它。
     */
    | { type: 'ROW_DRAG.START', rowId: string, rects: DragRect[], originY: number, pointerId: number, activate?: boolean, source: HTMLElement | null }
    | { type: 'ROW_DRAG.MOVE', clientY: number }
    | { type: 'ROW_DRAG.END' }
    | { type: 'ROW_DRAG.CANCEL' }
    | { type: 'ROW.MOVE_BY', rowId: string, target: DropTarget }
    /**
     * 按下量过之后如实写回：拖不动就带原因，能拖就写 null。
     *
     * 必须能写回 null——虚拟滚动那一条只有量过才知道，判过一次就锁死的话，
     * 宿主把整份渲出来之后再也恢复不了。
     */
    | { type: 'ROW.REORDER_BLOCKED', reason: TableRowReorderReason | null }
    /** 改一列的显隐 / 位置 / 宽。 */
    | { type: 'COLUMN_PREF.PATCH', columnId: string, hidden?: boolean, toIndex?: number, width?: number | string }
    /** 整体改写选中集合。 */
    | { type: 'SELECTION.SET', value: TableSelection }
    /** 切换单行选中（单选替换、复选增删）。 */
    | { type: 'ROW.SELECT', value: string, extend?: boolean }
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
  effect: 'trackResizePointer' | 'trackColumnDragPointer' | 'trackRowDragPointer'
}

export interface TableApi<T extends PropTypes = PropTypes> {
  /**
   * 生效的列：前缀列在前、数据列在后，各自自报 kind。
   * 列号、渲染顺序都以它为准；不要前缀列时它与作者给的那份一模一样。
   */
  columns: readonly TableColumn[]
  /**
   * 可以拖着换位的那一段列 id。声明了 `reorderable`、不是冻结列、且彼此相连。
   *
   * 冻结列与不可拖的列是屏障，把可拖范围切成段；这里给的是最长的那一段。
   * 拿它决定渲不渲把手，与库内部判「能不能落」的口径是同一份。
   */
  draggableColumns: readonly string[]
  /**
   * 行拖不动的原因，能拖时是 null。声明了 rowReorderable 才可能非空。
   * 库不自己弹提示——要不要把原因显示给用户是使用者的事。
   */
  rowReorderDisabledReason: TableRowReorderReason | null
  /** 此刻的落点；松手就落在这儿。没有合法落点时是 null，指示线跟着消失。 */
  dropTarget: TableDropTarget | null
  /** 读屏播报文本。渲进 live-region，不进视觉版面。 */
  announcement: string
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
  /** 选中某一行。extend 为真时选中锚点到这一行那一段（仅复选）。 */
  selectRow: (value: string, options?: { extend?: boolean }) => void
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
  /**
   * 这一行显示什么序号。平表是分页全局序号，树形是大纲编号。
   * 不出序号列时仍可调用——它是纯计算，不看要不要那一列。
   */
  rowNumber: (rowId: string) => string
  /** 当下的列偏好。原样交出去即可存盘。 */
  columnPreference: TableColumnPreference
  /** 藏起 / 放出一列。 */
  setColumnHidden: (columnId: string, hidden: boolean) => void
  /** 把一列挪到第几位（只在作者定义的那些列之间算，0 起算）。 */
  moveColumn: (columnId: string, toIndex: number) => void
  /** 改一列的宽。 */
  setColumnWidth: (columnId: string, width: number | string) => void
  /** 整份偏好换掉；不给即清空，回到作者定义的原样。 */
  setColumnPreference: (next?: TableColumnPreference) => void
  getRowProps: (props: TableRowProps) => T['element']
  getColumnHeaderProps: (props: TableColumnProps) => T['element']
  getCellProps: (props: TableCellProps) => T['element']
  getSelectAllTriggerProps: () => T['element']
  getRowSelectTriggerProps: (props: TableRowProps) => T['element']
  getSortTriggerProps: (props: TableColumnProps) => T['element']
  /** 列宽把手。只有 resizable 的列才渲它。 */
  getColumnResizeTriggerProps: (props: TableColumnProps) => T['element']
  /** 列拖拽把手。只有 reorderable 的列才渲它。 */
  getColumnDragTriggerProps: (props: TableColumnProps) => T['element']
  /**
   * 行拖动把手。触屏那一路唯一的入口，不占 Tab 位。
   *
   * 常挂即可：rowReorderable 关着或这张表拖不动时它自报 data-disabled、也不再让出滚动，
   * 渲了不会错。按拖不拖得动来决定渲不渲，会让 DOM 结构随状态变。
   */
  getRowDragTriggerProps: (props: TableRowProps) => T['element']
  getExpandTriggerProps: (props: TableRowProps) => T['element']
  getExpandedRowProps: (props: TableRowProps) => T['element']
  getEmptyProps: () => T['element']
  getLoadingStateProps: () => T['element']
  /**
   * 拖动过程的读屏播报区。视觉隐藏，文本从 `announcement` 取。
   * 它必须在拖动开始之前就在 DOM 上——读屏不播报后插入的节点。
   */
  getLiveRegionProps: () => T['element']
}

/** 读屏用的文案，默认英文。列拖拽那几句播报从共用的一份并进来。 */
export interface TableTranslations extends Partial<DragTranslations> {
  /** 列宽把手的名字。表头文字是列名，把手自己得说清它是干什么的。 */
  columnResize: (columnLabel: string) => string
  /** 列拖拽把手的名字。同一个列头里有两个把手，两个都得说清自己是谁。 */
  columnDrag: (columnLabel: string) => string
  /**
   * 全选把手的名字。它是个默认为空的角色节点，行内那颗把手又是 aria-hidden 的，
   * 这里是整张表的选择功能对读屏唯一的入口，所以这一句总会发出去。
   */
  selectAll: string
}

/** 列拖拽的落点：落在哪一列的哪一侧。 */
export type TableDropTarget = DropTarget
