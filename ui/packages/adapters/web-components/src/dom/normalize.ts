/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 normalize 相关实现。

import { createNormalizer } from '@xihan-ui/core'

// connect 产出的键已是 DOM 向，恒等透传，落到真实 DOM 由 spread 完成。
export const wcNormalize = createNormalizer(props => props)
