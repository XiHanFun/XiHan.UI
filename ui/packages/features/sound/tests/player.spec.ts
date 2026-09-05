/**
 * 判据按「门面在任何环境都不许炸」写：禁用不建上下文、环境缺 AudioContext
 * 静默退出、未知名只出一条诊断、节流按名生效、挂起态只保最近一声、
 * dispose 后还能重建。
 */

import type { DiagnosticRecord } from '@xihan-ui/core'
import { onDiagnostic, resetDiagnostics, setDiagnosticsConsoleOutput, setDiagnosticsDedupe, setDiagnosticsLevel } from '@xihan-ui/core'
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
