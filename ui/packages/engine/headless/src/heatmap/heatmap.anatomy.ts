import type { ItemQuery } from '@xihan-ui/behavior'
import { createAnatomy } from '@xihan-ui/kernel'

// 三种形态共用同一套部件，各自只用得上其中一部分：
// 日历形态是月份行 + 七行星期；月历形态在网格里再分出月块，块内一行是一周；
// 矩阵形态用 row-label 与 column-label 两条坐标轴。
// tooltip 是悬停/聚焦时显示的详情条，legend 是给眼睛看的色阶对照条，两者都可以不写。
// legend-label 是对照条两端的那两个字（少 / 多），一排色块自己说不出哪头是多。
export const heatmapAnatomy = createAnatomy('heatmap', [
  'root',
  'grid',
  'month-block',
  'row',
  'week-day',
  'month-label',
  'row-label',
  'column-label',
  'cell',
  'tooltip',
  'legend',
  'legend-label',
  'legend-item',
])

/** 键盘落点在事件那一刻按它现查活 DOM：格子的身份是写在 data-value 上的日期或列名。 */
export const heatmapCellQuery: ItemQuery = { scope: heatmapAnatomy.name, part: 'cell' }
