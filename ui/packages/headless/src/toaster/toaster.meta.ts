import type { ComponentMeta } from '../spec/types'

// root 承载地标语义，group 是通知真正落脚的那一摞，两者必需。
export const toasterMeta: ComponentMeta = {
  component: 'toaster',
  requiredParts: ['root', 'group'],
}
