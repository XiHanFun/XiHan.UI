/**
 * 计时靠单调时钟取时刻，定时器与 performance 都要能拨，所以用假时钟；
 * scope.getWin() 要有一个真窗口对象才拿得到 performance。
 *
 * @vitest-environment jsdom
 */

import type { TimerSchema } from '../src/timer'
import { normalizeProps } from '@xihan-ui/kernel'
import { createService } from '@xihan-ui/machine'
import { createVanillaRuntime } from '@xihan-ui/machine/vanilla'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
// 直接指到组件目录：包主入口的导出由接线一并补，测试不等它
import {
  connectTimer,
  formatTimerText,
  isTimerControlled,
  isTimerUnit,
  quantizeTimer,
  resolveTimerInterval,
  resolveTimerPrecision,
  resolveTimerStart,
  resolveTimerTarget,
  splitTimer,
  timerElapsedAt,
  timerMachine,
  timerRunOf,
  timerRunsOnMount,
  timerSegmentText,
  timerTotalMs,
  timerValueAt,
} from '../src/timer'

type Props = TimerSchema['props']
type Dict = Record<string, unknown>

const SECOND = 1000
const MINUTE = 60 * SECOND
const HOUR = 60 * MINUTE
const DAY = 24 * HOUR

// ── 纯函数：归一与拆分 ──────────────────────────────────────────────

describe('timer 取值归一', () => {
  it('间隔非有限数与非正数退回一秒，其余取整并抬到一帧以上', () => {
    expect(resolveTimerInterval(undefined)).toBe(1000)
    expect(resolveTimerInterval(0)).toBe(1000)
    expect(resolveTimerInterval(-5)).toBe(1000)
    expect(resolveTimerInterval(Number.NaN)).toBe(1000)
    expect(resolveTimerInterval(5)).toBe(16)
    expect(resolveTimerInterval(250.7)).toBe(250)
  })

  it('起始值非有限数与负数一律按 0', () => {
    expect(resolveTimerStart(undefined)).toBe(0)
    expect(resolveTimerStart(-1)).toBe(0)
    expect(resolveTimerStart(Number.POSITIVE_INFINITY)).toBe(0)
    expect(resolveTimerStart(1500)).toBe(1500)
  })

  it('终点缺省：倒计时归 0，正计时留 undefined——归成 0 会让秒表一开跑就到点', () => {
    expect(resolveTimerTarget(undefined, true)).toBe(0)
    expect(resolveTimerTarget(undefined, false)).toBeUndefined()
    expect(resolveTimerTarget(-3, false)).toBeUndefined()
    expect(resolveTimerTarget(5 * SECOND, false)).toBe(5 * SECOND)
  })

  it('这一轮的长度两个方向都非负：终点在起点反方向时长度为 0', () => {
    expect(timerTotalMs(10 * SECOND, 0, true)).toBe(10 * SECOND)
    expect(timerTotalMs(0, 10 * SECOND, false)).toBe(10 * SECOND)
    expect(timerTotalMs(undefined, undefined, false)).toBeUndefined()
    // 倒计时的终点比起点还大：一开跑就到点，而不是往回跑
    expect(timerTotalMs(5 * SECOND, 9 * SECOND, true)).toBe(0)
  })

  it('显示值夹在起点与终点之间，走过头也不越界', () => {
    expect(timerValueAt(0, 10 * SECOND, 0, true)).toBe(10 * SECOND)
    expect(timerValueAt(3 * SECOND, 10 * SECOND, 0, true)).toBe(7 * SECOND)
    expect(timerValueAt(99 * SECOND, 10 * SECOND, 0, true)).toBe(0)
    expect(timerValueAt(3 * SECOND, 0, undefined, false)).toBe(3 * SECOND)
    expect(timerValueAt(99 * SECOND, 0, 10 * SECOND, false)).toBe(10 * SECOND)
    // 负的与非有限的已走时长按没走算
    expect(timerValueAt(Number.NaN, 4 * SECOND, undefined, false)).toBe(4 * SECOND)
  })

  it('终点落在起点反方向时显示值停在起点上，不跳到那个走不到的终点', () => {
    // 倒着走却给了比起点还大的终点：这一轮长度是 0，显示的是起点
    expect(timerValueAt(0, 5 * SECOND, 9 * SECOND, true)).toBe(5 * SECOND)
    expect(timerValueAt(3 * SECOND, 5 * SECOND, 9 * SECOND, true)).toBe(5 * SECOND)
    // 正着走却给了比起点还小的终点，镜像同理
    expect(timerValueAt(0, 9 * SECOND, 5 * SECOND, false)).toBe(9 * SECOND)
    expect(timerValueAt(3 * SECOND, 9 * SECOND, 5 * SECOND, false)).toBe(9 * SECOND)
    // 只给终点不给起点的倒计时：起点是 0，显示恒为 0
    expect(timerValueAt(0, undefined, 60 * SECOND, true)).toBe(0)
  })

  it('结算按两个时刻相减，且夹进 [0, 总长]', () => {
    expect(timerElapsedAt(0, 100, 1100, undefined)).toBe(1000)
    expect(timerElapsedAt(2000, 100, 1100, undefined)).toBe(3000)
    expect(timerElapsedAt(0, 100, 9100, 5000)).toBe(5000)
    // 时钟往回跳也不会算出负的已走时长
    expect(timerElapsedAt(0, 500, 100, undefined)).toBe(0)
  })
})

