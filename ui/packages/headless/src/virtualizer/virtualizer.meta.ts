import type { ComponentMeta } from '../spec/types'

// viewport 缺一即违约：内核的尺寸观察与滚动监听都挂在它身上，没有它算不出任何区间。
// content 承载总长（滚动行程）与条目的定位上下文，缺了条目会以视口为参照乱飘。
// root 是外壳，方向与"正在滚"的标记挂在它身上，皮肤按它取用。
// item 可以一条都不写（空列表、或作者还没渲出来），因此不进必备清单。
//
// 这里一个角色语义都不规定：本组件只是个滚动窗口，role 与集合语义（含虚拟滚动下
// 必须自己补的 aria-setsize / aria-posinset）归住在里面的那个组件。
export const virtualizerMeta: ComponentMeta = {
  component: 'virtualizer',
  requiredParts: ['root', 'viewport', 'content'],
}
