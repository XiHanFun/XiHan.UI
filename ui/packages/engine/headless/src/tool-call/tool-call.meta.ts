import type { ComponentMeta } from '../spec/types'

// root / trigger / content 三者必需；approval 与 input/output/error 按阶段取舍，
// indicator/name/summary/status/duration 是 trigger 内的排版位，都可缺省。
export const toolCallMeta: ComponentMeta = {
  component: 'tool-call',
  requiredParts: ['root', 'trigger', 'content'],
}
