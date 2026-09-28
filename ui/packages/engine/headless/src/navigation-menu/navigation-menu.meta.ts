/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 navigation menu 相关实现。

import type { ComponentMeta } from '../spec/types'

// trigger/content 成对可选：没有下拉的那几项只有一条链接。
// branch-trigger/branch-content 同样成对可选：面板里只有链接时没有子级，branch-indicator 是纯装饰。
// indicator 与 viewport 都是纯装饰，可缺省。
export const navigationMenuMeta: ComponentMeta = {
  component: 'navigation-menu',
  requiredParts: ['root', 'list', 'item', 'link'],
}
