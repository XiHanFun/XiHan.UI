/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 导出层级布局：层级节点、按父 id 组树、矩形树图、分区（冰柱与旭日）、圆堆积、整齐的树与树状图。
// 走 @xihan-ui/viz/hierarchy 子路径，不从包入口再导出：只画直角坐标图的应用不为它付字节。

export { cluster } from './cluster'
export { computeHeight, hierarchy, HierarchyNode } from './node'
export { pack, packEnclose, packSiblings } from './pack'
export type { Circle, PackOptions } from './pack'
export { partition } from './partition'
export type { PartitionOptions } from './partition'
export { stratify } from './stratify'
export type { StratifyOptions } from './stratify'
export { tree } from './tree'
export type { TreeOptions, TreeSeparation } from './tree'
export { GOLDEN_RATIO, treemap, treemapBinary, treemapDice, treemapSlice, treemapSliceDice, treemapSquarify, treemapTile } from './treemap'
export type { TreemapOptions, TreemapPadding, TreemapTile, TreemapTileName } from './treemap'
