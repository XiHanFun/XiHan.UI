import type { NavIntent } from '@xihan-ui/behavior'
import type { NormalizeProps, PropTypes } from '@xihan-ui/core'
import type { Service } from '@xihan-ui/machine'
import type { TableApi, TableColumnDef, TableSchema, TableVisibleRow } from './table.types'
import {
  focusItem,
  isItemDisabled,
  ITEM_VALUE_ATTR,
  itemValue,
  navigateItems,
  navIntentFromKey,
  queryItems,
} from '@xihan-ui/behavior'
import { contains, dataAttr } from '@xihan-ui/core'
import { tableAnatomy, tableRowQuery } from './table.anatomy'
import { tableSelectionMode } from './table.machine'
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

export function connectTable<T extends PropTypes>(
  service: Service<TableSchema>,
  normalize: NormalizeProps<T>,
): TableApi<T> {
  const { context, prop, send, scope } = service
  const columns = prop('columns') ?? []
  const rows = prop('rows') ?? []
  const sort = context.get('sort')
  const selection = context.get('selection')
  const expandedValue = context.get('expanded')
  const focusedRow = context.get('focusedRow')
  const mode = tableSelectionMode(prop('selectionMode'))
  const loading = !!prop('loading')
  const stickyHeader = !!prop('stickyHeader')
  const hasFooter = !!prop('footer')
  const dir = prop('dir') ?? 'ltr'
  // 表格不像列表那样天然成环：上键停在首行、下键停在末行才符合"一屏数据有上下文"的直觉
  const loop = prop('loop') ?? false
  const ids = scope.ids('table', 'caption')

  // 摊平与索引都是 (rows, 展开集合) 的纯函数，一行 DOM 都不碰：
  // Vue 在 render 期求值 connect，那一刻 DOM 还不存在。
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

  const columnIndex = new Map<string, number>()
  const columnIndexDefs = new Map<string, TableColumnDef>()
  columns.forEach((column, i) => {
    // 列 id 重复时以先出现的为准，取列号是确定的
    if (columnIndexDefs.has(column.id))
      return
    columnIndexDefs.set(column.id, column)
    columnIndex.set(column.id, i + 1)
  })

  const selectableIds = tableSelectableRowIds(rows)
  const selectionState = tableSelectionState(selection, selectableIds)
  // 全选把手只在复选下生效：单选一次只中一行，none 压根没有选择这回事
  const canSelectAll = mode === 'multiple'
  const isEmpty = prop('empty') ?? dataRows.length === 0
  // 两个状态节点都常挂，只在表体为空时才轮到它们显形，且互斥：
  // 已经有数据还盖一层"加载中"会把用户正在读的表遮掉
  const showLoading = loading && isEmpty
  const showEmpty = !loading && isEmpty
  const rowCount = HEADER_ROW_COUNT + visibleRows.length + (hasFooter ? 1 : 0)

  const metaOf = (value: string): TableVisibleRow | undefined => metaIndex.get(value)
  const columnOf = (value: string): TableColumnDef | undefined => columnIndexDefs.get(value)
  const isSelected = (value: string): boolean => tableRowSelected(selection, value)
  const isExpanded = (value: string): boolean => !!metaOf(value)?.expanded
  const isRowDisabled = (value: string): boolean => !!metaOf(value)?.disabled
  const sortDirection = (value: string): 'asc' | 'desc' | null => tableSortDirectionOf(sort, value)
  const sortPriority = (value: string): number => tableSortIndexOf(sort, value)

  // 行级 roving tabindex 的唯一锚点：焦点在表体里跟焦点走，否则落在首个选中的数据行上。
  // 取可见序里的第一个而不是选中集合里的第一个：后者可能是一个压根不在本页的 id
  // （跨页全选、受控值超前于数据），认领了 tabindex=0 也等于没有停靠点。
  const anchor = focusedRow ?? dataRows.find(row => isSelected(row.id))?.id ?? null

  /**
   * 数据行元素，按**可见序**排列。只在事件那一刻读活 DOM。
   *
   * 容器取 body 而不是 root：表头行与脚注行同样写成 row 部件，
   * 以 root 为容器一查会把它们也算进方向键序列，焦点就会停到一行标题上。
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
    selectRow: value => send({ type: 'ROW.SELECT', value }),
    toggleSelectAll: () => send({ type: 'SELECTION.ALL_TOGGLE' }),
    setExpandedValue: next => send({ type: 'EXPANDED.SET', value: next }),
    expandRow: value => send({ type: 'ROW.EXPAND', value }),
    collapseRow: value => send({ type: 'ROW.COLLAPSE', value }),
    toggleExpandRow: value => send({ type: 'ROW.EXPAND_TOGGLE', value }),

    // root 是 role=grid 而不是 table：行可选、可展开，还要报行列总数——
    // role=table 不接受 aria-selected / aria-expanded 这类交互语义
    getRootProps: () => normalize.element({
      ...parts.root.attrs,
      'role': 'grid',
      'aria-labelledby': ids.caption,
      'aria-rowcount': rowCount,
      // 一列都没声明时不报列数：0 列的表格不是"列数为 0"，而是作者还没给列定义
      'aria-colcount': columns.length || undefined,
      // 复选与否必须显式说：省略只是"没说"，读屏无从区分单选表与"作者忘了标"
      'aria-multiselectable': mode === 'multiple' ? 'true' : 'false',
      // 加载态的播报归它：两个状态节点自己不带 role，见 getLoadingStateProps
      'aria-busy': loading ? 'true' : 'false',
      'data-loading': dataAttr(loading),
      'data-empty': dataAttr(isEmpty),
      'data-sticky': dataAttr(stickyHeader),
    }),

    getCaptionProps: () => normalize.element({
      ...parts.caption.attrs,
      id: ids.caption,
    }),

    getHeaderProps: () => normalize.element({
      ...parts.header.attrs,
      'role': 'rowgroup',
      // 吸顶只落标记，钉住的实现（position / inset / 层级）归皮肤：
      // 连接层不量 DOM，也就算不出该钉在哪
      'data-sticky': dataAttr(stickyHeader),
    }),

    // 键盘全在 body 上收口：行只管声明自己，一次冒泡一个处理器。
    // 收口点选 body 而不是 root，是为了让表头里的排序把手排在表体之前进 Tab 序列——
    // root 若占着兜底的 Tab 位，Tab 一进来就被转投到某一行，表头的把手全被跳过。
    getBodyProps: () => normalize.element({
      ...parts.body.attrs,
      'role': 'rowgroup',
      // 焦点在表体外时容器兜底进 Tab 序列，由 onFocus 转投给行。
      // 判据用 focusedRow 而非 anchor：anchor 可能指向一个已删掉或压根不在本页的行，
      // 那时没有任何行认领 tabindex=0，容器再一让位，整张表对键盘用户永久不可达
      'tabindex': focusedRow == null ? 0 : -1,
      'data-empty': dataAttr(isEmpty),
      'onKeyDown': (event: KeyboardEvent) => {
        const body = event.currentTarget as HTMLElement
        // 带 Ctrl/Cmd/Alt 的组合一律不归表格管（Ctrl+Home 之类归浏览器与读屏）
        if (event.ctrlKey || event.metaKey || event.altKey)
          return

        // 上下键与 Home/End 走可见数据行。轴固定 vertical：左右键在这里另有展开/收起的语义，
        // 不能被当成同轴导航吃掉
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
          // 不可展开、已展开、或禁用的行都改不了展开态，这个键也就不归表格管，放行给页面
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
          send({ type: 'ROW.SELECT', value: row.id })
        }
      },
      'onFocus': (event: FocusEvent) => {
        const body = event.currentTarget as HTMLElement
        // 只接管从表体外进来的焦点：体内 Shift+Tab 往外退时转投会把人困在表格里
        if (contains(body, event.relatedTarget as Node | null))
          return
        const list = rowEls(body)
        // 焦点进入表体应当落在选中行上；它不可停留（禁用、或压根不在本页）时退回首个可停留的行。
        // 全表禁用时两路都取不到，焦点就留在容器上
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

    // 表头行不进方向键序列（它不是数据行），因此也不认领 Tab 位：
    // 表头里真正要够得着的是排序与全选把手，它们各自占位
    getHeaderRowProps: () => normalize.element({
      ...parts.row.attrs,
      'role': 'row',
      'aria-rowindex': 1,
      'data-section': 'header',
    }),

    getFooterRowProps: () => normalize.element({
      ...parts.row.attrs,
      'role': 'row',
      // 脚注排在行号空间的最后一行；作者渲染了脚注却没给 footer 声明时这个号会越界，
      // 与 rows/columns 不同源是同一类作者错误
      'aria-rowindex': rowCount,
      'data-section': 'footer',
    }),

    getRowProps: (row) => {
      const meta = metaOf(row.value)
      const selectable = mode !== 'none'
      return normalize.element({
        ...parts.row.attrs,
        ...rowState(row.value),
        // 导航、选中与展开都以此为行身份
        [ITEM_VALUE_ATTR]: row.value,
        'role': 'row',
        // 行号的事实源是 rows + 展开集合，不是 DOM 顺序：
        // 不在 rows 里的行没有行号可言，宁可不报，也不能报一个编出来的数
        'aria-rowindex': dataRowIndex.get(row.value),
        // 选择关停时一个字都不提：省略表达的是"这不是可选行"，
        // 而 aria-selected="false" 说的是"可选，只是没选中"，两者不能混
        'aria-selected': selectable ? (isSelected(row.value) ? 'true' : 'false') : undefined,
        // 同理：不可展开的行不报 aria-expanded，那是"能展开却没展开"的意思
        'aria-expanded': meta?.expandable ? (meta.expanded ? 'true' : 'false') : undefined,
        'aria-controls': meta?.expandable ? detailId(row.value) : undefined,
        // 集合条目一律 aria-disabled，绝不输出原生 disabled：原生 disabled 不可聚焦、
        // 也不派发 click，禁用行就再也当不成方向键的起点
        'aria-disabled': isRowDisabled(row.value) ? 'true' : 'false',
        // 行级 roving tabindex：整张表只有锚点行留在 Tab 序列内
        'tabindex': anchor === row.value ? 0 : -1,
        'data-section': 'body',
        // 焦点是事实不是许可：禁用行被点到也记锚点，方向键才知道从哪儿起步
        'onFocus': () => send({ type: 'ROW.FOCUS', value: row.value }),
      })
    },

    getColumnHeaderProps: (column) => {
      const def = columnOf(column.value)
      const sortable = !!def?.sortable
      const direction = sortDirection(column.value)
      const size = columnSize(def?.width)
      return normalize.element({
        ...parts['column-header'].attrs,
        ...sortState(column.value),
        [ITEM_VALUE_ATTR]: column.value,
        'role': 'columnheader',
        'aria-colindex': columnIndex.get(column.value),
        // 只有参与排序的列才报方向；可排序但没在排的列报 none（"能排，此刻没排"），
        // 不可排序的列一个字都不提
        'aria-sort': sortable
          ? (direction === 'asc' ? 'ascending' : direction === 'desc' ? 'descending' : 'none')
          : undefined,
        'data-sortable': dataAttr(sortable),
        'data-sticky': dataAttr(!!def?.sticky),
        // 列宽由连接层写进内联 inline-size：那条轴归它，皮肤不再声明
        ...(size ? { style: { inlineSize: size } } : {}),
      })
    },

    getCellProps: (cell) => {
      const def = columnOf(cell.value)
      const size = columnSize(def?.width)
      return normalize.element({
        ...parts.cell.attrs,
        'role': 'gridcell',
        'aria-colindex': columnIndex.get(cell.value),
        // 表头与脚注的格子不给 row，也就没有选中/禁用可言
        'data-selected': cell.row != null ? dataAttr(isSelected(cell.row)) : undefined,
        'data-disabled': cell.row != null ? dataAttr(isRowDisabled(cell.row)) : undefined,
        'data-sticky': dataAttr(!!def?.sticky),
        ...(size ? { style: { inlineSize: size } } : {}),
      })
    },

    // 全选把手是三态的唯一载体：勾了一部分时读屏要念"部分选中"，
    // 而不是在 true/false 里二选一硬凑。它长在表头里、不属于 roving 行组，
    // 所以自己占一个 Tab 位——否则键盘用户永远够不着"全选"
    getSelectAllTriggerProps: () => normalize.element({
      ...parts['select-all-trigger'].attrs,
      'role': 'checkbox',
      'aria-checked': selectionState === 'all' ? 'true' : selectionState === 'some' ? 'mixed' : 'false',
      // 与集合条目同形：角色节点是普通元素而非原生控件，禁用后仍要能被聚焦，
      // 读屏才读得到这一列当前是"半选"
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
        // 作者写成 <button> 时按键会被浏览器再合成一次 click：拦下默认行为，
        // 否则同一次按键把全选切两回，等于没切。Space 不拦还会把页面滚一屏
        event.preventDefault()
        send({ type: 'SELECTION.ALL_TOGGLE' })
      },
    }),

    // 行内的两个把手都退出可及树、也不占 Tab 位：行自己已经报了 aria-selected 与
    // aria-expanded，把手再报一遍对读屏是纯噪音；更要紧的是每行多一个 Tab 位会让
    // "一行一个 Tab 位"的行级 roving 当场失效。键盘那一路由 Space 与左右方向键承担
    getRowSelectTriggerProps: row => normalize.element({
      ...parts['row-select-trigger'].attrs,
      ...rowState(row.value),
      'aria-hidden': 'true',
      'tabindex': -1,
      'onClick': (event: MouseEvent) => {
        if (mode === 'none' || isRowDisabled(row.value))
          return
        // tabindex=-1 的节点是点得到焦点的：不显式接管，焦点会停在这个 aria-hidden 的把手上
        focusOwnerRow(event.currentTarget as HTMLElement)
        send({ type: 'ROW.SELECT', value: row.value })
      },
    }),

    getSortTriggerProps: (column) => {
      const sortable = !!columnOf(column.value)?.sortable
      return normalize.element({
        ...parts['sort-trigger'].attrs,
        ...sortState(column.value),
        // 显式给角色：作者常把它写成 <span>，那样读屏只念得到一段文字，
        // 听不出这里能按。写成 <button> 时这个角色与原生一致，不产生第二种说法。
        // 当前排序方向由祖先 column-header 的 aria-sort 报出，不在这儿重复一遍
        'role': 'button',
        // 排序把手长在表头里、不属于 roving 行组，自己占一个 Tab 位；
        // 不可排序的列上它只是个装饰，退出 Tab 序列
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
      'aria-hidden': 'true',
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
        'data-state': meta?.expanded ? 'open' : 'closed',
        // 收起只加 hidden，不卸载作者节点：详情里的业务 DOM（输入框、滚动位置）得留着
        'hidden': !meta?.expanded || undefined,
      })
    },

    // 两个状态节点刻意不带 role：role=grid 的子节点只能是 row 与 rowgroup，
    // 凭空给它们一个角色反而让 grid 的结构失效；加载态的播报由 root 的 aria-busy 承担。
    // 节点常挂、只靠 hidden 显隐，作者写在里面的插图与按钮不会被反复建了又拆
    getEmptyStateProps: () => normalize.element({
      ...parts['empty-state'].attrs,
      hidden: !showEmpty || undefined,
    }),

    getLoadingStateProps: () => normalize.element({
      ...parts['loading-state'].attrs,
      hidden: !showLoading || undefined,
    }),
  }
}
