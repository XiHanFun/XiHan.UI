/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 弧（扇区、环段）：角度 0 在 12 点方向、顺时针为正；绘图区不随 RTL 镜像。
// 扇区间隙是与径向边平行的等宽条带，间隙宽度不随半径变化；圆角夹到环厚一半与弧长可容纳的范围内。

import type { Point } from '../geometry'
import type { PathSink } from '../path'
import { invalidArgument } from '../errors'
import { createSvgPath } from '../path'
import { pointRadial } from './curves'

export interface ArcParams {
  readonly innerRadius: number
  readonly outerRadius: number
  /** 弧度；endAngle < startAngle 时逆时针。 */
  readonly startAngle: number
  readonly endAngle: number
  /** 相邻扇区之间的间隙所对的角度，两侧各让出一半；在 padRadius 处量出的条带宽度沿整条边保持不变。 */
  readonly padAngle?: number
  /** 量间隙的半径，缺省 √(内半径² + 外半径²)。要固定间隙像素宽度 w，传 padAngle = w / padRadius。 */
  readonly padRadius?: number
  /**
   * 四角圆角半径；夹到环厚的一半，并缩到弧长容得下两侧圆角。
   * 内沿收成尖端（内半径为 0，或间隙吃掉了内沿）时，尖端同样按这个半径倒圆，缩到边线容得下；
   * 扇区不小于半圈时尖端是凹角，保持尖。
   */
  readonly cornerRadius?: number
}

const TAU = 2 * Math.PI
const EPSILON = 1e-9

function check(params: ArcParams): void {
  const fields = ['innerRadius', 'outerRadius', 'startAngle', 'endAngle', 'padAngle', 'padRadius', 'cornerRadius'] as const
  for (const name of fields) {
    const value = params[name]
    if (value !== undefined && !Number.isFinite(value))
      throw invalidArgument(`弧的参数 ${name} 必须是有限数`, { [name]: value })
  }
  if (params.innerRadius < 0 || params.outerRadius < 0)
    throw invalidArgument('弧的半径不能为负', { innerRadius: params.innerRadius, outerRadius: params.outerRadius })
  if ((params.padAngle ?? 0) < 0 || (params.cornerRadius ?? 0) < 0 || (params.padRadius ?? 0) < 0)
    throw invalidArgument('padAngle、padRadius 与 cornerRadius 不能为负', { params })
}

/** 按起始角与带符号的扫角画一段圆弧；扫角几乎为 0 时不画。 */
function sweepArc(sink: PathSink, cx: number, cy: number, r: number, from: number, sweep: number): void {
  if (Math.abs(sweep) < EPSILON || r < EPSILON)
    return
  sink.arc(cx, cy, r, from, from + sweep, sweep < 0)
}

