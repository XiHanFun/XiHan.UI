/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 graph chart 相关实现。

import type { ComponentMeta } from '../spec/types'

// 根承载状态属性；视口是尺寸观测的宿主，没有它就量不出空间；绘图区是连线、节点、拖动与键盘的唯一落点。
// 图例、提示框、空态都可以不放，标题也可以换成根上的 aria-label。
export const graphChartMeta: ComponentMeta = {
  component: 'graph-chart',
  requiredParts: ['root', 'viewport', 'plot'],
}
