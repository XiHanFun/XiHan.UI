/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 分区：冰柱图的底层布局。每一层占一条等高的带，节点在带里按聚合值横向分宽，子节点落在父节点正下方的那一段。
// 旭日图用同一份结果：把 x 当角度、y 当半径。调用前先 sum / count 算出聚合值。

import type { HierarchyNode } from './node'
import { invalidArgument } from '../../errors'
import { treemapDice } from './treemap'

export interface PartitionOptions {
  readonly size: readonly [number, number]
  /** 节点之间在右边与下边留出的间隙。 */
  readonly padding?: number
  /** 四边取整到像素。 */
  readonly round?: boolean
}

export function partition<T>(root: HierarchyNode<T>, options: PartitionOptions): HierarchyNode<T> {
  const [dx, dy] = options.size
  if (!(dx >= 0) || !(dy >= 0))
    throw invalidArgument('分区的尺寸必须是非负数', { size: options.size })
  if (root.value == null)
    throw invalidArgument('分区之前先 sum() 或 count() 算出聚合值', {})
  const padding = Math.max(0, options.padding ?? 0)
  const n = root.height + 1
  root.x0 = padding
  root.y0 = padding
  root.x1 = dx
  root.y1 = dy / n
  root.eachBefore((node) => {
    if (node.children)
      treemapDice(node, node.x0, (dy * (node.depth + 1)) / n, node.x1, (dy * (node.depth + 2)) / n)
    let x0 = node.x0
    let y0 = node.y0
    let x1 = node.x1 - padding
    let y1 = node.y1 - padding
    if (x1 < x0)
      x0 = x1 = (x0 + x1) / 2
    if (y1 < y0)
      y0 = y1 = (y0 + y1) / 2
    node.x0 = x0
    node.y0 = y0
    node.x1 = x1
    node.y1 = y1
  })
  if (options.round) {
    root.eachBefore((node) => {
      node.x0 = Math.round(node.x0)
      node.y0 = Math.round(node.y0)
      node.x1 = Math.round(node.x1)
      node.y1 = Math.round(node.y1)
    })
  }
  return root
}
