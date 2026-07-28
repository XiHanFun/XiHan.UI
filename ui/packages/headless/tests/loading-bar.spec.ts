// @vitest-environment jsdom
import type { LoadingBarSchema, LoadingBarValueChangeDetails } from '../src/loading-bar'
import { normalizeProps } from '@xihan-ui/core'
import { createService } from '@xihan-ui/machine'
import { createVanillaRuntime } from '@xihan-ui/machine/vanilla'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
// 直接指到组件目录：包主入口的导出由接线一并补，测试不等它
import {
  clampLoadingBarValue,
  connectLoadingBar,
  isLoadingBarDeterminate,
  LOADING_BAR_CEILING,
  LOADING_BAR_FADE_DURATION,
  LOADING_BAR_HEIGHT,
  LOADING_BAR_MINIMUM,
  LOADING_BAR_STEP_MAX_RATIO,
  LOADING_BAR_STEP_MIN_RATIO,
  LOADING_BAR_TRICKLE_SPEED,
  loadingBarMachine,
  nextLoadingBarValue,
  resolveLoadingBarFadeDuration,
  resolveLoadingBarMinimum,
  resolveLoadingBarTrickleSpeed,
} from '../src/loading-bar'

type Props = LoadingBarSchema['props']
type Dict = Record<string, unknown>

/** 钉死的随机源：算法里的随机性是特性，测试里必须能取到最小步、最大步与中间步。 */
const MIN_STEP = (): number => 0
const MAX_STEP = (): number => 1
const HALF_STEP = (): number => 0.5

// ── 纯函数：值域与爬升 ──────────────────────────────────────────────

describe('clampLoadingBarValue', () => {
  it('夹进 [0, 100]，越界两头都收住', () => {
    expect(clampLoadingBarValue(0)).toBe(0)
    expect(clampLoadingBarValue(42.5)).toBe(42.5)
    expect(clampLoadingBarValue(-30)).toBe(0)
    expect(clampLoadingBarValue(300)).toBe(100)
  })

  it('缺省与非有限数按 0 处理：宿主塞了个 NaN 不该让条子撑爆或整个消失', () => {
    expect(clampLoadingBarValue(undefined)).toBe(0)
    expect(clampLoadingBarValue(Number.NaN)).toBe(0)
    expect(clampLoadingBarValue(Number.POSITIVE_INFINITY)).toBe(0)
  })
})

describe('resolveLoadingBarMinimum', () => {
  it('缺省 8，给了就按给的算', () => {
    expect(resolveLoadingBarMinimum(undefined)).toBe(LOADING_BAR_MINIMUM)
    expect(resolveLoadingBarMinimum(20)).toBe(20)
  })

  it('0 是合法起步值，不能被当成"没给"', () => {
    // 0 是假值，用 `minimum ||` 判会让"从零起步"整个失效
    expect(resolveLoadingBarMinimum(0)).toBe(0)
  })

  it('上界取爬升上限而不是 100：起步就顶到 100 等于宣布事情已经办完', () => {
    expect(resolveLoadingBarMinimum(100)).toBe(LOADING_BAR_CEILING)
    expect(resolveLoadingBarMinimum(-5)).toBe(0)
    expect(resolveLoadingBarMinimum(Number.NaN)).toBe(LOADING_BAR_MINIMUM)
  })
})

describe('isLoadingBarDeterminate', () => {
  it('给了 value 才是确定进度；判据与 cell 的受控判据逐字一致', () => {
    expect(isLoadingBarDeterminate(undefined)).toBe(false)
    expect(isLoadingBarDeterminate(0)).toBe(true)
    expect(isLoadingBarDeterminate(60)).toBe(true)
  })
})

