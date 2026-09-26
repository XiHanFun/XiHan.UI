/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 导出 layout 模块的公共接口。

export { boxplotStats, kde, linearRegression, movingAverage, silvermanBandwidth, waterfall } from './statistics'
export type { BoxplotStats, DensityPoint, KernelName, LinearFit, WaterfallStep } from './statistics'
