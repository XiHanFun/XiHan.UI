import type { MotionFrame } from '../src/types'
import { easing, motionDistances, motionDurations, motionEasings } from '@xihan-ui/motion'
import { describe, expect, it } from 'vitest'
import { motionPresets } from '../src/presets'
import { MAX_FLASHES_PER_SECOND, peakFlashesPerSecond, validateMotionSpec } from '../src/spec'
import { BUILTIN_MOTION_NAMES } from '../src/types'

/** 静息态：元素不被动画改动时的样子。 */
const REST: Required<Pick<MotionFrame, 'opacity' | 'x' | 'y' | 'scale' | 'rotate' | 'blur'>> = {
  opacity: 1,
  x: 0,
  y: 0,
  scale: 1,
  rotate: 0,
  blur: 0,
}

function atRest(frame: MotionFrame): boolean {
  return (Object.keys(REST) as Array<keyof typeof REST>)
    .every(key => frame[key] === undefined || frame[key] === REST[key])
}

const ENTER = ['fade', 'fade-up', 'fade-down', 'fade-start', 'fade-end', 'zoom-in', 'zoom-out', 'blur-in', 'rise', 'drop-in', 'spin-in']
const ATTENTION = ['shake', 'pulse', 'bounce', 'wobble', 'flash', 'heartbeat']

describe('预设名单', () => {
  it('名单与实现一一对应', () => {
    expect(Object.keys(motionPresets).sort()).toEqual([...BUILTIN_MOTION_NAMES].sort())
  })

  it('两族加起来就是全部', () => {
    expect([...ENTER, ...ATTENTION].sort()).toEqual([...BUILTIN_MOTION_NAMES].sort())
  })
})

describe('每个预设都可播放', () => {
  for (const name of BUILTIN_MOTION_NAMES) {
    it(name, () => {
      const spec = motionPresets[name]
      expect(spec.frames.length).toBeGreaterThanOrEqual(2)
      expect(spec.duration).toBeGreaterThan(0)
      expect(() => validateMotionSpec(spec)).not.toThrow()
    })
  }
})

describe('进场一族', () => {
  it('末帧落在静息态：播完不留值，元素回到皮肤定义的样子', () => {
    for (const name of ENTER) {
      const frames = motionPresets[name as keyof typeof motionPresets].frames
      expect(atRest(frames[frames.length - 1]!), name).toBe(true)
    }
  })

  it('首帧不在静息态：否则这段动画什么都看不见', () => {
    for (const name of ENTER)
      expect(atRest(motionPresets[name as keyof typeof motionPresets].frames[0]!), name).toBe(false)
  })

  it('都从透明起步', () => {
    for (const name of ENTER)
      expect(motionPresets[name as keyof typeof motionPresets].frames[0]!.opacity, name).toBe(0)
  })

  it('不留值，播完由皮肤接管', () => {
    for (const name of ENTER)
      expect(motionPresets[name as keyof typeof motionPresets].fill, name).toBeUndefined()
  })

  it('横向进场标了 logical，纵向进场没标', () => {
    expect(motionPresets['fade-start'].logical).toBe(true)
    expect(motionPresets['fade-end'].logical).toBe(true)
    expect(motionPresets['fade-up'].logical).toBeUndefined()
  })
})

describe('注意一族', () => {
  it('首尾都在静息态：从原样出发，回到原样', () => {
    for (const name of ATTENTION) {
      const frames = motionPresets[name as keyof typeof motionPresets].frames
      expect(atRest(frames[0]!), `${name} 首帧`).toBe(true)
      expect(atRest(frames[frames.length - 1]!), `${name} 末帧`).toBe(true)
    }
  })

  it('中间帧偏离静息态', () => {
    for (const name of ATTENTION) {
      const frames = motionPresets[name as keyof typeof motionPresets].frames
      expect(frames.slice(1, -1).some(frame => !atRest(frame)), name).toBe(true)
    }
  })

  it('只播一次，不无限循环', () => {
    for (const name of ATTENTION)
      expect(motionPresets[name as keyof typeof motionPresets].iterations, name).toBeUndefined()
  })
})

describe('与令牌同源', () => {
  const preset = (name: string) => motionPresets[name as keyof typeof motionPresets]
  /** 一帧里位移的绝对值（没有位移记 0）。 */
  const shift = (name: string) => Math.max(...preset(name).frames.map(frame => Math.abs(Number(frame.x ?? 0)) + Math.abs(Number(frame.y ?? 0))))

  it('淡入取出现档', () => {
    expect(preset('fade').duration).toBe(motionDurations.enter)
    expect(preset('fade').easing).toBe(motionEasings.enter)
  })

  it('带位移的淡入、缩放与模糊取整幅位移档，位移取 distance-lg', () => {
    for (const name of ['fade-up', 'fade-down', 'fade-start', 'fade-end', 'zoom-in', 'zoom-out', 'blur-in']) {
      expect(preset(name).duration, name).toBe(motionDurations.slide)
      expect(preset(name).easing, name).toBe(motionEasings.enter)
    }
    for (const name of ['fade-up', 'fade-down', 'fade-start', 'fade-end'])
      expect(shift(name), name).toBe(motionDistances.lg)
  })

  it('上浮、落入、旋入取强调档：整幅位移加一段出现，位移是 distance-lg 的 1.5 倍', () => {
    for (const name of ['rise', 'drop-in', 'spin-in']) {
      expect(preset(name).duration, name).toBe(motionDurations.slide + motionDurations.enter)
      expect(preset(name).easing, name).toBe(motionEasings.emphasis)
    }
    for (const name of ['rise', 'drop-in'])
      expect(shift(name), name).toBe(motionDistances.lg * 1.5)
  })

  it('注意一族取注意档，摆幅以 distance-md 为准', () => {
    for (const name of ATTENTION)
      expect(preset(name).duration, name).toBe(motionDurations.attention)
    expect(shift('shake')).toBe(motionDistances.md)
    expect(shift('bounce')).toBe(motionDistances.md * 1.5)
  })

  it('缓动都是宿主认的 CSS 写法', () => {
    const named = new Set<string>(Object.values(easing))
    for (const name of BUILTIN_MOTION_NAMES) {
      const spec = preset(name)
      for (const value of [spec.easing, ...spec.frames.map(frame => frame.easing)].filter(v => v !== undefined))
        expect(named.has(value!), `${name}: ${value}`).toBe(true)
    }
  })

  it('flash 只播一遍时任意一秒不超过三次闪烁', () => {
    expect(peakFlashesPerSecond(preset('flash'))).toBeLessThanOrEqual(MAX_FLASHES_PER_SECOND)
  })
})
