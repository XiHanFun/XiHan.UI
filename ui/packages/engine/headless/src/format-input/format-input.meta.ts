/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 format input 相关实现。

import type { ComponentMeta } from '../spec/types'

// root 承载 role=group；kind 装着种类控件，没有它就选不了格式。参数行随种类出没，不列为必备。
export const formatInputMeta: ComponentMeta = {
  component: 'format-input',
  requiredParts: ['root', 'kind'],
}