describe('nextLoadingBarValue', () => {
  it('0 起步就往前挪，步长落在剩余量的比例区间内', () => {
    const remaining = LOADING_BAR_CEILING
    expect(nextLoadingBarValue(0, MIN_STEP)).toBeCloseTo(remaining * LOADING_BAR_STEP_MIN_RATIO, 2)
    expect(nextLoadingBarValue(0, MAX_STEP)).toBeCloseTo(remaining * LOADING_BAR_STEP_MAX_RATIO, 2)
    // 最小步也必须真的动，否则条子会一直停在 0
    expect(nextLoadingBarValue(0, MIN_STEP)).toBeGreaterThan(0)
  })

  it('步长随进度递减：同一个随机数，越接近上限走得越短', () => {
    const early = nextLoadingBarValue(10, HALF_STEP) - 10
    const mid = nextLoadingBarValue(50, HALF_STEP) - 50
    const late = nextLoadingBarValue(95, HALF_STEP) - 95
    expect(early).toBeGreaterThan(mid)
    expect(mid).toBeGreaterThan(late)
    expect(late).toBeGreaterThan(0)
  })

  it('一路最大步爬几百拍也越不过上限，更到不了 100', () => {
    let value = 0
    for (let i = 0; i < 500; i++) {
      const next = nextLoadingBarValue(value, MAX_STEP)
      expect(next).toBeGreaterThanOrEqual(value)
      expect(next).toBeLessThanOrEqual(LOADING_BAR_CEILING)
      value = next
    }
    expect(value).toBeLessThan(100)
  })

  it('已经贴着上限就停在上限：不越界也不倒退', () => {
    expect(nextLoadingBarValue(LOADING_BAR_CEILING, MAX_STEP)).toBe(LOADING_BAR_CEILING)
    // 越界的入参先被夹成 100，100 >= 上限，于是同样落回上限
    expect(nextLoadingBarValue(100, MAX_STEP)).toBe(LOADING_BAR_CEILING)
    expect(nextLoadingBarValue(400, MAX_STEP)).toBe(LOADING_BAR_CEILING)
  })

  it('负值当 0 起步，不会算出一个负宽度', () => {
    expect(nextLoadingBarValue(-50, MIN_STEP)).toBe(nextLoadingBarValue(0, MIN_STEP))
  })

  it('坏的随机源退回最小步，绝不产出 NaN 或负步长', () => {
    const floor = nextLoadingBarValue(30, MIN_STEP)
    expect(nextLoadingBarValue(30, () => Number.NaN)).toBe(floor)
    expect(nextLoadingBarValue(30, () => -5)).toBe(floor)
    // 大于 1 的随机数被夹回 1，也就是最大步，仍在上限之内
    expect(nextLoadingBarValue(30, () => 9)).toBe(nextLoadingBarValue(30, MAX_STEP))
  })

  it('留两位小数：onValueChange 的载荷不该带一串浮点尾巴', () => {
    const value = nextLoadingBarValue(7.77, HALF_STEP)
    expect(Math.round(value * 100)).toBe(value * 100)
  })
})

// ── 纯函数：时序归一 ────────────────────────────────────────────────

describe('resolveLoadingBarTrickleSpeed', () => {
  it('缺省 200ms，给了就按给的算', () => {
    expect(resolveLoadingBarTrickleSpeed(undefined)).toBe(LOADING_BAR_TRICKLE_SPEED)
    expect(resolveLoadingBarTrickleSpeed(50)).toBe(50)
  })

  it('<=0 与非有限数一律表示不起计时器', () => {
    expect(resolveLoadingBarTrickleSpeed(0)).toBe(0)
    expect(resolveLoadingBarTrickleSpeed(-1)).toBe(0)
    expect(resolveLoadingBarTrickleSpeed(Number.NaN)).toBe(0)
    expect(resolveLoadingBarTrickleSpeed(Number.POSITIVE_INFINITY)).toBe(0)
  })
})