describe('timer 分段', () => {
  it('天单独成段，所以时满 24 进位', () => {
    expect(splitTimer(2 * DAY + 3 * HOUR + 4 * MINUTE + 5 * SECOND + 6)).toEqual({
      days: 2,
      hours: 3,
      minutes: 4,
      seconds: 5,
      milliseconds: 6,
    })
  })

  it('补零：天不补，时分秒两位，毫秒三位', () => {
    const segments = splitTimer(9 * HOUR + 8 * MINUTE + 7 * SECOND + 6)
    expect(timerSegmentText(segments, 'days')).toBe('0')
    expect(timerSegmentText(segments, 'hours')).toBe('09')
    expect(timerSegmentText(segments, 'minutes')).toBe('08')
    expect(timerSegmentText(segments, 'seconds')).toBe('07')
    expect(timerSegmentText(segments, 'milliseconds')).toBe('006')
  })

  it('位数超了不截断：截掉高位会把大数说成小数', () => {
    expect(timerSegmentText(splitTimer(120 * DAY), 'days')).toBe('120')
  })

  it('认得出作者写在条目上的段单位', () => {
    expect(isTimerUnit('minutes')).toBe(true)
    expect(isTimerUnit('weeks')).toBe(false)
    expect(isTimerUnit(null)).toBe(false)
  })
})

// ── 机器：起停与到点 ────────────────────────────────────────────────

function makeTimer(initial: Props = {}) {
  const runtime = createVanillaRuntime()
  const props = runtime.signal<Props>(initial)
  const service = createService(timerMachine, { props: () => props.get(), runtime })
  runtime.start()
  return {
    service,
    state: () => service.state.get(),
    setProps: (next: Props) => props.set({ ...props.get(), ...next }),
    api: () => connectTimer(service, normalizeProps),
    root: () => connectTimer(service, normalizeProps).getRootProps() as Dict,
    display: () => connectTimer(service, normalizeProps).getDisplayProps() as Dict,
    control: () => connectTimer(service, normalizeProps).getControlProps() as Dict,
    stop: () => runtime.stop(),
  }
}

