import type { ComponentMeta } from '../spec/types'

// item 与 item-text 不列为必备：候选是调用方过滤后的结果，一条不剩是正常态。
// positioner 也可缺省——不摆它就没有浮层容器可定位，但组件仍是一个能打字的输入框。
export const mentionMeta: ComponentMeta = {
  component: 'mention',
  requiredParts: ['root', 'input', 'content'],
}