describe('resolveLoadingBarFadeDuration', () => {
  it('缺省 200ms；0 是合法的"不淡出"', () => {
    expect(resolveLoadingBarFadeDuration(undefined)).toBe(LOADING_BAR_FADE_DURATION)
    expect(resolveLoadingBarFadeDuration(0)).toBe(0)
    expect(resolveLoadingBarFadeDuration(1000)).toBe(1000)
  })

  it('负数夹成 0，非有限数退回缺省：Infinity 送进计时器会抛，条子也就再回不到 idle', () => {
    expect(resolveLoadingBarFadeDuration(-100)).toBe(0)
    expect(resolveLoadingBarFadeDuration(Number.POSITIVE_INFINITY)).toBe(LOADING_BAR_FADE_DURATION)
    expect(resolveLoadingBarFadeDuration(Number.NaN)).toBe(LOADING_BAR_FADE_DURATION)
  })
})

// ── 机器 ────────────────────────────────────────────────────────────

function makeLoadingBar(initial: Props = {}) {
  const runtime = createVanillaRuntime()
  const props = runtime.signal<Props>(initial)
  const service = createService(loadingBarMachine, { props: () => props.get(), runtime })
  runtime.start()
  return {
    service,
    state: () => service.state.get(),
    setProps: (next: Props) => props.set({ ...props.get(), ...next }),
    api: () => connectLoadingBar(service, normalizeProps),
    root: () => connectLoadingBar(service, normalizeProps).getRootProps() as Dict,
    range: () => connectLoadingBar(service, normalizeProps).getRangeProps() as Dict,
    stop: () => runtime.stop(),
  }
}

describe('loadingBarMachine 起停', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('默认停在 idle：条子收起、值为 0，时间过去多久都不动', () => {
    const bar = makeLoadingBar()
    expect(bar.state()).toBe('idle')
    expect(bar.api().visible).toBe(false)
    vi.advanceTimersByTime(60_000)
    expect(bar.api().value).toBe(0)
  })

  it('loading=true 挂载即开跑，并先跳到起步值', () => {
    const bar = makeLoadingBar({ loading: true })
    expect(bar.state()).toBe('loading')
    expect(bar.api().value).toBe(LOADING_BAR_MINIMUM)
    expect(bar.api().visible).toBe(true)
  })

  it('minimum 决定起步高度；0 也认', () => {
    expect(makeLoadingBar({ loading: true, minimum: 30 }).api().value).toBe(30)
    expect(makeLoadingBar({ loading: true, minimum: 0 }).api().value).toBe(0)
  })

  it('loading 翻 true：起步值经 onValueChange 报出去', () => {
    const onValueChange = vi.fn<(d: LoadingBarValueChangeDetails) => void>()
    const bar = makeLoadingBar({ onValueChange })
    expect(onValueChange).not.toHaveBeenCalled()

    bar.setProps({ loading: true })
    expect(bar.state()).toBe('loading')
    expect(onValueChange).toHaveBeenCalledWith({ value: LOADING_BAR_MINIMUM })
  })

  it('挂载时的 defaultValue 不会被 idle 抹掉', () => {
    // 归零只发生在淡出走完那一步；进入 idle 本身不该动值
    expect(makeLoadingBar({ defaultValue: 30 }).api().value).toBe(30)
  })
})

