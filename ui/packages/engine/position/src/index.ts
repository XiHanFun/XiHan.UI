/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 导出 src 模块的公共接口。

export { computePlacement, intersectEdges, isFullyClipped, joinPlacement, splitPlacement } from './compute'
export type { ComputeInput, ComputeOutput, PositionBox, PositionEdges } from './compute'
export { createDeferredPositionEngine, loadPositionEngine } from './deferred'
export { createPositionEngine } from './engine'