describe('timerMachine 起停', () => {
  beforeEach(() => {
    // 两个定时器与单调时钟都要能拨：performance 默认不在假时钟的接管范围里
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout', 'setInterval', 'clearInterval', 'performance', 'Date'] })
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('缺省不开跑，显示的就是起始值', () => {
    const t = makeTimer({ startMs: 30 * SECOND, countdown: true })
    expect(t.state()).toBe('idle')
    vi.advanceTimersByTime(10 * SECOND)
    expect(t.api().value).toBe(30 * SECOND)
    expect(t.api().elapsed).toBe(0)
  })

  it('autoStart 挂载即开跑，正计时按真实流逝往上走', () => {
    const t = makeTimer({ autoStart: true })
    expect(t.state()).toBe('running')
    vi.advanceTimersByTime(3 * SECOND)
    expect(t.api().value).toBe(3 * SECOND)
  })

  it('暂停停在看到的那个数上，继续从那里接着走而不是从头来', () => {
    const t = makeTimer({ autoStart: true })
    vi.advanceTimersByTime(4 * SECOND)
    t.api().pause()
    expect(t.state()).toBe('paused')

    // 停着的时候时间白过，累计不动
    vi.advanceTimersByTime(10 * SECOND)
    expect(t.api().value).toBe(4 * SECOND)

    t.api().resume()
    expect(t.state()).toBe('running')
    vi.advanceTimersByTime(2 * SECOND)
    expect(t.api().value).toBe(6 * SECOND)
  })

  it('归零回到没起步：累计清空，显示退回起始值', () => {
    const t = makeTimer({ autoStart: true, startMs: 20 * SECOND, countdown: true })
    vi.advanceTimersByTime(5 * SECOND)
    expect(t.api().value).toBe(15 * SECOND)

    t.api().reset()
    expect(t.state()).toBe('idle')
    expect(t.api().value).toBe(20 * SECOND)
    expect(t.api().elapsed).toBe(0)
  })

  it('走到一半再开跑是从头来，不是接着走', () => {
    const t = makeTimer({ autoStart: true })
    vi.advanceTimersByTime(7 * SECOND)
    t.api().start()
    expect(t.state()).toBe('running')
    expect(t.api().value).toBe(0)
  })
})

describe('timerMachine 到点', () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout', 'setInterval', 'clearInterval', 'performance', 'Date'] })
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('终点不落在整拍上也精确落点：不多走那一拍', () => {
    const onComplete = vi.fn()
    // 2.5 秒的倒计时配一秒一拍：只靠拍子判定的话要到第 3 秒才结束
    const t = makeTimer({ autoStart: true, countdown: true, startMs: 2500, onComplete })

    vi.advanceTimersByTime(2500)
    expect(t.state()).toBe('completed')
    expect(t.api().value).toBe(0)
    expect(onComplete).toHaveBeenCalledTimes(1)
    expect(onComplete).toHaveBeenCalledWith({ value: 0, elapsed: 2500 })
  })

  it('走完只通知一次，之后时间再过也不动', () => {
    const onComplete = vi.fn()
    const t = makeTimer({ autoStart: true, countdown: true, startMs: SECOND, onComplete })
    vi.advanceTimersByTime(30 * SECOND)
    expect(onComplete).toHaveBeenCalledTimes(1)
    expect(t.api().value).toBe(0)
    expect(t.state()).toBe('completed')
  })

  it('正计时给了终点就停在终点上；不给终点就一直走', () => {
    const capped = makeTimer({ autoStart: true, targetMs: 3 * SECOND })
    vi.advanceTimersByTime(30 * SECOND)
    expect(capped.state()).toBe('completed')
    expect(capped.api().value).toBe(3 * SECOND)

    const open = makeTimer({ autoStart: true })
    vi.advanceTimersByTime(30 * SECOND)
    expect(open.state()).toBe('running')
    expect(open.api().value).toBe(30 * SECOND)
  })

  it('暂停过的倒计时仍落在同一个终点上：停着的那段不算进路程', () => {
    const t = makeTimer({ autoStart: true, countdown: true, startMs: 10 * SECOND })
    vi.advanceTimersByTime(4 * SECOND)
    t.api().pause()
    vi.advanceTimersByTime(60 * SECOND)
    t.api().resume()

    vi.advanceTimersByTime(5 * SECOND)
    expect(t.state()).toBe('running')
    expect(t.api().value).toBe(SECOND)

    vi.advanceTimersByTime(SECOND)
    expect(t.state()).toBe('completed')
    expect(t.api().value).toBe(0)
  })

  it('每一拍通知一次，到点那一拍只发走完', () => {
    const onTick = vi.fn()
    const onComplete = vi.fn()
    makeTimer({ autoStart: true, countdown: true, startMs: 3 * SECOND, onTick, onComplete })

    vi.advanceTimersByTime(3 * SECOND)
    // 第 1、2 秒各一拍；第 3 秒是终点，那一刻只发走完
    expect(onTick).toHaveBeenCalledTimes(2)
    expect(onTick).toHaveBeenNthCalledWith(1, { value: 2 * SECOND, elapsed: SECOND })
    expect(onComplete).toHaveBeenCalledTimes(1)
  })

  it('改了起止值就按新的这一轮接着走，累计不丢', () => {
    const t = makeTimer({ autoStart: true, countdown: true, startMs: 10 * SECOND })
    vi.advanceTimersByTime(4 * SECOND)
    t.setProps({ startMs: 20 * SECOND })
    // 走过的 4 秒仍算数，只是这一轮的起点换了
    expect(t.api().value).toBe(16 * SECOND)

    vi.advanceTimersByTime(6 * SECOND)
    expect(t.state()).toBe('running')
    expect(t.api().value).toBe(10 * SECOND)
  })
})

describe('connectTimer 部件属性', () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout', 'setInterval', 'clearInterval', 'performance', 'Date'] })
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('root 带状态与尺寸；倒着走才出 data-countdown，正着走一个属性都不留', () => {
    const up = makeTimer({ size: 'lg' })
    expect(up.root()['data-state']).toBe('idle')
    expect(up.root()['data-size']).toBe('lg')
    expect(up.root()['data-countdown']).toBeUndefined()

    const down = makeTimer({ countdown: true })
    expect(down.root()['data-countdown']).toBe('')
  })

  it('时间区是 timer 角色，播报写死关掉，名字把每段说清楚', () => {
    const t = makeTimer({ startMs: HOUR + 2 * MINUTE + 3 * SECOND })
    const display = t.display()
    expect(display.role).toBe('timer')
    expect(display['aria-live']).toBe('off')
    expect(display['aria-label']).toBe('1 hour 2 minutes 3 seconds')
  })

  it('名字里的天数为 0 就不念它', () => {
    const t = makeTimer({ startMs: DAY })
    expect(t.display()['aria-label']).toBe('1 day 0 hours 0 minutes 0 seconds')
    expect(makeTimer({}).display()['aria-label']).toBe('0 hours 0 minutes 0 seconds')
  })

  it('内建名字按数量分单复数：1 用单数，0 与其余用复数', () => {
    expect(makeTimer({ startMs: HOUR + MINUTE + SECOND }).display()['aria-label'])
      .toBe('1 hour 1 minute 1 second')
    expect(makeTimer({ startMs: 2 * HOUR + 2 * MINUTE + 2 * SECOND }).display()['aria-label'])
      .toBe('2 hours 2 minutes 2 seconds')
  })

  it('终点落在起点反方向时显示值停在起点上，同时立刻算走完', () => {
    const t = makeTimer({ autoStart: true, countdown: true, startMs: 5 * SECOND, targetMs: 9 * SECOND })
    expect(t.api().value).toBe(5 * SECOND)

    vi.advanceTimersByTime(SECOND)
    expect(t.state()).toBe('completed')
    expect(t.api().value).toBe(5 * SECOND)
  })

  it('文案可整条替换，实例给的胜过内建英文', () => {
    const t = makeTimer({
      startMs: 65 * SECOND,
      translations: { time: s => `${s.minutes} 分 ${s.seconds} 秒`, start: '开始' },
    })
    expect(t.display()['aria-label']).toBe('1 分 5 秒')
    expect(t.control()['aria-label']).toBe('开始')
  })

  it('数字与分隔符对读屏隐藏：整段时间的读法归时间区的名字管', () => {
    const t = makeTimer({})
    const item = t.api().getItemProps({ unit: 'minutes' }) as Dict
    expect(item['aria-hidden']).toBe(true)
    expect(item['data-unit']).toBe('minutes')
    expect((t.api().getSeparatorProps() as Dict)['aria-hidden']).toBe(true)
  })

  it('起停按钮是原生 button，语义与名字随状态换', () => {
    const t = makeTimer({ countdown: true, startMs: 5 * SECOND })
    expect(t.control().type).toBe('button')
    expect(t.control()['data-action']).toBe('start')
    expect(t.control()['aria-label']).toBe('Start')

    t.api().start()
    expect(t.control()['data-action']).toBe('pause')

    t.api().pause()
    expect(t.control()['data-action']).toBe('resume')

    t.api().resume()
    vi.advanceTimersByTime(5 * SECOND)
    expect(t.control()['data-action']).toBe('reset')
    expect(t.control()['aria-label']).toBe('Reset')
  })

  it('按一下按钮就照当前语义走一步', () => {
    const t = makeTimer({})
    const press = (): void => void (t.control().onClick as () => void)()

    press()
    expect(t.state()).toBe('running')
    press()
    expect(t.state()).toBe('paused')
    press()
    expect(t.state()).toBe('running')
  })

  it('段文本取自当前显示值', () => {
    const t = makeTimer({ startMs: 90 * SECOND })
    expect(t.api().segmentText('minutes')).toBe('01')
    expect(t.api().segmentText('seconds')).toBe('30')
  })
})