describe('loadingBarMachine 爬升', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  // 每一步的幅度都拿"剩余量的比例区间"卡：真随机下步与步之间不单调，
  // 但"按剩余量取步长"这条规则每一步都成立。固定步长的实现在这里当场露馅。
  function expectStepWithinRatio(from: number, to: number): void {
    const remaining = LOADING_BAR_CEILING - from
    // 两位小数的舍入余量
    expect(to - from).toBeGreaterThanOrEqual(remaining * LOADING_BAR_STEP_MIN_RATIO - 0.01)
    expect(to - from).toBeLessThanOrEqual(remaining * LOADING_BAR_STEP_MAX_RATIO + 0.01)
  }

  it('按节拍往前爬：每一步的幅度都落在剩余量的比例区间内', () => {
    const bar = makeLoadingBar({ loading: true, trickleSpeed: 100 })
    const start = bar.api().value

    vi.advanceTimersByTime(99)
    expect(bar.api().value).toBe(start)

    vi.advanceTimersByTime(1)
    const first = bar.api().value
    expect(first).toBeGreaterThan(start)
    expectStepWithinRatio(start, first)

    vi.advanceTimersByTime(100)
    const second = bar.api().value
    expect(second).toBeGreaterThan(first)
    expectStepWithinRatio(first, second)
  })

  it('爬到高位之后一整拍也只挪得动一丁点：剩得越少走得越慢', () => {
    const bar = makeLoadingBar({ loading: true, trickleSpeed: 10 })
    vi.advanceTimersByTime(10 * 80)
    const high = bar.api().value
    expect(high).toBeGreaterThan(90)

    vi.advanceTimersByTime(10)
    expectStepWithinRatio(high, bar.api().value)
    expect(bar.api().value - high).toBeLessThan(1)
  })

  it('一拍只报一次值：重入 loading 会把保底动作再跑一遍，它必须是幂等的', () => {
    // 每拍先 advanceValue 再重跑进入动作 primeValue。primeValue 取 max，
    // 写回同一个数不该惊动 onValueChange——否则宿主每拍会收到两条自相矛盾的进度
    const onValueChange = vi.fn<(d: LoadingBarValueChangeDetails) => void>()
    const bar = makeLoadingBar({ loading: true, trickleSpeed: 100, onValueChange })
    onValueChange.mockClear()

    vi.advanceTimersByTime(300)
    expect(onValueChange).toHaveBeenCalledTimes(3)
    // 报出去的每一个数都得是递增的，且与当前显示的宽度对得上
    const reported = onValueChange.mock.calls.map(([d]) => d.value)
    expect(reported).toEqual([...reported].sort((a, b) => a - b))
    expect(reported.at(-1)).toBe(bar.api().value)
  })

  it('爬多久都到不了 100，也越不过上限', () => {
    const bar = makeLoadingBar({ loading: true, trickleSpeed: 10 })
    vi.advanceTimersByTime(10 * 2000)
    expect(bar.api().value).toBeLessThanOrEqual(LOADING_BAR_CEILING)
    expect(bar.api().value).toBeLessThan(100)
    // 还在 loading：爬到头不等于事情办完
    expect(bar.state()).toBe('loading')
  })

  it('trickle=false：停在起步值等宿主收尾，不起计时器', () => {
    const bar = makeLoadingBar({ loading: true, trickle: false })
    vi.advanceTimersByTime(60_000)
    expect(bar.api().value).toBe(LOADING_BAR_MINIMUM)
  })

  it('trickleSpeed<=0 等同于关掉爬升', () => {
    const bar = makeLoadingBar({ loading: true, trickleSpeed: 0 })
    vi.advanceTimersByTime(60_000)
    expect(bar.api().value).toBe(LOADING_BAR_MINIMUM)
  })

  it('运行中关掉 trickle：当场停住，不再往前挪', () => {
    const bar = makeLoadingBar({ loading: true, trickleSpeed: 100 })
    vi.advanceTimersByTime(100)
    const frozen = bar.api().value

    bar.setProps({ trickle: false })
    vi.advanceTimersByTime(60_000)
    expect(bar.api().value).toBe(frozen)
  })

  it('运行中改节拍：新节拍当场生效，不等旧计时器跑完', () => {
    const bar = makeLoadingBar({ loading: true, trickleSpeed: 10_000 })
    const start = bar.api().value

    bar.setProps({ trickleSpeed: 100 })
    vi.advanceTimersByTime(99)
    expect(bar.api().value).toBe(start)
    vi.advanceTimersByTime(1)
    expect(bar.api().value).toBeGreaterThan(start)
  })
})

