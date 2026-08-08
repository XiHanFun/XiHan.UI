import type { ComponentMeta } from '../spec/types'

// glyph 是可选的：不写 = 不授权元素在这里生成内容，作者自己往 svg 里写几何或 <use>。
export const iconMeta: ComponentMeta = {
  component: 'icon',
  requiredParts: ['root'],
}
