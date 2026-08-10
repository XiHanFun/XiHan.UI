// @vitest-environment jsdom
import type { CountdownSchema } from '../src/countdown'
import { normalizeProps } from '@xihan-ui/core'
import { createService } from '@xihan-ui/machine'
import { createVanillaRuntime } from '@xihan-ui/machine/vanilla'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
// 直接指到组件目录：包主入口的导出由接线一并补，测试不等它
import {
  connectCountdown,
  countdownMachine,
  formatCountdown,
  quantizeCountdown,
  resolveCountdownPrecision,
  resolveCountdownValue,
  splitCountdown,
} from '../src/countdown'

type Props = CountdownSchema['props']
type Dict = Record<string, unknown>

const SECOND = 1000
const MINUTE = 60 * SECOND
const HOUR = 60 * MINUTE

// ── 纯函数：拆分与铺字 ──────────────────────────────────────────────

describe('resolveCountdownValue', () => {
  it('负数、缺省与非有限数一律按 0：倒计时不倒着走', () => {
    expect(resolveCountdownValue(undefined)).toBe(0)
    expect(resolveCountdownValue(-500)).toBe(0)
    expect(resolveCountdownValue(Number.NaN)).toBe(0)
    expect(resolveCountdownValue(Number.POSITIVE_INFINITY)).toBe(0)
    expect(resolveCountdownValue(1500)).toBe(1500)
  })
})

describe('resolveCountdownPrecision', () => {
  it('缺省 0，夹进 [0,3]', () => {
    expect(resolveCountdownPrecision(undefined)).toBe(0)
    expect(resolveCountdownPrecision(3)).toBe(3)
    expect(resolveCountdownPrecision(9)).toBe(3)
    expect(resolveCountdownPrecision(-1)).toBe(0)
    expect(resolveCountdownPrecision(Number.NaN)).toBe(0)
  })
})

describe('quantizeCountdown', () => {
  it('往下取而不是四舍五入：还剩 1.9 秒就是 1 秒，那一秒还没走完', () => {
    expect(quantizeCountdown(1900, 0)).toBe(1000)
    expect(quantizeCountdown(1900, 1)).toBe(1900)
    expect(quantizeCountdown(1999, 1)).toBe(1900)
    expect(quantizeCountdown(1999, 3)).toBe(1999)
  })

  it('负数按 0', () => {
    expect(quantizeCountdown(-1, 3)).toBe(0)
  })
})

describe('splitCountdown', () => {
  it('拆成时分秒毫秒，分秒各自封顶 59', () => {
    expect(splitCountdown(HOUR + 2 * MINUTE + 3 * SECOND + 456)).toEqual({
      hours: 1,
      minutes: 2,
      seconds: 3,
      milliseconds: 456,
    })
  })

  it('小时不进位到天：100 小时就是 100', () => {
    expect(splitCountdown(100 * HOUR).hours).toBe(100)
  })

  it('归零就是四段全零', () => {
    expect(splitCountdown(0)).toEqual({ hours: 0, minutes: 0, seconds: 0, milliseconds: 0 })
  })
})

describe('formatCountdown', () => {
  it('缺省模板是 HH:mm:ss，位数不够补零', () => {
    expect(formatCountdown(HOUR + 2 * MINUTE + 3 * SECOND)).toBe('01:02:03')
    expect(formatCountdown(0)).toBe('00:00:00')
  })

  it('位数超了不截断：截成 00 会把"还早着呢"说成"到点了"', () => {
    expect(formatCountdown(100 * HOUR, 'HH:mm:ss')).toBe('100:00:00')
  })

  it('单字母记号不补零', () => {
    expect(formatCountdown(HOUR + 2 * MINUTE + 3 * SECOND, 'H:m:s')).toBe('1:2:3')
  })

  it('毫秒段先补满三位再取前几位', () => {
    expect(formatCountdown(1050, 'ss.S')).toBe('01.0')
    expect(formatCountdown(1050, 'ss.SS')).toBe('01.05')
    expect(formatCountdown(1050, 'ss.SSS')).toBe('01.050')
  })

  it('模板里非记号的字符原样留下', () => {
    expect(formatCountdown(HOUR + 2 * MINUTE + 3 * SECOND, 'H 时 m 分 s 秒')).toBe('1 时 2 分 3 秒')
  })

  it('只写一段也成立', () => {
    expect(formatCountdown(90 * SECOND, 'mm')).toBe('01')
  })
})

// ── 机器：逐帧递减 ──────────────────────────────────────────────────

/** 一帧的名义间隔，与假时钟里 requestAnimationFrame 的节拍一致。 */
const FRAME = 16

function makeCountdown(initial: Props = {}) {
  const runtime = createVanillaRuntime()
  const props = runtime.signal<Props>(initial)
  const service = createService(countdownMachine, { props: () => props.get(), runtime })
  runtime.start()
  return {
    service,
    state: () => service.state.get(),
    setProps: (next: Props) => props.set({ ...props.get(), ...next }),
    api: () => connectCountdown(service, normalizeProps),
    root: () => connectCountdown(service, normalizeProps).getRootProps() as Dict,
    stop: () => runtime.stop(),
  }
}

