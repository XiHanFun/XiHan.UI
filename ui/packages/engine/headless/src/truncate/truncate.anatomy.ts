/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 truncate 相关实现。

import { createAnatomy } from '@xihan-ui/core'

// 只有一个部件：夹字、量溢出、承载展开交互，全落在同一个盒子上。
export const truncateAnatomy = createAnatomy('truncate', ['root'])
