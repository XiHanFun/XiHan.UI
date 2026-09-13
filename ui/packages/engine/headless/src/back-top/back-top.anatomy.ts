/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 back top 相关实现。

import { createAnatomy } from '@xihan-ui/core'

// root 是定位壳，只管把按钮钉在视口一角；trigger 是真正可点、可聚焦的那个按钮。
export const backTopAnatomy = createAnatomy('back-top', ['root', 'trigger'])
