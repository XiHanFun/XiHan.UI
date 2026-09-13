/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 image viewer 相关实现。

import type { ComponentMeta } from '../spec/types'

// content 与 image 是看片的最小组合；工具条、翻页与计数全可缺省。
export const imageViewerMeta: ComponentMeta = {
  component: 'image-viewer',
  requiredParts: ['content', 'image'],
}
