/**
 * 判据按「门面在任何环境都不许炸」写：禁用不建上下文、环境缺 AudioContext
 * 静默退出、未知名只出一条诊断、节流按名生效、挂起态只保最近一声、
 * dispose 后还能重建；循环播放在音频时钟上提前排好、停得干净、挂起时不积压。
 */

import type { DiagnosticRecord } from '@xihan-ui/core'
import type { SoundSpec } from '../src/types'
import { DIAGNOSTIC_CODES, onDiagnostic, resetDiagnostics, setDiagnosticsConsoleOutput, setDiagnosticsDedupe, setDiagnosticsLevel } from '@xihan-ui/core'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createSoundPlayer } from '../src/player'
import { FakeGain, installFakeAudio } from './fake-audio'

let fake: ReturnType<typeof installFakeAudio>
let records: DiagnosticRecord[]
let offDiagnostic: () => void

beforeEach(() => {
  fake = installFakeAudio()
  resetDiagnostics()
  setDiagnosticsLevel('warn')
  setDiagnosticsDedupe(false)
  setDiagnosticsConsoleOutput(false)
  records = []
  offDiagnostic = onDiagnostic((record) => {
    records.push(record)
  })
})

afterEach(() => {
  offDiagnostic()
  resetDiagnostics()
  fake.restore()
  vi.restoreAllMocks()
})

function scheduledOf(index: number): Array<{ started: number | undefined, stopped: number | undefined }> {
  const instance = fake.instances[index]
  if (!instance)
    return []
  return instance.created.filter(node => 'started' in node) as never
}

