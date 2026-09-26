/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 播放器：动画层的对外门面。预设解析、入口校验、打断、错开起播、开关与速度收在这里。
// 减弱动效的降级不在这一层——它由 @xihan-ui/motion 的 animate 统一兜住。

import type { AnimationHandle } from '@xihan-ui/motion'
import type {
  MotionPlayer,
  MotionPlayerOptions,
  MotionSpec,
  MotionStatus,
  PlayOptions,
  StaggerFrom,
  StaggerOptions,
} from './types'
import { DIAGNOSTIC_CODES, reportDiagnostic } from '@xihan-ui/core'
import { animate, motionStaggerStep } from '@xihan-ui/motion'
import { motionPresets } from './presets'
import { DEFAULT_DURATION, MAX_DURATION, toKeyframes, validateMotionSpec } from './spec'

/** 时长系数的上限。 */
const MAX_SPEED = 100

function checkSpeed(value: number | undefined): number {
  if (value === undefined)
    return 1
  if (!Number.isFinite(value) || value <= 0 || value > MAX_SPEED)
    throw new RangeError(`[animations] speed 必须是 (0, ${MAX_SPEED}] 之间的有限数，收到 ${String(value)}`)
  return value
}

function checkStagger(value: number | undefined): number {
  if (value === undefined)
    return motionStaggerStep
  if (!Number.isFinite(value) || value < 0 || value > MAX_DURATION)
    throw new RangeError(`[animations] stagger 必须是 0 到 ${MAX_DURATION} 之间的有限数，收到 ${String(value)}`)
  return value
}

/** 目标在起播顺序里排第几。 */
function orderIndex(index: number, total: number, from: StaggerFrom): number {
  if (from === 'last')
    return total - 1 - index
  if (from === 'center')
    return Math.round(Math.abs(index - (total - 1) / 2))
  return index
}

export function createMotionPlayer(options: MotionPlayerOptions = {}): MotionPlayer {
  let presets: Record<string, MotionSpec> = options.presets ?? motionPresets
  let enabled = options.enabled ?? true
  const speed = checkSpeed(options.speed)

  const running = new Map<HTMLElement, AnimationHandle>()

  const resolve = (effect: string | MotionSpec): MotionSpec | null => {
    if (typeof effect !== 'string')
      return effect
    const found = presets[effect]
    if (found === undefined) {
      reportDiagnostic({
        code: DIAGNOSTIC_CODES.warn,
        level: 'warn',
        message: `[animations] 预设表里没有「${effect}」这段动画`,
      })
      return null
    }
    return found
  }

  const cancel = (target?: HTMLElement): void => {
    if (target !== undefined) {
      running.get(target)?.cancel()
      running.delete(target)
      return
    }
    for (const handle of [...running.values()]) handle.cancel()
    running.clear()
  }

  /**
   * 配方与本次选项、全局时长系数合成实际要播的那一段，并在入口校验：
   * 不合法（含闪烁超限）时同步抛错，不交给宿主。开关关着也照样校验，配方的错不随开关藏起来。
   */
  const play = (
    target: HTMLElement,
    effect: string | MotionSpec,
    playOptions: PlayOptions = {},
  ): Promise<MotionStatus> => {
    const spec = resolve(effect)
    if (spec === null)
      return Promise.resolve('finished')
    const timed: MotionSpec = {
      ...spec,
      duration: (playOptions.duration ?? spec.duration ?? DEFAULT_DURATION) * speed,
      easing: playOptions.easing ?? spec.easing,
      delay: playOptions.delay ?? spec.delay,
      fill: playOptions.fill ?? spec.fill,
      iterations: playOptions.iterations ?? spec.iterations,
      direction: playOptions.direction ?? spec.direction,
    }
    validateMotionSpec(timed)
    if (!enabled)
      return Promise.resolve('finished')

    // 同一元素上的上一段先撤掉：两段一起写同一批属性，后一段会从被改过的中间态起步
    cancel(target)

    const handle = animate(target, toKeyframes(timed, target), {
      duration: timed.duration,
      easing: timed.easing,
      delay: timed.delay,
      fill: timed.fill,
      iterations: timed.iterations,
      direction: timed.direction,
    })
    running.set(target, handle)

    return handle.finished.then((status) => {
      // 播完期间可能已被新的一段顶替，只清掉还是自己那一条
      if (running.get(target) === handle)
        running.delete(target)
      return status
    })
  }

  const playAll = (
    targets: Iterable<HTMLElement>,
    effect: string | MotionSpec,
    staggerOptions: StaggerOptions = {},
  ): Promise<MotionStatus> => {
    const gap = checkStagger(staggerOptions.stagger)
    const list = [...targets]
    if (list.length === 0)
      return Promise.resolve('finished')

    const from = staggerOptions.from ?? 'first'
    const base = staggerOptions.delay ?? 0

    const runs = list.map((target, index) => play(target, effect, {
      ...staggerOptions,
      delay: base + orderIndex(index, list.length, from) * gap,
    }))
    return Promise.all(runs).then(results => (results.includes('cancelled') ? 'cancelled' : 'finished'))
  }

  return {
    play,
    playAll,
    cancel,
    setEnabled: (next: boolean) => {
      enabled = next
      if (!next)
        cancel()
    },
    isEnabled: () => enabled,
    setPresets: (next: Record<string, MotionSpec>) => {
      presets = next
    },
  }
}
