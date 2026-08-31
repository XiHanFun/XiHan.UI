import type { ComponentMeta } from '../spec/types'

// root / trigger / content 三者必需；indicator、label 与 duration 都是排版位，可缺省。
export const reasoningMeta: ComponentMeta = {
  component: 'reasoning',
  requiredParts: ['root', 'trigger', 'content'],
}
