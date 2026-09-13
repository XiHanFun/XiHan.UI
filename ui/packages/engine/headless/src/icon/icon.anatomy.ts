/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 icon 相关实现。

import { createAnatomy } from '@xihan-ui/core'

// root = <svg> 本身；glyph = 作者留出的空壳容器，元素只在它里面铺图元。
export const iconAnatomy = createAnatomy('icon', ['root', 'glyph'])
