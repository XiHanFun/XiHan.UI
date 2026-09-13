/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 spinner 相关实现。

import type { ComponentMeta } from '../spec/types'

// root 承载活区语义与可及名字；label 是可选的可见文案节点。
export const spinnerMeta: ComponentMeta = {
  component: 'spinner',
  requiredParts: ['root'],
}
