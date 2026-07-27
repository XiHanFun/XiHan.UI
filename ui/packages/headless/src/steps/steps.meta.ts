import type { ComponentMeta } from '../spec/types'

// list 缺省则 tablist 语义与方向键导航都无处安放；item/trigger 是一步的最小可用形态。
// indicator / title / description / separator / content 全是可选：
// 只做进度指示（不切面板）的步骤条完全可以一个 content 都不渲染。
export const stepsMeta: ComponentMeta = {
  component: 'steps',
  requiredParts: ['root', 'list', 'item', 'trigger'],
}
