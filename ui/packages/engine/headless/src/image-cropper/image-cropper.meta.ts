import type { ComponentMeta } from '../spec/types'

// viewport 缺了就没有量坐标的尺子，image 缺了没有可裁的东西，crop-area 缺了裁切框无处安放。
// 把手与参考线是可选装饰：只用键盘调整尺寸时可以一个把手都不放，隐藏输入也只有进表单才需要。
export const imageCropperMeta: ComponentMeta = {
  component: 'image-cropper',
  requiredParts: ['root', 'viewport', 'image', 'crop-area'],
}
