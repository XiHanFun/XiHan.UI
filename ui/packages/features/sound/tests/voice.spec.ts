/**
 * 判据按「调度到参数上的曲线必须安全」写：指数 ramp 永不碰非正值、
 * 增益不出 0..1、频率不出可听域、每个源恰好 start 一次且如期 stop、
 * 结束或打断后整条链拆干净。三套内置主题的每个声音都过同一套检查。
 */

import type { SoundContext } from '../src/engine/context'
import type { Voice } from '../src/engine/voice'
import type { SoundSpec } from '../src/types'
import type { FakeAudioContext, FakeNode } from './fake-audio'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { createSoundContext } from '../src/engine/context'
import { playSpec } from '../src/engine/voice'
import { clampSpec, EPSILON, FREQ_MAX, FREQ_MIN } from '../src/spec'
import { defaultSoundTheme } from '../src/themes/default'
import { minimalSoundTheme } from '../src/themes/minimal'
import { softSoundTheme } from '../src/themes/soft'
import { BUILTIN_SOUND_NAMES } from '../src/types'
import { FakeConvolver, FakeGain, installFakeAudio } from './fake-audio'

let fake: ReturnType<typeof installFakeAudio>

beforeEach(() => {
  fake = installFakeAudio()
})

afterEach(() => {
  fake.restore()
})

function setup(): { sound: SoundContext, ctx: FakeAudioContext } {
  const sound = createSoundContext(0.5)
  const ctx = fake.instances[0]!
  return { sound, ctx }
}

interface Scheduled extends FakeNode {
  started: number | undefined
  stopped: number | undefined
  onended: (() => void) | null
}

function isScheduled(node: object): node is Scheduled {
  return 'started' in node
}

function playAndDiff(sound: SoundContext, ctx: FakeAudioContext, spec: SoundSpec, volume = 1): { voice: Voice, diff: FakeNode[] } {
  const before = ctx.created.length
  const voice = playSpec(sound, clampSpec(spec), volume)
  return { voice, diff: ctx.created.slice(before) }
}

