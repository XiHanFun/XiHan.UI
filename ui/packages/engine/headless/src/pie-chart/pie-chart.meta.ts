/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 pie chart 相关实现。

import type { ComponentMeta } from '../spec/types'

// 根承载状态属性与淡出；视口是尺寸观测的宿主，没有它就量不出半径；绘图区是扇区与键盘的唯一落点。
// 图例、环形中心、提示框、空态都可以不放，标题也可以换成根上的 aria-label。
export const pieChartMeta: ComponentMeta = {
  component: 'pie-chart',
  requiredParts: ['root', 'viewport', 'plot'],
}
