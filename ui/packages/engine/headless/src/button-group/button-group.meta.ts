/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 button group 相关实现。

import type { ComponentMeta } from '../spec/types'

export const buttonGroupMeta: ComponentMeta = {
  component: 'button-group',
  // root 是唯一部件；分隔线由适配器按属性自动生成，不进入作者部件面。
  requiredParts: ['root'],
}
