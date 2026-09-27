/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 圆堆积：叶子是面积与值成正比的圆，兄弟圆用前链算法（Wang 等，2006）互相贴着排开，
// 父圆是兄弟圆的最小外接圆（Welzl 的随机增量法）；最后整体缩放进给定的尺寸。
// 最小外接圆的随机次序取固定种子：服务端与客户端、每次重渲染的结果都一样。

import type { RandomSource } from '../../random'
import type { HierarchyNode } from './node'
import { invalidArgument } from '../../errors'
import { createRandom } from '../../random'

/** 一个圆：圆心与半径。 */
export interface Circle {
  x: number
  y: number
  r: number
}

/** 固定的种子：结果只由数据决定。 */
const PACK_SEED = 0x9E3779B9

/* ---------- 最小外接圆 ---------- */

function enclosesNot(a: Circle, b: Circle): boolean {
  const dr = a.r - b.r
  const dx = b.x - a.x
  const dy = b.y - a.y
  return dr < 0 || dr * dr < dx * dx + dy * dy
}

function enclosesWeak(a: Circle, b: Circle): boolean {
  const dr = a.r - b.r + Math.max(a.r, b.r, 1) * 1e-9
  const dx = b.x - a.x
  const dy = b.y - a.y
  return dr > 0 && dr * dr > dx * dx + dy * dy
}

function enclosesWeakAll(a: Circle, basis: readonly Circle[]): boolean {
  return basis.every(b => enclosesWeak(a, b))
}

function encloseBasis1(a: Circle): Circle {
  return { x: a.x, y: a.y, r: a.r }
}

function encloseBasis2(a: Circle, b: Circle): Circle {
  const x21 = b.x - a.x
  const y21 = b.y - a.y
  const r21 = b.r - a.r
  const l = Math.sqrt(x21 * x21 + y21 * y21)
  return {
    x: (a.x + b.x + (x21 / l) * r21) / 2,
    y: (a.y + b.y + (y21 / l) * r21) / 2,
    r: (l + a.r + b.r) / 2,
  }
}

function encloseBasis3(a: Circle, b: Circle, c: Circle): Circle {
  const { x: x1, y: y1, r: r1 } = a
  const { x: x2, y: y2, r: r2 } = b
  const { x: x3, y: y3, r: r3 } = c
  const a2 = x1 - x2
  const a3 = x1 - x3
  const b2 = y1 - y2
  const b3 = y1 - y3
  const c2 = r2 - r1
  const c3 = r3 - r1
  const d1 = x1 * x1 + y1 * y1 - r1 * r1
  const d2 = d1 - x2 * x2 - y2 * y2 + r2 * r2
  const d3 = d1 - x3 * x3 - y3 * y3 + r3 * r3
  const ab = a3 * b2 - a2 * b3
  const xa = (b2 * d3 - b3 * d2) / (ab * 2) - x1
  const xb = (b3 * c2 - b2 * c3) / ab
  const ya = (a3 * d2 - a2 * d3) / (ab * 2) - y1
  const yb = (a2 * c3 - a3 * c2) / ab
  const A = xb * xb + yb * yb - 1
  const B = 2 * (r1 + xa * xb + ya * yb)
  const C = xa * xa + ya * ya - r1 * r1
  const r = -(Math.abs(A) > 1e-6 ? (B + Math.sqrt(B * B - 4 * A * C)) / (2 * A) : C / B)
  return { x: x1 + xa + xb * r, y: y1 + ya + yb * r, r }
}

function encloseBasis(basis: readonly Circle[]): Circle {
  return basis.length === 1 ? encloseBasis1(basis[0]!) : basis.length === 2 ? encloseBasis2(basis[0]!, basis[1]!) : encloseBasis3(basis[0]!, basis[1]!, basis[2]!)
}