describe('createSoundPlayer', () => {
  it('禁用态不创建任何音频上下文', () => {
    const player = createSoundPlayer({ enabled: false })
    player.play('click')
    expect(fake.instances).toHaveLength(0)
    player.setEnabled(true)
    player.play('click')
    expect(fake.instances).toHaveLength(1)
  })

  it('环境没有 AudioContext 时静默退出', () => {
    fake.restore()
    const player = createSoundPlayer()
    expect(() => player.play('click')).not.toThrow()
    expect(() => player.unlock()).not.toThrow()
    fake = installFakeAudio()
  })

  it('上下文构造器抛错时静默退出', () => {
    fake.restore()
    ;(globalThis as Record<string, unknown>).AudioContext = class {
      constructor() {
        throw new Error('denied')
      }
    }
    const player = createSoundPlayer()
    expect(() => player.play('click')).not.toThrow()
    expect(() => player.unlock()).not.toThrow()
    delete (globalThis as Record<string, unknown>).AudioContext
    fake = installFakeAudio()
  })

  it('未知语义名只产出一条诊断，不建上下文', () => {
    const player = createSoundPlayer()
    player.play('nope')
    expect(records).toHaveLength(1)
    expect(records[0]!.code).toBe(DIAGNOSTIC_CODES.warn)
    expect(records[0]!.message).toContain('nope')
    expect(fake.instances).toHaveLength(0)
  })

  it('同名节流：窗口内丢弃、窗口外放行、异名不受影响', () => {
    const now = vi.spyOn(Date, 'now')
    const player = createSoundPlayer({ throttle: 50 })
    now.mockReturnValue(1000)
    player.play('tap')
    const afterFirst = scheduledOf(0).length
    expect(afterFirst).toBeGreaterThan(0)
    now.mockReturnValue(1020)
    player.play('tap')
    expect(scheduledOf(0)).toHaveLength(afterFirst)
    player.play('info')
    const afterOther = scheduledOf(0).length
    expect(afterOther).toBeGreaterThan(afterFirst)
    now.mockReturnValue(1060)
    player.play('tap')
    expect(scheduledOf(0).length).toBeGreaterThan(afterOther)
  })

  it('直接播配方对象不参与节流', () => {
    const spec = { layers: [{ kind: 'oscillator' as const, wave: 'sine' as const, frequency: [{ time: 0, value: 440 }], gain: [{ time: 0, value: 0.2 }] }] }
    const player = createSoundPlayer()
    player.play(spec)
    player.play(spec)
    expect(scheduledOf(0)).toHaveLength(2)
  })

  it('挂起态尝试恢复，且只保留最近一声待发', () => {
    fake.restore()
    fake = installFakeAudio('suspended')
    const player = createSoundPlayer({ throttle: 0 })
    player.play('tap')
    const ctx = fake.instances[0]!
    expect(ctx.resumeCalls).toBe(1)
    const first = scheduledOf(0)
    expect(first.length).toBeGreaterThan(0)
    player.play('info')
    // 第一声被压掉：结束时间被提前到淡出窗口内，新的一声仍排在原定时长上
    expect(first.every(node => node.stopped! <= ctx.currentTime + 0.02)).toBe(true)
    const second = scheduledOf(0).slice(first.length)
    expect(second.every(node => node.stopped! > 0)).toBe(true)
    // 恢复运行后待发声清空，后续播放不再动它
    ctx.setState('running')
    player.play('click')
    expect(second.every(node => node.stopped! > 0)).toBe(true)
  })

  it('音量初始化与运行期修改都钳进 0..1，运行期走平滑过渡不跳变', () => {
    const player = createSoundPlayer({ volume: 2 })
    player.play('tap')
    const master = fake.instances[0]!.created[0] as FakeGain
    expect(master.gain.value).toBe(1)
    player.setVolume(0.8)
    player.setVolume(-3)
    const ramps = master.gain.calls.filter(call => call.method === 'setTargetAtTime')
    expect(ramps.map(call => call.value)).toEqual([0.8, 0])
    // 除创建时的初值外没有第二次瞬时赋值
    expect(master.gain.calls.filter(call => call.method === 'set')).toHaveLength(1)
  })

  it('禁用时丢掉挂起态排队的那一声', () => {
    fake.restore()
    fake = installFakeAudio('suspended')
    const player = createSoundPlayer({ throttle: 0 })
    player.play('notification')
    const queued = scheduledOf(0)
    expect(queued.length).toBeGreaterThan(0)
    player.setEnabled(false)
    expect(queued.every(node => node.stopped! <= fake.instances[0]!.currentTime + 0.02)).toBe(true)
    // 之后恢复运行，那一声不会冒出来
    fake.instances[0]!.setState('running')
    expect(scheduledOf(0)).toHaveLength(queued.length)
  })

  it('禁用态的 unlock 不建上下文', () => {
    const player = createSoundPlayer({ enabled: false })
    player.unlock()
    expect(fake.instances).toHaveLength(0)
  })

  it('排队太久的那一声在恢复时丢弃，不再补播', () => {
    fake.restore()
    fake = installFakeAudio('suspended')
    const now = vi.spyOn(Date, 'now')
    now.mockReturnValue(1000)
    const player = createSoundPlayer()
    player.play('notification')
    const queued = scheduledOf(0)
    now.mockReturnValue(1000 + 3001)
    fake.instances[0]!.setState('running')
    expect(queued.every(node => node.stopped! <= fake.instances[0]!.currentTime + 0.02)).toBe(true)
  })

  it('throttle 传入非有限值时回落默认而非静默关掉节流', () => {
    const now = vi.spyOn(Date, 'now')
    now.mockReturnValue(1000)
    const player = createSoundPlayer({ throttle: Number.NaN })
    player.play('tap')
    const first = scheduledOf(0).length
    now.mockReturnValue(1020)
    player.play('tap')
    expect(scheduledOf(0)).toHaveLength(first)
  })

  it('单次播放的音量系数落到发声总增益', () => {
    const player = createSoundPlayer()
    player.play({ layers: [{ kind: 'oscillator', wave: 'sine', frequency: [{ time: 0, value: 440 }], gain: [{ time: 0, value: 0.5 }] }], gain: 0.6 }, { volume: 0.5 })
    const ctx = fake.instances[0]!
    const voiceGain = ctx.created.slice(3).find(node => node instanceof FakeGain) as FakeGain
    expect(voiceGain.gain.value).toBeCloseTo(0.3)
  })

  it('unlock 建上下文并尝试恢复，运行态不重复恢复', () => {
    fake.restore()
    fake = installFakeAudio('suspended')
    const player = createSoundPlayer()
    player.unlock()
    const ctx = fake.instances[0]!
    expect(ctx.resumeCalls).toBe(1)
    ctx.setState('running')
    player.unlock()
    expect(ctx.resumeCalls).toBe(1)
  })

  it('dispose 关闭上下文，之后播放重新建立', () => {
    const player = createSoundPlayer()
    player.play('tap')
    player.dispose()
    expect(fake.instances[0]!.closeCalls).toBe(1)
    player.play('tap')
    expect(fake.instances).toHaveLength(2)
  })
})

