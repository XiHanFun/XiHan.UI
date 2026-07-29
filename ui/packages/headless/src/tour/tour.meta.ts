import type { ComponentMeta } from '../spec/types'

// content 是引导唯一可显示的载体，必需。
// backdrop / spotlight / positioner / arrow / 四个按钮与 title/description/progress-text 全可缺省。
export const tourMeta: ComponentMeta = {
  component: 'tour',
  requiredParts: ['root', 'content'],
}
