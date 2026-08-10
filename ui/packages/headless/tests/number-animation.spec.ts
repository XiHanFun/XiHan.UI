// @vitest-environment jsdom
import type { NumberAnimationSchema } from '../src/number-animation'
import { normalizeProps } from '@xihan-ui/core'
import { createService } from '@xihan-ui/machine'
import { createVanillaRuntime } from '@xihan-ui/machine/vanilla'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
// 直接指到组件目录：包主入口的导出由接线一并补，测试不等它
import {
  connectNumberAnimation,
  formatNumberAnimation,
  NUMBER_ANIMATION_DURATION,
  numberAnimationMachine,
  resolveNumberAnimationBound,
  resolveNumberAnimationDuration,
  resolveNumberAnimationPrecision,
} from '../src/number-animation'

type Props = NumberAnimationSchema['props']
type Dict = Record<string, unknown>

// ── 纯函数：格式化与归一 ────────────────────────────────────────────

describe('resolveNumberAnimationPrecision', () => {
  it('缺省 0，给了就取整', () => {
    expect(resolveNumberAnimationPrecision(undefined)).toBe(0)
    expect(resolveNumberAnimationPrecision(2)).toBe(2)
    expect(resolveNumberAnimationPrecision(2.9)).toBe(2)
  })

  it('夹进 [0,20]：越界会让 toFixed 直接抛，整棵树跟着塌', () => {
    expect(resolveNumberAnimationPrecision(-3)).toBe(0)
    expect(resolveNumberAnimationPrecision(99)).toBe(20)
    expect(resolveNumberAnimationPrecision(Number.NaN)).toBe(0)
  })
})

describe('resolveNumberAnimationDuration', () => {
  it('缺省 1000，负数收到 0，非有限数退回缺省', () => {
    expect(resolveNumberAnimationDuration(undefined)).toBe(NUMBER_ANIMATION_DURATION)
    expect(resolveNumberAnimationDuration(250)).toBe(250)
    expect(resolveNumberAnimationDuration(-5)).toBe(0)
    expect(resolveNumberAnimationDuration(Number.NaN)).toBe(NUMBER_ANIMATION_DURATION)
  })

  it('0 是"一步到位"这个明确意图，不能被当成"没给"', () => {
    expect(resolveNumberAnimationDuration(0)).toBe(0)
  })
})

describe('resolveNumberAnimationBound', () => {
  it('缺省与非有限数一律按 0', () => {
    expect(resolveNumberAnimationBound(undefined)).toBe(0)
    expect(resolveNumberAnimationBound(Number.NaN)).toBe(0)
    expect(resolveNumberAnimationBound(Number.POSITIVE_INFINITY)).toBe(0)
    expect(resolveNumberAnimationBound(-12.5)).toBe(-12.5)
  })
})

describe('formatNumberAnimation', () => {
  it('小数位定长，位数不够补零', () => {
    expect(formatNumberAnimation(12.5, 0)).toBe('13')
    expect(formatNumberAnimation(12.5, 2)).toBe('12.50')
  })

  it('不给分隔符就不分隔：插什么符号是地区习惯，库不替作者猜', () => {
    expect(formatNumberAnimation(1234567, 0)).toBe('1234567')
    expect(formatNumberAnimation(1234567, 0, ',')).toBe('1,234,567')
    expect(formatNumberAnimation(1234567.891, 2, ' ')).toBe('1 234 567.89')
  })

  it('分组只管整数位，小数位不掺和', () => {
    expect(formatNumberAnimation(1000.123, 3, ',')).toBe('1,000.123')
  })

  it('位数不足三位时不留一个孤零零的分隔符', () => {
    expect(formatNumberAnimation(7, 0, ',')).toBe('7')
    expect(formatNumberAnimation(1000, 0, ',')).toBe('1,000')
  })

  it('负号在分隔之外', () => {
    expect(formatNumberAnimation(-1234567, 0, ',')).toBe('-1,234,567')
  })

  it('定长之后整个数是零就不带负号：写成 "-0" 只会让人以为坏了', () => {
    expect(formatNumberAnimation(-0.4, 0)).toBe('0')
    expect(formatNumberAnimation(-0.4, 1)).toBe('-0.4')
  })

  it('非有限数按 0：NaN 一路写进文本就是一个"NaN"', () => {
    expect(formatNumberAnimation(Number.NaN, 0)).toBe('0')
  })
})

// ── 机器：逐帧推进 ──────────────────────────────────────────────────

/** 一帧的名义间隔，与假时钟里 requestAnimationFrame 的节拍一致。 */
const FRAME = 16

function makeNumberAnimation(initial: Props = {}) {
  const runtime = createVanillaRuntime()
  const props = runtime.signal<Props>(initial)
  const service = createService(numberAnimationMachine, { props: () => props.get(), runtime })
  runtime.start()
  return {
    service,
    state: () => service.state.get(),
    setProps: (next: Props) => props.set({ ...props.get(), ...next }),
    api: () => connectNumberAnimation(service, normalizeProps),
    root: () => connectNumberAnimation(service, normalizeProps).getRootProps() as Dict,
    stop: () => runtime.stop(),
  }
}

