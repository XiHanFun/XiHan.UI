import type { ComponentMeta } from '../spec/types'

// root、pre、code 三者必需，lang-label 为纯装饰可缺省。
export const codeBlockMeta: ComponentMeta = {
  component: 'code-block',
  requiredParts: ['root', 'pre', 'code'],
}
