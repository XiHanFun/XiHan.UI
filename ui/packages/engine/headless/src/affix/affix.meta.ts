/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 affix 相关实现。

import type { ComponentMeta } from '../spec/types'

// 两个都必备：缺 root 就没有量判定线的参照，也没人撑住脱流后空出来的位置；缺 content 则无处可钉。
export const affixMeta: ComponentMeta = {
  component: 'affix',
  requiredParts: ['root', 'content'],
}
