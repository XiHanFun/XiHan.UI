/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 扁平的行按 id 与父 id 组成一棵树。组不成树的情形一律报错，不静默丢行：
// id 重复、父节点不存在、多个根、没有根（全部成环）、部分成环（有行从根走不到）。

import { hierarchyError } from '../../errors'
import { computeHeight, HierarchyNode } from './node'

export interface StratifyOptions<T> {
  /** 行的身份；缺失（null / undefined / 空串）的行报错。 */
  readonly id: (row: T, index: number) => string | null | undefined
  /** 父节点的身份；缺失即为根。 */
  readonly parentId: (row: T, index: number) => string | null | undefined
}

export function stratify<T>(rows: readonly T[], options: StratifyOptions<T>): HierarchyNode<T> {
  if (rows.length === 0)
    throw hierarchyError('没有行，组不成树', {})
  const nodes = rows.map(row => new HierarchyNode(row))
  const byId = new Map<string, HierarchyNode<T>>()
  rows.forEach((row, i) => {
    const id = options.id(row, i)
    if (id == null || id === '')
      throw hierarchyError('行缺少 id', { index: i })
    if (byId.has(id))
      throw hierarchyError(`id ${id} 重复`, { id, index: i })
    byId.set(id, nodes[i]!)
  })
  const roots: HierarchyNode<T>[] = []
  rows.forEach((row, i) => {
    const node = nodes[i]!
    const parentId = options.parentId(row, i)
    if (parentId == null || parentId === '') {
      roots.push(node)
      return
    }
    const parent = byId.get(parentId)
    if (!parent)
      throw hierarchyError(`父节点 ${parentId} 不存在`, { id: options.id(row, i), parentId, index: i })
    node.parent = parent
    ;(parent.children ??= []).push(node)
  })
  if (roots.length === 0)
    throw hierarchyError('没有根：全部的行都成了环', {})
  if (roots.length > 1)
    throw hierarchyError(`有 ${roots.length} 个根，只能有一个`, { roots: roots.map((node, i) => options.id(node.data, rows.indexOf(node.data)) ?? i) })
  const root = roots[0]!
  let reached = 0
  root.eachBefore((node) => {
    node.depth = node.parent ? node.parent.depth + 1 : 0
    reached++
  })
  if (reached < rows.length) {
    const stray = nodes.find(node => node !== root && node.depth === 0)
    throw hierarchyError('有行从根走不到：父子关系成了环', { id: stray ? options.id(stray.data, rows.indexOf(stray.data)) : undefined })
  }
  return computeHeight(root)
}
