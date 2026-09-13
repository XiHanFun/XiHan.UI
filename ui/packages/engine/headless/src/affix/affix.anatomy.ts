/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 affix 相关实现。

import { createAnatomy } from '@xihan-ui/core'

// root 是占位盒：content 吸住时脱离常规流，root 留在原位撑住那块空间，页面不跳。
export const affixAnatomy = createAnatomy('affix', ['root', 'content'])