describe('循环播放', () => {
  /** 一遍 0.4 秒、周期 1 秒的单层配方：每排一遍就多一个源 */
  const beep: SoundSpec = {
    layers: [{ kind: 'oscillator', wave: 'sine', frequency: [{ time: 0, value: 440 }], gain: [{ time: 0, value: 0 }, { time: 0.01, value: 0.2 }, { time: 0.4, value: 0, curve: 'exp' }] }],
    period: 1,
  }

  function starts(index = 0): number[] {
    return scheduledOf(index).map(node => node.started!)
  }

  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] })
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('按周期在音频时钟上提前排好几遍，不靠计时器准点', () => {
    const player = createSoundPlayer()
    player.loop(beep)
    const at = starts()
    expect(at).toHaveLength(3)
    expect(at[0]).toBeCloseTo(0.003)
    expect(at[1]).toBeCloseTo(1)
    expect(at[2]).toBeCloseTo(2)
  })

  it('时钟往前走，计时器把后面的接着排上，不重复排已经排好的', () => {
    const player = createSoundPlayer()
    player.loop(beep)
    const ctx = fake.instances[0]!
    ctx.currentTime = 1.6
    vi.advanceTimersByTime(250)
    expect(starts().slice(3).map(time => Math.round(time * 1000) / 1000)).toEqual([3, 4])
  })

  it('计时器被拖得比提前量还久：从此刻接着响，不把错过的那几遍补出来', () => {
    const player = createSoundPlayer()
    player.loop(beep)
    const ctx = fake.instances[0]!
    ctx.currentTime = 30
    vi.advanceTimersByTime(250)
    const later = starts().slice(3)
    expect(later[0]).toBeCloseTo(30.003)
    expect(later).toHaveLength(3)
  })

  it('stop：排好的每一遍都在淡出窗口内收掉，之后不再续排；重复 stop 无副作用', () => {
    const player = createSoundPlayer()
    const ring = player.loop(beep)
    const ctx = fake.instances[0]!
    ring.stop()
    expect(scheduledOf(0).every(node => node.stopped! <= ctx.currentTime + 0.02)).toBe(true)
    const count = scheduledOf(0).length
    ctx.currentTime = 5
    vi.advanceTimersByTime(5000)
    expect(scheduledOf(0)).toHaveLength(count)
    expect(() => ring.stop()).not.toThrow()
  })

  it('语义名从主题里取，不受同名节流影响', () => {
    const player = createSoundPlayer({ throttle: 10_000 })
    player.play('ring')
    const once = scheduledOf(0).length
    player.loop('ring')
    expect(scheduledOf(0).length).toBeGreaterThan(once)
  })

  it('上下文挂起时不排：只请求一次恢复，恢复后从此刻从头响', () => {
    fake.restore()
    fake = installFakeAudio('suspended')
    const player = createSoundPlayer()
    player.loop(beep)
    const ctx = fake.instances[0]!
    vi.advanceTimersByTime(1000)
    expect(scheduledOf(0)).toHaveLength(0)
    expect(ctx.resumeCalls).toBe(1)
    ctx.currentTime = 7
    ctx.setState('running')
    vi.advanceTimersByTime(250)
    expect(starts()[0]).toBeCloseTo(7.003)
  })

  it('关掉开关即停下正在响的循环；关着时开始的循环不出声、不建上下文', () => {
    const player = createSoundPlayer()
    player.loop(beep)
    const ctx = fake.instances[0]!
    player.setEnabled(false)
    expect(scheduledOf(0).every(node => node.stopped! <= ctx.currentTime + 0.02)).toBe(true)
    const count = scheduledOf(0).length
    vi.advanceTimersByTime(5000)
    expect(scheduledOf(0)).toHaveLength(count)

    const silent = createSoundPlayer({ enabled: false })
    expect(() => silent.loop(beep).stop()).not.toThrow()
    expect(fake.instances).toHaveLength(1)
  })

  it('dispose 停下全部循环', () => {
    const player = createSoundPlayer()
    player.loop(beep)
    player.loop('ringback')
    player.dispose()
    const ctx = fake.instances[0]!
    expect(scheduledOf(0).every(node => node.stopped! <= ctx.currentTime + 0.02)).toBe(true)
    expect(vi.getTimerCount()).toBe(0)
  })

  it('未知语义名只出一条诊断，返回的句柄可以照常 stop', () => {
    const player = createSoundPlayer()
    const ring = player.loop('nope')
    expect(records).toHaveLength(1)
    expect(fake.instances).toHaveLength(0)
    expect(() => ring.stop()).not.toThrow()
  })

  it('环境没有 AudioContext：静默结束，不留空转的计时器', () => {
    fake.restore()
    const player = createSoundPlayer()
    expect(() => player.loop(beep)).not.toThrow()
    expect(vi.getTimerCount()).toBe(0)
    fake = installFakeAudio()
  })
})
