/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 文字度量：服务端与首帧用确定性估算器，挂载后换成 Canvas 的 measureText。

import type { TextMeasurer } from '@xihan-ui/viz'
import { createEstimatingMeasurer } from '@xihan-ui/viz'

export { createCanvasMeasurer } from '@xihan-ui/viz'

/** 估算器：服务端与挂载前的布局都用它，结果确定，首屏输出稳定。 */
export const CHART_ESTIMATING_MEASURER: TextMeasurer = createEstimatingMeasurer()
