/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 clipboard 相关实现。

import type { ComponentMeta } from '../spec/types'

// label / control / input / indicator 都可省。
export const clipboardMeta: ComponentMeta = {
  component: 'clipboard',
  requiredParts: ['root', 'copy-trigger'],
}
