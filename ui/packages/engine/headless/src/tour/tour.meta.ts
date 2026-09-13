/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 tour 相关实现。

import type { ComponentMeta } from '../spec/types'

// content 是引导唯一可显示的载体，必需。
// backdrop / spotlight / positioner / arrow / 四个按钮与 title/description/进度那三件全可缺省。
export const tourMeta: ComponentMeta = {
  component: 'tour',
  requiredParts: ['root', 'content'],
}
