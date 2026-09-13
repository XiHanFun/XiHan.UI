/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 tree 相关实现。

import type { ComponentMeta } from '../spec/types'

// tree 必需：role=tree、可及名字与键盘入口全在它身上。
// requiredParts 表达不了 item 与 branch 二选一，因此只钉 item。
// root/label 与分支五件套可缺省。
export const treeMeta: ComponentMeta = {
  component: 'tree',
  requiredParts: ['tree', 'item'],
}
