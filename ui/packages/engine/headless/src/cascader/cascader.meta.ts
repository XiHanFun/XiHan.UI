import type { ComponentMeta } from '../spec/types'

// 候选列与条目只在有数据时出现，合法空态/首次加载不要求虚构 column 或 item。
// label/positioner/indicator/clear-trigger 与状态部件由作者按需提供。
export const cascaderMeta: ComponentMeta = {
  component: 'cascader',
  requiredParts: ['trigger', 'content'],
}
