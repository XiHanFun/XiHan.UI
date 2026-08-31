import type { ComponentMeta } from '../spec/types'

// root、pre、code 三者必需；header 系按数据有无渲染，line 系按行铺开，fold-trigger 只在可折叠时出现。
export const codeViewMeta: ComponentMeta = {
  component: 'code-view',
  requiredParts: ['root', 'pre', 'code'],
}
