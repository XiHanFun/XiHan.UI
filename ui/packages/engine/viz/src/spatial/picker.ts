/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 拾取器：命中走几何，不依赖 DOM。柱按整条带命中，折线与面积按 x 取最近键，散点用四叉树取最近点，扇区按极坐标判定。

import type { DatumRef, Mark, Scene } from '../scene/types'
import type { QuadtreeHit } from './quadtree'
import { invalidArgument } from '../errors'
import { sceneMarks } from '../scene/scene'
import { pointInArc } from './polygon'
import { createQuadtree } from './quadtree'

export interface PickerOptions {
  /** 细指针的最小命中半径，缺省 12（命中区至少 24px）。 */
  readonly radius?: number
  /** 粗指针（触摸、触控笔）的最小命中半径，缺省 22（命中区 44px）。 */
  readonly coarseRadius?: number
  /** 柱的命中区：band 为整条带宽 × 绘图区的值域（很短的柱也能命中），mark 为柱本身外扩命中半径。缺省 band。 */
  readonly rectHit?: 'band' | 'mark'
  /** axis 模式沿哪根轴对齐，缺省 x。 */
  readonly axis?: 'x' | 'y'
}

export interface PickOptions {
  /** item 只报告命中的那一个；axis 报告与之同一自变量位置上的全部系列。缺省 item。 */
  readonly mode?: 'item' | 'axis'
  /** 指针事件的 pointerType；touch 与 pen 按粗指针取命中半径。 */
  readonly pointerType?: string
}

export interface PickHit {
  /** 命中的标记键。 */
  readonly key: string
  /** 折线、面积里命中的点的键。 */
  readonly pointKey?: string
  readonly datum?: DatumRef
  /** 锚点（提示框与十字准线对齐的位置）。 */
  readonly x: number
  readonly y: number
  /** 指针到命中几何的距离；落在标记内为 0。 */
  readonly distance: number
}

export interface Picker {
  readonly pick: (x: number, y: number, options?: PickOptions) => PickHit[]
}

interface Candidate extends PickHit {
  /** 沿对齐轴的位置，axis 模式据此归组。 */
  readonly along: number
  /** 同一系列的标识，axis 模式每个系列只取一个。 */
  readonly series: string
}

const COARSE = new Set(['touch', 'pen'])

