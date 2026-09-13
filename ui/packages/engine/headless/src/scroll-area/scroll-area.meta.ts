/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 scroll area 相关实现。

import type { ComponentMeta } from '../spec/types'

// viewport 是真正滚动的那层，content 是内容包裹层，root 是定位上下文，三者必需。
// scrollbar 挂载点可缺省，缺省时没有自绘滚动条；挂载点里的 track / thumb / corner 归 scrollbar 那套解剖。
export const scrollAreaMeta: ComponentMeta = {
  component: 'scroll-area',
  requiredParts: ['root', 'viewport', 'content'],
}
