import type { ComponentMeta } from '../spec/types'

// item 不列为必备：候选是调用方过滤后的结果，空结果是正常态（此时显形的是 empty）。
// label / trigger / clear-trigger / positioner / 分组三件套都可缺省。
export const comboboxMeta: ComponentMeta = {
  component: 'combobox',
  requiredParts: ['control', 'input', 'content'],
}
