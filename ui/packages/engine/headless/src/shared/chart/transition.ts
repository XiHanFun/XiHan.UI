/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 图表的过渡：目标场景换了，就从正在显示的那一帧过渡到新场景。几何怎么插值由 viz 的过渡计划决定，
// 这里只管什么时候起跑、读哪一档时长与曲线、逐帧推进，以及什么时候不播。
//
// 首次出现播入场：柱沿值轴从基线长出、扇区顺着扫开、折线描出，其余淡入；折线上的点与饼图的外侧标签
// 等笔尖或扫开的边缘到了才出现，环形中心等整圈扫完再淡入。「首次出现」按数据层认：显示过的场景里一个数据
// 标记都没有（数据晚于尺寸到达，比如 Web Components 连上之后才赋 data、异步取数），数据到来仍播入场，
// 空态里已画出的坐标轴与网格从原处过渡，不重新淡入；场景里还没有数据标记时不播。之后的数据变化与图例切换按「更新」插值：
// 留下的标记从当前位置走到新位置，新增的从基线出现，删掉的收回基线并淡出。各图表交给内核的数
// （如环形中心的合计）随过渡从旧值滚到新值。尺寸、度量与字体换了不算变化：在跑的过渡换个终点、
// 时钟照走，不在跑就直接落到新场景。减弱动效下几何直接到位、数值直接到终值，只留淡入淡出；标记
// 太多时同样只淡入。时长与曲线从绘图区元素读取，作者对令牌的覆盖与容器上的 data-motion 同时生效。
//
// 读者看不见时不播：绘图区还没进入视口（或页面藏在后台）时，首次出现停在入场的第一帧、不起表——
// 标记都在场（键盘照样能 Tab 进来），由样式播的那一半（描线、逐个出现的标记、中心淡入）由根上的
// data-deferred 暂停在起点；进入视口的那一刻两半一起起跑。看不见时的数据变化直接落到终态，不空转。

import type { EasingFunction, MotionEaseName } from '@xihan-ui/motion'
import type { Mark, Scene, TransitionOptions, TransitionPlan } from '@xihan-ui/viz'
import type { ChartMetrics, ChartSize } from './types'
import { frameLoop, frameNow, motionStaggerStep, readMotion, resolveMotionPreference } from '@xihan-ui/motion'
import { createScene, planTransition, sceneAt } from '@xihan-ui/viz'

/**
 * 数据层的标记多过这个数就不做几何插值，只淡入淡出：几千个标记逐帧重算路径，
 * 过渡本身就成了卡顿，读者也看不清哪一个在动。
 */
export const CHART_ANIMATION_MARK_LIMIT = 1000

/** 随过渡滚动的数：各图表交给内核的数值，按名字取。 */
export type ChartNumbers = Readonly<Record<string, number>>

/** 过渡中正在显示的那一帧。 */
export interface ChartFrame {
  readonly scene: Scene
  /** 这一轮新出现的标记（含分组里的）：折线据此描出。 */
  readonly entering: ReadonlySet<string>
  /** 这一轮是首次出现：环形中心之类的 HTML 部件等标记长完再淡入。 */
  readonly entry: boolean
  /**
   * 随描线或扫开逐个出现的标记 → 它出现的时刻占入场时长的比例（0–1）。样式乘上入场时长得到延迟，
   * 作者改了时长、系统开了减弱动效，延迟跟着缩放。
   */
  readonly revealAt: ReadonlyMap<string, number>
  /** 各图表交给内核的数此刻的值：首次出现从 0 数上去，之后从旧值滚到新值。 */
  readonly numbers: ChartNumbers
  /**
   * 首次出现还在等读者看得见：画面停在入场的第一帧、时钟没起，根上投影 data-deferred，
   * 样式里由 data-drawing 起播的关键帧一并停在起点。
   */
  readonly pending: boolean
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
  /**
   * 首次出现时随描线或扫开逐个出现的标记：key → 它在描线 / 扫开进程里的位置（0–1）。
   * 内核按 revealEasing 把位置换算成时间比例，标记在笔尖或扫开的边缘到达时才出现。
   */
  readonly revealAt?: (target: Scene) => ReadonlyMap<string, number>
  /** 描线或扫开走的曲线：折线描线是 continuous，扇区扫开与入场同为 enter-strong。缺省 continuous。 */
  readonly revealEasing?: MotionEaseName
}

