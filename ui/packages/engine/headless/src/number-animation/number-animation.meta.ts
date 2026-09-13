/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 number animation 相关实现。

import type { ComponentMeta } from '../spec/types'

export const numberAnimationMeta: ComponentMeta = {
  component: 'number-animation',
  // 只有一个部件，数字就写在它里面；缺了它这个组件没有任何可显示的地方
  requiredParts: ['root'],
}
