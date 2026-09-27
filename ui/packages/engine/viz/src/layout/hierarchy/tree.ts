/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 整齐的树：Reingold–Tilford 的思路，按 Buchheim、Jünger 与 Leipert（2002）的线性时间做法实现。
// 先后序排出每棵子树的相对位置（左右轮廓用线索相连，碰撞时把右边的子树整体右移，移动量分摊给中间的兄弟），
// 再先序把累计的偏移加下去。父节点落在第一个与最后一个子节点的正中，同层的节点不重叠。

import type { HierarchyNode } from './node'
import { invalidArgument } from '../../errors'

/** 同层相邻两个节点之间的间隔（以单位间距计）：缺省同一个父节点 1，不同父节点 2。 */
export type TreeSeparation<T> = (a: HierarchyNode<T>, b: HierarchyNode<T>) => number

export interface TreeOptions<T = unknown> {
  /** 布局铺满的 [宽, 高]：x 沿宽排开兄弟，y 沿高按深度排开。与 nodeSize 二选一。 */
  readonly size?: readonly [number, number]
  /** 固定的 [相邻间距, 层距]：不缩放到整体尺寸，根落在 (0, 0)。 */
  readonly nodeSize?: readonly [number, number]
  readonly separation?: TreeSeparation<T>
}

export function defaultSeparation<T>(a: HierarchyNode<T>, b: HierarchyNode<T>): number {
  return a.parent === b.parent ? 1 : 2
}

/** 排布用的工作节点：prelim 是相对父节点的初步位置，mod 是要传给子孙的偏移。 */
interface Walker<T> {
  readonly node: HierarchyNode<T> | null
  readonly parent: Walker<T> | null
  readonly children: Walker<T>[]
  /** 在兄弟里的次序。 */
  readonly index: number
  prelim: number
  mod: number
  change: number
  shift: number
  /** 轮廓线索：子树里没有子节点时，沿轮廓继续走到的下一个节点。 */
  thread: Walker<T> | null
  /** 碰撞时认的祖先。 */
  ancestor: Walker<T>
  /** 父节点处理子节点时记下的「最近一个默认祖先」。 */
  defaultAncestor: Walker<T> | null
}

function walker<T>(node: HierarchyNode<T> | null, parent: Walker<T> | null, index: number): Walker<T> {
  const w = { node, parent, children: [] as Walker<T>[], index, prelim: 0, mod: 0, change: 0, shift: 0, thread: null, defaultAncestor: null } as unknown as Walker<T>
  w.ancestor = w
  return w
}

/** 把层级节点包成工作树；返回根的虚拟父节点（它只有一个子节点，即根）。 */
function wrap<T>(root: HierarchyNode<T>): Walker<T> {
  const top = walker<T>(null, null, 0)
  const stack: [HierarchyNode<T>, Walker<T>][] = []
  const first = walker(root, top, 0)
  top.children.push(first)
  stack.push([root, first])
  while (stack.length > 0) {
    const [node, w] = stack.pop()!
    node.children?.forEach((child, i) => {
      const cw = walker(child, w, i)
      w.children.push(cw)
      stack.push([child, cw])
    })
  }
  return top
}

function nextLeft<T>(v: Walker<T>): Walker<T> | null {
  return v.children.length > 0 ? v.children[0]! : v.thread
}

function nextRight<T>(v: Walker<T>): Walker<T> | null {
  return v.children.length > 0 ? v.children[v.children.length - 1]! : v.thread
}

/** 把以 right 为根的子树右移 shift，并把移动量摊给它与 left 之间的兄弟。 */
function moveSubtree<T>(left: Walker<T>, right: Walker<T>, shift: number): void {
  const change = shift / (right.index - left.index)
  right.change -= change
  right.shift += shift
  left.change += change
  right.prelim += shift
  right.mod += shift
}

/** 把摊到兄弟上的移动量兑现：自右向左累加。 */
function executeShifts<T>(v: Walker<T>): void {
  let shift = 0
  let change = 0
  for (let i = v.children.length - 1; i >= 0; i--) {
    const w = v.children[i]!
    w.prelim += shift
    w.mod += shift
    change += w.change
    shift += w.shift + change
  }
}

/** 碰撞时认哪个祖先：轮廓节点记下的祖先是 v 的兄弟就用它，否则用默认祖先。 */
function nextAncestor<T>(vim: Walker<T>, v: Walker<T>, fallback: Walker<T>): Walker<T> {
  return vim.ancestor.parent === v.parent ? vim.ancestor : fallback
}

