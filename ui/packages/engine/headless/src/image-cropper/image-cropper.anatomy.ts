import { createAnatomy } from '@xihan-ui/core'

// viewport 是量尺子的那个盒子：图片铺满它，裁切框的坐标以它的矩形与图片自然尺寸换算。
// grid 与八个 crop-handle 都住在 crop-area 里，跟着裁切框一起被缩放与旋转带走。
export const imageCropperAnatomy = createAnatomy('image-cropper', [
  'root',
  'viewport',
  'image',
  'crop-area',
  'crop-handle',
  'grid',
  'hidden-input',
])
