/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 播放器：声音层的对外门面。开关、音量、主题、同名节流与自动播放策略收在这里。
// 上下文被浏览器挂起时最多保留最近一次待发声——恢复后只补那一声，
// 绝不把积压的提示音一口气倒出来。循环播放另走一条：每一遍在音频时钟上提前排好，
// 计时器只负责往后续排，被后台页签放慢也不断档。

import type { SoundContext } from './engine/context'
import type { Voice } from './engine/voice'
import type { PlayOptions, SoundLoop, SoundPlayer, SoundPlayerOptions, SoundSpec, SoundTheme } from './types'
import { DIAGNOSTIC_WARN, reportDiagnostic } from '@xihan-ui/core'
import { createSoundContext, isAudioSupported } from './engine/context'
import { playSpec } from './engine/voice'
import { clampSpec, specPeriod } from './spec'
import { defaultSoundTheme } from './themes/default'

function clamp01(value: number): number {
  return Math.min(1, Math.max(0, Number.isFinite(value) ? value : 0))
}

/** 待发声的保质期（毫秒）：上下文恢复得比这更晚，那一声已经对不上任何事件。 */
const PENDING_MAX_AGE = 3000
/** 音量过渡时间常数（秒）：瞬时赋值会在正在响的声音上留下台阶。 */
const VOLUME_RAMP = 0.02
/** 循环在音频时钟上提前排好的时长（秒）：盖过后台页签里计时器一秒一次的节流。 */
const LOOP_AHEAD = 2.5
/** 循环续排的间隔（毫秒）。 */
const LOOP_TICK = 250

/** 正在进行的一段循环。 */
interface LoopRun {
  stop: () => void
}

export function createSoundPlayer(options: SoundPlayerOptions = {}): SoundPlayer {
  let theme: SoundTheme = options.theme ?? defaultSoundTheme
  let volume = clamp01(options.volume ?? 0.5)
  let enabled = options.enabled ?? true
  const throttle = Number.isFinite(options.throttle) ? Math.max(0, options.throttle!) : 50

  let sound: SoundContext | null = null
  let pending: Voice | null = null
  let pendingAt = 0
  const lastPlayed = new Map<string, number>()
  const loops = new Set<LoopRun>()

  /** 丢掉待发声：关开关、过期、被新的一声顶掉都走它。 */
  const dropPending = (): void => {
    pending?.stop()
    pending = null
  }

  const ensureContext = (): SoundContext | null => {
    if (sound && sound.ctx.state !== 'closed')
      return sound
    if (!isAudioSupported())
      return null
    let created: SoundContext
    try {
      created = createSoundContext(volume)
    }
    catch {
      // 上下文可能因浏览器的数量上限或权限策略创建失败——没有声音不该变成异常
      return null
    }
    created.ctx.addEventListener('statechange', () => {
      if (sound?.ctx !== created.ctx || created.ctx.state !== 'running')
        return
      // 恢复得太晚，那一声已经对不上任何事件；关掉开关的也一并丢掉
      if (!enabled || Date.now() - pendingAt > PENDING_MAX_AGE)
        dropPending()
      else
        pending = null
    })
    sound = created
    return sound
  }

  /** 语义名查主题，配方对象原样返回；主题里没有的名字出一条诊断。 */
  const resolve = (input: string | SoundSpec): SoundSpec | null => {
    if (typeof input === 'string') {
      const found = theme[input]
      if (!found) {
        reportDiagnostic({
          code: DIAGNOSTIC_WARN,
          level: 'warn',
          message: `[sound] 主题里没有「${input}」这个声音`,
        })
        return null
      }
      return found
    }
    return input && typeof input === 'object' ? input : null
  }

  const play = (input: string | SoundSpec, playOptions?: PlayOptions): void => {
    if (!enabled)
      return
    const spec = resolve(input)
    if (!spec)
      return
    if (typeof input === 'string') {
      const now = Date.now()
      const last = lastPlayed.get(input)
      if (last !== undefined && now - last < throttle)
        return
      lastPlayed.set(input, now)
    }
    const target = ensureContext()
    if (!target)
      return
    const clamped = clampSpec(spec)
    const level = clamp01(playOptions?.volume ?? 1)
    if (target.ctx.state === 'running') {
      playSpec(target, clamped, level)
      return
    }
    // 挂起态：尝试恢复；只保留最近一声待发，旧的直接压掉
    void target.ctx.resume().catch(() => undefined)
    dropPending()
    pending = playSpec(target, clamped, level)
    pendingAt = Date.now()
  }

  const loop = (input: string | SoundSpec, playOptions?: PlayOptions): SoundLoop => {
    const spec = enabled ? resolve(input) : null
    if (!spec)
      return { stop: () => undefined }
    const clamped = clampSpec(spec)
    const period = specPeriod(clamped)
    const level = clamp01(playOptions?.volume ?? 1)
    let voices: Voice[] = []
    /** 下一遍的起点（音频时钟）；-1 即还没开始，或挂起过要从头响。 */
    let next = -1
    let timer: ReturnType<typeof setTimeout> | null = null
    let waiting = false

    const run: LoopRun = {
      stop: () => {
        if (!loops.delete(run))
          return
        if (timer !== null)
          clearTimeout(timer)
        timer = null
        for (const voice of voices)
          voice.stop()
        voices = []
      },
    }

    const tick = (): void => {
      timer = null
      const target = ensureContext()
      if (!target) {
        // 没有声音可出：这段循环就此结束，不留空转的计时器
        run.stop()
        return
      }
      const { ctx } = target
      if (ctx.state !== 'running') {
        // 挂起期间不排：等恢复了从头响，而不是把错过的那几遍补出来
        if (!waiting)
          void ctx.resume().catch(() => undefined)
        waiting = true
        next = -1
      }
      else {
        waiting = false
        const now = ctx.currentTime
        voices = voices.filter(voice => voice.end > now)
        // 计时器被拖得比提前量还久，排好的已经响完：从此刻接着响
        if (next < now)
          next = now
        while (next < now + LOOP_AHEAD) {
          voices.push(playSpec(target, clamped, level, next))
          next += period
        }
      }
      timer = setTimeout(tick, LOOP_TICK)
    }

    loops.add(run)
    tick()
    return { stop: run.stop }
  }

  const stopLoops = (): void => {
    for (const run of [...loops])
      run.stop()
  }

  const unlock = (): void => {
    if (!enabled)
      return
    const target = ensureContext()
    if (target && target.ctx.state !== 'running')
      void target.ctx.resume().catch(() => undefined)
  }

  return {
    play,
    loop,
    unlock,
    setEnabled: (next: boolean) => {
      enabled = next
      if (!next) {
        dropPending()
        stopLoops()
      }
    },
    isEnabled: () => enabled,
    setVolume: (next: number) => {
      volume = clamp01(next)
      if (sound && sound.ctx.state !== 'closed') {
        const { gain } = sound.master
        const now = sound.ctx.currentTime
        gain.cancelScheduledValues(now)
        gain.setTargetAtTime(volume, now, VOLUME_RAMP)
      }
    },
    setTheme: (next: SoundTheme) => {
      theme = next
    },
    dispose: () => {
      dropPending()
      stopLoops()
      lastPlayed.clear()
      if (sound) {
        void sound.ctx.close().catch(() => undefined)
        sound = null
      }
    },
  }
}