// ── 文本、粒度与受控通道 ────────────────────────────────────────────

describe('timer 铺字与粒度', () => {
  it('缺省模板铺成 HH:mm:ss', () => {
    expect(formatTimerText(90 * SECOND)).toBe('00:01:30')
  })

  it('模板里没写 D 时小时收下全部小时数，写了 D 才把天分出来', () => {
    expect(formatTimerText(30 * HOUR)).toBe('30:00:00')
    expect(formatTimerText(30 * HOUR, 'D 天 HH:mm:ss')).toBe('1 天 06:00:00')
  })

  it('位数不够补零、超了不截断；毫秒先补满三位再取前几位', () => {
    expect(formatTimerText(100 * HOUR, 'HH')).toBe('100')
    expect(formatTimerText(1234, 's.S')).toBe('1.2')
    expect(formatTimerText(1234, 's.SSS')).toBe('1.234')
  })

  it('粒度缺省毫秒即不量化，写 0 才取到整秒', () => {
    expect(resolveTimerPrecision(undefined)).toBe(3)
    expect(resolveTimerPrecision(-1)).toBe(0)
    expect(resolveTimerPrecision(9)).toBe(3)
    expect(quantizeTimer(1999, 3)).toBe(1999)
    expect(quantizeTimer(1999, 0)).toBe(1000)
    expect(quantizeTimer(1999, 1)).toBe(1900)
  })
})