function drawArc(params: ArcParams, sink: PathSink): void {
  check(params)
  const r0 = Math.min(params.innerRadius, params.outerRadius)
  const r1 = Math.max(params.innerRadius, params.outerRadius)
  const { startAngle, endAngle } = params
  const dir = endAngle >= startAngle ? 1 : -1
  const da = Math.abs(endAngle - startAngle)
  const mid = (startAngle + endAngle) / 2

  if (r1 < EPSILON) {
    sink.moveTo(0, 0)
    sink.closePath()
    return
  }
  // 整圈：外圆与反向的内圆两个子路径，非零环绕规则下中间镂空
  if (da >= TAU - EPSILON) {
    const [x1, y1] = pointRadial(startAngle, r1)
    sink.moveTo(x1, y1)
    sweepArc(sink, 0, 0, r1, startAngle - Math.PI / 2, dir * TAU)
    if (r0 > EPSILON) {
      const [x0, y0] = pointRadial(startAngle, r0)
      sink.moveTo(x0, y0)
      sweepArc(sink, 0, 0, r0, startAngle - Math.PI / 2, -dir * TAU)
    }
    sink.closePath()
    return
  }

  const pad = params.padAngle ?? 0
  const h = pad > EPSILON ? (params.padRadius ?? Math.hypot(r0, r1)) * Math.sin(pad / 2) : 0
  // 边线离径向线 h；外圆上两条边线之间已经没有弧，整个扇区被间隙吃掉
  if (h >= r1 || da - 2 * Math.asin(h / r1) <= EPSILON) {
    const [x, y] = pointRadial(mid, (r0 + r1) / 2)
    sink.moveTo(x, y)
    sink.closePath()
    return
  }
  const innerCollapsed = r0 < EPSILON || h >= r0 || da - 2 * Math.asin(h / r0) <= EPSILON
  // 内沿收成尖端时，尖端是两条边线的交点
  const tipDistance = h > EPSILON && da < Math.PI ? h / Math.sin(da / 2) : 0
  const tipAlong = h > EPSILON && da < Math.PI ? h / Math.tan(da / 2) : 0

  // 外角圆角：圆心离原点 r1 − c、离径向线 h + c；α 是圆角与外圆切点相对径向线的角度
  const outerAlong = (c: number): number => Math.sqrt(Math.max(0, (r1 - c) ** 2 - (h + c) ** 2))
  const innerAlong = (c: number): number => Math.sqrt(Math.max(0, (r0 + c) ** 2 - (h + c) ** 2))
  const fits = (c: number): boolean => {
    if ((r1 - c) ** 2 <= (h + c) ** 2 || 2 * Math.atan2(h + c, outerAlong(c)) > da)
      return false
    if (innerCollapsed)
      return outerAlong(c) >= tipAlong
    return (r0 + c) ** 2 > (h + c) ** 2 && 2 * Math.atan2(h + c, innerAlong(c)) <= da
  }
  let c = Math.max(0, Math.min(params.cornerRadius ?? 0, (r1 - r0) / 2))
  if (c > 0 && !fits(c)) {
    let low = 0
    let high = c
    for (let i = 0; i < 40; i++) {
      const m = (low + high) / 2
      if (fits(m))
        low = m
      else
        high = m
    }
    c = low
  }

  const phi0 = startAngle - Math.PI / 2
  const phi1 = endAngle - Math.PI / 2
  /** 边线上的点：沿径向走 along、再向扇区内侧偏 offset。inward 为内侧法向所在的屏幕角。 */
  const onEdge = (phi: number, inward: number, along: number, offset: number): Point => [
    along * Math.cos(phi) + offset * Math.cos(inward),
    along * Math.sin(phi) + offset * Math.sin(inward),
  ]
  const inward0 = phi0 + (dir * Math.PI) / 2
  const inward1 = phi1 - (dir * Math.PI) / 2

  const s1 = outerAlong(c)
  const alpha = Math.atan2(h + c, s1)
  const outerStartCenter = onEdge(phi0, inward0, s1, h + c)
  const outerEndCenter = onEdge(phi1, inward1, s1, h + c)
  const start = onEdge(phi0, inward0, s1, h)
  sink.moveTo(start[0], start[1])
  sweepArc(sink, outerStartCenter[0], outerStartCenter[1], c, phi0 - (dir * Math.PI) / 2, dir * (Math.PI / 2 + alpha))
  sweepArc(sink, 0, 0, r1, phi0 + dir * alpha, dir * (da - 2 * alpha))
  sweepArc(sink, outerEndCenter[0], outerEndCenter[1], c, phi1 - dir * alpha, dir * (Math.PI / 2 + alpha))

  if (innerCollapsed) {
    // 尖端倒圆：与两条边线都相切的一段小圆弧，切点离尖端 r / tan(θ/2)，圆心在角平分线上离尖端 r / sin(θ/2)；
    // 切点不能越过外角圆角的起点，半径按边线剩下的长度收小
    const slope = Math.tan(da / 2)
    const tip = da < Math.PI - EPSILON
      ? Math.max(0, Math.min(params.cornerRadius ?? 0, (s1 - tipAlong) * slope))
      : 0
    if (tip > EPSILON) {
      const [ex, ey] = onEdge(phi1, inward1, tipAlong + tip / slope, h)
      const [fx, fy] = pointRadial(mid, tipDistance + tip / Math.sin(da / 2))
      sink.lineTo(ex, ey)
      sweepArc(sink, fx, fy, tip, inward1 + Math.PI, dir * (Math.PI - da))
    }
    else {
      const [x, y] = pointRadial(mid, tipDistance)
      sink.lineTo(x, y)
    }
  }
  else {
    const s0 = innerAlong(c)
    const beta = Math.atan2(h + c, s0)
    const innerEndCenter = onEdge(phi1, inward1, s0, h + c)
    const innerStartCenter = onEdge(phi0, inward0, s0, h + c)
    const [ex, ey] = onEdge(phi1, inward1, s0, h)
    sink.lineTo(ex, ey)
    sweepArc(sink, innerEndCenter[0], innerEndCenter[1], c, phi1 + (dir * Math.PI) / 2, dir * (Math.PI / 2 - beta))
    sweepArc(sink, 0, 0, r0, phi1 - dir * beta, -dir * (da - 2 * beta))
    sweepArc(sink, innerStartCenter[0], innerStartCenter[1], c, phi0 + dir * beta + Math.PI, dir * (Math.PI / 2 - beta))
  }
  sink.closePath()
}

/** 弧的路径：不传 sink 返回 SVG 路径字符串（2 位小数），传入 sink 时直接写入。 */
export function arc(params: ArcParams): string
export function arc(params: ArcParams, sink: PathSink): void
export function arc(params: ArcParams, sink?: PathSink): string | void {
  if (sink) {
    drawArc(params, sink)
    return
  }
  const path = createSvgPath()
  drawArc(params, path)
  return path.toString()
}

/** 弧的中心点：中间角度、内外半径的中点处，用于放标签。 */
export function arcCentroid(params: ArcParams): Point {
  return pointRadial((params.startAngle + params.endAngle) / 2, (params.innerRadius + params.outerRadius) / 2)
}