/** 把 v 这棵子树与它左边已经排好的兄弟子树对齐：沿两边的轮廓逐层比较，撞上就把 v 右移。 */
function apportion<T>(v: Walker<T>, w: Walker<T> | null, fallback: Walker<T>, separation: TreeSeparation<T>): Walker<T> {
  if (!w)
    return fallback
  let vip: Walker<T> | null = v
  let vop: Walker<T> = v
  let vim: Walker<T> | null = w
  let vom: Walker<T> = v.parent!.children[0]!
  let sip = vip.mod
  let sop = vop.mod
  let sim = vim.mod
  let som = vom.mod
  let ancestor = fallback
  vim = nextRight(vim)
  vip = nextLeft(vip)
  while (vim && vip) {
    vom = nextLeft(vom)!
    vop = nextRight(vop)!
    vop.ancestor = v
    const shift = vim.prelim + sim - (vip.prelim + sip) + separation(vim.node!, vip.node!)
    if (shift > 0) {
      moveSubtree(nextAncestor(vim, v, ancestor), v, shift)
      sip += shift
      sop += shift
    }
    sim += vim.mod
    sip += vip.mod
    som += vom.mod
    sop += vop.mod
    vim = nextRight(vim)
    vip = nextLeft(vip)
  }
  if (vim && !nextRight(vop)) {
    vop.thread = vim
    vop.mod += sim - sop
  }
  if (vip && !nextLeft(vom)) {
    vom.thread = vip
    vom.mod += sip - som
    ancestor = v
  }
  return ancestor
}

/** 整齐的树：把 x（兄弟方向）与 y（深度方向）写回每个节点。 */
export function tree<T>(root: HierarchyNode<T>, options: TreeOptions<T>): HierarchyNode<T> {
  const separation = options.separation ?? defaultSeparation
  const fixed = options.nodeSize
  const size = fixed ?? options.size ?? [1, 1]
  if (!(size[0] >= 0) || !(size[1] >= 0))
    throw invalidArgument('树的尺寸必须是非负数', { size })
  const top = wrap(root)

  // 后序：排出每棵子树的相对位置
  const post: Walker<T>[] = []
  const stack = [top.children[0]!]
  while (stack.length > 0) {
    const v = stack.pop()!
    post.push(v)
    for (const c of v.children) stack.push(c)
  }
  for (let i = post.length - 1; i >= 0; i--) {
    const v = post[i]!
    const siblings = v.parent!.children
    const w = v.index > 0 ? siblings[v.index - 1]! : null
    if (v.children.length > 0) {
      executeShifts(v)
      const mid = (v.children[0]!.prelim + v.children[v.children.length - 1]!.prelim) / 2
      if (w) {
        v.prelim = w.prelim + separation(v.node!, w.node!)
        v.mod = v.prelim - mid
      }
      else {
        v.prelim = mid
      }
    }
    else if (w) {
      v.prelim = w.prelim + separation(v.node!, w.node!)
    }
    const parent = v.parent!
    parent.defaultAncestor = apportion(v, w, parent.defaultAncestor ?? siblings[0]!, separation)
  }

  // 先序：把累计的偏移加下去
  top.mod = -top.children[0]!.prelim
  const order = [top.children[0]!]
  while (order.length > 0) {
    const v = order.pop()!
    v.node!.x = v.prelim + v.parent!.mod
    v.mod += v.parent!.mod
    for (const c of v.children) order.push(c)
  }

  if (fixed) {
    root.eachBefore((node) => {
      node.x *= fixed[0]
      node.y = node.depth * fixed[1]
    })
    return root
  }
  // 缩放到整体尺寸：最左与最右的节点各留半个间隔，最深一层贴底
  let left = root
  let right = root
  let bottom = root
  root.eachBefore((node) => {
    if (node.x < left.x)
      left = node
    if (node.x > right.x)
      right = node
    if (node.depth > bottom.depth)
      bottom = node
  })
  const s = left === right ? 1 : separation(left, right) / 2
  const tx = s - left.x
  const kx = size[0] / (right.x + s + tx)
  const ky = size[1] / (bottom.depth || 1)
  root.eachBefore((node) => {
    node.x = (node.x + tx) * kx
    node.y = node.depth * ky
  })
  return root
}
