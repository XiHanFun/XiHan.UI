import type { NavIntent, NormalizeProps, PropTypes, Service } from '@xihan-ui/core'
import type { MeasuredRow } from './table.drag'
import type { TableApi, TableColumn, TableColumnDef, TableSchema, TableVisibleRow } from './table.types'
import {
  contains,
  dataAttr,
  focusItem,
  isComposingEvent,
  isItemDisabled,
  ITEM_VALUE_ATTR,
  itemValue,
  navigateItems,
  navIntentFromKey,
  queryItems,
  warn,
} from '@xihan-ui/core'
import { flatMoveIntentFromKey } from '../shared/drag'
import { isEditableTarget } from '../shared/editable-target'
import { VISUALLY_HIDDEN_STYLE } from '../shared/visually-hidden'
import { tableAnatomy, tableRowQuery } from './table.anatomy'
import { resolveTableColumns } from './table.columns'
import { columnDragRects, columnMoveCommand, columnMoveIntentFromKey, draggableColumnIds, rowGroupRects, rowReorderReason, tableRowMoveCommand, treeRowIntentFromKey } from './table.drag'
import { TABLE_COLUMN_LARGE_STEP, TABLE_COLUMN_MIN_WIDTH, TABLE_COLUMN_STEP, tableSelectionMode } from './table.machine'
import {
  flattenTableRows,
  tableRowSelected,
  tableSelectableRowIds,
  tableSelectionState,
} from './table.rows'
import { tableSortDirectionOf, tableSortIndexOf } from './table.sort'

const parts = tableAnatomy.build()

/** 表头恒占行号空间的第 1 行，数据行因此从第 2 行起算。 */
const HEADER_ROW_COUNT = 1

/** 列宽：数字按 px，字符串原样交给 CSS。 */
function columnSize(width: string | number | undefined): string | undefined {
  if (width == null)
    return undefined
  return typeof width === 'number' ? `${width}px` : width
}

/**
 * 列宽的内联样式。
 *
 * 单元格默认是 `flex: 1 1 auto`，只给一列写死宽度会让其余列重新分配剩余空间——
 * 拖一列、整排跟着动。因此**被用户改过的列要钉死**：flex 不再参与分配，
 * 那一列就只听内联宽度的。
 *
 * 只钉偏好里的列。作者在 `columns` 里写的 `width` 保持原样可伸缩，既有表格不受影响。
 */
function columnSizeStyle(width: string | number | undefined, pinned: boolean): Record<string, unknown> {
  const size = columnSize(width)
  if (!size)
    return {}
  return pinned ? { inlineSize: size, flexGrow: 0, flexShrink: 0 } : { inlineSize: size }
}

/**
 * 量出这一行里全部列此刻的宽度。
 *
 * 从表头格往上找到它所在的那一行再往下查，而不是从 root 查：详情行与脚注行里也有格子，
 * 以行为界才只拿到列标题这一排。
 */
function measureColumns(header: HTMLElement): Record<string, number> {
  const row = header.closest<HTMLElement>('[data-scope="table"][data-part="row"]') ?? header.parentElement
  const out: Record<string, number> = {}
  if (!row)
    return out
  for (const el of row.querySelectorAll<HTMLElement>('[data-scope="table"][data-part="column-header"]')) {
    const id = el.getAttribute(ITEM_VALUE_ATTR)
    if (id)
      out[id] = el.getBoundingClientRect().width
  }
  return out
}

/**
 * 量出可见行此刻的纵向位置。事件处理器里碰 DOM 是允许的，渲染期才不许。
 *
 * 数据行与详情行一起量，并块归 rowGroupRects：不并的话拖过展开着的行时落点会来回跳。
 * 收起的详情行带 data-state=closed，跳过——它不占版面，量出来是一条零高的假行。
 */
function measureRowGroups(body: HTMLElement): MeasuredRow[] {
  const out: MeasuredRow[] = []
  for (const node of body.querySelectorAll<HTMLElement>(
    '[data-scope="table"][data-part="row"],[data-scope="table"][data-part="expanded-row"]',
  )) {
    // 只认直接归这个表体的行：详情行里可以嵌另一张完整的表，
    // 把它的行也量进来会让行数对不上，整张外层表被误判成「只渲了一段」
    if (node.parentElement?.closest('[data-scope="table"][data-part="body"]') !== body)
      continue
    // 收起的那一枝连同里面的一切都不占版面。查祖先而不是只看自己：
    // 收起态落在详情行上时，写在它里面的行自己并不带这个状态。
    // 作者自己给行加的 hidden 一并跳过
    if (node.closest('[hidden]') || node.closest('[data-scope="table"][data-part="expanded-row"][data-state="closed"]'))
      continue
    const rect = node.getBoundingClientRect()
    out.push({
      value: node.getAttribute(ITEM_VALUE_ATTR) ?? '',
      kind: node.getAttribute('data-part') === 'row' ? 'data' : 'expanded',
      start: rect.top,
      size: rect.height,
    })
  }
  return out
}

/** 这一列眼下的 px 宽度。偏好里的覆盖优先，两者都不是数字就返回 null。 */
function columnNumericWidth(
  override: string | number | undefined,
  defWidth: string | number | undefined,
): number | null {
  const raw = override ?? defWidth
  return typeof raw === 'number' && Number.isFinite(raw) ? raw : null
}

/** 改宽把手上的方向键：往行尾侧推是加宽。rtl 下左右两键对调，语义恒是「加宽 / 收窄」。 */
function resizeStepFromKey(key: string, rtl: boolean): number | null {
  if (key === 'ArrowRight')
    return rtl ? -1 : 1
  if (key === 'ArrowLeft')
    return rtl ? 1 : -1
  return null
}

