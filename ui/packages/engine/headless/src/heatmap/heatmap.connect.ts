import type { NormalizeProps, PropTypes } from '@xihan-ui/kernel'
import type { Service } from '@xihan-ui/machine'
import type { HeatmapApi, HeatmapCellFocusDetails, HeatmapSchema } from './heatmap.types'
import { focusItem, ITEM_VALUE_ATTR, itemValue, queryItems, readDirection } from '@xihan-ui/behavior'
import { heatmapAnatomy, heatmapCellQuery } from './heatmap.anatomy'
import { buildHeatmapGrid, heatmapLevelPercent, heatmapNavIntentFromKey, heatmapNavTarget } from './heatmap.grid'
import { heatmapGridOptions } from './heatmap.machine'

const parts = heatmapAnatomy.build()

// 格子集合只在事件处理器里查活 DOM，顺序即文档序
const CELL_QUERY = heatmapCellQuery

export function connectHeatmap<T extends PropTypes>(
  service: Service<HeatmapSchema>,
  normalize: NormalizeProps<T>,
): HeatmapApi<T> {
  const { context, prop, send } = service
  const grid = buildHeatmapGrid(heatmapGridOptions(prop))

  const translations = prop('translations')
  const gridLabel = translations?.gridLabel ?? 'Activity heatmap'
  const cellLabel = translations?.cellLabel
    ?? ((details: HeatmapCellFocusDetails) => `${details.count} on ${details.date}`)

  const monthOf = new Map(grid.months.map(month => [month.value, month]))

  const focusedDate = context.get('focusedDate') ?? null
  // roving 锚点：锚点还落在区间里就用它，否则退回文档序头一格。
  // 判据必须现算：区间换了之后，上一次聚焦的那天可能已经不在网格里，
  // 让它继续占着 tabindex=0 就等于没有任何一格认领 Tab 位，键盘再也进不来
  const anchorDate = focusedDate != null && grid.cells.has(focusedDate) ? focusedDate : grid.firstDate

  /** 档位换成色阶上的位置，皮肤按它兑色；档数随便改都不必再写选择器。 */
  const levelStyle = (level: number): Record<string, string> => ({
    '--xh-_heatmap-level': `${heatmapLevelPercent(level, grid.levels)}%`,
  })

  return {
    grid,
    focusedDate,
    anchorDate,
    cellAt: date => grid.cells.get(date) ?? null,
    setFocusedDate: date => send({ type: 'FOCUS.SET', date }),

    getRootProps: () => normalize.element({
      ...parts.root.attrs,
      // 只在作者显式给了时才写：写死 ltr 会切断从 RTL 祖先继承来的方向
      'dir': prop('dir'),
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
      'aria-rowcount': grid.rows.length > 0 ? grid.rows.length : undefined,
      'aria-colcount': grid.rows.length > 0 ? grid.weekCount : undefined,
      // 一格都没有时容器兜底占住 Tab 位，否则 Tab 序列里整块凭空消失
      'tabindex': anchorDate == null ? 0 : -1,
      // 键盘全在网格上收口：格子只管声明自己，一次冒泡一个处理器
      'onKeyDown': (event: KeyboardEvent) => {
        const container = event.currentTarget as HTMLElement
        // 列沿 inline 轴排开，视觉次序由祖先链上任意一处 dir 或 CSS direction 决定，
        // 只能在事件那一刻从 DOM 现读；prop('dir') 只作显式覆盖
        const intent = heatmapNavIntentFromKey(event, prop('dir') ?? readDirection(container))
        // 返回 null 表示该键不归导航管，此时绝不 preventDefault（页面滚动与读屏要用）
        if (!intent)
          return
        // 一格都没有时导航无从谈起，键留给页面，别把滚动一起吞掉
        if (anchorDate == null)
          return
        // 键归网格管就先拦下：走到边界没处可去时也不该让页面跟着滚
        event.preventDefault()
        const next = heatmapNavTarget(grid, anchorDate, intent)
        if (next == null)
          return
        const target = queryItems(container, CELL_QUERY).find(el => itemValue(el) === next) ?? null
        if (!target)
          return
        focusItem(target)
        send({ type: 'CELL.FOCUS', date: next })
      },
      'onFocus': (event: FocusEvent) => {
        // 焦点落在网格自己身上（点了格子之间的空隙、或被程序聚焦）就转投给锚点那一格
        if (event.target !== event.currentTarget || anchorDate == null)
          return
        const container = event.currentTarget as HTMLElement
        const target = queryItems(container, CELL_QUERY).find(el => itemValue(el) === anchorDate) ?? null
        focusItem(target)
      },
    }),

    getRowProps: row => normalize.element({
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
    }),

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
      // 标签横跨这个月占的那几列，宽度由皮肤按列数算
      'style': { '--xh-_heatmap-month-weeks': String(monthOf.get(month.value)?.weeks ?? 1) },
    }),

    getCellProps: (cell) => {
      const meta = grid.cells.get(cell.date)
      const count = meta?.count ?? 0
      const level = meta?.level ?? 0
      return normalize.element({
        ...parts.cell.attrs,
        // 导航与锚点都以此为格子身份
        [ITEM_VALUE_ATTR]: cell.date,
        'role': 'gridcell',
        'aria-label': cellLabel({ date: cell.date, count, level }),
        // 各行的格子数不一样齐（首行可能少一格），列号显式给出来才对得上
        'aria-colindex': meta ? meta.weekIndex + 1 : undefined,
        // 锚点那一格独占 Tab 序列位
        'tabindex': anchorDate === cell.date ? 0 : -1,
        'data-level': String(level),
        'style': levelStyle(level),
        'onFocus': () => send({ type: 'CELL.FOCUS', date: cell.date }),
      })
    },

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
