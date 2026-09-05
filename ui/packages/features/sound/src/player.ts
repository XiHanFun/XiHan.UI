// 播放器：声音层的对外门面。开关、音量、主题、同名节流与自动播放策略收在这里。
// 上下文被浏览器挂起时最多保留最近一次待发声——恢复后只补那一声，
// 绝不把积压的提示音一口气倒出来。

import type { SoundContext } from './engine/context'
import type { Voice } from './engine/voice'
import type { PlayOptions, SoundPlayer, SoundPlayerOptions, SoundSpec, SoundTheme } from './types'
import { DIAGNOSTIC_CODES, reportDiagnostic } from '@xihan-ui/core'
import { createSoundContext, isAudioSupported } from './engine/context'
import { playSpec } from './engine/voice'
import { clampSpec } from './spec'
import { defaultSoundTheme } from './themes/default'

function clamp01(value: number): number {
  return Math.min(1, Math.max(0, Number.isFinite(value) ? value : 0))
}

/** 待发声的保质期（毫秒）：上下文恢复得比这更晚，那一声已经对不上任何事件。 */
const PENDING_MAX_AGE = 3000
/** 音量过渡时间常数（秒）：瞬时赋值会在正在响的声音上留下台阶。 */
const VOLUME_RAMP = 0.02

export function createSoundPlayer(options: SoundPlayerOptions = {}): SoundPlayer {
  let theme: SoundTheme = options.theme ?? defaultSoundTheme
  let volume = clamp01(options.volume ?? 0.5)
  let enabled = options.enabled ?? true
  const throttle = Number.isFinite(options.throttle) ? Math.max(0, options.throttle!) : 50

  let sound: SoundContext | null = null
  let pending: Voice | null = null
  let pendingAt = 0
  const lastPlayed = new Map<string, number>()

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

  const play = (input: string | SoundSpec, playOptions?: PlayOptions): void => {
    if (!enabled)
      return
    let spec: SoundSpec
    if (typeof input === 'string') {
      const found = theme[input]
      if (!found) {
        reportDiagnostic({
          code: DIAGNOSTIC_CODES.warn,
          level: 'warn',
          message: `[sound] 主题里没有「${input}」这个声音`,
        })
        return
      }
      const now = Date.now()
      const last = lastPlayed.get(input)
      if (last !== undefined && now - last < throttle)
        return
      lastPlayed.set(input, now)
      spec = found
    }
    else if (input && typeof input === 'object') {
      spec = input
    }
    else {
      return
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

  const unlock = (): void => {
    if (!enabled)
      return
    const target = ensureContext()
    if (target && target.ctx.state !== 'running')
      void target.ctx.resume().catch(() => undefined)
  }

  return {
    play,
    unlock,
    setEnabled: (next: boolean) => {
      enabled = next
      if (!next)
        dropPending()
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
      lastPlayed.clear()
      if (sound) {
        void sound.ctx.close().catch(() => undefined)
        sound = null
      }
    },
  }
}
