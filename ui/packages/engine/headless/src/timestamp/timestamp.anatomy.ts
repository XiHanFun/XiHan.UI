/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 timestamp 相关实现。

import { createAnatomy } from '@xihan-ui/core'

// 只有一个角色节点：那个 <time>。它同时承载给人看的文本与给机器读的 datetime。
export const timestampAnatomy = createAnatomy('timestamp', ['root'])
