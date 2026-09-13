/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 popover 相关实现。

import type { ComponentMeta } from '../spec/types'

// trigger 与 content 缺一即违约（aria-controls 无从指向）；title/description/arrow 可缺省。
export const popoverMeta: ComponentMeta = {
  component: 'popover',
  requiredParts: ['trigger', 'content'],
}
