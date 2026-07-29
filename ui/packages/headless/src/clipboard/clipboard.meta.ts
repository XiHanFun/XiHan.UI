import type { ComponentMeta } from '../spec/types'

// label / control / input / indicator 都可省。
export const clipboardMeta: ComponentMeta = {
  component: 'clipboard',
  requiredParts: ['root', 'trigger'],
}
