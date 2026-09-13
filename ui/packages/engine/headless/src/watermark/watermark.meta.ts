/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 watermark 相关实现。

import type { ComponentMeta } from '../spec/types'

export const watermarkMeta: ComponentMeta = {
  component: 'watermark',
  // 只有根是必备的：印子铺在根的伪元素上，不写 content 也是一块盖了水印的地
  requiredParts: ['root'],
}
