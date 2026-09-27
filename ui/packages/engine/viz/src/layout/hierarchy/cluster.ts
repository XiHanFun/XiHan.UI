/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 树状图（dendrogram）：叶子一律落在最底一层、等距排开，父节点落在子节点的正中、高度比最高的子节点高一层。
// 适合聚类结果与谱系：读的是「在哪一层合并」，不是深度。

import type { HierarchyNode } from './node'
import type { TreeOptions } from './tree'
import { invalidArgument } from '../../errors'
import { defaultSeparation } from './tree'

/** 树状图：把 x（叶子排开的方向）与 y（合并高度，根为 0）写回每个节点。 */
export function cluster<T>(root: HierarchyNode<T>, options: TreeOptions<T>): HierarchyNode<T> {
  const separation = options.separation ?? defaultSeparation
  const fixed = options.nodeSize
  const size = fixed ?? options.size ?? [1, 1]
  if (!(size[0] >= 0) || !(size[1] >= 0))
    throw invalidArgument('树状图的尺寸必须是非负数', { size })
  let previous: HierarchyNode<T> | null = null
  let x = 0
  root.eachAfter((node) => {
    const children = node.children
    if (children) {
      node.x = children.reduce((sum, c) => sum + c.x, 0) / children.length
      node.y = 1 + children.reduce((max, c) => Math.max(max, c.y), 0)
    }
    else {
      x = previous ? x + separation(node, previous) : 0
      node.x = x
      node.y = 0
      previous = node
    }
  })
  let left = root
  while (left.children) left = left.children[0]!
  let right = root
  while (right.children) right = right.children[right.children.length - 1]!
  const x0 = left.x - separation(left, right) / 2
  const x1 = right.x + separation(right, left) / 2
  const height = root.y
  if (fixed) {
    const rx = root.x
    root.eachBefore((node) => {
      node.x = (node.x - rx) * fixed[0]
      node.y = (height - node.y) * fixed[1]
    })
    return root
  }
  root.eachBefore((node) => {
    node.x = x1 > x0 ? ((node.x - x0) / (x1 - x0)) * size[0] : size[0] / 2
    node.y = (1 - (height ? node.y / height : 1)) * size[1]
  })
  return root
}
