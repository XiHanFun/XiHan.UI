import type { ComponentMeta } from '../spec/types'

// control 缺省则没有落笔的地方，path 缺省则画了也看不见。
// 标题、基准线、清空按钮与表单影子都是可选装饰，不进这份清单。
export const signaturePadMeta: ComponentMeta = {
  component: 'signature-pad',
  requiredParts: ['root', 'control', 'path'],
}
