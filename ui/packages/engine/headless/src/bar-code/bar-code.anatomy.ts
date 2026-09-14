/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 bar code 相关实现。

import { createAnatomy } from '@xihan-ui/core'

// 只有一个角色节点：承载整张码的 <svg>。条合成一条 <path>，人读文字每段一个 <text>——
// 这些是算出来的几何、不是角色节点，它们带 data-xh-geom 标记，皮肤据此上色与选字体。
export const barCodeAnatomy = createAnatomy('bar-code', ['root'])
