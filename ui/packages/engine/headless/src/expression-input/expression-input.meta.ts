/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 expression input 相关实现。

import type { ComponentMeta } from '../spec/types'

// 高亮层、浮层与问题列表都可缺省：不摆它们，组件仍是一个能打字、能报 aria-invalid 的输入框。
export const expressionInputMeta: ComponentMeta = {
  component: 'expression-input',
  requiredParts: ['root', 'control', 'input'],
}
