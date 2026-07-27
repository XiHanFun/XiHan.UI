import type { ComponentMeta } from '../spec/types'

// input 与 content 缺一即违约（role=combobox、aria-controls 与键盘入口全在这两处）；
// control 是浮层的定位锚点，没有它列表落不了位。
// item 不列为必备：候选是调用方过滤后的结果，空结果是正常态（此时该显形的是 empty）。
// label / trigger / clear-trigger / positioner / 分组三件套都可缺省。
export const comboboxMeta: ComponentMeta = {
  component: 'combobox',
  requiredParts: ['control', 'input', 'content'],
}