function extendBasis(basis: readonly Circle[], p: Circle): Circle[] {
  if (enclosesWeakAll(p, basis))
    return [p]
  for (const b of basis) {
    if (enclosesNot(p, b) && enclosesWeakAll(encloseBasis2(b, p), basis))
      return [b, p]
  }
  for (let i = 0; i < basis.length - 1; ++i) {
    for (let j = i + 1; j < basis.length; ++j) {
      const bi = basis[i]!
      const bj = basis[j]!
      if (enclosesNot(encloseBasis2(bi, bj), p)
        && enclosesNot(encloseBasis2(bi, p), bj)
        && enclosesNot(encloseBasis2(bj, p), bi)
        && enclosesWeakAll(encloseBasis3(bi, bj, p), basis)) {
        return [bi, bj, p]
      }
    }
  }
  throw invalidArgument('最小外接圆的基没能扩展：输入的圆有非有限数', {})
}

/** 一组圆的最小外接圆；random 决定考察的次序，缺省取固定种子。 */
export function packEnclose(circles: readonly Circle[], random: RandomSource = createRandom(PACK_SEED)): Circle | undefined {
  const list = [...circles]
  // Fisher–Yates：随机增量法的期望线性时间靠这一步
  for (let m = list.length; m;) {
    const i = Math.floor(random() * m--)
    const t = list[m]!
    list[m] = list[i]!
    list[i] = t
  }
  let basis: Circle[] = []
  let e: Circle | undefined
  for (let i = 0; i < list.length;) {
    const p = list[i]!
    if (e && enclosesWeak(e, p)) {
      ++i
    }
    else {
      basis = extendBasis(basis, p)
      e = encloseBasis(basis)
      i = 0
    }
  }
  return e
}

/* ---------- 兄弟圆 ---------- */

function place(b: Circle, a: Circle, c: Circle): void {
  const dx = b.x - a.x
  const dy = b.y - a.y
  const d2 = dx * dx + dy * dy
  if (d2) {
    let a2 = a.r + c.r
    a2 *= a2
    let b2 = b.r + c.r
    b2 *= b2
    if (a2 > b2) {
      const x = (d2 + b2 - a2) / (2 * d2)
      const y = Math.sqrt(Math.max(0, b2 / d2 - x * x))
      c.x = b.x - x * dx - y * dy
      c.y = b.y - x * dy + y * dx
    }
    else {
      const x = (d2 + a2 - b2) / (2 * d2)
      const y = Math.sqrt(Math.max(0, a2 / d2 - x * x))
      c.x = a.x + x * dx - y * dy
      c.y = a.y + x * dy + y * dx
    }
  }
  else {
    c.x = a.x + c.r
    c.y = a.y
  }
}

function intersects(a: Circle, b: Circle): boolean {
  const dr = a.r + b.r - 1e-6
  const dx = b.x - a.x
  const dy = b.y - a.y
  return dr > 0 && dr * dr > dx * dx + dy * dy
}

/** 前链上的一环。 */
interface ChainNode {
  readonly circle: Circle
  next: ChainNode
  previous: ChainNode
}

function chain(circle: Circle): ChainNode {
  const node = { circle } as ChainNode
  node.next = node
  node.previous = node
  return node
}

function score(node: ChainNode): number {
  const a = node.circle
  const b = node.next.circle
  const ab = a.r + b.r
  const dx = (a.x * b.r + b.x * a.r) / ab
  const dy = (a.y * b.r + b.y * a.r) / ab
  return dx * dx + dy * dy
}

/**
 * 把一组圆互相贴着排开：圆心写回每个圆，整体的最小外接圆落在原点；返回外接圆的半径。
 * 前链算法：新圆贴着链上离原点最近的一对相切放下，和链上别的圆相交就把链收紧重来。
 */
