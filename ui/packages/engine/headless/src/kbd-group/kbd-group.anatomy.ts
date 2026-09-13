/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 kbd group 相关实现。

import { createAnatomy } from '@xihan-ui/core'

// key 由 keys 数据铺开；root 承担整组唯一可访问名称。
export const kbdGroupAnatomy = createAnatomy('kbd-group', ['root', 'key'])
