import type { ComponentMeta } from '../spec/types'

// trigger 缺省则无从展开；content 缺省则展开无物可示。
export const accordionMeta: ComponentMeta = {
  component: 'accordion',
  requiredParts: ['trigger', 'content'],
}
