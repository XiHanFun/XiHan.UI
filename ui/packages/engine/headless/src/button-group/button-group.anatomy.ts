/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 button group 相关实现。

import { createAnatomy } from '@xihan-ui/core'

// 只有 root 属于作者可组合的部件；段间分隔线由适配器按属性生成。
export const buttonGroupAnatomy = createAnatomy('button-group', ['root'])
