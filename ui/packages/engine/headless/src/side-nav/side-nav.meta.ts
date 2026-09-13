/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 side nav 相关实现。

import type { ComponentMeta } from '../spec/types'

// list、item 与至少一条 link 是侧栏的最小组合；分组、分支与折叠都可缺省。
export const sideNavMeta: ComponentMeta = {
  component: 'side-nav',
  requiredParts: ['root', 'list', 'item', 'link'],
}
