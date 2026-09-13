/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 hotkeys 相关实现。

import { createAnatomy } from '@xihan-ui/core'

// Hotkeys 是纯行为组件，不渲染任何 DOM，也就没有视觉部件。
export const hotkeysAnatomy = createAnatomy('hotkeys', [] as const)
