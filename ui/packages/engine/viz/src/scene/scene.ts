/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 场景的构造、遍历、按键求差与标记转路径。

import type { Rect } from '../geometry'
import type { PathSink } from '../path'
import type { Curve } from '../shape/curves'
import type { ArcMark, AreaMark, CurveName, LineMark, Mark, RectMark, Scene, SceneLayer, SceneLayers, SymbolMark } from './types'
import { invalidArgument, VizError } from '../errors'
import { createSvgPath } from '../path'
import { arc } from '../shape/arc'
import { roundedBar } from '../shape/bar'
import {
  curveBasis,
  curveBumpX,
  curveBumpY,
  curveCatmullRom,
  curveCatmullRomClosed,
  curveLinear,
  curveLinearClosed,
  curveMonotoneX,
  curveMonotoneY,
  curveStep,
  curveStepAfter,
  curveStepBefore,
} from '../shape/curves'
import { area, line } from '../shape/line'
import { symbol } from '../shape/symbol'

export const LAYERS: readonly SceneLayer[] = Object.freeze(['back', 'data', 'front'])

const CURVES: Readonly<Record<CurveName, Curve>> = {
  linear: curveLinear,
  linearClosed: curveLinearClosed,
  monotoneX: curveMonotoneX,
  monotoneY: curveMonotoneY,
  step: curveStep,
  stepBefore: curveStepBefore,
  stepAfter: curveStepAfter,
  catmullRom: curveCatmullRom,
  catmullRomClosed: curveCatmullRomClosed,
  basis: curveBasis,
  bumpX: curveBumpX,
  bumpY: curveBumpY,
}

/** 按名字取曲线。 */
export function curveOf(name: CurveName): Curve {
  const curve = CURVES[name]
  if (!curve)
    throw invalidArgument('未知的曲线名', { name })
  return curve
}

export interface SceneEntry {
  readonly layer: SceneLayer
  readonly mark: Mark
  /** 所在分组的累计平移。 */
  readonly offset: readonly [number, number]
}

/** 按层序与文档序展开全部标记（含分组里的子标记）。 */
export function sceneMarks(scene: Scene): SceneEntry[] {
  const out: SceneEntry[] = []
  const walk = (marks: readonly Mark[], layer: SceneLayer, dx: number, dy: number): void => {
    for (const mark of marks) {
      out.push({ layer, mark, offset: [dx, dy] })
      if (mark.kind === 'group')
        walk(mark.children, layer, dx + (mark.x ?? 0), dy + (mark.y ?? 0))
    }
  }
  for (const layer of LAYERS)
    walk(scene.layers[layer], layer, 0, 0)
  return out
}

function checkMark(mark: Mark): void {
  const paint = mark.paint
  if (paint?.slot !== undefined && !(Number.isInteger(paint.slot) && paint.slot >= 1 && paint.slot <= 8))
    throw invalidArgument('色槽必须是 1–8 的整数', { key: mark.key, slot: paint.slot })
  if (paint?.pattern !== undefined && !(Number.isInteger(paint.pattern) && paint.pattern >= 1 && paint.pattern <= 8))
    throw invalidArgument('纹理序号必须是 1–8 的整数', { key: mark.key, pattern: paint.pattern })
  if (paint?.t !== undefined && !(paint.t >= 0 && paint.t <= 1))
    throw invalidArgument('色阶位置必须在 [0, 1] 内', { key: mark.key, t: paint.t })
  if (mark.opacity !== undefined && !(mark.opacity >= 0 && mark.opacity <= 1))
    throw invalidArgument('不透明度必须在 [0, 1] 内', { key: mark.key, opacity: mark.opacity })
}

function deepFreeze<T>(value: T): T {
  if (typeof value === 'object' && value !== null && !Object.isFrozen(value)) {
    Object.freeze(value)
    for (const child of Object.values(value))
      deepFreeze(child)
  }
  return value
}

export interface SceneInput {
  readonly version: number
  readonly layers: Partial<SceneLayers>
  readonly bounds: Rect
  readonly frame?: number
}

/** 构造场景：缺的层补成空表，校验键在整个场景内唯一与着色引用的取值，然后整体冻结。 */
export function createScene(input: SceneInput): Scene {
  if (!Number.isFinite(input.version))
    throw invalidArgument('场景版本必须是有限数', { version: input.version })
  const layers: SceneLayers = {
    back: input.layers.back ?? [],
    data: input.layers.data ?? [],
    front: input.layers.front ?? [],
  }
  const scene: Scene = input.frame === undefined
    ? { version: input.version, layers, bounds: input.bounds }
    : { version: input.version, frame: input.frame, layers, bounds: input.bounds }
  const seen = new Map<string, SceneLayer>()
  for (const { layer, mark } of sceneMarks(scene)) {
    const first = seen.get(mark.key)
    if (first !== undefined)
      throw new VizError('XH_VIZ_DUPLICATE_KEY', '场景里有重复的标记键', { key: mark.key, first, duplicate: layer })
    seen.set(mark.key, layer)
    checkMark(mark)
  }
  return deepFreeze(scene)
}

