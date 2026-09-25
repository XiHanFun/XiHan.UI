/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 路径接收端：形状生成器只写入 PathSink。SVG 路径构建器产出 d 字符串；CanvasRenderingContext2D 本身就满足这个协议，可直接传入。

import { invalidArgument } from '../errors'

/**
 * 与 Canvas 2D 路径方法同名同义的最小协议。角度为弧度，从 x 轴正方向起、屏幕坐标下顺时针为正；
 * arc 与 arcTo 在已有当前点时先画直线接到弧的起点。
 */
export interface PathSink {
  moveTo: (x: number, y: number) => void
  lineTo: (x: number, y: number) => void
  bezierCurveTo: (x1: number, y1: number, x2: number, y2: number, x: number, y: number) => void
  quadraticCurveTo: (x1: number, y1: number, x: number, y: number) => void
  arc: (x: number, y: number, r: number, a0: number, a1: number, ccw?: boolean) => void
  arcTo: (x1: number, y1: number, x2: number, y2: number, r: number) => void
  rect: (x: number, y: number, w: number, h: number) => void
  closePath: () => void
}

/** 输出 SVG 路径字符串的接收端。 */
export interface SvgPath extends PathSink {
  toString: () => string
}

const TAU = 2 * Math.PI
const EPSILON = 1e-6

/**
 * SVG 路径构建器。数值保留 digits 位小数（缺省 2，末尾的 0 去掉），控制大数据量时的 DOM 体积；
 * 半径为负时报错。
 */
export function createSvgPath(digits = 2): SvgPath {
  if (!Number.isInteger(digits) || digits < 0 || digits > 15)
    throw invalidArgument('路径小数位必须是 0–15 的整数', { digits })
  const factor = 10 ** digits
  const n = (value: number): string => {
    const rounded = Math.round(value * factor) / factor
    return Object.is(rounded, -0) ? '0' : String(rounded)
  }

  let d = ''
  /** 当前点；null 表示还没有子路径。 */
  let cx: number | null = null
  let cy = 0
  /** 当前子路径的起点，closePath 回到这里。 */
  let sx = 0
  let sy = 0

  const move = (x: number, y: number): void => {
    d += `M${n(x)},${n(y)}`
    cx = x
    cy = y
    sx = x
    sy = y
  }
  const line = (x: number, y: number): void => {
    d += `L${n(x)},${n(y)}`
    cx = x
    cy = y
  }

  const sink: SvgPath = {
    moveTo: move,
    lineTo(x, y) {
      if (cx === null)
        move(x, y)
      else
        line(x, y)
    },
    bezierCurveTo(x1, y1, x2, y2, x, y) {
      if (cx === null)
        move(x1, y1)
      d += `C${n(x1)},${n(y1)},${n(x2)},${n(y2)},${n(x)},${n(y)}`
      cx = x
      cy = y
    },
    quadraticCurveTo(x1, y1, x, y) {
      if (cx === null)
        move(x1, y1)
      d += `Q${n(x1)},${n(y1)},${n(x)},${n(y)}`
      cx = x
      cy = y
    },
    arc(x, y, r, a0, a1, ccw = false) {
      if (r < 0)
        throw invalidArgument('弧的半径不能为负', { r })
      const x0 = x + r * Math.cos(a0)
      const y0 = y + r * Math.sin(a0)
      if (cx === null)
        move(x0, y0)
      else if (Math.abs(cx - x0) > EPSILON || Math.abs(cy - y0) > EPSILON)
        line(x0, y0)
      if (r === 0)
        return
      // 扫过的角度折算到 [0, 2π) 之外的整圈按整圆画
      let sweep = ccw ? a0 - a1 : a1 - a0
      if (sweep < 0)
        sweep = (sweep % TAU) + TAU
      const flag = ccw ? 0 : 1
      if (sweep > TAU - EPSILON) {
        // 整圆拆成两个半圆：SVG 的 A 命令起止点重合时不画
        d += `A${n(r)},${n(r)},0,1,${flag},${n(2 * x - x0)},${n(2 * y - y0)}A${n(r)},${n(r)},0,1,${flag},${n(x0)},${n(y0)}`
        cx = x0
        cy = y0
      }
      else if (sweep > EPSILON) {
        const x1 = x + r * Math.cos(a1)
        const y1 = y + r * Math.sin(a1)
        d += `A${n(r)},${n(r)},0,${sweep >= Math.PI ? 1 : 0},${flag},${n(x1)},${n(y1)}`
        cx = x1
        cy = y1
      }
    },
    arcTo(x1, y1, x2, y2, r) {
      if (r < 0)
        throw invalidArgument('弧的半径不能为负', { r })
      if (cx === null) {
        move(x1, y1)
        return
      }
      const x01 = cx - x1
      const y01 = cy - y1
      const x21 = x2 - x1
      const y21 = y2 - y1
      const l01 = Math.hypot(x01, y01)
      const l21 = Math.hypot(x21, y21)
      // 与当前点重合：什么也不画
      if (l01 < EPSILON)
        return
      // 三点共线或半径为 0：直线接到拐点
      if (Math.abs(y01 * x21 - y21 * x01) < EPSILON || r === 0 || l21 < EPSILON) {
        line(x1, y1)
        return
      }
      // 两条切线夹角的一半决定切点到拐点的距离
      const cos = (x01 * x21 + y01 * y21) / (l01 * l21)
      const half = Math.acos(Math.max(-1, Math.min(1, cos))) / 2
      const tangent = r / Math.tan(half)
      const ax = x1 + (x01 / l01) * tangent
      const ay = y1 + (y01 / l01) * tangent
      const bx = x1 + (x21 / l21) * tangent
      const by = y1 + (y21 / l21) * tangent
      if (Math.abs(ax - cx) > EPSILON || Math.abs(ay - cy) > EPSILON)
        line(ax, ay)
      const sweepFlag = x01 * y21 - y01 * x21 > 0 ? 0 : 1
      d += `A${n(r)},${n(r)},0,0,${sweepFlag},${n(bx)},${n(by)}`
      cx = bx
      cy = by
    },
    rect(x, y, w, h) {
      move(x, y)
      d += `h${n(w)}v${n(h)}h${n(-w)}Z`
    },
    closePath() {
      if (cx === null)
        return
      d += 'Z'
      cx = sx
      cy = sy
    },
    toString: () => d,
  }
  return Object.freeze(sink)
}