describe('countdownMachine', () => {
  beforeEach(() => {
    // 逐帧循环与时间戳都要能拨：rAF 与 performance 默认不在假时钟的接管范围里
    vi.useFakeTimers({ toFake: ['requestAnimationFrame', 'cancelAnimationFrame', 'performance', 'Date'] })
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('挂载即开始往下走，走到 0 就停住', () => {
    const c = makeCountdown({ value: 5 * SECOND, precision: 3 })
    expect(c.state()).toBe('running')
    expect(c.api().value).toBe(5000)

    vi.advanceTimersByTime(2 * SECOND)
    const midway = c.api().value
    expect(midway).toBeGreaterThan(0)
    expect(midway).toBeLessThan(5000)

    vi.advanceTimersByTime(5 * SECOND)
    expect(c.state()).toBe('idle')
    expect(c.api().value).toBe(0)
    expect(c.api().finished).toBe(true)
  })

  it('走到 0 通知一次，而且只有一次', () => {
    const onFinish = vi.fn()
    makeCountdown({ value: SECOND, onFinish })
    vi.advanceTimersByTime(10 * SECOND)
    expect(onFinish).toHaveBeenCalledTimes(1)
    expect(onFinish).toHaveBeenCalledWith({ value: 0 })
  })

  it('剩余量按精度往下取：缺省一秒才跳一次，中间那些毫秒不露面', () => {
    const c = makeCountdown({ value: 10 * SECOND })
    vi.advanceTimersByTime(1500)
    // 走了 1.5 秒，还剩 8.5 秒，取到整秒就是 8 秒
    expect(c.api().value).toBe(8 * SECOND)
    expect(c.api().text).toBe('00:00:08')
  })

  it('active 为假就停着：时间过去多久剩余量都不动，也不通知', () => {
    const onFinish = vi.fn()
    const c = makeCountdown({ value: 3 * SECOND, active: false, onFinish })
    expect(c.state()).toBe('idle')
    vi.advanceTimersByTime(10 * SECOND)
    expect(c.api().value).toBe(3 * SECOND)
    expect(onFinish).not.toHaveBeenCalled()
  })

  it('暂停停在看到的那个数上，继续从那里接着走而不是从头来', () => {
    const c = makeCountdown({ value: 10 * SECOND, precision: 3 })
    vi.advanceTimersByTime(4 * SECOND)
    c.setProps({ active: false })
    const frozen = c.api().value
    expect(frozen).toBeLessThan(7 * SECOND)

    vi.advanceTimersByTime(10 * SECOND)
    expect(c.api().value).toBe(frozen)

    c.setProps({ active: true })
    vi.advanceTimersByTime(FRAME)
    expect(c.api().value).toBeLessThan(frozen)
  })

  it('改剩余量即重新计时', () => {
    const c = makeCountdown({ value: 10 * SECOND, precision: 3 })
    vi.advanceTimersByTime(4 * SECOND)
    c.setProps({ value: 30 * SECOND })
    expect(c.api().value).toBe(30 * SECOND)
    vi.advanceTimersByTime(2 * SECOND)
    expect(c.api().value).toBeLessThan(30 * SECOND)
    expect(c.api().value).toBeGreaterThan(27 * SECOND)
  })

  it('到点之后改剩余量照样重新走起来，不必再拨 active', () => {
    const c = makeCountdown({ value: SECOND })
    vi.advanceTimersByTime(5 * SECOND)
    expect(c.state()).toBe('idle')

    c.setProps({ value: 20 * SECOND })
    expect(c.state()).toBe('running')
    expect(c.api().finished).toBe(false)
  })

  it('没给剩余量就是已经到点', () => {
    const c = makeCountdown()
    vi.advanceTimersByTime(FRAME)
    expect(c.state()).toBe('idle')
    expect(c.api().finished).toBe(true)
    expect(c.api().text).toBe('00:00:00')
  })

  it('停机后循环就撤了：再拨多少时间剩余量都不动', () => {
    const c = makeCountdown({ value: 60 * SECOND, precision: 3 })
    vi.advanceTimersByTime(SECOND)
    const before = c.api().value
    c.stop()
    vi.advanceTimersByTime(30 * SECOND)
    expect(c.api().value).toBe(before)
  })
})

describe('connectCountdown', () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['requestAnimationFrame', 'cancelAnimationFrame', 'performance', 'Date'] })
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('根是 status，但 aria-live 缺省显式写成 off', () => {
    // status 的隐含 aria-live 就是 polite，不写等于默认开着，
    // 一个每秒都在变的数字会把读屏刷爆
    const root = makeCountdown({ value: MINUTE, active: false }).root()
    expect(root.role).toBe('status')
    expect(root['aria-live']).toBe('off')
  })

  it('要播报由作者自己开', () => {
    const root = makeCountdown({ value: MINUTE, active: false, live: 'assertive' }).root()
    expect(root['aria-live']).toBe('assertive')
  })

  it('到点与暂停是两个钩子：停在 30 秒上不算到点', () => {
    const paused = makeCountdown({ value: 30 * SECOND, active: false }).root()
    expect(paused['data-state']).toBe('idle')
    expect(paused['data-finished']).toBeUndefined()

    const done = makeCountdown({ value: 0, active: false }).root()
    expect(done['data-finished']).toBe('')
  })

  it('parts 与 text 读的是同一个量化过的数', () => {
    const c = makeCountdown({ value: HOUR + 2 * MINUTE + 3 * SECOND + 900, active: false })
    expect(c.api().text).toBe('01:02:03')
    expect(c.api().parts).toEqual({ hours: 1, minutes: 2, seconds: 3, milliseconds: 0 })
  })
})
