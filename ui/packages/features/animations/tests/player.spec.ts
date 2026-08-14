// @vitest-environment jsdom
import { onDiagnostic, resetDiagnostics, setDiagnosticsConsoleOutput } from '@xihan-ui/kernel'
import { setMotionOverride } from '@xihan-ui/motion'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createMotionPlayer } from '../src/player'

interface Call {
  frames: Keyframe[]
  options: KeyframeAnimationOptions
  settle: () => void
  abort: () => void
}

const calls: Call[] = []

/** 让元素的 animate 记录调用并交出结算手柄。 */
function stub(el: HTMLElement): HTMLElement {
  Object.defineProperty(el, 'animate', {
    configurable: true,
    writable: true,
    value: (frames: Keyframe[], options: KeyframeAnimationOptions) => {
      let done = (): void => {}
      let fail = (reason: unknown): void => void reason
      const finished = new Promise<void>((resolve, reject) => {
        done = () => resolve()
        fail = reject
      })
      calls.push({ frames, options, settle: done, abort: () => fail(new DOMException('aborted', 'AbortError')) })
      return { finished, cancel: () => fail(new DOMException('aborted', 'AbortError')), finish: () => done() }
    },
  })
  return el
}

function element(): HTMLElement {
  const el = stub(document.createElement('div'))
  document.body.append(el)
  return el
}

beforeEach(() => {
  calls.length = 0
  setMotionOverride('no-preference')
  setDiagnosticsConsoleOutput(false)
})

afterEach(() => {
  setMotionOverride(null)
  resetDiagnostics()
  document.body.innerHTML = ''
})

describe('播一段', () => {
  it('按预设的时序参数交给宿主', () => {
    const player = createMotionPlayer()
    void player.play(element(), 'fade')

    expect(calls).toHaveLength(1)
    expect(calls[0]!.options.duration).toBe(240)
    expect(calls[0]!.frames).toEqual([{ opacity: '0' }, { opacity: '1' }])
  })

  it('直接给配方也认', () => {
    const player = createMotionPlayer()
    void player.play(element(), { frames: [{ scale: 0 }, { scale: 1 }], duration: 100 })

    expect(calls[0]!.options.duration).toBe(100)
    expect(calls[0]!.frames).toEqual([{ scale: '0' }, { scale: '1' }])
  })

  it('选项压过配方', () => {
    const player = createMotionPlayer()
    void player.play(element(), 'fade', { duration: 999, delay: 30, fill: 'both', iterations: 3 })

    expect(calls[0]!.options).toMatchObject({ duration: 999, delay: 30, fill: 'both', iterations: 3 })
  })

  it('播完结算成 finished', async () => {
    const player = createMotionPlayer()
    const promise = player.play(element(), 'fade')
    calls[0]!.settle()
    await expect(promise).resolves.toBe('finished')
  })

  it('被打断结算成 cancelled', async () => {
    const player = createMotionPlayer()
    const el = element()
    const promise = player.play(el, 'fade')
    player.cancel(el)
    await expect(promise).resolves.toBe('cancelled')
  })
})

describe('未收录的预设', () => {
  it('不播、不抛，产出一条诊断告警', async () => {
    const seen = vi.fn()
    onDiagnostic(seen)
    const player = createMotionPlayer()

    await expect(player.play(element(), '并不存在')).resolves.toBe('finished')
    expect(calls).toHaveLength(0)
    expect(seen).toHaveBeenCalledTimes(1)
    expect(seen.mock.calls[0]![0].message).toContain('并不存在')
  })
})

describe('打断', () => {
  it('同一元素上再播一次，先撤掉上一段', async () => {
    const player = createMotionPlayer()
    const el = element()

    const first = player.play(el, 'fade')
    void player.play(el, 'pulse')

    await expect(first).resolves.toBe('cancelled')
    expect(calls).toHaveLength(2)
  })

  it('不传目标就全撤', async () => {
    const player = createMotionPlayer()
    const a = player.play(element(), 'fade')
    const b = player.play(element(), 'fade')

    player.cancel()

    await expect(a).resolves.toBe('cancelled')
    await expect(b).resolves.toBe('cancelled')
  })

  it('撤一个不影响另一个', async () => {
    const player = createMotionPlayer()
    const kept = element()
    const dropped = element()
    const a = player.play(kept, 'fade')
    const b = player.play(dropped, 'fade')

    player.cancel(dropped)
    calls[0]!.settle()

    await expect(a).resolves.toBe('finished')
    await expect(b).resolves.toBe('cancelled')
  })

  it('撤一个没在播的元素不抛', () => {
    const player = createMotionPlayer()
    expect(() => player.cancel(element())).not.toThrow()
  })
})

