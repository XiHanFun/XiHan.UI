import type { ComponentMeta } from '../spec/types'

// root/label 与分组三件套可缺省；合法空态与首次加载允许没有 item。
export const listboxMeta: ComponentMeta = {
  component: 'listbox',
  requiredParts: ['content'],
}
