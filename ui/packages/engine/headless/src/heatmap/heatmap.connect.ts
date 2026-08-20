import type { NormalizeProps, PropTypes } from '@xihan-ui/kernel'
import type { Service } from '@xihan-ui/machine'
import type {
  HeatmapCellDetails,
  HeatmapCellRef,
  HeatmapGrid,
  HeatmapMatrixGrid,
  HeatmapMonthGrid,
  HeatmapMonthWeekMeta,
  HeatmapNavIntent,
  HeatmapTipRect,
} from './heatmap.grid'
import type { HeatmapApi, HeatmapSchema } from './heatmap.types'
import { focusItem, ITEM_VALUE_ATTR, itemValue, queryItems, readDirection } from '@xihan-ui/behavior'
import { contains } from '@xihan-ui/kernel'
import { heatmapAnatomy, heatmapCellQuery } from './heatmap.anatomy'
import {
  buildHeatmapGrid,
  buildHeatmapMatrixGrid,
  buildHeatmapMonthGrid,
  heatmapDetailsOf,
  heatmapLevelPercent,
  heatmapMatrixKey,
  heatmapMatrixNavTarget,
  heatmapMonthNavTarget,
  heatmapNavIntentFromKey,
  heatmapNavTarget,
  heatmapTipPlacement,
  resolveHeatmapTip,
} from './heatmap.grid'
import { heatmapActiveCell, heatmapActiveTip, heatmapGridOptions } from './heatmap.machine'

const parts = heatmapAnatomy.build()

// 格子集合只在事件处理器里查活 DOM，顺序即文档序
const CELL_QUERY = heatmapCellQuery

/** 矩阵格子的行身份写在这个属性上：列身份占了 data-value，行身份只能另开一个。 */
const CELL_ROW_ATTR = 'data-row'

/**
 * 量出一格相对承载它的 root 的落点。
 * 只在事件处理器里调用：此刻 DOM 一定在场，而 connect 自身是在渲染期求值的。
 */
function measureTip(cell: HTMLElement, rtl: boolean): HeatmapTipRect | null {
  const host = cell.closest<HTMLElement>(parts.root.selector)
  if (!host)
    return null
  const hostRect = host.getBoundingClientRect()
  const cellRect = cell.getBoundingClientRect()
  // 绝对定位的偏移从内边距盒起算，量测起点要把 root 自己的描边刨掉
  return resolveHeatmapTip(
    {
      left: hostRect.left + host.clientLeft,
      top: hostRect.top + host.clientTop,
      width: host.clientWidth,
      height: host.clientHeight,
    },
    { left: cellRect.left, top: cellRect.top, width: cellRect.width, height: cellRect.height },
    host.scrollLeft,
    host.scrollTop,
    rtl,
  )
}

/** 按身份在活 DOM 里找那一格：日期形态认 data-value，矩阵形态还要再比一次行身份。 */
function findCell(container: HTMLElement, ref: HeatmapCellRef): HTMLElement | null {
  const items = queryItems(container, CELL_QUERY)
  if (ref.date != null)
    return items.find(el => itemValue(el) === ref.date) ?? null
  return items.find(el => itemValue(el) === ref.column && el.getAttribute(CELL_ROW_ATTR) === ref.row) ?? null
}