export function packSiblings(circles: Circle[], random: RandomSource = createRandom(PACK_SEED)): number {
  const n = circles.length
  if (n === 0)
    return 0
  let first = circles[0]!
  first.x = 0
  first.y = 0
  if (n === 1)
    return first.r
  const second = circles[1]!
  first.x = -second.r
  second.x = first.r
  second.y = 0
  if (n === 2)
    return first.r + second.r
  const third = circles[2]!
  place(second, first, third)
  let a = chain(first)
  let b = chain(second)
  let c = chain(third)
  a.next = c.previous = b
  b.next = a.previous = c
  c.next = b.previous = a

  for (let i = 3; i < n; ++i) {
    const circle = circles[i]!
    // 贴着 a、b 放下；和前链上的圆相交就把链收紧到相交的那个圆，在新的一对上重放，直到不相交
    for (;;) {
      place(a.circle, b.circle, circle)
      c = chain(circle)
      // 在前链上找离新圆最近的相交圆；「近」按沿链的距离算
      let j = b.next
      let k = a.previous
      let sj = b.circle.r
      let sk = a.circle.r
      let hit: 'ahead' | 'behind' | null = null
      do {
        if (sj <= sk) {
          if (intersects(j.circle, c.circle)) {
            hit = 'ahead'
            break
          }
          sj += j.circle.r
          j = j.next
        }
        else {
          if (intersects(k.circle, c.circle)) {
            hit = 'behind'
            break
          }
          sk += k.circle.r
          k = k.previous
        }
      } while (j !== k.next)
      if (hit === 'ahead')
        b = j
      else if (hit === 'behind')
        a = k
      else break
      a.next = b
      b.previous = a
    }
    // 放下：新圆插进 a 与 b 之间，再找离原点最近的一对当下一次的起点
    c.previous = a
    c.next = b
    a.next = b.previous = b = c
    let best = score(a)
    for (c = c.next; c !== b; c = c.next) {
      const s = score(c)
      if (s < best) {
        a = c
        best = s
      }
    }
    b = a.next
  }
  // 前链的最小外接圆就是整组的外接圆：平移到原点
  const front: Circle[] = [b.circle]
  for (c = b.next; c !== b; c = c.next)
    front.push(c.circle)
  const enclosing = packEnclose(front, random)!
  for (first of circles) {
    first.x -= enclosing.x
    first.y -= enclosing.y
  }
  return enclosing.r
}

/* ---------- 圆堆积 ---------- */

export interface PackOptions<T = unknown> {
  readonly size: readonly [number, number]
  /** 兄弟圆之间的间隙。 */
  readonly padding?: number
  /** 叶子的半径；缺省取聚合值的平方根，整体再缩放进尺寸。给了就不再缩放。 */
  readonly radius?: (node: HierarchyNode<T>) => number
}

export function pack<T>(root: HierarchyNode<T>, options: PackOptions<T>): HierarchyNode<T> {
  const [dx, dy] = options.size
  if (!(dx >= 0) || !(dy >= 0))
    throw invalidArgument('圆堆积的尺寸必须是非负数', { size: options.size })
  if (root.value == null && !options.radius)
    throw invalidArgument('圆堆积之前先 sum() 或 count() 算出聚合值，或给出叶子的半径', {})
  const padding = Math.max(0, options.padding ?? 0)
  const random = createRandom(PACK_SEED)
  const leafRadius = options.radius ?? ((node: HierarchyNode<T>) => Math.sqrt(node.value ?? 0))
  root.eachBefore((node) => {
    if (!node.children)
      node.r = Math.max(0, Number(leafRadius(node)) || 0)
  })
  const packChildren = (pad: number, k: number) => (node: HierarchyNode<T>): void => {
    const children = node.children
    if (!children)
      return
    const r = pad * k
    if (r)
      children.forEach((child) => { child.r += r })
    const e = packSiblings(children as Circle[], random)
    if (r)
      children.forEach((child) => { child.r -= r })
    node.r = e + r
  }
  const translate = (k: number) => (node: HierarchyNode<T>): void => {
    node.r *= k
    if (node.parent) {
      node.x = node.parent.x + k * node.x
      node.y = node.parent.y + k * node.y
    }
  }
  root.x = dx / 2
  root.y = dy / 2
  if (options.radius) {
    root.eachAfter(packChildren(padding, 0.5))
    root.eachBefore(translate(1))
  }
  else {
    // 先不带间隙排一次量出整体半径，再按缩放后的像素把间隙换回原始单位重排
    root.eachAfter(packChildren(0, 1))
    root.eachAfter(packChildren(padding, root.r / Math.min(dx, dy)))
    root.eachBefore(translate(Math.min(dx, dy) / (2 * root.r || 1)))
  }
  return root
}
