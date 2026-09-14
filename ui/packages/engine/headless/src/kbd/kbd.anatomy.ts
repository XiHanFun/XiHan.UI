/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 kbd 相关实现。

import { createAnatomy } from '@xihan-ui/core'

/** 单键与组合键共用一枚语义键帽。 */
export const kbdAnatomy = createAnatomy('kbd', ['root', 'key'])