describe('loadingBarMachine 收尾', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('loading 翻 false：先冲到 100，走完淡出窗口才归零收起', () => {
    const bar = makeLoadingBar({ loading: true, trickleSpeed: 100, fadeDuration: 300 })
    vi.advanceTimersByTime(100)

    bar.setProps({ loading: false })
    expect(bar.state()).toBe('finishing')
    expect(bar.api().value).toBe(100)
    // 淡出期间仍露面：早一步收起，那段淡出动画根本没机会跑
    expect(bar.api().visible).toBe(true)

    vi.advanceTimersByTime(299)
    expect(bar.state()).toBe('finishing')
    expect(bar.api().value).toBe(100)

    vi.advanceTimersByTime(1)
    expect(bar.state()).toBe('idle')
    expect(bar.api().value).toBe(0)
    expect(bar.api().visible).toBe(false)
  })

  it('收尾途中的值变化按顺序报出去：先 100 后 0', () => {
    const onValueChange = vi.fn<(d: LoadingBarValueChangeDetails) => void>()
    const bar = makeLoadingBar({ loading: true, trickle: false, fadeDuration: 200, onValueChange })
    onValueChange.mockClear()

    bar.setProps({ loading: false })
    vi.advanceTimersByTime(200)
    expect(onValueChange.mock.calls.map(([d]) => d.value)).toEqual([100, 0])
  })

  it('淡出途中又开始加载：从起步值重来，不从满格接着走', () => {
    const bar = makeLoadingBar({ loading: true, trickle: false, fadeDuration: 500 })
    bar.setProps({ loading: false })
    expect(bar.api().value).toBe(100)

    bar.setProps({ loading: true })
    expect(bar.state()).toBe('loading')
    expect(bar.api().value).toBe(LOADING_BAR_MINIMUM)

    // 上一轮的淡出计时器已随状态退出被拆掉，不会隔一会儿把跑着的条子收走
    vi.advanceTimersByTime(60_000)
    expect(bar.state()).toBe('loading')
  })

  it('中途重开保留已有进度：进度条绝不往回缩', () => {
    const bar = makeLoadingBar({ loading: true, trickleSpeed: 100, minimum: 5 })
    vi.advanceTimersByTime(500)
    const climbed = bar.api().value
    expect(climbed).toBeGreaterThan(5)

    // 再来一次 LOADING.START（宿主重复置真不会触发 watch，直接送事件）
    bar.service.send({ type: 'LOADING.START' })
    expect(bar.api().value).toBe(climbed)
  })

  it('idle 下 loading 再翻一次 false 是空操作：不会凭空冒出一条冲刺', () => {
    const onValueChange = vi.fn<(d: LoadingBarValueChangeDetails) => void>()
    const bar = makeLoadingBar({ loading: true, trickle: false, onValueChange })
    bar.setProps({ loading: false })
    vi.advanceTimersByTime(1000)
    expect(bar.state()).toBe('idle')
    onValueChange.mockClear()

    bar.service.send({ type: 'LOADING.END' })
    expect(bar.state()).toBe('idle')
    expect(onValueChange).not.toHaveBeenCalled()
  })
})

describe('loadingBarMachine 确定进度', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('给了 value 就照着显示：爬升整个让位，值一动不动', () => {
    const bar = makeLoadingBar({ loading: true, value: 42, trickleSpeed: 10 })
    expect(bar.api().value).toBe(42)
    expect(bar.api().indeterminate).toBe(false)
    vi.advanceTimersByTime(60_000)
    expect(bar.api().value).toBe(42)
  })

  it('确定进度下机器一个字都不写：起步、冲刺、归零全部让位给宿主', () => {
    const onValueChange = vi.fn<(d: LoadingBarValueChangeDetails) => void>()
    const bar = makeLoadingBar({ value: 42, fadeDuration: 100, onValueChange })

    bar.setProps({ loading: true })
    expect(bar.state()).toBe('loading')
    bar.setProps({ loading: false })
    // 状态该走的还是要走（淡出照跑），只是值不归它管
    expect(bar.state()).toBe('finishing')
    vi.advanceTimersByTime(100)
    expect(bar.state()).toBe('idle')

    expect(onValueChange).not.toHaveBeenCalled()
    expect(bar.api().value).toBe(42)
  })

  it('宿主写回 value 即刻反映；值越界照样夹住', () => {
    const bar = makeLoadingBar({ loading: true, value: 10 })
    bar.setProps({ value: 80 })
    expect(bar.api().value).toBe(80)
    bar.setProps({ value: 500 })
    expect(bar.api().value).toBe(100)
  })

  it('运行中撤掉 value（确定转不确定）：爬升重新支起来，不会就此冻住', () => {
    const bar = makeLoadingBar({ loading: true, value: 40, trickleSpeed: 100 })
    vi.advanceTimersByTime(1000)
    expect(bar.api().value).toBe(40)

    bar.setProps({ value: undefined })
    expect(bar.api().indeterminate).toBe(true)
    vi.advanceTimersByTime(100)
    expect(bar.api().value).toBeGreaterThan(0)
  })
})

