import type { ComponentMeta } from '../spec/types'

// viewport 承载内核的尺寸观察与滚动监听，content 承载总长与条目的定位上下文，
// root 承载方向与正在滚的标记，三者必需；item 可以一条都不写，不进必备清单。
// 这里不规定任何角色语义：role 与集合语义（含 aria-setsize / aria-posinset）归住在里面的那个组件。
export const virtualizerMeta: ComponentMeta = {
  component: 'virtualizer',
  requiredParts: ['root', 'viewport', 'content'],
}