/** 由场景建拾取器：只看 data 层、未在退场、可聚焦（未声明时视为可聚焦）的形状标记。 */
export function createPicker(scene: Scene, options: PickerOptions = {}): Picker {
  const { radius = 12, coarseRadius = 22, rectHit = 'band', axis = 'x' } = options
  if (!(radius >= 0) || !(coarseRadius >= 0))
    throw invalidArgument('命中半径不能为负', { radius, coarseRadius })
  const { bounds } = scene
  const pickable = sceneMarks(scene).filter(({ layer, mark }) =>
    layer === 'data' && !mark.exiting && mark.a11y?.focusable !== false)

  interface Positioned<M extends Mark['kind']> { mark: Extract<Mark, { kind: M }>, dx: number, dy: number }
  const of = <M extends Mark['kind']>(kind: M): Positioned<M>[] =>
    pickable.filter(e => e.mark.kind === kind).map(e => ({ mark: e.mark as Extract<Mark, { kind: M }>, dx: e.offset[0], dy: e.offset[1] }))
  const rects = of('rect')
  const arcs = of('arc')
  const symbols = of('symbol')
  const series = [...of('line'), ...of('area')]
  const symbolTree = createQuadtree(symbols, s => s.mark.x + s.dx, s => s.mark.y + s.dy)
  const largestSymbol = Math.max(0, ...symbols.map(s => Math.sqrt(s.mark.size / Math.PI)))
  const linePoints = series.flatMap(({ mark, dx, dy }) => mark.points
    .map((point, index) => ({ mark, point, index, x: point.x + dx, y: point.y + dy }))
    .filter(p => p.point.defined !== false && Number.isFinite(p.x) && Number.isFinite(p.y)))

  const seriesOf = (mark: Mark): string => mark.datum?.seriesId ?? mark.key
  const inBounds = (x: number, y: number): boolean =>
    x >= bounds.x && x <= bounds.x + bounds.width && y >= bounds.y && y <= bounds.y + bounds.height

  function candidates(px: number, py: number, reach: number): Candidate[] {
    const out: Candidate[] = []
    for (const { mark, dx, dy } of rects) {
      const x0 = Math.min(mark.x, mark.x + mark.width) + dx
      const y0 = Math.min(mark.y, mark.y + mark.height) + dy
      const x1 = x0 + Math.abs(mark.width)
      const y1 = y0 + Math.abs(mark.height)
      const vertical = (mark.orientation ?? 'vertical') === 'vertical'
      // 整条带：沿值轴铺满绘图区
      const [bx0, by0, bx1, by1] = rectHit === 'band'
        ? (vertical ? [x0, bounds.y, x1, bounds.y + bounds.height] : [bounds.x, y0, bounds.x + bounds.width, y1])
        : [x0, y0, x1, y1]
      const distance = Math.hypot(Math.max(bx0 - px, 0, px - bx1), Math.max(by0 - py, 0, py - by1))
      if (distance > (rectHit === 'band' ? 0 : reach))
        continue
      // 同一条带上堆叠的几段：指针落在哪段就是哪段，否则按到该段的距离排
      const own = Math.hypot(Math.max(x0 - px, 0, px - x1), Math.max(y0 - py, 0, py - y1))
      const anchorX = vertical ? (x0 + x1) / 2 : x1
      const anchorY = vertical ? y0 : (y0 + y1) / 2
      out.push({ key: mark.key, datum: mark.datum, x: anchorX, y: anchorY, distance: own, along: axis === 'x' ? (x0 + x1) / 2 : (y0 + y1) / 2, series: seriesOf(mark) })
    }
    for (const { mark, dx, dy } of arcs) {
      const cx = mark.cx + dx
      const cy = mark.cy + dy
      if (!pointInArc(px - cx, py - cy, mark))
        continue
      const mid = (mark.startAngle + mark.endAngle) / 2
      const r = (mark.innerRadius + mark.outerRadius) / 2
      out.push({ key: mark.key, datum: mark.datum, x: cx + r * Math.sin(mid), y: cy - r * Math.cos(mid), distance: 0, along: mid, series: seriesOf(mark) })
    }
    // 命中半径 = max（符号外延 + 2px 间隙，最小命中半径）
    const near: QuadtreeHit<Positioned<'symbol'>>[] = symbolTree.findAll(px, py, Math.max(reach, largestSymbol + 2))
    for (const hit of near) {
      const extent = Math.sqrt(hit.item.mark.size / Math.PI)
      if (hit.distance > Math.max(extent + 2, reach))
        continue
      const distance = Math.max(0, hit.distance - extent)
      out.push({ key: hit.item.mark.key, datum: hit.item.mark.datum, x: hit.x, y: hit.y, distance, along: axis === 'x' ? hit.x : hit.y, series: seriesOf(hit.item.mark) })
    }
    // 折线与面积：沿对齐轴取最近的点所在的键，再在该键上按另一轴取最近的系列
    if (linePoints.length > 0 && inBounds(px, py)) {
      const gap = (p: { x: number, y: number }): number => Math.abs(axis === 'x' ? p.x - px : p.y - py)
      const nearest = Math.min(...linePoints.map(gap))
      for (const p of linePoints) {
        if (gap(p) - nearest > 0.5)
          continue
        const cross = Math.abs(axis === 'x' ? p.y - py : p.x - px)
        out.push({
          key: p.mark.key,
          pointKey: p.point.key,
          datum: p.mark.datum ? { seriesId: p.mark.datum.seriesId, index: p.index } : undefined,
          x: p.x,
          y: p.y,
          distance: cross,
          along: axis === 'x' ? p.x : p.y,
          series: seriesOf(p.mark),
        })
      }
    }
    return out
  }

  const strip = ({ along: _along, series: _series, ...hit }: Candidate): PickHit =>
    (hit.pointKey === undefined ? { key: hit.key, datum: hit.datum, x: hit.x, y: hit.y, distance: hit.distance } : hit)

  return Object.freeze({
    pick(px: number, py: number, pickOptions: PickOptions = {}): PickHit[] {
      if (!Number.isFinite(px) || !Number.isFinite(py))
        return []
      const reach = COARSE.has(pickOptions.pointerType ?? '') ? coarseRadius : radius
      const found = candidates(px, py, reach).sort((a, b) => a.distance - b.distance)
      const best = found[0]
      if (!best)
        return []
      if ((pickOptions.mode ?? 'item') === 'item')
        return [strip(best)]
      // axis：与最近者同一对齐位置上的全部系列，每个系列取离指针最近的一个
      const bySeries = new Map<string, Candidate>()
      for (const hit of found) {
        if (Math.abs(hit.along - best.along) > 0.5)
          continue
        if (!bySeries.has(hit.series))
          bySeries.set(hit.series, hit)
      }
      return [...bySeries.values()].map(strip)
    },
  })
}
