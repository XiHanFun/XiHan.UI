/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 popover 相关实现。

import type { ComponentMeta } from '../spec/types'

// content 缺席即违约；trigger 可由 anchor 顶替，两者都没有时展开那一刻报诊断。title/description/arrow 可缺省。
export const popoverMeta: ComponentMeta = {
  component: 'popover',
  requiredParts: ['content'],
}
