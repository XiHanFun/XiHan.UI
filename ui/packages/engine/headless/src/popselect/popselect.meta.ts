import type { ComponentMeta } from '../spec/types'

// trigger、content、item 必需：aria-controls 的两端与「有得可选」这件事都靠它们。
// root 与 positioner 都承载视觉轴，positioner 另带坐标，缺了各自降级但不违约。
export const popselectMeta: ComponentMeta = {
  component: 'popselect',
  requiredParts: ['trigger', 'content', 'item'],
}