/** 在跑的过渡。 */
export interface ChartTransitionRun {
  plan: TransitionPlan
  entering: ReadonlySet<string>
  revealAt: ReadonlyMap<string, number>
  readonly options: TransitionOptions
  /** 这一轮是首次出现。 */
  readonly entry: boolean
  /** 新出现的标记相对哪一帧算：更新是起跑前显示过的目标场景，首次出现是空态里的坐标轴与网格，从未显示过为 null。 */
  readonly base: Scene | null
  readonly numbersFrom: ChartNumbers
  numbersTo: ChartNumbers
  /** 几何走完之后再留几帧（毫秒）：描线、逐个出现的标记与中心淡入由样式播，要等它们播完才撤掉标记。 */
  hold: number
  /** 把新目标场景里逐个出现的标记换算成时间比例；减弱动效或不逐个出现时为 null。 */
  readonly reveal: ((target: Scene) => ReadonlyMap<string, number>) | null
  /** 首次出现在等读者看得见：停在第一帧，时钟与帧循环都还没起。 */
  held: boolean
  startedAt: number
  stop: VoidFunction
}

/** 最近一次交给过渡的目标场景，以及它是在哪一份尺寸、度量、文字度量器与框架下算出来的。 */
export interface ChartShown {
  readonly scene: Scene | null
  readonly size: ChartSize | null
  readonly metrics: ChartMetrics
  readonly measurerVersion: number
  readonly extent: unknown
  readonly numbers: ChartNumbers
}

