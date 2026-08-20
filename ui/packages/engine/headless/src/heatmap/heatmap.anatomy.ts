import type { ItemQuery } from '@xihan-ui/behavior'
import { createAnatomy } from '@xihan-ui/kernel'

// root 之下两条横排：月份行在网格之外（它只是一条对齐用的坐标轴，不进网格语义），
// grid 里是七行星期，每行行首一个星期名、其后是这一星期几逐周的格子。
// legend 是给眼睛看的色阶对照条。
export const heatmapAnatomy = createAnatomy('heatmap', [
  'root',
  'grid',
  'row',
  'week-day-label',
  'month-label',
  'cell',
  'legend',
  'legend-item',
])

/** 键盘落点在事件那一刻按它现查活 DOM：格子的身份是写在 data-value 上的日期。 */
export const heatmapCellQuery: ItemQuery = { scope: heatmapAnatomy.name, part: 'cell' }