export function connectHeatmap<T extends PropTypes>(
  service: Service<HeatmapSchema>,
  normalize: NormalizeProps<T>,
): HeatmapApi<T> {
  const { context, prop, send } = service
  const options = heatmapGridOptions(prop)
  const variant = prop('variant') ?? 'calendar'

  // 只建当前形态那一张网格。日历网格在其余形态下仍给一张空的：
  // 它是默认插槽的载荷之一，作者拿到 null 得多写一道判空
  const grid: HeatmapGrid = variant === 'calendar'
    ? buildHeatmapGrid(options)
    : buildHeatmapGrid({
        levels: options.levels,
        thresholds: options.thresholds,
        firstDayOfWeek: options.firstDayOfWeek,
        locale: options.locale,
      })
  const monthGrid: HeatmapMonthGrid | null = variant === 'month' ? buildHeatmapMonthGrid(options) : null
  const matrixGrid: HeatmapMatrixGrid | null = variant === 'matrix' ? buildHeatmapMatrixGrid(options) : null

  const levels = monthGrid?.levels ?? matrixGrid?.levels ?? grid.levels

  const translations = prop('translations')
  const gridLabel = translations?.gridLabel ?? 'Activity heatmap'
  const cellLabel = translations?.cellLabel
    ?? ((details: HeatmapCellDetails) => `${details.count} on ${details.date}`)
  const matrixCellLabel = translations?.matrixCellLabel
    ?? ((details: HeatmapCellDetails) => `${details.count} at ${details.row} ${details.column}`)

  const monthOf = new Map(grid.months.map(month => [month.value, month]))
  const monthBlockOf = new Map((monthGrid?.blocks ?? []).map(block => [block.value, block]))
  // 月历的一行由「哪个月 + 月内第几周」定位，两个坐标拼成一把钥匙
  const monthRowOf = new Map<string, HeatmapMonthWeekMeta>(
    (monthGrid?.weeks ?? []).map(row => [`${row.month}#${row.week}`, row]),
  )

  const focusedCell = context.get('focusedCell') ?? null

  /**
   * roving 锚点：锚点还落在网格里就用它，否则退回文档序头一格。
   * 判据必须现算：区间或行列换了之后，上一次聚焦的那一格可能已经不在网格里，
   * 让它继续占着 tabindex=0 就等于没有任何一格认领 Tab 位，键盘再也进不来。
   */
  const anchorCell = ((): HeatmapCellRef | null => {
    if (matrixGrid) {
      const row = focusedCell?.row
      const column = focusedCell?.column
      if (row != null && column != null && matrixGrid.cells.has(heatmapMatrixKey(row, column)))
        return { row, column }
      const first = matrixGrid.firstCell
      return first ? { row: first.row, column: first.column } : null
    }
    const cells = monthGrid?.cells ?? grid.cells
    const date = focusedCell?.date
    if (date != null && cells.has(date))
      return { date }
    const first = monthGrid?.firstDate ?? grid.firstDate
    return first == null ? null : { date: first }
  })()

  // 详情的内容与落点都从这一份 context 里挑，且用的是同一条优先级：
  // 指针停着不动同时用键盘走格时，条上的数与条的位置说的才是同一格
  const activeContext = {
    hoveredCell: context.get('hoveredCell'),
    focusedCell,
    focusWithin: context.get('focusWithin'),
    dismissed: context.get('dismissed'),
  }
  const activeRef = heatmapActiveCell(activeContext)
  const activeCell = activeRef == null ? null : heatmapDetailsOf(options, activeRef)
  const tip = heatmapActiveTip({
    ...activeContext,
    hoverTip: context.get('hoverTip'),
    focusTip: context.get('focusTip'),
  })

  /** 详情条摆上边还是下边：按活跃那一格在本组行里的位置定，不量像素。 */
  const tipPlacement = ((): 'block-start' | 'block-end' => {
    if (activeRef == null)
      return 'block-end'
    if (matrixGrid) {
      const at = matrixGrid.cells.get(heatmapMatrixKey(activeRef.row ?? '', activeRef.column ?? ''))
      return heatmapTipPlacement(at?.rowIndex ?? 0, matrixGrid.rows.length)
    }
    if (monthGrid) {
      const at = monthGrid.cells.get(activeRef.date ?? '')
      const block = monthBlockOf.get(monthGrid.rowOf.get(activeRef.date ?? '')?.month ?? '')
      return heatmapTipPlacement(at?.weekIndex ?? 0, block?.weeks.length ?? 0)
    }
    const at = grid.cells.get(activeRef.date ?? '')
    return heatmapTipPlacement(at?.weekDay ?? 0, grid.rows.length)
  })()

  /** 档位换成色阶上的位置，皮肤按它兑色；档数随便改都不必再写选择器。 */
  const levelStyle = (level: number): Record<string, string> => ({
    '--xh-_heatmap-level': `${heatmapLevelPercent(level, levels)}%`,
  })

  /** 一步走到哪一格；走不动给 null（焦点原地不动）。 */
  const navTarget = (from: HeatmapCellRef, intent: HeatmapNavIntent): HeatmapCellRef | null => {
    if (matrixGrid) {
      const next = heatmapMatrixNavTarget(matrixGrid, { row: from.row ?? '', column: from.column ?? '' }, intent)
      return next == null ? null : { row: next.row, column: next.column }
    }
    const date = monthGrid
      ? heatmapMonthNavTarget(monthGrid, from.date ?? '', intent)
      : heatmapNavTarget(grid, from.date ?? '', intent)
    return date == null ? null : { date }
  }

  /** 网格该报几行几列；一格都没有时两个总数一并不写。 */
  const counts = ((): { rows: number, columns: number } => {
    if (matrixGrid) {
      const filled = matrixGrid.rows.length > 0 && matrixGrid.columns.length > 0
      // 表头行与行首那一列也算进总数，读屏报的行列号才对得上
      return filled
        ? { rows: matrixGrid.rows.length + 1, columns: matrixGrid.columns.length + 1 }
        : { rows: 0, columns: 0 }
    }
    if (monthGrid)
      return { rows: monthGrid.weeks.length, columns: 7 }
    return grid.rows.length > 0 ? { rows: grid.rows.length, columns: grid.weekCount } : { rows: 0, columns: 0 }
  })()

  /** 每格都挂的几个事件：指针进出与聚焦，几条路通向同一个详情。 */
  const cellHandlers = (ref: HeatmapCellRef): Record<string, (event: Event) => void> => {
    const open = (event: Event, type: 'CELL.ENTER' | 'CELL.FOCUS'): void => {
      const el = event.currentTarget as HTMLElement
      const rtl = (prop('dir') ?? readDirection(el)) === 'rtl'
      send({ type, cell: ref, tip: measureTip(el, rtl) })
    }
    return {
      onPointerEnter: event => open(event, 'CELL.ENTER'),
      onPointerLeave: () => send({ type: 'CELL.LEAVE' }),
      // 指针被系统抢走（拖拽、右键菜单）时也要收起，否则详情会一直挂着
      onPointerCancel: () => send({ type: 'CELL.LEAVE' }),
      onFocus: event => open(event, 'CELL.FOCUS'),
    }
  }

  return {
    variant,
    grid,
    monthGrid,
    matrixGrid,
    focusedCell,
    focusedDate: matrixGrid ? null : (focusedCell?.date ?? null),
    anchorCell,
    anchorDate: matrixGrid ? null : (anchorCell?.date ?? null),
    activeCell,
    detailOpen: activeRef != null,
    cellAt: date => (monthGrid?.cells ?? grid.cells).get(date) ?? null,
    setFocusedCell: cell => send({ type: 'FOCUS.SET', cell }),
    setFocusedDate: date => send({ type: 'FOCUS.SET', cell: date == null ? null : { date } }),

    getRootProps: () => normalize.element({
      ...parts.root.attrs,
      // 只在作者显式给了时才写：写死 ltr 会切断从 RTL 祖先继承来的方向
      'dir': prop('dir'),
      // 缺省的 calendar 档写在皮肤的基础规则里，不写时不产出这个属性
      'data-variant': prop('variant'),
      'data-tone': prop('tone'),
      'data-size': prop('size'),
    }),

    getGridProps: () => normalize.element({
      ...parts.grid.attrs,
      // 一片没有文字的方格子自己说不出这是什么图，名字只能从文案给
      'role': 'grid',
      'aria-label': gridLabel,
      // 格子只读，点不出值来
      'aria-readonly': 'true',
      // 一格都没有时两个总数一并不写：写成 0 会让读屏念出「0 行 0 列」，
      // 而这两个属性本就是用来描述「DOM 里只铺了一部分」的，没有行可描述时不该出现
      'aria-rowcount': counts.rows > 0 ? counts.rows : undefined,
      'aria-colcount': counts.rows > 0 ? counts.columns : undefined,
      // 一格都没有时容器兜底占住 Tab 位，否则 Tab 序列里整块凭空消失
      'tabindex': anchorCell == null ? 0 : -1,
      // 键盘全在网格上收口：格子只管声明自己，一次冒泡一个处理器
      'onKeyDown': (event: KeyboardEvent) => {
        const container = event.currentTarget as HTMLElement
        // 详情开着时 Escape 先收起它。不 preventDefault：外层对话框的关闭仍归它自己管
        if (event.key === 'Escape') {
          if (activeRef != null)
            send({ type: 'DETAIL.DISMISS' })
          return
        }
        // 横轴沿 inline 排开，视觉次序由祖先链上任意一处 dir 或 CSS direction 决定，
        // 只能在事件那一刻从 DOM 现读；prop('dir') 只作显式覆盖
        const dir = prop('dir') ?? readDirection(container)
        const intent = heatmapNavIntentFromKey(event, dir)
        // 返回 null 表示该键不归导航管，此时绝不 preventDefault（页面滚动与读屏要用）
        if (!intent)
          return
        // 一格都没有时导航无从谈起，键留给页面，别把滚动一起吞掉
        if (anchorCell == null)
          return
        // 键归网格管就先拦下：走到边界没处可去时也不该让页面跟着滚
        event.preventDefault()
        const next = navTarget(anchorCell, intent)
        if (next == null)
          return
        const target = findCell(container, next)
        if (!target)
          return
        focusItem(target)
        send({ type: 'CELL.FOCUS', cell: next, tip: measureTip(target, dir === 'rtl') })
      },
      'onFocus': (event: FocusEvent) => {
        // 焦点落在网格自己身上（点了格子之间的空隙、或被程序聚焦）就转投给锚点那一格
        if (event.target !== event.currentTarget || anchorCell == null)
          return
        const container = event.currentTarget as HTMLElement
        focusItem(findCell(container, anchorCell))
      },
      'onFocusOut': (event: FocusEvent) => {
        const container = event.currentTarget as HTMLElement
        // 网格内部换格子不算离场，详情要跟着焦点继续显示
        if (contains(container, event.relatedTarget as Node | null))
          return
        send({ type: 'CELL.BLUR' })
      },
    }),

    // 一个自然月一块。块里除了周行还有月份名与星期名两条坐标轴，它们都藏起来了，
    // 读屏看到的这一块就只剩合法的几行
    getMonthBlockProps: block => normalize.element({
      ...parts['month-block'].attrs,
      [ITEM_VALUE_ATTR]: block.value,
      'role': 'rowgroup',
      'aria-label': monthBlockOf.get(block.value)?.long ?? block.value,
    }),

    getRowProps: (row) => {
      // 矩阵形态：不给行身份即表头行，它装着一排列名，是真正的一行
      if (matrixGrid) {
        if (row.row == null) {
          return normalize.element({
            ...parts.row.attrs,
            'role': 'row',
            'aria-rowindex': 1,
          })
        }
        const meta = matrixGrid.rows.find(item => item.value === row.row)
        return normalize.element({
          ...parts.row.attrs,
          [ITEM_VALUE_ATTR]: row.row,
          'role': 'row',
          // 表头行占掉第 1 行，数据行从第 2 行起算
          'aria-rowindex': meta ? meta.index + 2 : undefined,
        })
      }

      // 月历形态：不给周序即块内那条星期名坐标轴，整条藏起来
      if (monthGrid) {
        if (row.week == null) {
          return normalize.element({
            ...parts.row.attrs,
            'aria-hidden': 'true',
          })
        }
        const meta = monthRowOf.get(`${row.month ?? ''}#${row.week}`)
        return normalize.element({
          ...parts.row.attrs,
          'role': 'row',
          'aria-rowindex': meta ? meta.rowIndex + 1 : undefined,
          'data-week': String(row.week),
          // 这一周里 1 号之前的那几个星期几空着，整行往后错这么多列
          'style': { '--xh-_heatmap-row-offset': String(meta?.offset ?? 0) },
        })
      }

      return normalize.element({
        ...parts.row.attrs,
        // 星期行进网格语义；月份行在网格之外，它只是一条对齐用的横排，不该冒充表格行
        'role': row.weekDay == null ? undefined : 'row',
        'aria-rowindex': row.weekDay == null ? undefined : row.weekDay + 1,
        'data-week-day': row.weekDay == null ? undefined : String(row.weekDay),
        // 区间起点不在周首日时，排在它前面的几行没有第 0 列的格子，整行往后错一列。
        // 月份行不写这个键，而不是给 undefined：给了 undefined 的 style 在 Web Components
        // 侧会把作者写在这一行上的整条内联样式删掉
        ...(row.weekDay == null
          ? {}
          : { style: { '--xh-_heatmap-row-offset': String(grid.rows[row.weekDay]?.offset ?? 0) } }),
      })
    },

    // 星期名与月份名都是给眼睛看的坐标轴：每格自己念得出完整日期与计数，
    // 读屏再把两条轴念一遍只是噪音，一律藏起来
    getWeekDayLabelProps: label => normalize.element({
      ...parts['week-day-label'].attrs,
      'aria-hidden': 'true',
      'data-week-day': label.weekDay == null ? undefined : String(label.weekDay),
    }),

    getMonthLabelProps: month => normalize.element({
      ...parts['month-label'].attrs,
      [ITEM_VALUE_ATTR]: month.value,
      'aria-hidden': 'true',
      // 日历形态里标签横跨这个月占的那几列，宽度由皮肤按列数算；
      // 月历形态里它是一块的标题，占满整块，列数写 0 让皮肤走另一条规则
      'style': {
        '--xh-_heatmap-month-weeks': String(monthGrid ? 0 : (monthOf.get(month.value)?.weeks ?? 1)),
      },
    }),

    // 矩阵的两条坐标轴是真表头：行名是 rowheader、列名是 columnheader，
    // 读屏报某一格时会连着念出它属于哪一行哪一列
    getRowLabelProps: (label) => {
      if (label.value == null) {
        // 表头行行首那个角落占位，只负责让列名与格子对齐
        return normalize.element({
          ...parts['row-label'].attrs,
          'aria-hidden': 'true',
        })
      }
      return normalize.element({
        ...parts['row-label'].attrs,
        [ITEM_VALUE_ATTR]: label.value,
        'role': 'rowheader',
        'aria-colindex': 1,
      })
    },

    getColumnLabelProps: (label) => {
      const meta = matrixGrid?.columns.find(item => item.value === label.value)
      return normalize.element({
        ...parts['column-label'].attrs,
        [ITEM_VALUE_ATTR]: label.value,
        'role': 'columnheader',
        // 行名占掉第 1 列，数据列从第 2 列起算
        'aria-colindex': meta ? meta.index + 2 : undefined,
      })
    },

    getCellProps: (cell) => {
      if (matrixGrid) {
        const row = cell.row ?? ''
        const column = cell.column ?? ''
        const meta = matrixGrid.cells.get(heatmapMatrixKey(row, column))
        const count = meta?.count ?? 0
        const level = meta?.level ?? 0
        return normalize.element({
          ...parts.cell.attrs,
          // 列身份占 data-value，行身份另开一个：两者合起来才定位得到一格
          [ITEM_VALUE_ATTR]: column,
          [CELL_ROW_ATTR]: row,
          'role': 'gridcell',
          'aria-label': matrixCellLabel({
            date: '',
            row,
            column,
            count,
            level,
            percent: heatmapLevelPercent(level, levels),
          }),
          'aria-colindex': meta ? meta.columnIndex + 2 : undefined,
          'tabindex': anchorCell?.row === row && anchorCell.column === column ? 0 : -1,
          'data-level': String(level),
          'style': levelStyle(level),
          ...cellHandlers({ row, column }),
        })
      }

      const date = cell.date ?? ''
      const meta = (monthGrid?.cells ?? grid.cells).get(date)
      const count = meta?.count ?? 0
      const level = meta?.level ?? 0
      return normalize.element({
        ...parts.cell.attrs,
        // 导航与锚点都以此为格子身份
        [ITEM_VALUE_ATTR]: date,
        'role': 'gridcell',
        'aria-label': cellLabel({ date, row: '', column: '', count, level, percent: heatmapLevelPercent(level, levels) }),
        // 各行的格子数不一样齐（首行可能少一格），列号显式给出来才对得上
        'aria-colindex': meta ? (monthGrid ? meta.weekDay + 1 : meta.weekIndex + 1) : undefined,
        // 锚点那一格独占 Tab 序列位
        'tabindex': anchorCell?.date === date ? 0 : -1,
        'data-level': String(level),
        'style': levelStyle(level),
        ...cellHandlers({ date }),
      })
    },

    // 详情条不进读屏：每格的可及名字已经把日期/行列与数值念全了，
    // 再念一遍是重复。写进条里的文字必须与 cellLabel 同源，别只写在这里
    getTooltipProps: () => normalize.element({
      ...parts.tooltip.attrs,
      'aria-hidden': 'true',
      // 收起时靠 hidden 属性，皮肤的 [hidden] 兜底把它藏掉
      'hidden': activeRef == null || undefined,
      'data-placement': activeRef == null ? undefined : tipPlacement,
      // 量过才给这个键：给 undefined 会把作者写在条上的整条内联样式删掉
      ...(tip == null
        ? {}
        : {
            style: {
              '--xh-_heatmap-tip-x': `${tip.inlineStart}px`,
              '--xh-_heatmap-tip-y': `${tip.blockStart}px`,
              '--xh-_heatmap-tip-w': `${tip.inlineSize}px`,
              '--xh-_heatmap-tip-h': `${tip.blockSize}px`,
            },
          }),
    }),

    // 图例本身不藏：作者要在色块旁写「少 → 多」这句方向说明，落点就在这里，
    // 整块藏起来那句话对读屏用户就没了
    getLegendProps: () => normalize.element({ ...parts.legend.attrs }),

    getLegendItemProps: item => normalize.element({
      ...parts['legend-item'].attrs,
      // 色块是对照条，每格自己念得出计数，读屏再念一遍档位没有信息量
      'aria-hidden': 'true',
      'data-level': String(item.level),
      'style': levelStyle(item.level),
    }),
  }
}
