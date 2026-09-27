/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 力导模拟：速度 Verlet 积分，α 从 1 按 alphaDecay 衰减到 alphaMin，每轮速度乘 (1 − velocityDecay)。
// 力：连线弹簧（强度缺省 1 / 两端较小的度数）、电荷（四叉树 Barnes–Hut，θ 缺省 0.9）、向心、碰撞（四叉树）、
// 朝 x / y 定位。初始位置按叶序排开而不是随机撒点；重合时的微扰用种子随机数，同样的输入永远得到同样的布局。

import type { RandomSource } from '../../random'
import type { FlatQuadtree } from './flat-quadtree'
import { invalidArgument } from '../../errors'
import { createRandom } from '../../random'
import { buildFlatQuadtree } from './flat-quadtree'

export interface ForceNode {
  x: number
  y: number
  vx: number
  vy: number
  /** 固定的位置：拖拽时写入，松手后清成 null。 */
  fx: number | null
  fy: number | null
}

export interface ForceLink {
  /** 两端节点的下标。 */
  readonly source: number
  readonly target: number
}

type PerLink = number | ((link: ForceLink, index: number) => number)
type PerNode = number | ((index: number) => number)

export interface ForceOptions {
  /** 弹簧的静止长度，缺省 30。 */
  readonly linkDistance?: PerLink
  /** 弹簧的强度，缺省 1 / 两端较小的度数：连得多的节点不被一条连线拽跑。 */
  readonly linkStrength?: PerLink
  /** 电荷强度，负为互斥，缺省 −30。 */
  readonly charge?: PerNode
  /** Barnes–Hut 的近似阈值：格子宽与距离之比小于它时整格当一个质点，缺省 0.9。 */
  readonly theta?: number
  /** 电荷作用的最近距离，更近时按它算，免得力无穷大，缺省 1。 */
  readonly distanceMin?: number
  /** 电荷作用的最远距离，缺省不限。 */
  readonly distanceMax?: number
  /** 向心：每轮把质心平移回这一点；null 关掉，缺省 [0, 0]。 */
  readonly center?: readonly [number, number] | null
  /** 碰撞半径：节点之间至少隔开两者半径之和；缺省不做碰撞。 */
  readonly collide?: PerNode | null
  /** 碰撞的强度，缺省 1。 */
  readonly collideStrength?: number
  /** 朝一个横坐标定位（分组聚拢、成行）。 */
  readonly x?: { readonly target: PerNode, readonly strength?: PerNode } | null
  /** 朝一个纵坐标定位。 */
  readonly y?: { readonly target: PerNode, readonly strength?: PerNode } | null
  /** 缺省 0.001。 */
  readonly alphaMin?: number
  /** 缺省 1 − alphaMin^(1/300)：约 300 轮从 1 衰减到 alphaMin。 */
  readonly alphaDecay?: number
  /** 每轮速度的衰减，缺省 0.4。 */
  readonly velocityDecay?: number
  /** 重合时微扰用的种子。 */
  readonly seed?: number
}

export interface ForceSimulation {
  readonly nodes: readonly ForceNode[]
  /** 当前的 α。 */
  readonly alpha: () => number
  /** 推进若干轮（缺省 1）。 */
  readonly tick: (iterations?: number) => void
  /** 同步推进到 α 低于 alphaMin。 */
  readonly run: () => void
  /** 重新加热：α 回到给定值（缺省 1），拖拽与数据小改时用。 */
  readonly reheat: (alpha?: number) => void
  /** α 衰减的目标：拖拽中设成正数让模拟一直走，松手设回 0。 */
  readonly setAlphaTarget: (target: number) => void
  /** 把节点钉在 (x, y)。 */
  readonly fix: (index: number, x: number, y: number) => void
  /** 松开钉住的节点。 */
  readonly release: (index: number) => void
}

/** 叶序的初始半径与黄金角：节点按向日葵的籽排开，不重合也不依赖随机数。 */
const INITIAL_RADIUS = 10
const INITIAL_ANGLE = Math.PI * (3 - Math.sqrt(5))

