import type { ComponentMeta } from '../spec/types'

// 没有滚动容器与内容容器，粘底就无从谈起：句柄的监听目标与观察目标各缺一个，
// 整个组件退化成一层空壳。scroll-button 与 live-region 是可选增强——
// 前者缺了仍能用手滚回底部，后者缺了只是不播报。
export const threadMeta: ComponentMeta = {
  component: 'thread',
  requiredParts: ['root', 'viewport', 'content'],
}
