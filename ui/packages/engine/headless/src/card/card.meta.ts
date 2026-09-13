/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 card 相关实现。

import type { ComponentMeta } from '../spec/types'

export const cardMeta: ComponentMeta = {
  component: 'card',
  // 只有根是必备的：头、内容、脚按需组合，图片等媒体直接作为普通子节点放入。
  requiredParts: ['root'],
}
