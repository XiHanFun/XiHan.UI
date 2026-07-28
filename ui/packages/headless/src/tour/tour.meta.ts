import type { ComponentMeta } from '../spec/types'

// content 未渲染即违约（引导没有任何可显示的载体）。
// backdrop / spotlight / positioner / arrow / 四个按钮与 title/description/progress-text 全可缺省：
// 只想要一个居中的、点"下一步"往前走的极简引导，一个 spotlight 都不必渲染。
export const tourMeta: ComponentMeta = {
  component: 'tour',
  requiredParts: ['root', 'content'],
}
