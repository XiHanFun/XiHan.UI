import type { ComponentMeta } from '../spec/types'

export const resizableMeta: ComponentMeta = {
  component: 'resizable',
  // handle 不列：只读不可调的形态是正当的，作者可以一个把手都不放
  requiredParts: ['root'],
}