// ── connect 产出 ────────────────────────────────────────────────────

describe('connectLoadingBar', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('root 是 progressbar，带名字与值域两端', () => {
    const root = makeLoadingBar({ loading: true, value: 30 }).root()
    expect(root.role).toBe('progressbar')
    expect(root['aria-label']).toBe('Loading')
    expect(root['aria-valuemin']).toBe('0')
    expect(root['aria-valuemax']).toBe('100')
    expect(root['data-scope']).toBe('loading-bar')
    expect(root['data-part']).toBe('root')
  })

  it('确定进度报 aria-valuenow，不确定进度则整个省略', () => {
    expect(makeLoadingBar({ loading: true, value: 30 }).root()['aria-valuenow']).toBe('30')

    const guessed = makeLoadingBar({ loading: true }).root()
    // 省略才是"进度未知"的表达；报一个编出来的数等于对读屏撒谎
    expect(guessed['aria-valuenow']).toBeUndefined()
    expect(guessed['data-indeterminate']).toBe('')
  })

  it('idle 时 root 带 hidden，露面时摘掉', () => {
    const bar = makeLoadingBar({ trickle: false, fadeDuration: 100 })
    expect(bar.root().hidden).toBe(true)

    bar.setProps({ loading: true })
    expect(bar.root().hidden).toBeUndefined()
    expect(bar.root()['data-state']).toBe('loading')

    bar.setProps({ loading: false })
    expect(bar.root()['data-state']).toBe('finishing')
    expect(bar.root().hidden).toBeUndefined()

    vi.advanceTimersByTime(100)
    expect(bar.root().hidden).toBe(true)
  })

  it('厚度写进 root 的内联样式：数字按像素，字符串原样，缺省有兜底', () => {
    expect((makeLoadingBar().root().style as Dict).blockSize).toBe(LOADING_BAR_HEIGHT)
    expect((makeLoadingBar({ height: 6 }).root().style as Dict).blockSize).toBe('6px')
    expect((makeLoadingBar({ height: '0.5rem' }).root().style as Dict).blockSize).toBe('0.5rem')
  })

  it('range 的宽度是百分比；颜色给了才写，没给写空串把上一帧清掉', () => {
    const plain = makeLoadingBar({ loading: true, value: 37.5 }).range()
    expect((plain.style as Dict).inlineSize).toBe('37.5%')
    expect((plain.style as Dict).background).toBe('')

    const painted = makeLoadingBar({ loading: true, value: 10, color: 'tomato' }).range()
    expect((painted.style as Dict).background).toBe('tomato')
  })

  it('三个角色节点的 data-state 同步推进', () => {
    const bar = makeLoadingBar({ loading: true, trickle: false })
    const api = bar.api()
    expect((api.getRootProps() as Dict)['data-state']).toBe('loading')
    expect((api.getTrackProps() as Dict)['data-state']).toBe('loading')
    expect((api.getRangeProps() as Dict)['data-state']).toBe('loading')
    expect((api.getTrackProps() as Dict)['data-part']).toBe('track')
    expect((api.getRangeProps() as Dict)['data-part']).toBe('range')
  })

  it('translations.root 换掉读屏念的名字', () => {
    const root = makeLoadingBar({ loading: true, translations: { root: '正在加载' } }).root()
    expect(root['aria-label']).toBe('正在加载')
  })
})
