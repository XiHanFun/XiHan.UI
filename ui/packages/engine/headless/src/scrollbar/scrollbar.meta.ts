/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 scrollbar 相关实现。

import type { ComponentMeta } from '../spec/types'

// 三个都必需：root 是定位盒与热区，track 是量长度的那条轨，thumb 是唯一能拖能聚焦的那块。
// 少一个就没有可用的滚动条，不像 scroll-area 那样可以「不写就退化成原生滚动」。
export const scrollbarMeta: ComponentMeta = {
  component: 'scrollbar',
  requiredParts: ['root', 'track', 'thumb'],
}
