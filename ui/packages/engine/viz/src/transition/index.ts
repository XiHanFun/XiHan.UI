/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 过渡：按键把新旧场景对齐成进入 / 更新 / 退出三类轨迹，按几何参数插值而不是插值路径字符串。
// 计时、缓动与减弱动效判断由调用方提供（取自动效包），这里只按经过的毫秒数给出那一帧的场景。

import type { KeyedPoint } from '../interpolate/points'
import type { ArcMark, AreaMark, GroupMark, LineMark, Mark, RectMark, Scene, SceneLayer, SymbolMark, TextMark } from '../scene/types'
import { invalidArgument } from '../errors'
import { interpolatePoints } from '../interpolate/points'
import { LAYERS } from '../scene/scene'

export type EnterStyle = 'baseline' | 'center' | 'fade'

export interface TransitionOptions {
  /** 每条轨迹的时长（毫秒），必须为正。 */
  readonly duration: number
  /** 缓动：把 [0, 1] 的线性进度映射成缓动后的进度。 */
  readonly easing: (t: number) => number
  /**
   * 新增标记从哪里来：baseline 柱从基线长出、扇区结束角从起始角增长、面积从基线升起；
   * center 柱从中心展开；fade 只淡入。折线、点、文字、路径总是淡入。缺省 baseline。
   */
  readonly enterFrom?: EnterStyle
  /** 按系列错开的步长（毫秒），至多错开 5 步；同一系列内不错开。缺省 0。 */
  readonly stagger?: number
  /** 减弱动效：几何直接落到终态，只保留淡入淡出。 */
  readonly reducedMotion?: boolean
}

export interface TransitionPlan {
  readonly from: Scene
  readonly to: Scene
  /** 含错开在内的总时长（毫秒）。 */
  readonly total: number
}

const MAX_STAGGER_STEPS = 5

type Lerp = (a: number, b: number, t: number) => number
const lerp: Lerp = (a, b, t) => a + (b - a) * t

/** 标记的「收起」形态：柱收回基线、扇区收成零角、面积落回基线；其余形态只改不透明度。 */
function collapsed(mark: Mark, style: EnterStyle): Mark {
  if (style === 'fade')
    return { ...mark, opacity: 0 }
  switch (mark.kind) {
    case 'rect': {
      if (style === 'center')
        return { ...mark, x: mark.x + mark.width / 2, y: mark.y + mark.height / 2, width: 0, height: 0 }
      const vertical = (mark.orientation ?? 'vertical') === 'vertical'
      const atEnd = (mark.baseline ?? (vertical ? 'end' : 'start')) === 'end'
      return vertical
        ? { ...mark, y: atEnd ? mark.y + mark.height : mark.y, height: 0 }
        : { ...mark, x: atEnd ? mark.x + mark.width : mark.x, width: 0 }
    }
    case 'arc':
      return { ...mark, endAngle: mark.startAngle }
    case 'area':
      return style === 'baseline'
        ? { ...mark, points: mark.points.map(p => ({ ...p, y: p.y0 ?? p.y })) }
        : { ...mark, opacity: 0 }
    default:
      return { ...mark, opacity: 0 }
  }
}

/** 同类标记之间按参数插值；类型不同时直接取终态。 */
function between(from: Mark, to: Mark, geometry: boolean): (t: number) => Mark {
  const opacity = (t: number): number => lerp(from.opacity ?? 1, to.opacity ?? 1, t)
  if (!geometry || from.kind !== to.kind)
    return t => ({ ...to, opacity: opacity(t) })
  switch (to.kind) {
    case 'rect': {
      const a = from as RectMark
      return t => ({
        ...to,
        x: lerp(a.x, to.x, t),
        y: lerp(a.y, to.y, t),
        width: lerp(a.width, to.width, t),
        height: lerp(a.height, to.height, t),
        opacity: opacity(t),
      })
    }
    case 'arc': {
      const a = from as ArcMark
      return t => ({
        ...to,
        cx: lerp(a.cx, to.cx, t),
        cy: lerp(a.cy, to.cy, t),
        innerRadius: lerp(a.innerRadius, to.innerRadius, t),
        outerRadius: lerp(a.outerRadius, to.outerRadius, t),
        startAngle: lerp(a.startAngle, to.startAngle, t),
        endAngle: lerp(a.endAngle, to.endAngle, t),
        opacity: opacity(t),
      })
    }
    case 'symbol': {
      const a = from as SymbolMark
      return t => ({ ...to, x: lerp(a.x, to.x, t), y: lerp(a.y, to.y, t), size: lerp(a.size, to.size, t), opacity: opacity(t) })
    }
    case 'text': {
      const a = from as TextMark
      return t => ({ ...to, x: lerp(a.x, to.x, t), y: lerp(a.y, to.y, t), rotate: lerp(a.rotate ?? 0, to.rotate ?? 0, t), opacity: opacity(t) })
    }
    case 'line':
    case 'area': {
      const points = interpolatePoints((from as LineMark | AreaMark).points, to.points)
      // 终点精确等于新点序，删除的点在这一刻移除
      return t => ({ ...to, points: t >= 1 ? to.points : points(t) as KeyedPoint[], opacity: opacity(t) })
    }
    case 'group': {
      const a = from as GroupMark
      const children = planMarks(a.children, to.children, { geometry, enterFrom: 'fade' })
      return t => ({
        ...to,
        x: lerp(a.x ?? 0, to.x ?? 0, t),
        y: lerp(a.y ?? 0, to.y ?? 0, t),
        children: children.map(track => track(t)).filter((m): m is Mark => m !== null),
        opacity: opacity(t),
      })
    }
    default:
      return t => ({ ...to, opacity: opacity(t) })
  }
}

