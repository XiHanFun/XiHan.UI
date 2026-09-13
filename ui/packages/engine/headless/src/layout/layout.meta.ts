/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 layout 相关实现。

import type { ComponentMeta } from '../spec/types'

// 只有根是必备的：头、侧栏、遮罩、内容、脚与折叠把手按需摆，只放一段也是一副合法的骨架。
export const layoutMeta: ComponentMeta = {
  component: 'layout',
  requiredParts: ['root'],
}