/** 过渡要读写的那几片状态。 */
export interface ChartTransitionState {
  readonly animated: boolean
  /**
   * 读者此刻看不看得见绘图区：进了视口且页面没藏在后台，或作者关掉了 animateInView。
   * 看不见时首次出现停在第一帧等着，数据变化直接落到终态。
   */
  readonly visible: boolean
  readonly target: Scene | null
  readonly size: ChartSize | null
  readonly metrics: ChartMetrics
  readonly measurerVersion: number
  /** 框架：还会改几何、但变化时不该播过渡的输入（缩放窗口）；没有时为 null。 */
  readonly extent: unknown
  /**
   * 框架这一次是一步到位的离散变化（键盘缩放、滚轮一格、点缩放条的空处）：按 move 补间过去。
   * 拖着平移、捏合与刷选是连续的操作，为假，场景直接跟到终态。
   */
  readonly extentStep: boolean
  /** 各图表交给内核的数，按目标场景的数据算出。 */
  readonly numbers: ChartNumbers
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

const NONE: ReadonlyMap<string, number> = new Map()

/** 场景里全部标记的 key，含分组里的。 */
function keysOf(scene: Scene | null): Set<string> {
  const keys = new Set<string>()
  if (!scene)
    return keys
  const visit = (marks: readonly Mark[]): void => {
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

/** 数据层里不是分组的标记有多少个。 */
function dataMarkCount(scene: Scene): number {
  let count = 0
  const visit = (marks: readonly Mark[]): void => {
    for (const mark of marks) {
      if (mark.kind === 'group')
        visit(mark.children)
      else
        count++
    }
  }
  visit(scene.layers.data)
  return count
}

/** 数据层里有没有画得出来的标记：没有数据的折线系列也留着一条没有点的线，它什么都不画。 */
function drawsData(scene: Scene): boolean {
  const drawn = (marks: readonly Mark[]): boolean => marks.some(mark =>
    mark.kind === 'group'
      ? drawn(mark.children)
      : mark.kind === 'line' || mark.kind === 'area' ? mark.points.length > 0 : true)
  return drawn(scene.layers.data)
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

/** 缓动的反函数：进度走到 progress 时，时间走到了几成。缓动单调，二分即可。 */
function inverseEasing(easing: EasingFunction, progress: number): number {
  const goal = Math.min(1, Math.max(0, progress))
  let lo = 0
  let hi = 1
  for (let i = 0; i < 24; i++) {
    const mid = (lo + hi) / 2
    if (easing(mid) < goal)
      lo = mid
    else
      hi = mid
  }
  return (lo + hi) / 2
}

/** 两个数之间按进度插值；小数位取两端较多的一端，免得滚动中途冒出一长串小数。 */
function between(from: number, to: number, t: number): number {
  if (t >= 1 || from === to)
    return to
  const decimals = (n: number): number => {
    const text = String(n)
    const dot = text.indexOf('.')
    return dot < 0 || text.includes('e') ? 0 : text.length - dot - 1
  }
  const factor = 10 ** Math.min(6, Math.max(decimals(from), decimals(to)))
  return Math.round((from + (to - from) * t) * factor) / factor
}

/** 起点里没有的数不滚、直接写终值：比如刚落得下的标签，它的标记并没有变。 */
function interpolateNumbers(from: ChartNumbers, to: ChartNumbers, t: number): ChartNumbers {
  const out: Record<string, number> = {}
  for (const [name, value] of Object.entries(to)) {
    const start = from[name]
    out[name] = start == null ? value : between(start, value, t)
  }
  return out
}

function zeros(numbers: ChartNumbers): ChartNumbers {
  return Object.fromEntries(Object.keys(numbers).map(name => [name, 0]))
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
  const next: ChartShown = { scene: target, size: state.size, metrics: state.metrics, measurerVersion: state.measurerVersion, extent: state.extent, numbers: state.numbers }
  if (!state.animated || target == null) {
    state.setShown(next)
    halt(state)
    return
  }
  if (shown != null && shown.scene === target) {
    // 目标没换、只是读者看得见了（滚进视口、页面回到前台、关掉了 animateInView）：停着的入场从第一帧起跑
    if (run?.held && state.visible)
      release(state, run)
    return
  }
  state.setShown(next)
  const { plot, win } = state
  if (!plot || typeof win.requestAnimationFrame !== 'function') {
    halt(state)
    return
  }

  const base = shown?.scene ?? null
  const reframed = base != null && shown!.extent !== state.extent
  const reshaped = base != null && (reframed || shown!.size !== state.size || shown!.metrics !== state.metrics || shown!.measurerVersion !== state.measurerVersion)
  // 只是框架一步到位地换了：从正在显示的那一帧补间过去，不跟尺寸与度量的变化混在一起
  const stepped = reshaped && reframed && state.extentStep
    && shown!.size === state.size && shown!.metrics === state.metrics && shown!.measurerVersion === state.measurerVersion
  if (reshaped && !stepped) {
    if (!run) {
      state.setFrame(null)
      return
    }
    // 换终点不换时钟：起点仍是这一轮起跑时那一帧，走到哪儿按起跑后经过的时间算
    run.plan = planTransition(run.plan.from, target, run.options)
    run.entering = enteringKeys(run.base, target)
    run.revealAt = run.reveal?.(target) ?? NONE
    run.numbersTo = state.numbers
    step(state, run)
    return
  }

  // 正在显示的画面里没有画得出来的数据就是首次出现：数据先到还是后到，入场都是同一段。
  // 停着的入场还没真的显示过数据，按它起跑前的那一帧认：等着的时候数据又变了，仍是首次出现
  const displayed = run?.held ? run.base : (state.frame?.scene ?? base)
  const entry = displayed == null || !drawsData(displayed)
  // 还没有可画的数据：没有什么可入场的，空态直接显示
  if (entry && !drawsData(target)) {
    halt(state)
    return
  }
  // 读者看不见时的数据变化直接落到终态：没人看的过渡只是白白占着帧
  if (!entry && !state.visible) {
    halt(state)
    return
  }
  // 首次出现只沿用空态里画出的坐标轴与网格，数据层与标签层按从未显示过处理
  const origin = entry && displayed != null
    ? createScene({ version: 0, layers: { back: displayed.layers.back }, bounds: displayed.bounds })
    : entry ? null : base
  const reduced = resolveMotionPreference(plot) === 'reduce' || dataMarkCount(target) > CHART_ANIMATION_MARK_LIMIT
  const motion = readMotion(plot)
  const stagger = options.stagger ? motionStaggerStep : 0
  // 框架一步到位的换位在减弱动效下直接落到终态：它不是数据的变化，没有要淡变交代的东西
  if (stepped && reduced) {
    halt(state)
    return
  }
  const timing: TransitionOptions = reduced
    ? { duration: motion.duration('enter'), easing: motion.easing('enter'), reducedMotion: true }
    : entry
      ? { duration: motion.duration('reveal'), easing: motion.easing('enter-strong'), stagger }
      : stepped
        ? { duration: motion.duration('move'), easing: motion.easing('continuous') }
        : { duration: motion.duration('morph'), easing: motion.easing('continuous'), stagger }
  run?.stop()
  // 作者把时长改成 0 就是不要过渡
  if (!(timing.duration > 0)) {
    state.setRun(null)
    state.setFrame(null)
    return
  }
  const seed = entry && !reduced && options.entry ? options.entry(target) : createScene({ version: 0, layers: {}, bounds: target.bounds })
  // 空态里已画出的坐标轴与网格从正在显示的位置过渡，入场只管数据层与标签层
  const from = !entry
    ? displayed!
    : origin == null
      ? seed
      : createScene({ version: 0, layers: { back: origin.layers.back, data: seed.layers.data, front: seed.layers.front }, bounds: seed.bounds })
  const plan = planTransition(from, target, timing)
  const entering = enteringKeys(origin, target)

  // 逐个出现的标记按描线或扫开的曲线换算时间比例：位置在 p 的标记，等进程走到 p 才出现
  const revealDuration = motion.duration('reveal')
  const revealEasing = motion.easing(options.revealEasing ?? 'continuous')
  const reveal = entry && !reduced && options.revealAt
    ? (scene: Scene): ReadonlyMap<string, number> => {
        const times = new Map<string, number>()
        for (const [key, at] of options.revealAt!(scene))
          times.set(key, inverseEasing(revealEasing, at))
        return times
      }
    : null
  // 描线、逐个出现的标记与中心淡入由样式播：几何走完之后再留一段，等样式播完才撤掉标记
  const styled = entry || entering.size > 0
  const hold = styled ? Math.max(plan.total, reduced ? 0 : revealDuration) + motion.duration('enter') : plan.total

  const numbersFrom = reduced
    ? state.numbers
    : entry ? zeros(state.numbers) : (state.frame?.numbers ?? shown?.numbers ?? state.numbers)
  // 读者看不见的首次出现停在第一帧：不起表、不挂帧循环，等看得见时由 release 起跑
  const held = !state.visible
  const started: ChartTransitionRun = {
    plan,
    entering,
    revealAt: reveal?.(target) ?? NONE,
    options: timing,
    entry,
    base: origin,
    numbersFrom,
    numbersTo: state.numbers,
    hold,
    reveal,
    held,
    startedAt: held ? 0 : frameNow(win),
    stop: held ? () => {} : frameLoop(win, state.requestFrame),
  }
  state.setRun(started)
  // 起跑这一帧当场给出：不等下一帧，免得新场景的终态先闪一下
  step(state, started)
}

/** 停着的入场起跑：时钟从此刻算起，帧循环这时才挂上。 */
function release(state: ChartTransitionState, run: ChartTransitionRun): void {
  run.held = false
  run.startedAt = frameNow(state.win)
  run.stop = frameLoop(state.win, state.requestFrame)
  step(state, run)
}

/** 推进一帧；几何走完后留到样式播完，再停下、显示新场景本身。 */
export function advanceChartTransition(state: ChartTransitionState): void {
  if (state.run)
    step(state, state.run)
}

function step(state: ChartTransitionState, run: ChartTransitionRun): void {
  const elapsed = run.held ? 0 : frameNow(state.win) - run.startedAt
  if (elapsed >= run.hold) {
    halt(state)
    return
  }
  const settled = elapsed >= run.plan.total
  // 几何已经到位、只等样式播完的那一段：帧只写一次，不再逐帧重绘
  if (settled && state.frame?.scene === run.plan.to)
    return
  const t = Math.min(1, Math.max(0, elapsed / run.options.duration))
  state.setFrame({
    scene: settled ? run.plan.to : sceneAt(run.plan, elapsed),
    entering: run.entering,
    entry: run.entry,
    revealAt: run.revealAt,
    numbers: settled ? run.numbersTo : interpolateNumbers(run.numbersFrom, run.numbersTo, run.options.easing(t)),
    pending: run.held,
  })
}