describe('timer 受控通道', () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout', 'setInterval', 'clearInterval', 'performance', 'Date'] })
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('给了剩余量即接管起止与方向：起点是它、倒着走、终点是 0', () => {
    expect(timerRunOf({ value: 5 * SECOND, startMs: 99, targetMs: 42, countdown: false }))
      .toEqual({ startMs: 5 * SECOND, targetMs: 0, countdown: true })
    expect(timerRunOf({ startMs: 99, targetMs: 42, countdown: true }))
      .toEqual({ startMs: 99, targetMs: 42, countdown: true })
  })

  it('给了剩余量或开关即算受控；两个都没给才看 autoStart', () => {
    expect(isTimerControlled(5 * SECOND, undefined)).toBe(true)
    expect(isTimerControlled(undefined, false)).toBe(true)
    expect(isTimerControlled(undefined, undefined)).toBe(false)
    expect(timerRunsOnMount(5 * SECOND, undefined, undefined)).toBe(true)
    expect(timerRunsOnMount(5 * SECOND, false, undefined)).toBe(false)
    expect(timerRunsOnMount(undefined, undefined, true)).toBe(true)
    expect(timerRunsOnMount(undefined, undefined, undefined)).toBe(false)
  })

  it('受控时挂载即开跑，剩余量落成显示值', () => {
    const t = makeTimer({ value: 5 * SECOND, precision: 0 })
    expect(t.state()).toBe('running')
    expect(t.api().value).toBe(5 * SECOND)
    expect(t.root()['data-controlled']).toBe('')
    t.stop()
  })

  it('开关翻假停在当前值，翻真接着走', () => {
    const t = makeTimer({ value: 10 * SECOND, active: true, precision: 0 })
    vi.advanceTimersByTime(3 * SECOND)
    t.setProps({ active: false })
    expect(t.state()).toBe('paused')
    expect(t.api().value).toBe(7 * SECOND)
    t.setProps({ active: true })
    expect(t.state()).toBe('running')
    t.stop()
  })

  it('剩余量改写即把累计清零、从新值重新计时', () => {
    const t = makeTimer({ value: 10 * SECOND, precision: 0 })
    vi.advanceTimersByTime(4 * SECOND)
    expect(t.api().value).toBe(6 * SECOND)
    t.setProps({ value: 8 * SECOND })
    expect(t.state()).toBe('running')
    expect(t.api().value).toBe(8 * SECOND)
    t.stop()
  })

  it('受控时起停按钮不改状态', () => {
    const t = makeTimer({ value: 5 * SECOND, active: false })
    expect(t.state()).toBe('idle')
    ;(t.control().onClick as () => void)()
    expect(t.state()).toBe('idle')
    t.stop()
  })

  it('走完落 data-state=completed，不另发一支 data-finished', () => {
    const t = makeTimer({ value: 2 * SECOND, precision: 0 })
    vi.advanceTimersByTime(2 * SECOND)
    expect(t.state()).toBe('completed')
    expect(t.api().value).toBe(0)
    expect(t.root()['data-state']).toBe('completed')
    expect(t.root()['data-finished']).toBeUndefined()
    t.stop()
  })

  it('播报档位落到时间区的 aria-live，缺省 off', () => {
    const t = makeTimer({})
    expect(t.display()['aria-live']).toBe('off')
    t.setProps({ live: 'polite' })
    expect(t.display()['aria-live']).toBe('polite')
    t.stop()
  })
})
