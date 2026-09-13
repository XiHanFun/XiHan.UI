/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 markdown stream 相关实现。

import type { ComponentMeta } from '../spec/types'

// root 与 content 必需；block 按数据铺开，空正文时一个都没有；live-region 只在开了播报时渲。
export const markdownStreamMeta: ComponentMeta = {
  component: 'markdown-stream',
  requiredParts: ['root', 'content'],
}
