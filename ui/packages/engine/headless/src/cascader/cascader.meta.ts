/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 cascader 相关实现。

import type { ComponentMeta } from '../spec/types'

// 候选列与条目只在有数据时出现，合法空态/首次加载不要求虚构 column 或 item。
// label/positioner/indicator/clear-trigger 与状态部件由作者按需提供。
export const cascaderMeta: ComponentMeta = {
  component: 'cascader',
  requiredParts: ['trigger', 'content'],
}
