/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 marquee 相关实现。

import { createAnatomy } from '@xihan-ui/core'

// data-part 直接用 kebab-case，与 CSS 选择器一致。
// 两个角色节点：只露出一段的窗口是 root，在窗口里走的那条轨道是 content。
export const marqueeAnatomy = createAnatomy('marquee', ['root', 'content'])
