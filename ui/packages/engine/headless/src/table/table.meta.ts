/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 table 相关实现。

import type { ComponentMeta } from '../spec/types'

// root 与 body 必备：grid 系角色、行列总数与键盘入口都在这两个部件上。
// row 不列为必备（空表是正常态）；header / footer / caption 与两个状态节点同样可缺省。
export const tableMeta: ComponentMeta = {
  component: 'table',
  requiredParts: ['root', 'body'],
}