describe('playSpec 的调度安全域', () => {
  it('三套内置主题的每个声音：参数曲线全部落在安全域内', () => {
    for (const theme of [defaultSoundTheme, minimalSoundTheme, softSoundTheme]) {
      for (const name of BUILTIN_SOUND_NAMES) {
        const { sound, ctx } = setup()
        const spec = theme[name]
        expect(spec, name).toBeDefined()
        // 替身会对指数 ramp 到非正值、start 两次、未 start 就 stop 直接抛
        playSpec(sound, clampSpec(spec!), 1)
        for (const { node, name: paramName, param } of ctx.allParams()) {
          for (const call of param.calls) {
            if (call.method === 'cancelScheduledValues')
              continue
            if (node === 'gain' && paramName === 'gain')
              expect(call.value, `${name} 的增益`).toBeGreaterThanOrEqual(0)
            if (node === 'gain' && paramName === 'gain')
              expect(call.value, `${name} 的增益`).toBeLessThanOrEqual(1)
            if (paramName === 'frequency') {
              expect(call.value, `${name} 的频率`).toBeGreaterThanOrEqual(FREQ_MIN)
              expect(call.value, `${name} 的频率`).toBeLessThanOrEqual(FREQ_MAX)
            }
            if (call.method === 'exponentialRampToValueAtTime')
              expect(call.value, `${name} 的指数 ramp`).toBeGreaterThan(0)
          }
        }
        for (const node of ctx.created) {
          if (!isScheduled(node))
            continue
          expect(node.started, `${name} 的源要 start`).toBeDefined()
          expect(node.stopped, `${name} 的源要排定 stop`).toBeDefined()
          expect(node.stopped!).toBeGreaterThan(node.started!)
        }
        fake.restore()
        fake = installFakeAudio()
      }
    }
  })

  it('衰减到 0 的指数段用 epsilon 收尾', () => {
    const { sound, ctx } = setup()
    playSpec(sound, clampSpec({
      layers: [{ kind: 'oscillator', wave: 'sine', frequency: [{ time: 0, value: 440 }], gain: [{ time: 0, value: 0.3 }, { time: 0.2, value: 0, curve: 'exp' }] }],
    }), 1)
    const expCalls = ctx.allParams()
      .flatMap(({ param }) => param.calls)
      .filter(call => call.method === 'exponentialRampToValueAtTime')
    expect(expCalls).toHaveLength(1)
    expect(expCalls[0]!.value).toBe(EPSILON)
  })

  it('层的启动偏移反映在源的 start 时间上', () => {
    const { sound, ctx } = setup()
    playSpec(sound, clampSpec({
      layers: [
        { kind: 'oscillator', wave: 'sine', frequency: [{ time: 0, value: 440 }], gain: [{ time: 0, value: 0.2 }, { time: 0.1, value: 0 }] },
        { kind: 'oscillator', wave: 'sine', frequency: [{ time: 0, value: 660 }], gain: [{ time: 0, value: 0.2 }, { time: 0.1, value: 0 }], delay: 0.5 },
      ],
    }), 1)
    const starts = ctx.created.filter(isScheduled).map(node => node.started!)
    expect(starts).toHaveLength(2)
    expect(starts[1]! - starts[0]!).toBeCloseTo(0.5)
  })

  it('space 大于 0 时湿路送进混响，纯干声完全不碰混响', () => {
    const { sound, ctx } = setup()
    const convolver = ctx.created.find(node => node instanceof FakeConvolver)!
    const dry = playAndDiff(sound, ctx, { layers: [{ kind: 'oscillator', wave: 'sine', frequency: [{ time: 0, value: 440 }], gain: [{ time: 0, value: 0.2 }] }] })
    expect(dry.diff.some(node => node.connections.includes(convolver))).toBe(false)
    const wet = playAndDiff(sound, ctx, { layers: [{ kind: 'oscillator', wave: 'sine', frequency: [{ time: 0, value: 440 }], gain: [{ time: 0, value: 0.2 }] }], space: 0.3 })
    expect(wet.diff.some(node => node.connections.includes(convolver))).toBe(true)
  })

  it('最后结束的源触发 onended 后整条链拆干净、常驻链不动', () => {
    const { sound, ctx } = setup()
    const { diff } = playAndDiff(sound, ctx, defaultSoundTheme.success!)
    const janitor = diff
      .filter(isScheduled)
      .reduce((a, b) => (a.stopped! > b.stopped! ? a : b))
    expect(janitor.onended).toBeTypeOf('function')
    janitor.onended!()
    for (const node of diff)
      expect(node.disconnected).toBe(true)
    const master = ctx.created[0] as FakeGain
    expect(master.disconnected).toBe(false)
  })

  it('增益包络没收到无声时，源被切断前先补一段淡出', () => {
    const { sound, ctx } = setup()
    const { diff } = playAndDiff(sound, ctx, {
      layers: [{ kind: 'oscillator', wave: 'sine', frequency: [{ time: 0, value: 440 }], gain: [{ time: 0, value: 0.3 }] }],
    })
    const layerGain = diff.filter(node => node instanceof FakeGain).at(-1) as FakeGain
    const fade = layerGain.gain.calls.filter(call => call.method === 'linearRampToValueAtTime' && call.value === 0)
    expect(fade).toHaveLength(1)
    const source = diff.filter(isScheduled)[0]!
    expect(fade[0]!.time).toBe(source.stopped)
  })

  it('包络已经收到无声的不再补淡出', () => {
    const { sound, ctx } = setup()
    const { diff } = playAndDiff(sound, ctx, {
      layers: [{ kind: 'oscillator', wave: 'sine', frequency: [{ time: 0, value: 440 }], gain: [{ time: 0, value: 0.3 }, { time: 0.1, value: 0 }] }],
    })
    const layerGain = diff.filter(node => node instanceof FakeGain).at(-1) as FakeGain
    const zeros = layerGain.gain.calls.filter(call => call.method === 'linearRampToValueAtTime' && call.value === 0)
    expect(zeros).toHaveLength(1)
    expect(zeros[0]!.time).toBeLessThan(diff.filter(isScheduled)[0]!.stopped!)
  })

  it('stop 走淡出而非硬切，拆链留给 onended', () => {
    const { sound, ctx } = setup()
    const { voice, diff } = playAndDiff(sound, ctx, defaultSoundTheme.notification!)
    const sources = diff.filter(isScheduled)
    const originalEnd = sources.map(node => node.stopped!)
    // 拆链的仍是原先最后结束的那个源，打断不改这个分工
    const janitor = sources.reduce((a, b) => (a.stopped! > b.stopped! ? a : b))
    voice.stop()
    const voiceGain = diff.find(node => node instanceof FakeGain) as FakeGain
    expect(voiceGain.gain.calls.some(call => call.method === 'cancelScheduledValues')).toBe(true)
    const fade = voiceGain.gain.calls.filter(call => call.method === 'setTargetAtTime')
    expect(fade).toHaveLength(1)
    expect(fade[0]!.value).toBe(0)
    // 源提前到近未来结束，但不是当场切断
    sources.forEach((node, i) => {
      expect(node.stopped!).toBeGreaterThan(ctx.currentTime)
      expect(node.stopped!).toBeLessThan(originalEnd[i]!)
    })
    expect(diff.every(node => node.disconnected)).toBe(false)
    janitor.onended!()
    for (const node of diff)
      expect(node.disconnected).toBe(true)
  })

  it('零层配方 stop 当场拆链', () => {
    const { sound, ctx } = setup()
    const { voice, diff } = playAndDiff(sound, ctx, { layers: [] })
    voice.stop()
    for (const node of diff)
      expect(node.disconnected).toBe(true)
  })

  it('零层配方不抛错且不留节点', () => {
    const { sound, ctx } = setup()
    const { diff } = playAndDiff(sound, ctx, { layers: [] })
    expect(diff.length).toBeGreaterThan(0)
    for (const node of diff)
      expect(node.disconnected).toBe(true)
  })
})
