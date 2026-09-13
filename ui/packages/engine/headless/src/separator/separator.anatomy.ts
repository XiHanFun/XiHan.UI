/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 separator 相关实现。

import { createAnatomy } from '@xihan-ui/core'

// 三个角色节点：root 是分隔本身，只有它一个时它就是那条线；
// 给了 content（分节标题那一小段文字）之后 root 变成容器，线由 line 画，两条 line 夹着 content。
export const separatorAnatomy = createAnatomy('separator', ['root', 'line', 'content'])