function perLink(value: PerLink | undefined, fallback: (link: ForceLink, index: number) => number, links: readonly ForceLink[]): Float64Array {
  const out = new Float64Array(links.length)
  links.forEach((link, i) => {
    out[i] = typeof value === 'function' ? value(link, i) : value ?? fallback(link, i)
  })
  return out
}

function perNode(value: PerNode | undefined, fallback: number, n: number): Float64Array {
  const out = new Float64Array(n)
  for (let i = 0; i < n; i++)
    out[i] = typeof value === 'function' ? value(i) : value ?? fallback
  return out
}

/** 建一个力导模拟：count 个节点按叶序排开（或取 initial 给的位置），连线按下标连两端。 */
export function forceSimulation(
  count: number,
  links: readonly ForceLink[],
  options: ForceOptions = {},
  initial?: readonly { readonly x: number, readonly y: number }[],
): ForceSimulation {
  if (!Number.isInteger(count) || count < 0)
    throw invalidArgument('节点数必须是非负整数', { count })
  for (const [index, link] of links.entries()) {
    if (!(link.source >= 0 && link.source < count && link.target >= 0 && link.target < count))
      throw invalidArgument(`第 ${index} 条连线的端点越界`, { index, source: link.source, target: link.target })
  }
  const center = options.center === undefined ? [0, 0] as const : options.center
  const nodes: ForceNode[] = Array.from({ length: count }, (_, i) => {
    const given = initial?.[i]
    if (given)
      return { x: given.x, y: given.y, vx: 0, vy: 0, fx: null, fy: null }
    const r = INITIAL_RADIUS * Math.sqrt(0.5 + i)
    const a = i * INITIAL_ANGLE
    return { x: (center?.[0] ?? 0) + r * Math.cos(a), y: (center?.[1] ?? 0) + r * Math.sin(a), vx: 0, vy: 0, fx: null, fy: null }
  })
  const random: RandomSource = createRandom(options.seed ?? 0x5EED)
  const jiggle = (): number => (random() - 0.5) * 1e-6

  // 连线：度数决定缺省强度与两端分摊的比例
  const degree = new Float64Array(count)
  for (const link of links) {
    degree[link.source]! += 1
    degree[link.target]! += 1
  }
  const distances = perLink(options.linkDistance, () => 30, links)
  const linkStrengths = perLink(options.linkStrength, link => 1 / Math.max(1, Math.min(degree[link.source]!, degree[link.target]!)), links)
  const bias = Float64Array.from(links, link => degree[link.source]! / (degree[link.source]! + degree[link.target]! || 1))

  const charges = perNode(options.charge, -30, count)
  const theta2 = (options.theta ?? 0.9) ** 2
  const distanceMin2 = (options.distanceMin ?? 1) ** 2
  const distanceMax2 = (options.distanceMax ?? Number.POSITIVE_INFINITY) ** 2
  const radii = options.collide == null ? null : perNode(options.collide, 0, count)
  const collideStrength = options.collideStrength ?? 1
  const xTarget = options.x ? perNode(options.x.target, 0, count) : null
  const xStrength = options.x ? perNode(options.x.strength, 0.1, count) : null
  const yTarget = options.y ? perNode(options.y.target, 0, count) : null
  const yStrength = options.y ? perNode(options.y.strength, 0.1, count) : null

  const alphaMin = options.alphaMin ?? 0.001
  const alphaDecay = options.alphaDecay ?? 1 - alphaMin ** (1 / 300)
  const velocityKeep = 1 - (options.velocityDecay ?? 0.4)
  let alpha = 1
  let alphaTarget = 0

  const xs = new Float64Array(count)
  const ys = new Float64Array(count)
  // 电荷与碰撞各自重建一棵树，缓冲逐轮复用；遍历用显式的栈，不递归
  let chargeTree: FlatQuadtree | null = null
  let collideTree: FlatQuadtree | null = null
  const stack = new Int32Array(4 * 32 + 8)

  const applyLinks = (): void => {
    links.forEach((link, i) => {
      const s = nodes[link.source]!
      const t = nodes[link.target]!
      let dx = t.x + t.vx - s.x - s.vx || jiggle()
      let dy = t.y + t.vy - s.y - s.vy || jiggle()
      let l = Math.sqrt(dx * dx + dy * dy)
      l = ((l - distances[i]!) / l) * alpha * linkStrengths[i]!
      dx *= l
      dy *= l
      const b = bias[i]!
      t.vx -= dx * b
      t.vy -= dy * b
      s.vx += dx * (1 - b)
      s.vy += dy * (1 - b)
    })
  }

  const applyCharge = (): void => {
    for (let i = 0; i < count; i++) {
      xs[i] = nodes[i]!.x
      ys[i] = nodes[i]!.y
    }
    const tree = chargeTree = buildFlatQuadtree(chargeTree, xs, ys, count)
    if (tree.size === 0)
      return
    const { first, last, start, end, side, charge, cx, cy, order } = tree
    // 倒着扫就是后序：累计每格的电荷与按强度绝对值加权的重心
    for (let q = tree.size - 1; q >= 0; q--) {
      let sum = 0
      let weight = 0
      let wx = 0
      let wy = 0
      if (first[q]! < 0) {
        for (let k = start[q]!; k < end[q]!; k++) {
          const i = order[k]!
          const c = charges[i]!
          const w = Math.abs(c)
          sum += c
          weight += w
          wx += w * xs[i]!
          wy += w * ys[i]!
        }
      }
      else {
        for (let c = first[q]!; c < last[q]!; c++) {
          const w = Math.abs(charge[c]!)
          sum += charge[c]!
          weight += w
          wx += w * cx[c]!
          wy += w * cy[c]!
        }
      }
      charge[q] = sum
      cx[q] = weight > 0 ? wx / weight : tree.x0[q]! + side[q]! / 2
      cy[q] = weight > 0 ? wy / weight : tree.y0[q]! + side[q]! / 2
    }
    for (let i = 0; i < count; i++) {
      const xi = xs[i]!
      const yi = ys[i]!
      let ax = 0
      let ay = 0
      let top = 0
      stack[top++] = 0
      while (top > 0) {
        const q = stack[--top]!
        let dx = cx[q]! - xi
        let dy = cy[q]! - yi
        let l = dx * dx + dy * dy
        const w = side[q]!
        // 离得够远：整格当一个质点
        if (w * w / theta2 < l) {
          if (l < distanceMax2) {
            if (dx === 0) {
              dx = jiggle()
              l += dx * dx
            }
            if (dy === 0) {
              dy = jiggle()
              l += dy * dy
            }
            if (l < distanceMin2)
              l = Math.sqrt(distanceMin2 * l)
            ax += (dx * charge[q]! * alpha) / l
            ay += (dy * charge[q]! * alpha) / l
          }
          continue
        }
        if (first[q]! >= 0) {
          for (let c = first[q]!; c < last[q]!; c++) stack[top++] = c
          continue
        }
        for (let k = start[q]!; k < end[q]!; k++) {
          const j = order[k]!
          if (j === i)
            continue
          dx = xs[j]! - xi
          dy = ys[j]! - yi
          l = dx * dx + dy * dy
          if (l >= distanceMax2)
            continue
          if (dx === 0) {
            dx = jiggle()
            l += dx * dx
          }
          if (dy === 0) {
            dy = jiggle()
            l += dy * dy
          }
          if (l < distanceMin2)
            l = Math.sqrt(distanceMin2 * l)
          ax += (dx * charges[j]! * alpha) / l
          ay += (dy * charges[j]! * alpha) / l
        }
      }
      nodes[i]!.vx += ax
      nodes[i]!.vy += ay
    }
  }

  const applyCollide = (): void => {
    // 按下一步的位置判断重叠：速度已经加上了别的力
    for (let i = 0; i < count; i++) {
      xs[i] = nodes[i]!.x + nodes[i]!.vx
      ys[i] = nodes[i]!.y + nodes[i]!.vy
    }
    const tree = collideTree = buildFlatQuadtree(collideTree, xs, ys, count)
    if (tree.size === 0)
      return
    const { first, last, start, end, side, x0, y0, radius, order } = tree
    for (let q = tree.size - 1; q >= 0; q--) {
      let r = 0
      if (first[q]! < 0) {
        for (let k = start[q]!; k < end[q]!; k++) r = Math.max(r, radii![order[k]!]!)
      }
      else {
        for (let c = first[q]!; c < last[q]!; c++) r = Math.max(r, radius[c]!)
      }
      radius[q] = r
    }
    for (let i = 0; i < count; i++) {
      const node = nodes[i]!
      const ri = radii![i]!
      const x = xs[i]!
      const y = ys[i]!
      let top = 0
      stack[top++] = 0
      while (top > 0) {
        const q = stack[--top]!
        const reach = ri + radius[q]!
        // 格子离得比两者半径之和还远：整格跳过
        if (x + reach < x0[q]! || x - reach > x0[q]! + side[q]! || y + reach < y0[q]! || y - reach > y0[q]! + side[q]!)
          continue
        if (first[q]! >= 0) {
          for (let c = first[q]!; c < last[q]!; c++) stack[top++] = c
          continue
        }
        for (let k = start[q]!; k < end[q]!; k++) {
          const j = order[k]!
          // 每对只算一次：由下标小的那个推开两边
          if (j <= i)
            continue
          const other = nodes[j]!
          const rj = radii![j]!
          const r = ri + rj
          let dx = x - xs[j]!
          let dy = y - ys[j]!
          let l = dx * dx + dy * dy
          if (l >= r * r)
            continue
          if (dx === 0) {
            dx = jiggle()
            l += dx * dx
          }
          if (dy === 0) {
            dy = jiggle()
            l += dy * dy
          }
          l = Math.sqrt(l)
          const push = ((r - l) / l) * collideStrength
          dx *= push
          dy *= push
          // 大的节点挪得少
          const share = (rj * rj) / (ri * ri + rj * rj || 1)
          node.vx += dx * share
          node.vy += dy * share
          other.vx -= dx * (1 - share)
          other.vy -= dy * (1 - share)
        }
      }
    }
  }

  const applyPosition = (): void => {
    for (let i = 0; i < count; i++) {
      const node = nodes[i]!
      if (xTarget)
        node.vx += (xTarget[i]! - node.x) * xStrength![i]! * alpha
      if (yTarget)
        node.vy += (yTarget[i]! - node.y) * yStrength![i]! * alpha
    }
  }

  const applyCenter = (): void => {
    if (!center || count === 0)
      return
    let sx = 0
    let sy = 0
    for (const node of nodes) {
      sx += node.x
      sy += node.y
    }
    sx = sx / count - center[0]
    sy = sy / count - center[1]
    for (const node of nodes) {
      node.x -= sx
      node.y -= sy
    }
  }

  const step = (): void => {
    alpha += (alphaTarget - alpha) * alphaDecay
    if (links.length > 0)
      applyLinks()
    applyCharge()
    if (radii)
      applyCollide()
    if (xTarget || yTarget)
      applyPosition()
    applyCenter()
    for (const node of nodes) {
      if (node.fx == null) {
        node.vx *= velocityKeep
        node.x += node.vx
      }
      else {
        node.x = node.fx
        node.vx = 0
      }
      if (node.fy == null) {
        node.vy *= velocityKeep
        node.y += node.vy
      }
      else {
        node.y = node.fy
        node.vy = 0
      }
    }
  }

  return {
    nodes,
    alpha: () => alpha,
    tick: (iterations = 1) => {
      for (let k = 0; k < iterations; k++) step()
    },
    run: () => {
      // α 按几何级数逼近目标：轮数有上限，目标高于 alphaMin 时也会停
      const limit = Math.ceil(Math.log(alphaMin) / Math.log(1 - alphaDecay)) + 1
      for (let k = 0; k < limit; k++) {
        if (alpha < alphaMin)
          break
        step()
      }
    },
    reheat: (value = 1) => {
      alpha = value
    },
    setAlphaTarget: (target) => {
      alphaTarget = target
    },
    fix: (index, x, y) => {
      const node = nodes[index]
      if (!node)
        return
      node.fx = x
      node.fy = y
    },
    release: (index) => {
      const node = nodes[index]
      if (!node)
        return
      node.fx = null
      node.fy = null
    },
  }
}
