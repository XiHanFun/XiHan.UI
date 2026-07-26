import type { ComponentMeta } from '../spec/types'

// content 未渲染即违约；trigger 缺省时无从切换。
export const collapsibleMeta: ComponentMeta = {
  component: 'collapsible',
  requiredParts: ['content'],
}
