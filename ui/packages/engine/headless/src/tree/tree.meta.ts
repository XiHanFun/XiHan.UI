/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 tree 相关实现。

import type { ComponentMeta } from '../spec/types'

// tree 必需：role=tree、可及名字与键盘入口全在它身上。
// 条目不算必需：空树、由脚本随后铺出的条目（虚拟化窗口、异步取数）在挂载那一刻都没有条目，
// 与列表框只钉容器同一口径。root/label、条目与分支五件套都可缺省。
export const treeMeta: ComponentMeta = {
  component: 'tree',
  requiredParts: ['tree'],
}
