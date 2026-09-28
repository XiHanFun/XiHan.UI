/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 truncate 相关实现。

import { createAnatomy } from '@xihan-ui/core'

// root 夹字、量溢出；trigger 是它旁边那颗展开 / 收起的按钮，排在 root 之外——
// 放进被夹住的盒子里会跟着文字一起被裁掉。
export const truncateAnatomy = createAnatomy('truncate', ['root', 'trigger'])
