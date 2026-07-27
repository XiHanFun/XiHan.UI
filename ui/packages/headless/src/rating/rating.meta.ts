import type { ComponentMeta } from '../spec/types'

// label 与 hidden-input 是可选的：没有标题也能用 aria-label 顶上，
// 不进表单时那份影子输入纯属多余。control 与 item 缺一不可——少了它们就没有 radiogroup。
export const ratingMeta: ComponentMeta = {
  component: 'rating',
  requiredParts: ['root', 'control', 'item'],
}
