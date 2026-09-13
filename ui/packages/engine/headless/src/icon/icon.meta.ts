/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 icon 相关实现。

import type { ComponentMeta } from '../spec/types'

// glyph 是可选的：不写 = 不授权元素在这里生成内容，作者自己往 svg 里写几何或 <use>。
export const iconMeta: ComponentMeta = {
  component: 'icon',
  requiredParts: ['root'],
}