describe('numberAnimationMachine', () => {
  beforeEach(() => {
    // 逐帧循环与时间戳都要能拨：rAF 与 performance 默认不在假时钟的接管范围里
    vi.useFakeTimers({ toFake: ['requestAnimationFrame', 'cancelAnimationFrame', 'performance', 'Date'] })
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('挂载即从起点起跑，走满时长后停在终点本身', () => {
    const n = makeNumberAnimation({ from: 0, to: 1000, duration: 100 })
    expect(n.state()).toBe('running')
    expect(n.api().value).toBe(0)

    vi.advanceTimersByTime(50)
    const midway = n.api().value
    expect(midway).toBeGreaterThan(0)
    expect(midway).toBeLessThan(1000)

    vi.advanceTimersByTime(100)
    expect(n.state()).toBe('idle')
    // 逐帧累出来的浮点尾巴会让它停在 999.99 上
    expect(n.api().value).toBe(1000)
  })

  it('走到终点通知一次，而且只有一次', () => {
    const onFinish = vi.fn()
    const n = makeNumberAnimation({ from: 0, to: 10, duration: 50, onFinish })
    vi.advanceTimersByTime(500)
    expect(onFinish).toHaveBeenCalledTimes(1)
    expect(onFinish).toHaveBeenCalledWith({ value: 10 })
    expect(n.state()).toBe('idle')
  })

  it('active 为假就停着：时间过去多久数字都不挪，也不通知', () => {
    const onFinish = vi.fn()
    const n = makeNumberAnimation({ from: 3, to: 900, duration: 50, active: false, onFinish })
    expect(n.state()).toBe('idle')
    vi.advanceTimersByTime(1000)
    expect(n.api().value).toBe(3)
    expect(onFinish).not.toHaveBeenCalled()
  })

  it('active 翻真从当前值接着走，翻假当场停在看到的那个数上', () => {
    const n = makeNumberAnimation({ from: 0, to: 100, duration: 100, active: false })
    n.setProps({ active: true })
    expect(n.state()).toBe('running')

    vi.advanceTimersByTime(48)
    n.setProps({ active: false })
    const frozen = n.api().value
    expect(frozen).toBeGreaterThan(0)
    expect(frozen).toBeLessThan(100)

    vi.advanceTimersByTime(1000)
    expect(n.api().value).toBe(frozen)
  })

  it('改终点从当前数字接着走，不跳回起点', () => {
    const n = makeNumberAnimation({ from: 0, to: 100, duration: 100 })
    vi.advanceTimersByTime(48)
    const before = n.api().value
    expect(before).toBeGreaterThan(0)

    n.setProps({ to: 200 })
    // 换目标那一刻数字不该有任何跳变
    expect(n.api().value).toBe(before)

    vi.advanceTimersByTime(200)
    expect(n.api().value).toBe(200)
  })

  it('改起点是"换起点"：数字当场落到新起点再重跑', () => {
    const n = makeNumberAnimation({ from: 0, to: 100, duration: 100 })
    vi.advanceTimersByTime(48)
    n.setProps({ from: 500 })
    expect(n.api().value).toBe(500)
  })

  it('停下之后改终点照样重新跑起来：数字跟着数据走，不必再拨 active', () => {
    const n = makeNumberAnimation({ from: 0, to: 10, duration: 50 })
    vi.advanceTimersByTime(200)
    expect(n.state()).toBe('idle')

    n.setProps({ to: 40 })
    expect(n.state()).toBe('running')
    vi.advanceTimersByTime(200)
    expect(n.api().value).toBe(40)
  })

  it('停着时改终点不会自己跑起来', () => {
    const n = makeNumberAnimation({ from: 1, to: 10, duration: 50, active: false })
    n.setProps({ to: 40 })
    expect(n.state()).toBe('idle')
    vi.advanceTimersByTime(500)
    expect(n.api().value).toBe(1)
  })

  it('时长为 0 就是一步到位：第一帧就落在终点上', () => {
    const n = makeNumberAnimation({ from: 0, to: 77, duration: 0 })
    vi.advanceTimersByTime(FRAME)
    expect(n.api().value).toBe(77)
    expect(n.state()).toBe('idle')
  })

  it('停机后循环就撤了：再拨多少时间数字都不动', () => {
    const n = makeNumberAnimation({ from: 0, to: 100, duration: 1000 })
    vi.advanceTimersByTime(100)
    const before = n.api().value
    n.stop()
    vi.advanceTimersByTime(5000)
    expect(n.api().value).toBe(before)
  })
})

describe('connectNumberAnimation', () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['requestAnimationFrame', 'cancelAnimationFrame', 'performance', 'Date'] })
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('根是 status，但 aria-live 缺省显式写成 off', () => {
    // status 的隐含 aria-live 就是 polite，不写等于默认开着，
    // 一个每帧都在变的数字会把读屏刷爆
    const root = makeNumberAnimation({ active: false }).root()
    expect(root.role).toBe('status')
    expect(root['aria-live']).toBe('off')
  })

  it('要播报由作者自己开', () => {
    const root = makeNumberAnimation({ active: false, live: 'polite' }).root()
    expect(root['aria-live']).toBe('polite')
  })

  it('状态与两个视觉轴落成 data-*，没写的轴不输出', () => {
    const plain = makeNumberAnimation({ active: false }).root()
    expect(plain['data-state']).toBe('idle')
    expect(plain['data-size']).toBeUndefined()
    expect(plain['data-tone']).toBeUndefined()

    const dressed = makeNumberAnimation({ active: false, size: 'lg', tone: 'success' }).root()
    expect(dressed['data-size']).toBe('lg')
    expect(dressed['data-tone']).toBe('success')
  })

  it('text 就是当前数字按 precision 与 separator 铺好的字', () => {
    const n = makeNumberAnimation({ active: false, from: 1234567.891, precision: 2, separator: ',' })
    expect(n.api().text).toBe('1,234,567.89')
    expect(n.api().running).toBe(false)
  })
})