describe('错开起播', () => {
  it('按顺序递增延迟', () => {
    const player = createMotionPlayer()
    void player.playAll([element(), element(), element()], 'fade', { stagger: 50 })

    expect(calls.map(call => call.options.delay)).toEqual([0, 50, 100])
  })

  it('从末尾铺开', () => {
    const player = createMotionPlayer()
    void player.playAll([element(), element(), element()], 'fade', { stagger: 50, from: 'last' })

    expect(calls.map(call => call.options.delay)).toEqual([100, 50, 0])
  })

  it('从中间铺开', () => {
    const player = createMotionPlayer()
    void player.playAll([element(), element(), element(), element(), element()], 'fade', { stagger: 10, from: 'center' })

    expect(calls.map(call => call.options.delay)).toEqual([20, 10, 0, 10, 20])
  })

  it('叠在给定的基础延迟上', () => {
    const player = createMotionPlayer()
    void player.playAll([element(), element()], 'fade', { stagger: 50, delay: 200 })

    expect(calls.map(call => call.options.delay)).toEqual([200, 250])
  })

  it('缺省间隔 60', () => {
    const player = createMotionPlayer()
    void player.playAll([element(), element()], 'fade')

    expect(calls.map(call => call.options.delay)).toEqual([0, 60])
  })

  it('空集合直接结算', async () => {
    const player = createMotionPlayer()
    await expect(player.playAll([], 'fade')).resolves.toBe('finished')
    expect(calls).toHaveLength(0)
  })

  it('任意一个被打断，整体就算被打断', async () => {
    const player = createMotionPlayer()
    const first = element()
    const promise = player.playAll([first, element()], 'fade')

    player.cancel(first)
    calls[1]!.settle()

    await expect(promise).resolves.toBe('cancelled')
  })
})

describe('开关', () => {
  it('关掉之后不播，但照常结算', async () => {
    const player = createMotionPlayer({ enabled: false })

    await expect(player.play(element(), 'fade')).resolves.toBe('finished')
    expect(calls).toHaveLength(0)
    expect(player.isEnabled()).toBe(false)
  })

  it('关掉时撤掉在播的', async () => {
    const player = createMotionPlayer()
    const promise = player.play(element(), 'fade')

    player.setEnabled(false)

    await expect(promise).resolves.toBe('cancelled')
  })

  it('开回来又能播', () => {
    const player = createMotionPlayer({ enabled: false })
    player.setEnabled(true)
    void player.play(element(), 'fade')
    expect(calls).toHaveLength(1)
  })
})

describe('时长系数', () => {
  it('按系数缩放时长', () => {
    createMotionPlayer({ speed: 2 }).play(element(), 'fade').catch(() => {})
    expect(calls[0]!.options.duration).toBe(480)
  })

  it('非正或非有限的系数退回 1', () => {
    createMotionPlayer({ speed: 0 }).play(element(), 'fade').catch(() => {})
    createMotionPlayer({ speed: Number.NaN }).play(element(), 'fade').catch(() => {})
    expect(calls[0]!.options.duration).toBe(240)
    expect(calls[1]!.options.duration).toBe(240)
  })

  it('也作用在被选项覆盖的时长上', () => {
    createMotionPlayer({ speed: 0.5 }).play(element(), 'fade', { duration: 100 }).catch(() => {})
    expect(calls[0]!.options.duration).toBe(50)
  })
})

describe('自定义预设表', () => {
  it('构造时给的表压过内置', () => {
    const player = createMotionPlayer({ presets: { fade: { frames: [{ scale: 0 }, { scale: 1 }], duration: 10 } } })
    void player.play(element(), 'fade')
    expect(calls[0]!.options.duration).toBe(10)
  })

  it('换表之后按新表解析', () => {
    const player = createMotionPlayer()
    player.setPresets({ 自定义: { frames: [{ opacity: 0 }, { opacity: 1 }], duration: 77 } })
    void player.play(element(), '自定义')
    expect(calls[0]!.options.duration).toBe(77)
  })
})

describe('减弱动效', () => {
  it('偏好为 reduce 时不产生中间帧，仍照常结算', async () => {
    setMotionOverride('reduce')
    const player = createMotionPlayer()

    await expect(player.play(element(), 'fade')).resolves.toBe('finished')
    expect(calls).toHaveLength(0)
  })

  it('错开起播在 reduce 下也整体结算', async () => {
    setMotionOverride('reduce')
    const player = createMotionPlayer()

    await expect(player.playAll([element(), element()], 'fade')).resolves.toBe('finished')
    expect(calls).toHaveLength(0)
  })
})
