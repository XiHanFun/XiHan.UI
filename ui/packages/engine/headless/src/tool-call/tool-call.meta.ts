/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 tool call 相关实现。

import type { ComponentMeta } from '../spec/types'

// root / trigger / content 三者必需；approval 与 input/output/error 按阶段取舍，
// indicator/name/summary/status/duration 是 trigger 内的排版位，都可缺省。
export const toolCallMeta: ComponentMeta = {
  component: 'tool-call',
  requiredParts: ['root', 'trigger', 'content'],
}
