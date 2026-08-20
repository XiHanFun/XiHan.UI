import type { ComponentMeta } from '../spec/types'

// root 缺席则三轴（语气、尺寸）无处安放；grid 缺席则表格语义、可及名字与键盘收口都无处安放。
// 格子、星期名、月份名、图例都是按数据铺出来的，区间为空时一个都不该有，不进必备清单。
export const heatmapMeta: ComponentMeta = {
  component: 'heatmap',
  requiredParts: ['root', 'grid'],
}
