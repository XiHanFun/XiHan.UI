/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 list 相关实现。

import type { ComponentMeta } from '../spec/types'

export const listMeta: ComponentMeta = {
  // 只有根是必备的：空列表照样是一份合法列表，条目内的四个位也各自可缺省
  component: 'list',
  requiredParts: ['root'],
}
