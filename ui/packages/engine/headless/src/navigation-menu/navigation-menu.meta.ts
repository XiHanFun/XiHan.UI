/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 navigation menu 相关实现。

import type { ComponentMeta } from '../spec/types'

// trigger/content 成对可选：没有下拉的那几项只有一条链接。
// indicator 与 viewport 都是纯装饰，可缺省。
export const navigationMenuMeta: ComponentMeta = {
  component: 'navigation-menu',
  requiredParts: ['root', 'list', 'item', 'link'],
}
