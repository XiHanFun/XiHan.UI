/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 splitter 相关实现。

import type { ComponentMeta } from '../spec/types'

export const splitterMeta: ComponentMeta = {
  component: 'splitter',
  requiredParts: ['root', 'panel', 'resize-trigger'],
}
