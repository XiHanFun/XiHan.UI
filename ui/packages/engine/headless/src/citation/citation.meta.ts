/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 citation 相关实现。

import type { ComponentMeta } from '../spec/types'

export const citationMeta: ComponentMeta = {
  component: 'citation',
  requiredParts: ['root', 'text', 'trigger', 'preview', 'preview-title', 'list', 'source', 'source-link'],
}
