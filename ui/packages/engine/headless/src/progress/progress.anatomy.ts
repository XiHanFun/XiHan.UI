/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 progress 相关实现。

import { createAnatomy } from '@xihan-ui/core'

// canvas 是承载环的 <svg>，label 是环心那一块；两个都只在环形下渲染，作者不写也成立。
export const progressAnatomy = createAnatomy('progress', ['root', 'canvas', 'track', 'range', 'label'])
