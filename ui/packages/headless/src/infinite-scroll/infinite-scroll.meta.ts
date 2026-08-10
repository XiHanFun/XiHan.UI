import type { ComponentMeta } from '../spec/types'

// 两个都必备：缺了 sentinel 就没有可观察的目标，整套触发无从谈起。
export const infiniteScrollMeta: ComponentMeta = {
  component: 'infinite-scroll',
  requiredParts: ['root', 'sentinel'],
}
