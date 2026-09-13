/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 markdown stream 相关实现。

import { createAnatomy } from '@xihan-ui/core'

// root 是外壳并承载流式标记，content 是正文包裹层，block 是一个顶层块，
// live-region 是视觉隐藏的原子播报区。
export const markdownStreamAnatomy = createAnatomy('markdown-stream', ['root', 'content', 'block', 'live-region'])
