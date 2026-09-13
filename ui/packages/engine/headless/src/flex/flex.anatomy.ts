/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 flex 相关实现。

import { createAnatomy } from '@xihan-ui/core'

// data-part 直接用 kebab-case，与 CSS 选择器一致。
// root 是排布容器，split 是夹在两个子项之间的分隔符。
// 子项本身不是角色节点：它们是作者的内容，组件只管把它们排开、在中间留白。
export const flexAnatomy = createAnatomy('flex', ['root', 'split'])