export function connectTable<T extends PropTypes>(
  service: Service<TableSchema>,
  normalize: NormalizeProps<T>,
): TableApi<T> {
  const { context, prop, send, scope } = service
  const authorColumns = prop('columns') ?? []
  const rows = prop('rows') ?? []
  // 前缀列插在最前面并占住列号：不占的话右侧所有列的 aria-colindex 会整体串位。
  // 数据列按列偏好排过序、藏过、覆盖过宽与冻结
  const columnPreference = context.get('columnPreference')
  const columns: TableColumn[] = resolveTableColumns(
    authorColumns,
    prop('prefixColumns') ?? [],
    columnPreference,
  )
  const sort = context.get('sort')
  const selection = context.get('selection')
  const expandedValue = context.get('expandedValue')
  const focusedRow = context.get('focusedRow')
  const mode = tableSelectionMode(prop('selectionMode'))
  const loading = !!prop('loading')
  const stickyHeader = !!prop('stickyHeader')
  const hasFooter = !!prop('footer')
  const dir = prop('dir') ?? 'ltr'
  const translations = prop('translations')
  const numericWidth = (id: string, def: TableColumnDef | undefined): number | null =>
    columnNumericWidth(context.get('columnPreference').widths?.[id], def?.width)
  /** 这一列的宽度是不是用户改出来的。 */
  const hasWidthOverride = (id: string): boolean => context.get('columnPreference').widths?.[id] != null
  const label = {
    columnResize: translations?.columnResize ?? ((columnLabel: string) => `Resize column ${columnLabel}`),
    columnDrag: translations?.columnDrag ?? ((columnLabel: string) => `Reorder column ${columnLabel}`),
    selectAll: translations?.selectAll ?? 'Select all rows',
  }
  // 可拖的那一段列。谁能拖、落点算在谁身上、键盘能挪到哪儿，三处同一份口径
  const draggableColumns = draggableColumnIds(columns)
  const draggingColumn = context.get('draggingColumn')
  const dropTarget = context.get('dropTarget')
  /** 这一列此刻是不是落点，是的话落在它的哪一侧。 */
  const dropSide = (id: string): 'before' | 'after' | undefined =>
    draggingColumn != null && dropTarget?.targetValue === id && dropTarget.position !== 'inside'
      ? dropTarget.position
      : undefined
  // 表格不回绕：上键停在首行、下键停在末行
  const loop = prop('loop') ?? false
  const ids = scope.ids('table', 'caption')

  // 有 parentId 即树形：子行与详情行是两套互斥的展开语义
  const nested = rows.some(row => row.parentId != null)

  // 摊平与索引都是 (rows, 展开集合) 的纯函数；connect 在 Vue 的 render 期求值，此时 DOM 尚不存在。
  const visibleRows = flattenTableRows(rows, expandedValue)
  const dataRows = visibleRows.filter(row => row.kind === 'data')
  const metaIndex = new Map<string, TableVisibleRow>()
  // 行号：表头占了第 1 行，可见序往后顺推。数据行与它的详情行共用 id，分开两张表存
  const dataRowIndex = new Map<string, number>()
  const detailRowIndex = new Map<string, number>()
  for (const row of visibleRows) {
    const index = HEADER_ROW_COUNT + row.index + 1
    if (row.kind === 'data') {
      metaIndex.set(row.id, row)
      dataRowIndex.set(row.id, index)
    }
    else {
      detailRowIndex.set(row.id, index)
    }
  }

  // 行能展开出另一行，这正是 treegrid 与 grid 的分界；一行都展不开的表格是平的，仍报 grid。
  // 子行与详情行都算「展得开」
  const hierarchical = rows.some(row => row.expandable) || nested
  // 层级序号：数据行都是第一层，序号按可见的数据行排
  const rowPosition = new Map<string, number>()
  dataRows.forEach((row, i) => rowPosition.set(row.id, i + 1))
  // 树形的大纲编号（1 / 1.1 / 1.2）。平表不填，序号走分页全局序号那一支——
  // 平表的「第几条」应当跨页连续，而大纲编号是页内的层级位置，两者不是一回事
  const rowOutline = new Map<string, string>()
  if (nested) {
    for (const row of dataRows)
      rowOutline.set(row.id, row.outline)
  }
  const rowSetSize = dataRows.length

  const rowReorderable = !!prop('rowReorderable')
  const draggingRow = context.get('draggingRow')
  /**
   * 行拖不动的原因。排序与树形在渲染期就知道；虚拟滚动要按下量过才知道，
   * 那一条由机器在按下失败时记下来。
   */
  const rowBlocked = rowReorderable
    // 判据是 nested（有行声明了 parentId）而不是 hierarchical——后者把「有可展开的行」
    // 也算进去了，而展开出的详情行是跟着数据行一起搬的，不妨碍换位
    // cell 初值是 undefined，这里连同收成 null：api 上写的是 | null
    ? (rowReorderReason(sort.length) ?? context.get('rowReorderBlocked') ?? null)
    : null
  /**
   * 这一行此刻是不是落点，落在它的哪一档。
   * 前后两档是插到这一行的上下沿，inside 是落进这一行里面、认它当父。
   */
  const rowDropSide = (id: string): 'before' | 'after' | 'inside' | undefined =>
    draggingRow != null && dropTarget?.targetValue === id ? dropTarget.position : undefined

  const columnIndex = new Map<string, number>()
  const columnIndexDefs = new Map<string, TableColumnDef>()
  columns.forEach((column, i) => {
    // 列 id 重复时以先出现的为准，取列号是确定的
    if (columnIndexDefs.has(column.id))
      return
    columnIndexDefs.set(column.id, column)
    columnIndex.set(column.id, i + 1)
  })

  /**
   * 这一行显示什么序号。
   *
   * 平表用分页全局序号，翻到第二页不会又从 1 开始；page / pageSize 都不给时
   * 退回可见序。树形的大纲编号另行接管（见 rowOutline）。
   */
  const pageNo = Math.max(1, Math.trunc(prop('page') ?? 1))
  const perPage = Math.max(0, Math.trunc(prop('pageSize') ?? 0))
  const rowNumber = (rowId: string): string => {
    const outline = rowOutline.get(rowId)
    if (outline)
      return outline
    const seq = rowPosition.get(rowId)
    if (seq == null)
      return ''
    return String((pageNo - 1) * perPage + seq)
  }

  const selectableIds = tableSelectableRowIds(rows)
  const selectionState = tableSelectionState(selection, selectableIds)
  // 全选把手只在复选下生效
  const canSelectAll = mode === 'multiple'
  const isEmpty = prop('empty') ?? dataRows.length === 0
  // 两个状态节点常挂且互斥，只在表体为空时显形
  const showLoading = loading && isEmpty
  const showEmpty = !loading && isEmpty
  const rowCount = HEADER_ROW_COUNT + visibleRows.length + (hasFooter ? 1 : 0)

  const metaOf = (value: string): TableVisibleRow | undefined => metaIndex.get(value)
  const columnOf = (value: string): TableColumnDef | undefined => columnIndexDefs.get(value)

  // 吸附列：同侧多列时按数字列宽累加偏移。行首侧从左往右加、行尾侧从右往左加；
  // 碰到宽度不是数字的列就算不下去，那一侧从这列起都退回贴边（偏移留空，皮肤按 0 处理）
  const stickySideOf = (def: TableColumnDef | undefined): 'start' | 'end' | undefined =>
    def?.sticky === true ? 'start' : def?.sticky === 'start' || def?.sticky === 'end' ? def.sticky : undefined
  const stickyInset = new Map<string, number>()
  {
    let acc: number | null = 0
    for (const def of columns) {
      if (stickySideOf(def) !== 'start')
        continue
      if (acc != null)
        stickyInset.set(def.id, acc)
      acc = acc != null && typeof def.width === 'number' ? acc + def.width : null
    }
    acc = 0
    for (let i = columns.length - 1; i >= 0; i--) {
      const def = columns[i]!
      if (stickySideOf(def) !== 'end')
        continue
      if (acc != null)
        stickyInset.set(def.id, acc)
      acc = acc != null && typeof def.width === 'number' ? acc + def.width : null
    }
  }
  const stickyAttrs = (def: TableColumnDef | undefined): Record<string, unknown> => {
    const side = stickySideOf(def)
    if (!side)
      return { 'data-frozen': undefined }
    const inset = def ? stickyInset.get(def.id) : undefined
    return {
      'data-frozen': side,
      ...(inset != null && inset > 0 ? { style: { '--xh-table-sticky-inset': `${inset}px` } } : {}),
    }
  }
  const isSelected = (value: string): boolean => tableRowSelected(selection, value)
  const isExpanded = (value: string): boolean => !!metaOf(value)?.expanded
  const isRowDisabled = (value: string): boolean => !!metaOf(value)?.disabled
  const sortDirection = (value: string): 'asc' | 'desc' | null => tableSortDirectionOf(sort, value)
  const sortPriority = (value: string): number => tableSortIndexOf(sort, value)

  // 行级 roving 的唯一锚点：焦点在表体里跟焦点走，否则落在可见序里首个选中的数据行。
  // 取可见序而非选中集合的第一个，后者可能是不在本页的 id
  const anchor = focusedRow ?? dataRows.find(row => isSelected(row.id))?.id ?? null

  /**
   * 数据行元素，按可见序排列，只在事件那一刻读活 DOM。
   * 容器取 body 而不是 root：表头行与脚注行同样写成 row 部件，以 root 为容器会把它们也算进来。
   */
  const rowEls = (body: HTMLElement): HTMLElement[] => {
    const byValue = new Map<string, HTMLElement>()
    for (const el of queryItems(body, tableRowQuery)) {
      const value = itemValue(el)
      if (value != null && !byValue.has(value))
        byValue.set(value, el)
    }
    return dataRows
      .map(row => byValue.get(row.id))
      .filter((el): el is HTMLElement => el != null)
  }

  /** 把手长在单元格里，拿不到行元素，只能就地往上找最近的那个。 */
  const rowElOf = (el: HTMLElement): HTMLElement | null => el.closest<HTMLElement>(parts.row.selector)

  const focusValue = (el: HTMLElement | null): void => {
    const next = itemValue(el)
    if (next == null)
      return
    focusItem(el)
    send({ type: 'ROW.FOCUS', value: next })
  }

  /** 方向键落点：起点用锚点，终点在可见数据行上算，禁用行自动跳过。 */
  const focusBy = (body: HTMLElement, intent: NavIntent): void => {
    focusValue(navigateItems(rowEls(body), anchor, intent, { loop }))
  }

  /** 把焦点交给某个把手所在的那一行：把手自己 tabindex=-1，点它不该把焦点留在把手上。 */
  const focusOwnerRow = (el: HTMLElement): void => {
    focusValue(rowElOf(el))
  }

  /** 排序把手与全选把手共用：确认键要拦下默认行为。 */
  const isCommitKey = (event: KeyboardEvent): boolean =>
    (event.key === 'Enter' || event.key === ' ') && !event.ctrlKey && !event.metaKey && !event.altKey

  const toggleSortOf = (value: string, append: boolean): void => {
    send({ type: 'SORT.TOGGLE', value, append })
  }

  /** 行系部件（row / row-select-trigger / expand-trigger）共用的状态标记，样式层各处一致。 */
  const rowState = (value: string): Record<string, string | undefined> => {
    const meta = metaOf(value)
    return {
      'data-selected': dataAttr(isSelected(value)),
      'data-disabled': dataAttr(isRowDisabled(value)),
      // 焦点所在与选中互相独立：可以停在一个没被选中的行上
      'data-highlighted': dataAttr(focusedRow === value),
      // 不可展开的行没有开合可言，给一个 closed 会让皮肤画出一个永远转不动的箭头
      'data-state': meta?.expandable ? (meta.expanded ? 'open' : 'closed') : undefined,
    }
  }

  /** 列系部件（column-header / sort-trigger）共用的排序标记。 */
  const sortState = (value: string): Record<string, string | number | undefined> => {
    const direction = sortDirection(value)
    return {
      'data-sort': direction ?? undefined,
      // 优先级只在参与排序时给：多字段排序的序号是皮肤画角标的依据
      'data-sort-index': direction ? sortPriority(value) : undefined,
    }
  }

  /** 详情行的 id：展开把手与行都靠它指向同一段详情内容。 */
  const detailId = (value: string): string => scope.partId(tableAnatomy.name, `expanded-row:${encodeURIComponent(value)}`)

  return {
    columns,
    draggableColumns,
    rowReorderDisabledReason: rowBlocked,
    dropTarget,
    announcement: context.get('announcement'),
    columnPreference,
    setColumnHidden: (columnId, hidden) => send({ type: 'COLUMN_PREF.PATCH', columnId, hidden }),
    moveColumn: (columnId, toIndex) => send({ type: 'COLUMN_PREF.PATCH', columnId, toIndex }),
    setColumnWidth: (columnId, width) => send({ type: 'COLUMN_PREF.PATCH', columnId, width }),
    setColumnPreference: next => send({ type: 'COLUMN_PREF.SET', value: next }),
    rowNumber,
    rows,
    visibleRows,
    sort,
    selection,
    selectionState,
    selectionMode: mode,
    expandedValue,
    focusedRow,
    loading,
    empty: isEmpty,
    rowCount,
    columnCount: columns.length,
    isSelected,
    isExpanded,
    sortDirection,
    sortPriority,
    setSort: next => send({ type: 'SORT.SET', value: next }),
    toggleSort: (value, options) => toggleSortOf(value, !!options?.append),
    setSelection: next => send({ type: 'SELECTION.SET', value: next }),
    selectRow: (value, options) => send({ type: 'ROW.SELECT', value, extend: options?.extend }),
    toggleSelectAll: () => send({ type: 'SELECTION.ALL_TOGGLE' }),
    setExpandedValue: next => send({ type: 'EXPANDED.SET', value: next }),
    expandRow: value => send({ type: 'ROW.EXPAND', value }),
    collapseRow: value => send({ type: 'ROW.COLLAPSE', value }),
    toggleExpandRow: value => send({ type: 'ROW.EXPAND_TOGGLE', value }),

    // root 用 grid 系而不是 role=table：role=table 不接受 aria-selected 这类交互语义。
    // 有可展开的行时报 treegrid：行上的 aria-expanded 只在 treegrid 里成立，
    // 展开出来的详情行也正是这一行的下一层行
    getRootProps: () => normalize.element({
      ...parts.root.attrs,
      'role': hierarchical ? 'treegrid' : 'grid',
      'aria-labelledby': ids.caption,
      'aria-rowcount': rowCount,
      // 一列都没声明时不报列数
      'aria-colcount': columns.length || undefined,
      // 复选与否必须显式说，省略只是没说
      'aria-multiselectable': mode === 'multiple' ? 'true' : 'false',
      // 加载态的播报归它：两个状态节点自己不带 role，见 getLoadingProps
      'aria-busy': loading ? 'true' : undefined,
      'data-size': prop('size'),
      'data-loading': dataAttr(loading),
      'data-empty': dataAttr(isEmpty),
      'data-fixed': dataAttr(stickyHeader),
      'data-striped': dataAttr(!!prop('striped')),
      'data-bordered': dataAttr(!prop('borderless')),
      'data-split': dataAttr(!!prop('ruled')),
    }),

    getCaptionProps: () => normalize.element({
      ...parts.caption.attrs,
      id: ids.caption,
    }),

    getHeaderProps: () => normalize.element({
      ...parts.header.attrs,
      'role': 'rowgroup',
      // 吸顶只落标记，钉住的实现归皮肤
      'data-fixed': dataAttr(stickyHeader),
    }),

    // 键盘全在 body 上收口，行只管声明自己。
    // 收口点选 body 而不是 root，否则 root 的兜底 Tab 位会让表头把手被跳过。
    getBodyProps: () => normalize.element({
      ...parts.body.attrs,
      'role': 'rowgroup',
      // 焦点在表体外时容器兜底进 Tab 序列，由 onFocus 转投给行。
      // 判据用 focusedRow 而非 anchor：anchor 可能指向已删掉或不在本页的行，那时无人认领 tabindex=0
      'tabindex': focusedRow == null ? 0 : -1,
      'data-empty': dataAttr(isEmpty),
      'onKeyDown': (event: KeyboardEvent) => {
        // 输入法组合中的按键是给候选框的，不是给表格的；
        // 落在可编辑控件上的按键归那个控件
        if (isComposingEvent(event) || isEditableTarget(event.target))
          return
        const body = event.currentTarget as HTMLElement
        const command = event.ctrlKey || event.metaKey

        // Ctrl/Cmd + A 全选。单选与不可选的表格不接这个键，让它回落到浏览器的全选
        if (command && !event.altKey && (event.key === 'a' || event.key === 'A')) {
          if (mode !== 'multiple')
            return
          event.preventDefault()
          // 按住不放会连发 keydown，这是切换：重复执行会来回翻转
          if (event.repeat)
            return
          send({ type: 'SELECTION.ALL_TOGGLE' })
          return
        }

        // Alt + 上下键换行位。一按就是一次已过守卫的完整提交，不进拖动态——
        // 裸方向键是导航、Space 是选中、左右键是展开收起，模态拾起在这里无处落脚
        if (event.altKey && !command && focusedRow != null && !isRowDisabled(focusedRow)) {
          // 行是纵向排的；轴之外的键不归换位管
          // 树形表多认左右键：改一层缩进。平表没有层级，那两个键放行给页面
          const intent = nested
            ? treeRowIntentFromKey(event.key, dir === 'rtl')
            : flatMoveIntentFromKey(event.key, 'vertical')
          if (intent) {
            // 没打开换位就不归表格管，这个组合键放行给页面——
            // 与另外三处（列、树、标签）同一个写法
            if (!rowReorderable)
              return
            // Alt + 方向键在部分浏览器是前进后退，认了就得挡住。
            // 降级时照样挡：键是认下了的，只是这张表此刻搬不动
            event.preventDefault()
            if (rowBlocked == null) {
              const target = tableRowMoveCommand(visibleRows, focusedRow, intent)
              if (target)
                send({ type: 'ROW.MOVE_BY', rowId: focusedRow, target })
            }
            return
          }
        }

        // 其余带 Ctrl/Cmd/Alt 的组合一律不归表格管（Ctrl+Home 之类归浏览器与读屏）
        if (command || event.altKey)
          return

        // 上下键与 Home/End 走可见数据行；轴固定 vertical，左右键另有展开/收起语义
        const intent = navIntentFromKey(event, { axis: 'vertical' })
        if (intent) {
          event.preventDefault()
          focusBy(body, intent)
          return
        }

        const row = focusedRow != null ? metaOf(focusedRow) : undefined
        if (!row)
          return
        // rtl 下左右键整体对调：展开永远是"往里去"的那个方向
        const forward = dir === 'rtl' ? 'ArrowLeft' : 'ArrowRight'
        const backward = dir === 'rtl' ? 'ArrowRight' : 'ArrowLeft'

        if (event.key === forward) {
          // 不可展开、已展开或禁用的行改不了展开态，这个键放行给页面
          if (!row.expandable || row.expanded || row.disabled)
            return
          event.preventDefault()
          send({ type: 'ROW.EXPAND', value: row.id })
          return
        }

        if (event.key === backward) {
          if (!row.expandable || !row.expanded || row.disabled)
            return
          event.preventDefault()
          send({ type: 'ROW.COLLAPSE', value: row.id })
          return
        }

        if (event.key === ' ') {
          // 选不动就不吞这个键：Space 必须放行给页面滚动
          if (mode === 'none' || row.disabled)
            return
          event.preventDefault()
          send({ type: 'ROW.SELECT', value: row.id, extend: event.shiftKey })
        }
      },
      'onFocus': (event: FocusEvent) => {
        const body = event.currentTarget as HTMLElement
        // 只接管从表体外进来的焦点：体内 Shift+Tab 往外退时转投会把人困在表格里
        if (contains(body, event.relatedTarget as Node | null))
          return
        const list = rowEls(body)
        // 焦点进入表体落在选中行上；不可停留时退回首个可停留行，两路都取不到则留在容器上
        const selected = list.find((el) => {
          const value = itemValue(el)
          return value != null && isSelected(value) && !isItemDisabled(el)
        })
        // 落点行自己的 onFocus 会把锚点接过去
        focusItem(selected ?? navigateItems(list, null, 'first'))
      },
      'onFocusOut': (event: FocusEvent) => {
        const body = event.currentTarget as HTMLElement
        if (contains(body, event.relatedTarget as Node | null))
          return
        send({ type: 'TABLE.BLUR' })
      },
    }),

    getFooterProps: () => normalize.element({
      ...parts.footer.attrs,
      role: 'rowgroup',
    }),

    // 表头行不进方向键序列，也不认领 Tab 位；表头里的排序与全选把手各自占位
    getHeaderRowProps: () => normalize.element({
      ...parts.row.attrs,
      'role': 'row',
      'aria-rowindex': 1,
      'data-section': 'header',
    }),

    getFooterRowProps: () => {
      // 行号空间是按 footer prop 算的。渲了脚注行却没声明这个 prop，rowCount 就等于末行数据行的行号，
      // 报出去会与它撞号；此时宁可不报行号，也不给一个错的
      warn(hasFooter, 'table: 渲染了脚注行但没有设置 footer prop，脚注行不会报 aria-rowindex')
      return normalize.element({
        ...parts.row.attrs,
        'role': 'row',
        // 脚注排在行号空间的最后一行
        'aria-rowindex': hasFooter ? rowCount : undefined,
        'data-section': 'footer',
      })
    },

    getRowProps: (row) => {
      const meta = metaOf(row.value)
      const selectable = mode !== 'none'
      return normalize.element({
        ...parts.row.attrs,
        ...rowState(row.value),
        // 导航、选中与展开都以此为行身份
        [ITEM_VALUE_ATTR]: row.value,
        'role': 'row',
        // 行号的事实源是 rows 加展开集合，不是 DOM 顺序；不在 rows 里的行不报行号
        'aria-rowindex': dataRowIndex.get(row.value),
        // 选择关停时不写 aria-selected：省略是不可选，false 是可选但没选中
        'aria-selected': selectable ? (isSelected(row.value) ? 'true' : 'false') : undefined,
        // 不可展开的行不报 aria-expanded，那是能展开却没展开的意思
        'aria-expanded': meta?.expandable ? (meta.expanded ? 'true' : 'false') : undefined,
        'aria-controls': meta?.expandable ? detailId(row.value) : undefined,
        // treegrid 的层级不体现在 DOM 嵌套上，只能逐行报出来：数据行都在第一层
        'aria-level': hierarchical ? (metaIndex.get(row.value)?.level ?? 1) : undefined,
        // 层级三件套按摊平结果给：写死 1 的话树形表格所有行都报第一层
        'aria-posinset': hierarchical ? (metaIndex.get(row.value)?.posInSet ?? rowPosition.get(row.value)) : undefined,
        'aria-setsize': hierarchical ? (metaIndex.get(row.value)?.setSize ?? rowSetSize) : undefined,
        // 集合条目一律 aria-disabled，不用原生 disabled：原生 disabled 不可聚焦、不派 click
        'aria-disabled': isRowDisabled(row.value) ? 'true' : 'false',
        // 行级 roving tabindex：整张表只有锚点行留在 Tab 序列内
        'tabindex': anchor === row.value ? 0 : -1,
        'data-section': 'body',
        'data-dragging': dataAttr(draggingRow === row.value),
        'data-drop': rowDropSide(row.value),
        'data-draggable': dataAttr(rowReorderable && rowBlocked == null && !isRowDisabled(row.value)),
        // 焦点是事实不是许可：禁用行被点到也记锚点，方向键才知道从哪儿起步
        'onFocus': () => send({ type: 'ROW.FOCUS', value: row.value }),
        // 整行都是拖动源，没有把手。按在行里的交互控件上不起拖：
        // 那些地方按下去是要点它们，不是要搬这一行
        'onPointerDown': (event: PointerEvent) => {
          // 只认主键：右键要弹上下文菜单，中键是自动滚动。
          // 触屏也不认：拖行是纵向的，而纵向手势在按下那一刻就归了浏览器滚动，
          // touch-action 事后改不回来。触屏那一路走 row-drag-trigger 把手。
          // 禁用的行不是拖动源：它自己动不了，别人仍可以落在它前后
          if (!rowReorderable || isRowDisabled(row.value)
            || event.button !== 0 || event.pointerType === 'touch') {
            return
          }
          // 排序链与树形在渲染期就知道；虚拟滚动那一条要量过才知道，
          // 所以它不进这道守卫——否则判过一次就再也没有重新测量的机会
          if (rowReorderReason(sort.length) != null)
            return
          const target = event.target as HTMLElement | null
          if (target?.closest('input,textarea,select,button,a,[contenteditable],[role="button"],[role="checkbox"]'))
            return
          const el = event.currentTarget as HTMLElement | null
          const body = el?.closest<HTMLElement>('[data-scope="table"][data-part="body"]')
          if (!body)
            return
          const rects = rowGroupRects(measureRowGroups(body))
          // 量到的行数与数据行数对不上 = 宿主只渲了一段，窗口外的行没有矩形。
          // 无条件写回：这一下量出来能拖，就把上一次记下的原因清掉
          const blocked = rects.length !== dataRows.length ? 'virtualized' : null
          send({ type: 'ROW.REORDER_BLOCKED', reason: blocked })
          if (blocked)
            return
          send({
            type: 'ROW_DRAG.START',
            rowId: row.value,
            rects,
            originY: event.clientY,
            pointerId: event.pointerId,
            source: el,
          })
        },

      })
    },

    getColumnHeaderProps: (column) => {
      const def = columnOf(column.value)
      const sortable = !!def?.sortable
      const direction = sortDirection(column.value)
      const sizeStyle = columnSizeStyle(def?.width, hasWidthOverride(column.value))
      const sticky = stickyAttrs(def)
      return normalize.element({
        ...parts['column-header'].attrs,
        ...sortState(column.value),
        [ITEM_VALUE_ATTR]: column.value,
        'role': 'columnheader',
        'aria-colindex': columnIndex.get(column.value),
        // 可排序但没在排的列报 none，不可排序的列不写 aria-sort
        'aria-sort': sortable
          ? (direction === 'asc' ? 'ascending' : direction === 'desc' ? 'descending' : 'none')
          : undefined,
        'data-sortable': dataAttr(sortable),
        // 拖动中：被拖的那一列自己降透明度，落点那一列画指示线。
        // 两个属性都不带位移——被拖的列原地不动，冻结列的吸附才不会被祖先 transform 打死
        'data-dragging': dataAttr(draggingColumn === column.value),
        'data-drop': dropSide(column.value),
        ...sticky,
        // 列宽由连接层写进内联 inline-size：那条轴归它，皮肤不再声明；吸附偏移与它同住一个 style
        ...(Object.keys(sizeStyle).length ? { style: { ...sticky.style as Record<string, unknown>, ...sizeStyle } } : {}),
      })
    },

    getCellProps: (cell) => {
      const def = columnOf(cell.value)
      const sizeStyle = columnSizeStyle(def?.width, hasWidthOverride(cell.value))
      const sticky = stickyAttrs(def)
      // 跨列数只在真的跨了列时报，1 是默认值
      const colSpan = cell.colSpan != null && cell.colSpan > 1 ? cell.colSpan : undefined
      return normalize.element({
        ...parts.cell.attrs,
        // 列身份与表头格发同一份：少了它，使用者按列写的样式只命中表头，
        // 同一列在表头与表体分到的余量就不一样，列边界跟着错开
        [ITEM_VALUE_ATTR]: cell.value,
        'role': 'gridcell',
        'aria-colindex': columnIndex.get(cell.value),
        'aria-colspan': colSpan,
        // 表头与脚注的格子不给 row，也就没有选中/禁用可言
        'data-selected': cell.row != null ? dataAttr(isSelected(cell.row)) : undefined,
        'data-disabled': cell.row != null ? dataAttr(isRowDisabled(cell.row)) : undefined,
        // 与表头格同发：指示线要贯穿整张表，只画在列头上会看不出落到哪儿
        'data-dragging': dataAttr(draggingColumn === cell.value),
        'data-drop': dropSide(cell.value),
        ...sticky,
        ...(Object.keys(sizeStyle).length ? { style: { ...sticky.style as Record<string, unknown>, ...sizeStyle } } : {}),
      })
    },

    // 全选把手是三态的唯一载体；它不属于 roving 行组，自己占一个 Tab 位。
    // 名字无条件发：这一格默认没有内容，行内那颗把手又退出了可及树，
    // 缺了它读屏在整张表里找不到任何能操作选择的东西
    getSelectAllTriggerProps: () => normalize.element({
      ...parts['select-all-trigger'].attrs,
      'role': 'checkbox',
      'aria-label': label.selectAll,
      'aria-checked': selectionState === 'checked' ? 'true' : selectionState === 'indeterminate' ? 'mixed' : 'false',
      // 角色节点是普通元素而非原生控件，禁用后仍要能被聚焦
      'aria-disabled': canSelectAll ? 'false' : 'true',
      'tabindex': 0,
      'data-state': selectionState,
      'data-disabled': dataAttr(!canSelectAll),
      'onClick': () => {
        if (canSelectAll)
          send({ type: 'SELECTION.ALL_TOGGLE' })
      },
      'onKeyDown': (event: KeyboardEvent) => {
        if (!isCommitKey(event) || !canSelectAll)
          return
        // 作者写成 <button> 时按键会被再合成一次 click，拦下默认行为，否则同一次按键切两回
        event.preventDefault()
        // 按住不放会连发 keydown，这是切换：重复执行会来回翻转
        if (event.repeat)
          return
        send({ type: 'SELECTION.ALL_TOGGLE' })
      },
    }),

    // 行内的两个把手退出可及树、不占 Tab 位：行自己已报 aria-selected 与 aria-expanded，
    // 每行多一个 Tab 位会让行级 roving 失效；键盘那一路由 Space 与左右方向键承担
    getRowSelectTriggerProps: row => normalize.element({
      ...parts['row-select-trigger'].attrs,
      ...rowState(row.value),
      'aria-hidden': true,
      'tabindex': -1,
      'onClick': (event: MouseEvent) => {
        if (mode === 'none' || isRowDisabled(row.value))
          return
        // tabindex=-1 的节点是点得到焦点的：不显式接管，焦点会停在这个 aria-hidden 的把手上
        focusOwnerRow(event.currentTarget as HTMLElement)
        send({ type: 'ROW.SELECT', value: row.value, extend: event.shiftKey })
      },
    }),

    getColumnResizeTriggerProps: (column) => {
      const def = columnOf(column.value)
      // 可聚焦的 separator 是个 widget，读屏要一个数值。算不出 px 宽度（列宽写成
      // 百分比这类）就不认可改宽——键盘本来也动不了它，只让指针拖会留下一个
      // 读屏读不出、键盘够不着的半残控件
      const width = numericWidth(column.value, def)
      const resizable = !!def?.resizable && width != null
      const active = context.get('resizingColumn') === column.value
      return normalize.element({
        ...parts['column-resize-trigger'].attrs,
        [ITEM_VALUE_ATTR]: column.value,
        // 显式给角色：作者常写成 <span>，读屏听不出能操作
        'role': 'separator',
        // 分隔条自身是竖的：它把左右两列分开
        'aria-orientation': 'vertical',
        'aria-label': label.columnResize(def?.label ?? column.value),
        'aria-valuenow': width ?? undefined,
        'aria-valuemin': resizable ? (def?.minWidth ?? TABLE_COLUMN_MIN_WIDTH) : undefined,
        'aria-valuemax': resizable ? def?.maxWidth : undefined,
        // 改宽把手自己占一个 Tab 位，不属于表体的 roving 行组；不可改宽的列退出 Tab 序列
        'tabindex': resizable ? 0 : -1,
        'aria-disabled': resizable ? 'false' : 'true',
        'data-disabled': dataAttr(!resizable),
        'data-resizing': dataAttr(active),
        // 不关掉这一轴的默认手势，触屏上手指一划就被系统收走（pointercancel）
        'style': { touchAction: resizable ? 'none' : undefined },
        'onPointerDown': (event: PointerEvent) => {
          // 只认主键：右键要弹上下文菜单，中键是自动滚动
          if (!resizable || event.button !== 0)
            return
          // 量一次真实列宽：列定义里的 width 可能没写、也可能是百分比这类算不出 px 的写法。
          // 事件处理器里碰 DOM 是允许的，渲染期才不许
          const trigger = event.currentTarget as HTMLElement | null
          const header = trigger?.closest<HTMLElement>('[data-scope="table"][data-part="column-header"]')
          if (!header)
            return
          event.preventDefault()
          send({
            type: 'COLUMN_RESIZE.START',
            columnId: column.value,
            startWidth: header.getBoundingClientRect().width,
            originX: event.clientX,
            snapshot: measureColumns(header),
          })
        },
        'onKeyDown': (event: KeyboardEvent) => {
          if (!resizable)
            return
          // 带 Ctrl/Cmd/Alt 的组合一律不归改宽管（Alt+方向键之类归浏览器与读屏）。
          // Shift 不在此列：它是大步，见下
          if (event.ctrlKey || event.metaKey || event.altKey)
            return
          const step = resizeStepFromKey(event.key, dir === 'rtl')
          if (step == null)
            return
          event.preventDefault()
          send({ type: 'COLUMN_RESIZE.STEP', columnId: column.value, delta: step * (event.shiftKey ? TABLE_COLUMN_LARGE_STEP : TABLE_COLUMN_STEP) })
        },
      })
    },

    getRowDragTriggerProps: (row) => {
      const draggable = rowReorderable && rowBlocked == null
      return normalize.element({
        ...parts['row-drag-trigger'].attrs,
        [ITEM_VALUE_ATTR]: row.value,
        // 把手对读屏隐藏、也不占 Tab 位：键盘那一路由表体上的 Alt + 上下键承担
        'aria-hidden': true,
        'tabindex': -1,
        'data-disabled': dataAttr(!draggable),
        'data-dragging': dataAttr(draggingRow === row.value),
        // 手势从按下那一刻就归拖动。这一小块地方因此不再跟着表格滚，
        // 换来的是触屏上拖得动——整行起手在触屏上做不到这件事
        'style': { touchAction: draggable ? 'none' : undefined },
        'onPointerDown': (event: PointerEvent) => {
          // 不看 rowBlocked：虚拟滚动那一条要量过才知道，把它放进守卫
          // 就等于判过一次再也回不来
          if (!rowReorderable || isRowDisabled(row.value) || event.button !== 0)
            return
          if (rowReorderReason(sort.length) != null)
            return
          const el = event.currentTarget as HTMLElement | null
          const body = el?.closest<HTMLElement>('[data-scope="table"][data-part="body"]')
          if (!body)
            return
          const rects = rowGroupRects(measureRowGroups(body))
          // 无条件写回：这一下量出来能拖，就把上一次记下的原因清掉
          const blocked = rects.length !== dataRows.length ? 'virtualized' : null
          send({ type: 'ROW.REORDER_BLOCKED', reason: blocked })
          if (blocked)
            return
          event.preventDefault()
          // tabindex=-1 的节点是点得到焦点的：不显式接管，焦点会停在这个 aria-hidden 的把手上。
          // 同一行里另外两个把手（选择、展开）也是这么做的
          focusOwnerRow(event.currentTarget as HTMLElement)
          send({
            type: 'ROW_DRAG.START',
            rowId: row.value,
            rects,
            originY: event.clientY,
            pointerId: event.pointerId,
            // 拖动源取把手所属的那一行：把手跟着行一起挪
            source: el?.closest<HTMLElement>('[data-scope="table"][data-part="row"]') ?? null,
            // 把手是专门的拖动入口，意图无歧义：按下即拖，不等激活距离
            activate: true,
          })
        },
      })
    },

    getColumnDragTriggerProps: (column) => {
      const def = columnOf(column.value)
      // 可拖的判据由 draggableColumnIds 一处说了算：声明了 reorderable、不是冻结列、
      // 且与本列同处最长的那一段。不在段里的列产出一个报不可用的把手，
      // 而不是干脆不渲——列头的构成随拖动状态变会让 Tab 序列在拖动中跳动
      const draggable = draggableColumns.includes(column.value)
      return normalize.element({
        ...parts['column-drag-trigger'].attrs,
        [ITEM_VALUE_ATTR]: column.value,
        // 显式给角色：作者常写成 <span>，读屏听不出能按
        'role': 'button',
        'aria-label': label.columnDrag(def?.label ?? column.value),
        // 与同一个列头里的改宽把手（role=separator）区分开：两个都答方向键，
        // 一个改宽一个换位，读屏得能说清按的是哪一个
        'aria-roledescription': 'draggable column',
        // 拖拽把手自己占一个 Tab 位，不属于表体的 roving 行组；不可拖的列退出 Tab 序列
        'tabindex': draggable ? 0 : -1,
        'aria-disabled': draggable ? 'false' : 'true',
        'data-disabled': dataAttr(!draggable),
        'data-dragging': dataAttr(draggingColumn === column.value),
        // 不关掉这一轴的默认手势，触屏上手指一划就被系统收走（pointercancel）
        'style': { touchAction: draggable ? 'none' : undefined },
        'onPointerDown': (event: PointerEvent) => {
          // 只认主键：右键要弹上下文菜单，中键是自动滚动
          if (!draggable || event.button !== 0)
            return
          const trigger = event.currentTarget as HTMLElement | null
          const header = trigger?.closest<HTMLElement>('[data-scope="table"][data-part="column-header"]')
          const row = header?.closest<HTMLElement>('[data-scope="table"][data-part="row"]') ?? header?.parentElement
          if (!row)
            return
          // 量一次可拖列此刻的横向位置。事件处理器里碰 DOM 是允许的，渲染期才不许。
          // 快照全程不重量：重量会让「让位之后再判落点」自激振荡
          const boxes = new Map<string, { start: number, size: number }>()
          for (const el of row.querySelectorAll<HTMLElement>('[data-scope="table"][data-part="column-header"]')) {
            const id = el.getAttribute(ITEM_VALUE_ATTR)
            if (id) {
              const rect = el.getBoundingClientRect()
              boxes.set(id, { start: rect.left, size: rect.width })
            }
          }
          event.preventDefault()
          send({
            type: 'COLUMN_DRAG.START',
            columnId: column.value,
            rects: columnDragRects(columns, id => boxes.get(id) ?? null),
            originX: event.clientX,
            pointerId: event.pointerId,
            // 拖动源取列头本身：把手是它的孩子，跟着它一起挪
            source: header ?? null,
          })
        },
        'onKeyDown': (event: KeyboardEvent) => {
          if (!draggable)
            return
          // 带 Ctrl/Cmd/Alt 的组合一律不归换位管（Alt+方向键之类归浏览器与读屏）
          if (event.ctrlKey || event.metaKey || event.altKey)
            return
          const intent = columnMoveIntentFromKey(event.key, dir === 'rtl')
          if (intent == null)
            return
          event.preventDefault()
          const target = columnMoveCommand(draggableColumns, column.value, intent)
          // 已经在段首/段末：挡住默认行为但不发事件，也不回绕——回绕会让人以为按坏了
          if (target)
            send({ type: 'COLUMN.MOVE_BY', columnId: column.value, target })
        },
      })
    },

    /**
     * 拖动过程只说给读屏听。
     *
     * 它必须渲在 root **之外**：root 是 role=grid，grid 的子节点只能是 row 与 rowgroup，
     * 塞一个活动区域进去是 aria-required-children（critical）——不带 role 也一样，
     * 无角色但带全局 aria 属性的节点照样被算进 owned。两个适配器都把它渲成 root 的兄弟。
     *
     * 也必须在拖动开始之前就在 DOM 上——读屏不播报后插入的节点。
     */
    getLiveRegionProps: () => normalize.element({
      ...parts['live-region'].attrs,
      'role': 'status',
      'aria-live': 'polite',
      'aria-atomic': 'true',
      'style': VISUALLY_HIDDEN_STYLE,
    }),

    getSortTriggerProps: (column) => {
      const sortable = !!columnOf(column.value)?.sortable
      return normalize.element({
        ...parts['sort-trigger'].attrs,
        ...sortState(column.value),
        // 显式给角色：作者常写成 <span>，读屏听不出能按。
        // 当前排序方向由祖先 column-header 的 aria-sort 报出，不在这儿重复
        'role': 'button',
        // 排序把手不属于 roving 行组，自己占一个 Tab 位；不可排序的列退出 Tab 序列
        'tabindex': sortable ? 0 : -1,
        'aria-disabled': sortable ? 'false' : 'true',
        'data-disabled': dataAttr(!sortable),
        // 按住 Shift 点是"追加到排序链"，裸点是"整条链换成这一列"
        'onClick': (event: MouseEvent) => {
          if (sortable)
            toggleSortOf(column.value, event.shiftKey)
        },
        'onKeyDown': (event: KeyboardEvent) => {
          if (!isCommitKey(event) || !sortable)
            return
          event.preventDefault()
          toggleSortOf(column.value, event.shiftKey)
        },
      })
    },

    getExpandTriggerProps: row => normalize.element({
      ...parts['expand-trigger'].attrs,
      ...rowState(row.value),
      'aria-hidden': true,
      'tabindex': -1,
      'onClick': (event: MouseEvent) => {
        if (!metaOf(row.value)?.expandable || isRowDisabled(row.value))
          return
        focusOwnerRow(event.currentTarget as HTMLElement)
        send({ type: 'ROW.EXPAND_TOGGLE', value: row.value })
      },
    }),

    getExpandedRowProps: (row) => {
      const meta = metaOf(row.value)
      return normalize.element({
        ...parts['expanded-row'].attrs,
        'id': detailId(row.value),
        'role': 'row',
        // 详情行占一个真实行号：展开一行会把它后面所有行整体后移一位
        'aria-rowindex': detailRowIndex.get(row.value),
        // 详情行是所属数据行的下一层，且那一层只有它自己
        // 详情行恒是它所属数据行的下一层，独占一格
        'aria-level': hierarchical ? (metaIndex.get(row.value)?.level ?? 1) + 1 : undefined,
        'aria-posinset': hierarchical ? 1 : undefined,
        'aria-setsize': hierarchical ? 1 : undefined,
        // 收起只翻这一位，不卸载作者节点，详情里的输入框与滚动位置得留着
        'data-state': meta?.expanded ? 'open' : 'closed',
        // 详情行跟着所属数据行一起标：落点判定把两者算作一整块
        'data-dragging': dataAttr(draggingRow === row.value),
      })
    },

    // 两个状态节点不带 role：grid 系角色的子节点只能是 row 与 rowgroup；
    // 加载态的播报由 root 的 aria-busy 承担。节点常挂，只靠 hidden 显隐。
    getEmptyProps: () => normalize.element({
      ...parts.empty.attrs,
      hidden: !showEmpty || undefined,
    }),

    getLoadingProps: () => normalize.element({
      ...parts.loading.attrs,
      hidden: !showLoading || undefined,
    }),
  }
}