export interface SceneDiff {
  /** 只在新场景里的标记。 */
  readonly enter: readonly SceneEntry[]
  /** 两边都有的标记；changed 表示几何或着色有变化。 */
  readonly update: ReadonlyArray<{ readonly layer: SceneLayer, readonly from: Mark, readonly to: Mark, readonly changed: boolean }>
  /** 只在旧场景里的标记。 */
  readonly exit: readonly SceneEntry[]
}

function sameValue(a: unknown, b: unknown): boolean {
  if (a === b)
    return true
  if (typeof a !== 'object' || typeof b !== 'object' || a === null || b === null)
    return Number.isNaN(a) && Number.isNaN(b)
  const ka = Object.keys(a)
  const kb = Object.keys(b)
  if (ka.length !== kb.length)
    return false
  return ka.every(key => sameValue((a as Record<string, unknown>)[key], (b as Record<string, unknown>)[key]))
}

/** 顶层标记按键求差：进入、更新、退出。分组作为一个整体比较。 */
export function diffScenes(previous: Scene, next: Scene): SceneDiff {
  const top = (scene: Scene): Map<string, SceneEntry> => {
    const map = new Map<string, SceneEntry>()
    for (const layer of LAYERS) {
      for (const mark of scene.layers[layer])
        map.set(mark.key, { layer, mark, offset: [0, 0] })
    }
    return map
  }
  const before = top(previous)
  const after = top(next)
  const enter: SceneEntry[] = []
  const update: Array<{ layer: SceneLayer, from: Mark, to: Mark, changed: boolean }> = []
  const exit: SceneEntry[] = []
  for (const [key, entry] of after) {
    const old = before.get(key)
    if (old)
      update.push({ layer: entry.layer, from: old.mark, to: entry.mark, changed: !sameValue(old.mark, entry.mark) })
    else
      enter.push(entry)
  }
  for (const [key, entry] of before) {
    if (!after.has(key))
      exit.push(entry)
  }
  return { enter, update, exit }
}

/** 形状标记。 */
export type ShapeMark = RectMark | ArcMark | LineMark | AreaMark | SymbolMark

/** 把 sink 平移 (dx, dy) 后再写入。 */
function translated(sink: PathSink, dx: number, dy: number): PathSink {
  if (dx === 0 && dy === 0)
    return sink
  return {
    moveTo: (x, y) => sink.moveTo(x + dx, y + dy),
    lineTo: (x, y) => sink.lineTo(x + dx, y + dy),
    bezierCurveTo: (x1, y1, x2, y2, x, y) => sink.bezierCurveTo(x1 + dx, y1 + dy, x2 + dx, y2 + dy, x + dx, y + dy),
    quadraticCurveTo: (x1, y1, x, y) => sink.quadraticCurveTo(x1 + dx, y1 + dy, x + dx, y + dy),
    arc: (x, y, r, a0, a1, ccw) => sink.arc(x + dx, y + dy, r, a0, a1, ccw),
    arcTo: (x1, y1, x2, y2, r) => sink.arcTo(x1 + dx, y1 + dy, x2 + dx, y2 + dy, r),
    rect: (x, y, w, h) => sink.rect(x + dx, y + dy, w, h),
    closePath: () => sink.closePath(),
  }
}

function drawMark(mark: ShapeMark, sink: PathSink): void {
  switch (mark.kind) {
    case 'rect':
      roundedBar({ x: mark.x, y: mark.y, width: mark.width, height: mark.height }, {
        radius: mark.cornerRadius ?? 0,
        orientation: mark.orientation ?? 'vertical',
        baseline: mark.baseline ?? 'end',
      }, sink)
      return
    case 'arc':
      arc({
        innerRadius: mark.innerRadius,
        outerRadius: mark.outerRadius,
        startAngle: mark.startAngle,
        endAngle: mark.endAngle,
        padAngle: mark.padAngle,
        padRadius: mark.padRadius,
        cornerRadius: mark.cornerRadius,
      }, translated(sink, mark.cx, mark.cy))
      return
    case 'symbol':
      symbol(mark.symbol, mark.size, translated(sink, mark.x, mark.y))
      return
    case 'line':
      line<typeof mark.points[number]>({
        x: p => p.x,
        y: p => p.y,
        defined: p => p.defined !== false && Number.isFinite(p.x) && Number.isFinite(p.y),
        curve: curveOf(mark.curve),
      })(mark.points, sink)
      return
    case 'area':
      area<typeof mark.points[number]>({
        x: p => p.x,
        y0: p => p.y0 ?? p.y,
        y1: p => p.y,
        defined: p => p.defined !== false && Number.isFinite(p.x) && Number.isFinite(p.y),
        curve: curveOf(mark.curve),
      })(mark.points, sink)
      return
    default:
      throw invalidArgument('不是形状标记', { kind: (mark as Mark).kind })
  }
}

/** 形状标记的路径（绝对坐标，不含分组平移）。不传 sink 返回 SVG 路径字符串，传入 sink 时直接写入。 */
export function markPath(mark: ShapeMark): string
export function markPath(mark: ShapeMark, sink: PathSink): void
export function markPath(mark: ShapeMark, sink?: PathSink): string | void {
  if (sink) {
    drawMark(mark, sink)
    return
  }
  const path = createSvgPath()
  drawMark(mark, path)
  return path.toString()
}
