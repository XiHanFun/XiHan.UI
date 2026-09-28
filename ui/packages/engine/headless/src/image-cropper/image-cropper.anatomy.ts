/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 image cropper 相关实现。

import { createAnatomy } from '@xihan-ui/core'

// viewport 是量尺子的那个盒子：图片铺满它，裁切框的坐标以它的矩形与图片自然尺寸换算。
// grid 与八个 crop-handle 都住在 crop-area 里，跟着裁切框一起被缩放、旋转与翻转带走；
// flip-trigger 是两颗按轴翻转的开关钮，与两条滑杆一样住在视口之外。
export const imageCropperAnatomy = createAnatomy('image-cropper', [
  'root',
  'viewport',
  'image',
  'crop-area',
  'crop-handle',
  'grid',
  'zoom-slider',
  'rotate-slider',
  'flip-trigger',
  'hidden-input',
])
