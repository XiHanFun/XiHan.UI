/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 图表的过渡：目标场景换了，就从正在显示的那一帧过渡到新场景。几何怎么插值由 viz 的过渡计划决定，
// 这里只管什么时候起跑、读哪一档时长与曲线、逐帧推进，以及什么时候不播。
//
// 首次出现播入场：柱沿值轴从基线长出、扇区顺着扫开、折线描出，其余淡入。之后的数据变化与图例切换按「更新」
// 插值：留下的标记从当前位置走到新位置，新增的从基线出现，删掉的收回基线并淡出。尺寸、度量与字体换了不算
// 变化：在跑的过渡换个终点、时钟照走，不在跑就直接落到新场景。减弱动效下几何直接落到终态，只留淡入淡出。
// 时长与曲线从绘图区元素读取，作者对令牌的覆盖与容器上的 data-motion 同时生效。

import type { Scene, TransitionOptions, TransitionPlan } from '@xihan-ui/viz'
import type { ChartMetrics, ChartSize } from './types'
import { frameLoop, frameNow, motionStaggerStep, readMotion, resolveMotionPreference } from '@xihan-ui/motion'
import { createScene, planTransition, sceneAt } from '@xihan-ui/viz'

/** 过渡中正在显示的那一帧。 */
export interface ChartFrame {
  readonly scene: Scene
  /** 这一轮新出现的标记（含分组里的）：折线据此描出。 */
  readonly entering: ReadonlySet<string>
}

/** 各图表交给内核的过渡设定。 */
export interface ChartTransitionOptions {
  /**
   * 首次出现从哪一帧起跑；缺省是空场景：柱从基线长出、扇区从各自的起始角展开、其余淡入。
   * 减弱动效下不用它，入场只淡入。
   */
  readonly entry?: (target: Scene) => Scene
  /** 按系列错开（至多 5 步）；同一系列内不错开。 */
  readonly stagger: boolean
}

/** 在跑的过渡。 */
export interface ChartTransitionRun {
  plan: TransitionPlan
  entering: ReadonlySet<string>
  readonly options: TransitionOptions
  /** 这一轮起跑前真正显示过的目标场景；首次出现为 null。 */
  readonly base: Scene | null
  readonly startedAt: number
  readonly stop: VoidFunction
}

/** 最近一次交给过渡的目标场景，以及它是在哪一份尺寸、度量与文字度量器下算出来的。 */
export interface ChartShown {
  readonly scene: Scene | null
  readonly size: ChartSize | null
  readonly metrics: ChartMetrics
  readonly measurerVersion: number
}

/** 过渡要读写的那几片状态。 */
export interface ChartTransitionState {
  readonly animated: boolean
  readonly target: Scene | null
  readonly size: ChartSize | null
  readonly metrics: ChartMetrics
  readonly measurerVersion: number
  /** 绘图区元素：时长、曲线与减弱动效都从它读；没有渲染宿主时为 null。 */
  readonly plot: Element | null
  readonly win: Window
  readonly shown: ChartShown | null
  readonly run: ChartTransitionRun | null
  readonly frame: ChartFrame | null
  setShown: (shown: ChartShown) => void
  setRun: (run: ChartTransitionRun | null) => void
  setFrame: (frame: ChartFrame | null) => void
  /** 排一帧：机器收到后调 advanceChartTransition。 */
  requestFrame: () => void
}

/** 场景里全部标记的 key，含分组里的。 */
function keysOf(scene: Scene | null): Set<string> {
  const keys = new Set<string>()
  if (!scene)
    return keys
  const visit = (marks: Scene['layers']['data']): void => {
    for (const mark of marks) {
      keys.add(mark.key)
      if (mark.kind === 'group')
        visit(mark.children)
    }
  }
  visit(scene.layers.back)
  visit(scene.layers.data)
  visit(scene.layers.front)
  return keys
}

/** 新场景里有、旧场景里没有的标记。 */
function enteringKeys(base: Scene | null, target: Scene): ReadonlySet<string> {
  const before = keysOf(base)
  const entering = new Set<string>()
  for (const key of keysOf(target)) {
    if (!before.has(key))
      entering.add(key)
  }
  return entering
}

function halt(state: ChartTransitionState): void {
  state.run?.stop()
  state.setRun(null)
  state.setFrame(null)
}

/**
 * 目标场景或 animated 变了：决定这一次过渡怎么走。
 * 同一个目标场景重复进来什么都不做：管线按输入引用记忆，场景对象不变就是几何没变。
 */
export function syncChartTransition(state: ChartTransitionState, options: ChartTransitionOptions): void {
  const { target, shown, run } = state
  const next: ChartShown = { scene: target, size: state.size, metrics: state.metrics, measurerVersion: state.measurerVersion }
  if (!state.animated || target == null) {
    state.setShown(next)
    halt(state)
    return
  }
  if (shown != null && shown.scene === target)
    return
  state.setShown(next)
  const { plot, win } = state
  if (!plot || typeof win.requestAnimationFrame !== 'function') {
    halt(state)
    return
  }

  const base = shown?.scene ?? null
  const reshaped = base != null && (shown!.size !== state.size || shown!.metrics !== state.metrics || shown!.measurerVersion !== state.measurerVersion)
  if (reshaped) {
    if (!run) {
      state.setFrame(null)
      return
    }
    // 换终点不换时钟：起点仍是这一轮起跑时那一帧，走到哪儿按起跑后经过的时间算
    run.plan = planTransition(run.plan.from, target, run.options)
    run.entering = enteringKeys(run.base, target)
    advanceChartTransition(state)
    return
  }

  const reduced = resolveMotionPreference(plot) === 'reduce'
  const motion = readMotion(plot)
  const entry = base == null
  const timing: TransitionOptions = reduced
    ? { duration: motion.duration('enter'), easing: motion.easing('enter'), reducedMotion: true }
    : entry
      ? { duration: motion.duration('reveal'), easing: motion.easing('enter-strong'), stagger: options.stagger ? motionStaggerStep : 0 }
      : { duration: motion.duration('morph'), easing: motion.easing('continuous'), stagger: options.stagger ? motionStaggerStep : 0 }
  run?.stop()
  // 作者把时长改成 0 就是不要过渡
  if (!(timing.duration > 0)) {
    state.setRun(null)
    state.setFrame(null)
    return
  }
  const from = entry
    ? (!reduced && options.entry ? options.entry(target) : createScene({ version: 0, layers: {}, bounds: target.bounds }))
    : state.frame?.scene ?? base
  const plan = planTransition(from, target, timing)
  const entering = enteringKeys(base, target)
  state.setRun({ plan, entering, options: timing, base, startedAt: frameNow(win), stop: frameLoop(win, state.requestFrame) })
  // 起跑这一帧当场给出：不等下一帧，免得新场景的终态先闪一下
  state.setFrame({ scene: sceneAt(plan, 0), entering })
}

/** 推进一帧；走到头就停下，显示新场景本身。 */
export function advanceChartTransition(state: ChartTransitionState): void {
  const run = state.run
  if (!run)
    return
  const elapsed = frameNow(state.win) - run.startedAt
  if (elapsed >= run.plan.total) {
    halt(state)
    return
  }
  state.setFrame({ scene: sceneAt(run.plan, elapsed), entering: run.entering })
}
