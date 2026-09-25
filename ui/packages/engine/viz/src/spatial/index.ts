/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 导出 spatial 模块的公共接口。

export { createPicker } from './picker'
export type { Picker, PickerOptions, PickHit, PickOptions } from './picker'
export { pointInArc, pointInPolygon, polygonArea, polygonCentroid } from './polygon'
export { createQuadtree } from './quadtree'
export type { Quadtree, QuadtreeHit, QuadtreeNode } from './quadtree'
