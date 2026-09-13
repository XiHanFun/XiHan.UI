/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 reasoning 相关实现。

import type { ComponentMeta } from '../spec/types'

// root / trigger / content 三者必需；indicator、label 与 duration 都是排版位，可缺省。
export const reasoningMeta: ComponentMeta = {
  component: 'reasoning',
  requiredParts: ['root', 'trigger', 'content'],
}
