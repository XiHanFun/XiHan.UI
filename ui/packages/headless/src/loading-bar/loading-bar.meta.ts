import type { ComponentMeta } from '../spec/types'

// root 是 progressbar 语义与状态属性的落点，range 是唯一承载宽度的节点——
// 少了它这条进度条就只剩一道空槽，什么都表达不了。
// track 可省：只要一条会长的色带，不要背景槽，也是成立的写法。
export const loadingBarMeta: ComponentMeta = {
  component: 'loading-bar',
  requiredParts: ['root', 'range'],
}