/** 一条轨迹：给局部进度 0–1 返回那一刻的标记；null 表示已经移除。 */
type Track = (t: number) => Mark | null

function planMarks(before: readonly Mark[], after: readonly Mark[], options: { geometry: boolean, enterFrom: EnterStyle }): Track[] {
  const previous = new Map(before.map(mark => [mark.key, mark]))
  const next = new Set(after.map(mark => mark.key))
  const tracks: Track[] = after.map((mark) => {
    const old = previous.get(mark.key)
    if (old) {
      const step = between(old, mark, options.geometry)
      return t => (t >= 1 ? mark : step(t))
    }
    const style: EnterStyle = !options.geometry || mark.kind === 'line' || mark.kind === 'symbol' || mark.kind === 'text' || mark.kind === 'path' || mark.kind === 'group'
      ? 'fade'
      : options.enterFrom
    const step = between(collapsed(mark, style), mark, true)
    return t => (t >= 1 ? mark : step(t))
  })
  for (const mark of before) {
    if (next.has(mark.key))
      continue
    // 退场：收回基线（或原地）并淡出，期间不可命中；到终点时移除
    const target = options.geometry ? { ...collapsed(mark, options.enterFrom === 'center' ? 'center' : 'baseline'), opacity: 0 } : { ...mark, opacity: 0 }
    const step = between(mark, target, options.geometry)
    tracks.push(t => (t >= 1 ? null : { ...step(t), exiting: true }))
  }
  return tracks
}

const evaluators = new WeakMap<TransitionPlan, (elapsed: number) => Scene>()

/** 由新旧两个场景得出过渡计划。 */
export function planTransition(previous: Scene, next: Scene, options: TransitionOptions): TransitionPlan {
  const { duration, easing, enterFrom = 'baseline', stagger = 0, reducedMotion = false } = options
  if (!(duration > 0) || !Number.isFinite(duration))
    throw invalidArgument('过渡时长必须是正的有限数', { duration })
  if (!(stagger >= 0) || !Number.isFinite(stagger))
    throw invalidArgument('错开步长必须是非负有限数', { stagger })

  // 系列按在新场景里首次出现的次序错开
  const seriesOrder = new Map<string, number>()
  for (const layer of LAYERS) {
    for (const mark of [...next.layers[layer], ...previous.layers[layer]]) {
      const id = mark.datum?.seriesId
      if (id !== undefined && !seriesOrder.has(id))
        seriesOrder.set(id, seriesOrder.size)
    }
  }
  const delayOf = (mark: Mark | null): number => {
    const id = mark?.datum?.seriesId
    return reducedMotion || id === undefined ? 0 : Math.min(seriesOrder.get(id) ?? 0, MAX_STAGGER_STEPS - 1) * stagger
  }
  const maxDelay = reducedMotion ? 0 : Math.min(Math.max(0, seriesOrder.size - 1), MAX_STAGGER_STEPS - 1) * stagger
  const total = duration + maxDelay

  const layers = LAYERS.map((layer) => {
    const tracks = planMarks(previous.layers[layer], next.layers[layer], { geometry: !reducedMotion, enterFrom })
    const delays = tracks.map(track => delayOf(track(0)))
    return { layer, tracks, delays }
  })

  const plan: TransitionPlan = Object.freeze({ from: previous, to: next, total })
  evaluators.set(plan, (elapsed) => {
    const frame = Math.min(1, Math.max(0, elapsed / total))
    const built = {} as Record<SceneLayer, Mark[]>
    for (const { layer, tracks, delays } of layers) {
      built[layer] = []
      tracks.forEach((track, i) => {
        const local = Math.min(1, Math.max(0, (elapsed - (delays[i] as number)) / duration))
        const mark = track(local >= 1 ? 1 : easing(local))
        if (mark)
          built[layer].push(mark)
      })
    }
    return Object.freeze({
      version: next.version,
      frame,
      layers: Object.freeze({ back: Object.freeze(built.back), data: Object.freeze(built.data), front: Object.freeze(built.front) }),
      bounds: next.bounds,
    })
  })
  return plan
}

/** 经过 elapsed 毫秒时的场景；到达总时长后返回新场景本身。 */
export function sceneAt(plan: TransitionPlan, elapsed: number): Scene {
  const evaluate = evaluators.get(plan)
  if (!evaluate)
    throw invalidArgument('不是 planTransition 得出的过渡计划', {})
  if (Number.isNaN(elapsed))
    throw invalidArgument('经过的时间必须是数', { elapsed })
  return elapsed >= plan.total ? plan.to : evaluate(elapsed)
}
