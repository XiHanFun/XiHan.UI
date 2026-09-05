// 播放器：动画层的对外门面。预设解析、打断、错开起播、开关与速度收在这里。
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
import { animate } from '@xihan-ui/motion'
import { motionPresets } from './presets'
import { clampSpec, DEFAULT_DURATION, toKeyframes } from './spec'

/** 相邻两个目标的起播间隔缺省毫秒。 */
const DEFAULT_STAGGER = 60
/** 时长系数的上限。 */
const MAX_SPEED = 100

function clampSpeed(value: number | undefined): number {
  if (value === undefined || !Number.isFinite(value) || value <= 0)
    return 1
  return Math.min(MAX_SPEED, value)
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
  const speed = clampSpeed(options.speed)

  const running = new Map<HTMLElement, AnimationHandle>()

  const resolve = (effect: string | MotionSpec): MotionSpec | null => {
    if (typeof effect !== 'string')
      return clampSpec(effect)
    const found = presets[effect]
    if (found === undefined) {
      reportDiagnostic({
        code: DIAGNOSTIC_CODES.warn,
        level: 'warn',
        message: `[animations] 预设表里没有「${effect}」这段动画`,
      })
      return null
    }
    return clampSpec(found)
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

  const play = async (
    target: HTMLElement,
    effect: string | MotionSpec,
    playOptions: PlayOptions = {},
  ): Promise<MotionStatus> => {
    if (!enabled)
      return 'finished'
    const spec = resolve(effect)
    if (spec === null)
      return 'finished'

    // 同一元素上的上一段先撤掉：两段一起写同一批属性，后一段会从被改过的中间态起步
    cancel(target)

    const handle = animate(target, toKeyframes(spec, target), {
      duration: (playOptions.duration ?? spec.duration ?? DEFAULT_DURATION) * speed,
      easing: playOptions.easing ?? spec.easing,
      delay: playOptions.delay ?? spec.delay,
      fill: playOptions.fill ?? spec.fill,
      iterations: playOptions.iterations ?? spec.iterations,
      direction: playOptions.direction ?? spec.direction,
    })
    running.set(target, handle)

    const status = await handle.finished
    // 播完期间可能已被新的一段顶替，只清掉还是自己那一条
    if (running.get(target) === handle)
      running.delete(target)
    return status
  }

  const playAll = async (
    targets: Iterable<HTMLElement>,
    effect: string | MotionSpec,
    staggerOptions: StaggerOptions = {},
  ): Promise<MotionStatus> => {
    const list = [...targets]
    if (list.length === 0)
      return 'finished'

    const gap = Number.isFinite(staggerOptions.stagger) ? Math.max(0, staggerOptions.stagger!) : DEFAULT_STAGGER
    const from = staggerOptions.from ?? 'first'
    const base = staggerOptions.delay ?? 0

    const results = await Promise.all(list.map((target, index) => play(target, effect, {
      ...staggerOptions,
      delay: base + orderIndex(index, list.length, from) * gap,
    })))
    return results.includes('cancelled') ? 'cancelled' : 'finished'
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
