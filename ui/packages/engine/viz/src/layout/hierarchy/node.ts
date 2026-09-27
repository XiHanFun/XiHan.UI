/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 层级节点：一棵树上的每个节点带着深度、高度、父子与聚合值；各布局把几何写回节点上（矩形的四边、圆心与半径）。
// 遍历有三种次序：each 逐层（广度优先）、eachBefore 先根、eachAfter 后根；聚合与布局都建立在它们之上。

import { hierarchyError } from '../../errors'

export class HierarchyNode<T> {
  readonly data: T
  /** 到根的边数：根为 0。 */
  depth = 0
  /** 到最远叶子的边数：叶子为 0。 */
  height = 0
  parent: HierarchyNode<T> | null = null
  children: HierarchyNode<T>[] | undefined = undefined
  /** sum / count 算出的聚合值；没有聚合过为 undefined。 */
  value: number | undefined = undefined
  /** 矩形布局（treemap、partition）写回的四边。 */
  x0 = 0
  y0 = 0
  x1 = 0
  y1 = 0
  /** 圆形布局（pack）与点布局写回的圆心与半径。 */
  x = 0
  y = 0
  r = 0

  constructor(data: T) {
    this.data = data
  }

  /** 逐层遍历（广度优先），自根而下。 */
  each(visit: (node: HierarchyNode<T>, index: number) => void): this {
    const queue: HierarchyNode<T>[] = [this]
    for (let i = 0; i < queue.length; i++) {
      const node = queue[i]!
      visit(node, i)
      if (node.children)
        queue.push(...node.children)
    }
    return this
  }

  /** 先根遍历：父节点先于子节点，子节点按次序。 */
  eachBefore(visit: (node: HierarchyNode<T>, index: number) => void): this {
    const stack: HierarchyNode<T>[] = [this]
    let index = 0
    while (stack.length > 0) {
      const node = stack.pop()!
      visit(node, index++)
      if (node.children) {
        for (let i = node.children.length - 1; i >= 0; i--)
          stack.push(node.children[i]!)
      }
    }
    return this
  }

  /** 后根遍历：子节点先于父节点。 */
  eachAfter(visit: (node: HierarchyNode<T>, index: number) => void): this {
    // 兄弟按原次序压栈、弹出时根在前子在后且兄弟倒序；整串反过来就是兄弟按原次序的后根序
    const stack: HierarchyNode<T>[] = [this]
    const out: HierarchyNode<T>[] = []
    while (stack.length > 0) {
      const node = stack.pop()!
      out.push(node)
      if (node.children)
        stack.push(...node.children)
    }
    out.reverse().forEach((node, i) => visit(node, i))
    return this
  }

  /** 自下而上聚合：节点的值是它自己的值（value 函数给出）加上全部子孙的值；缺失与非有限数记 0。 */
  sum(value: (data: T) => number | null | undefined): this {
    return this.eachAfter((node) => {
      const own = Number(value(node.data))
      let total = Number.isFinite(own) ? own : 0
      if (node.children) {
        for (const child of node.children)
          total += child.value ?? 0
      }
      node.value = total
    })
  }

  /** 叶子数：叶子为 1，其余是子孙里的叶子数。 */
  count(): this {
    return this.eachAfter((node) => {
      node.value = node.children ? node.children.reduce((sum, child) => sum + (child.value ?? 0), 0) : 1
    })
  }

  /** 按比较函数给每一层的兄弟排序。 */
  sort(compare: (a: HierarchyNode<T>, b: HierarchyNode<T>) => number): this {
    return this.eachBefore((node) => {
      node.children?.sort(compare)
    })
  }

  /** 自身到根的节点，自身在前。 */
  ancestors(): HierarchyNode<T>[] {
    const out: HierarchyNode<T>[] = [this]
    for (let node = this.parent; node; node = node.parent)
      out.push(node)
    return out
  }

  /** 自身与全部子孙，逐层次序。 */
  descendants(): HierarchyNode<T>[] {
    const out: HierarchyNode<T>[] = []
    this.each(node => out.push(node))
    return out
  }

  /** 全部叶子，先根次序。 */
  leaves(): HierarchyNode<T>[] {
    const out: HierarchyNode<T>[] = []
    this.eachBefore((node) => {
      if (!node.children)
        out.push(node)
    })
    return out
  }

  /** 父子连线：每个非根节点一条。 */
  links(): { source: HierarchyNode<T>, target: HierarchyNode<T> }[] {
    const out: { source: HierarchyNode<T>, target: HierarchyNode<T> }[] = []
    this.each((node) => {
      if (node !== this && node.parent)
        out.push({ source: node.parent, target: node })
    })
    return out
  }

  /** 从自身经最近公共祖先走到目标的路径（含两端）。 */
  path(target: HierarchyNode<T>): HierarchyNode<T>[] {
    const up = this.ancestors()
    const down = target.ancestors()
    const common = up.find(node => down.includes(node))
    if (!common)
      throw hierarchyError('两个节点不在同一棵树上', {})
    return [...up.slice(0, up.indexOf(common) + 1), ...down.slice(0, down.indexOf(common)).reverse()]
  }

  /** 先根次序里第一个满足条件的节点。 */
  find(predicate: (node: HierarchyNode<T>) => boolean): HierarchyNode<T> | undefined {
    let hit: HierarchyNode<T> | undefined
    this.eachBefore((node) => {
      if (!hit && predicate(node))
        hit = node
    })
    return hit
  }
}

/** 把嵌套的数据建成层级：children 取子节点的数组，缺省取 data.children；同一个对象在树上出现两次（成环或共享子树）报错。 */
export function hierarchy<T>(root: T, children: (data: T) => Iterable<T> | null | undefined = data => (data as { children?: Iterable<T> }).children): HierarchyNode<T> {
  const top = new HierarchyNode(root)
  const seen = new Set<unknown>([root])
  const queue: HierarchyNode<T>[] = [top]
  for (let i = 0; i < queue.length; i++) {
    const node = queue[i]!
    const kids = children(node.data)
    if (!kids)
      continue
    const list = Array.from(kids)
    if (list.length === 0)
      continue
    node.children = list.map((data) => {
      if (typeof data === 'object' && data !== null) {
        if (seen.has(data))
          throw hierarchyError('同一个节点在树上出现了两次：数据成环或共享了子树', { depth: node.depth + 1 })
        seen.add(data)
      }
      const child = new HierarchyNode(data)
      child.parent = node
      child.depth = node.depth + 1
      queue.push(child)
      return child
    })
  }
  return computeHeight(top)
}

/** 自下而上写回高度。 */
export function computeHeight<T>(root: HierarchyNode<T>): HierarchyNode<T> {
  root.eachAfter((node) => {
    node.height = node.children ? Math.max(...node.children.map(child => child.height)) + 1 : 0
  })
  return root
}
