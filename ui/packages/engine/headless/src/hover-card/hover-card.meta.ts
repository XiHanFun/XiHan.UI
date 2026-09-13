/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 hover card 相关实现。

import type { ComponentMeta } from '../spec/types'

// root/positioner/title/description/arrow 可缺省。
export const hoverCardMeta: ComponentMeta = {
  component: 'hover-card',
  requiredParts: ['trigger', 'content'],
}
