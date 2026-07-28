import type { ComponentMeta } from '../spec/types'

// root 缺一即违约：指针进出的判据挂在它身上，hover 那一路的显隐会整个失灵。
// viewport 是真正滚动的那层，尺寸、滚动量与 scroll 事件全取自它；
// content 是内容包裹层，横向溢出靠它撑出宽度，尺寸变化也观察它。
// scrollbar / thumb / corner 都可缺省——只要竖向滚动条的写一个 scrollbar 即可，
// 一个都不写也仍是个能用的滚动容器（只是没有自绘滚动条）。
export const scrollAreaMeta: ComponentMeta = {
  component: 'scroll-area',
  requiredParts: ['root', 'viewport', 'content'],
}
