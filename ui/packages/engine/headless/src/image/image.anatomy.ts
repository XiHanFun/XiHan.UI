/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 image 相关实现。

import { createAnatomy } from '@xihan-ui/core'

// placeholder 只在图片未落位时露面，fallback 承担失败与延迟窗口过后的兜底内容。
export const imageAnatomy = createAnatomy('image', ['root', 'image', 'placeholder', 'fallback'])
