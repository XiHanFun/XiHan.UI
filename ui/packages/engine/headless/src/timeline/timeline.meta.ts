/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 timeline 相关实现。

import type { ComponentMeta } from '../spec/types'

// 列表与条目是时间线的最小可用形态：没有条目就没有事件可读。
// indicator / connector 是装饰，content / title / description / time 是条目文字的可选分块，
// 只在条目里写一行裸文本也成立。
export const timelineMeta: ComponentMeta = {
  component: 'timeline',
  requiredParts: ['root', 'item'],
}
