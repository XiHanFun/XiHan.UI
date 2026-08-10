import type { ComponentMeta } from '../spec/types'

export const watermarkMeta: ComponentMeta = {
  component: 'watermark',
  // 只有根是必备的：印子铺在根的伪元素上，不写 content 也是一块盖了水印的地
  requiredParts: ['root'],
}
