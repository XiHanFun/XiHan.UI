// @vitest-environment jsdom
// 角标说的是「有事情发生了」：计数、上限截断、0 值收起、小红点都归它算，
// 不该由每个宿主各拼一遍——上限口径散在各处迟早不一致。
// 这些属性住在 indicator 那一层：root 只是锚点，被标记的东西放在它里面。
import type { BadgeProps } from '../src/badge'
import { createService, normalizeProps } from '@xihan-ui/core'
import { createVanillaRuntime } from '@xihan-ui/core/vanilla'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { badgeMachine, connectBadge } from '../src/badge'
import { badgeGlyphs } from '../src/badge/badge.machine'

type Dict = Record<string, unknown>

function makeBadge(initial: BadgeProps = {}) {
  const runtime = createVanillaRuntime()
  const props = runtime.signal<BadgeProps>(initial)
  const service = createService(badgeMachine, { props: () => props.get(), runtime })
  runtime.start()
  return {
    api: () => connectBadge(service, normalizeProps),
    indicator: () => connectBadge(service, normalizeProps).getIndicatorProps() as Dict,
    setProps: (next: BadgeProps) => props.set({ ...props.get(), ...next }),
  }
}

const api = (props: BadgeProps) => makeBadge(props).api()
const indicatorOf = (props: BadgeProps) => makeBadge(props).indicator()

describe('计数与截断', () => {
  it('给了 count 就自己出数字', () => {
    expect(api({ count: 5 }).text).toBe('5')
  })

  it('超过上限写成「上限+」，默认上限 99', () => {
    expect(api({ count: 100 }).text).toBe('99+')
    expect(api({ count: 99 }).text).toBe('99')
  })

  it('上限可以自己定', () => {
    expect(api({ count: 20, max: 9 }).text).toBe('9+')
  })

  it('不给 count 就不出文字，交给插槽', () => {
    expect(api({}).text).toBe('')
  })
})

describe('0 值收起', () => {
  it('没有未读就整枚收起', () => {
    expect(api({ count: 0 }).visible).toBe(false)
    expect(indicatorOf({ count: 0 }).hidden).toBe(true)
  })

  it('显式要求显示 0 时照常出现', () => {
    expect(api({ count: 0, showZero: true }).visible).toBe(true)
    expect(indicatorOf({ count: 0, showZero: true }).hidden).toBeUndefined()
  })

  it('不给 count 的徽标不受这条影响', () => {
    expect(api({}).visible).toBe(true)
  })
})

describe('小红点', () => {
  it('只表示「有」，不出数字', () => {
    expect(api({ dot: true, count: 5 }).text).toBe('')
    expect(indicatorOf({ dot: true })['data-dot']).toBe('')
  })

  it('计数为 0 时红点同样收起——没有新的就不该有点', () => {
    expect(api({ dot: true, count: 0 }).visible).toBe(false)
  })
})

describe('读屏', () => {
  it('给了整句就用整句，并报成状态', () => {
    const root = indicatorOf({ count: 3, label: '3 条未读' })
    expect(root['aria-label']).toBe('3 条未读')
    expect(root.role).toBe('status')
  })

  it('没给就不硬造 role：光念数字也好过念错角色', () => {
    expect(indicatorOf({ count: 3 }).role).toBeUndefined()
  })
})

describe('圆点呼吸', () => {
  it('圆点档写了 pulse 才投影 data-pulse', () => {
    expect(indicatorOf({ dot: true, pulse: true })['data-pulse']).toBe('')
    expect(indicatorOf({ dot: true })['data-pulse']).toBeUndefined()
  })

  it('数字角标不呼吸：明暗起伏会压低数字的对比度', () => {
    expect(indicatorOf({ count: 3, pulse: true })['data-pulse']).toBeUndefined()
  })
})

describe('出现与消失', () => {
  const settle = (): Promise<void> => new Promise(resolve => setTimeout(resolve, 0))
  const realGetComputedStyle = window.getComputedStyle.bind(window)

  afterEach(() => {
    vi.restoreAllMocks()
    document.body.innerHTML = ''
  })

  /** 按 connect 给的 id 挂一枚角标，身上有一段在播的退场动画；finish() 模拟它播完。 */
  function stubExit(badge: ReturnType<typeof makeBadge>): { finish: () => void } {
    const node = document.createElement('span')
    node.id = String(badge.indicator().id)
    document.body.append(node)
    vi.spyOn(window, 'getComputedStyle').mockImplementation(((el: Element, pseudo?: string | null) => {
      if (el === node)
        return { animationName: 'xh-pop-out', animationDuration: '0.12s', animationDelay: '0s', animationTimingFunction: 'linear', opacity: '1', display: 'inline-flex' } as CSSStyleDeclaration
      return realGetComputedStyle(el as HTMLElement, pseudo)
    }) as typeof window.getComputedStyle)
    let finish!: () => void
    const finished = new Promise<Animation>((resolve) => {
      finish = () => resolve({} as Animation)
    })
    Object.defineProperty(node, 'getAnimations', {
      configurable: true,
      value: () => [{ animationName: 'xh-pop-out', playState: 'running', effect: { getComputedTiming: () => ({ endTime: 120 }) }, finished }],
    })
    return { finish }
  }

  it('首帧就在的角标投影 data-instant 直接呈现；显隐换过之后才播', () => {
    const badge = makeBadge({ count: 3 })
    expect(badge.indicator()['data-state']).toBe('visible')
    expect(badge.indicator()['data-instant']).toBe('')
    badge.setProps({ count: 0 })
    expect(badge.indicator()['data-instant']).toBeUndefined()
  })

  it('清零时先播完退场才写 hidden，退场途中照清零前的数字写', async () => {
    const badge = makeBadge({ count: 3 })
    const exit = stubExit(badge)
    badge.setProps({ count: 0 })
    expect(badge.indicator()['data-state']).toBe('hidden')
    expect(badge.indicator().hidden).toBeUndefined()
    expect(badge.api().text).toBe('3')

    await settle()
    expect(badge.indicator().hidden).toBeUndefined()
    exit.finish()
    await settle()
    expect(badge.indicator().hidden).toBe(true)

    badge.setProps({ count: 5 })
    expect(badge.indicator().hidden).toBeUndefined()
    expect(badge.indicator()['data-state']).toBe('visible')
    expect(badge.api().text).toBe('5')
  })

  it('初始即清零：直接 hidden，不留退场', () => {
    expect(indicatorOf({ count: 0 }).hidden).toBe(true)
  })
})

describe('逐位排出', () => {
  it('不在换数时各位原地写，键只带位次；超过上限时「+」单独一位', () => {
    expect(badgeGlyphs('12', null)).toEqual({ glyphs: [{ key: 'n1', char: '1' }, { key: 'n0', char: '2' }], suffix: null })
    expect(badgeGlyphs('99+', null).suffix).toEqual({ key: 'suffix', char: '+' })
  })

  it('按个位对齐比较：变大多出的高位从无到有，个位换字', () => {
    expect(badgeGlyphs('10', { from: '9', up: true, serial: 1 }).glyphs).toEqual([
      { key: 'n1:1', char: '1', change: 'enter' },
      { key: 'n0:1', char: '0', from: '9', change: 'swap' },
    ])
  })

  it('变小少掉的高位从有到无，仍写原来的字等它滚走', () => {
    expect(badgeGlyphs('9', { from: '10', up: false, serial: 2 }).glyphs).toEqual([
      { key: 'n1:2', char: '1', change: 'leave' },
      { key: 'n0:2', char: '9', from: '0', change: 'swap' },
    ])
  })

  it('只有「+」进出时数字原地不动', () => {
    const next = badgeGlyphs('99+', { from: '99', up: true, serial: 3 })
    expect(next.glyphs.map(glyph => glyph.key)).toEqual(['n1', 'n0'])
    expect(next.suffix).toEqual({ key: 'suffix:3', char: '+', change: 'enter' })
    expect(badgeGlyphs('99', { from: '99+', up: false, serial: 4 }).suffix).toEqual({ key: 'suffix:4', char: '+', change: 'leave' })
  })
})

describe('换数滚动', () => {
  const settle = (): Promise<void> => new Promise(resolve => setTimeout(resolve, 0))

  afterEach(() => {
    document.body.innerHTML = ''
  })

  /** 按 connect 给的 id 挂一枚能播动画的角标；各位身上的滚动在 finish() 之前一直在播。 */
  function stubRolling(badge: ReturnType<typeof makeBadge>): { node: HTMLElement, finish: () => void } {
    const node = document.createElement('span')
    node.id = String(badge.indicator().id)
    document.body.append(node)
    let finish!: () => void
    const finished = new Promise<Animation>((resolve) => {
      finish = () => resolve({} as Animation)
    })
    Object.defineProperty(node, 'getAnimations', { configurable: true, value: () => [] })
    // 宿主按 connect 的输出把在动的位写进角标：这里只放一位，身上挂一段在播的滚动
    const glyph = document.createElement('span')
    glyph.dataset.roll = 'up'
    Object.defineProperty(glyph, 'getAnimations', { configurable: true, value: () => [{ finished }] })
    node.append(glyph)
    return { node, finish }
  }

  it('宿主播不了动画（jsdom、SSR）时直接换字，不进滚动', () => {
    const badge = makeBadge({ count: 3 })
    badge.setProps({ count: 4 })
    expect(badge.indicator()['data-animating']).toBeUndefined()
    expect(badge.api().glyphs).toEqual([{ key: 'n0', char: '4' }])
  })

  it('一直露着时换数：变了的位按方向滚，播完各位回到不动的写法', async () => {
    const badge = makeBadge({ count: 9 })
    const rolling = stubRolling(badge)
    badge.setProps({ count: 10 })
    expect(badge.indicator()['data-animating']).toBe('')
    const api = badge.api()
    expect(api.glyphs.map(glyph => glyph.change)).toEqual(['enter', 'swap'])
    expect(api.getGlyphProps(api.glyphs[1]!)).toMatchObject({ 'data-presence': undefined, 'data-roll': 'up', 'data-from': '9' })

    await settle()
    expect(badge.indicator()['data-animating']).toBe('')
    rolling.finish()
    await settle()
    expect(badge.indicator()['data-animating']).toBeUndefined()
    expect(badge.api().glyphs).toEqual([{ key: 'n1', char: '1' }, { key: 'n0', char: '0' }])
  })

  it('变小往下滚，少掉的那一位不再念', () => {
    const badge = makeBadge({ count: 10 })
    stubRolling(badge)
    badge.setProps({ count: 9 })
    const api = badge.api()
    expect(api.getGlyphProps(api.glyphs[0]!)).toMatchObject({ 'data-presence': 'leave', 'data-roll': 'down', 'aria-hidden': true })
  })

  it('接连换数时每一轮换一批键；上一轮迟到的「播完」不作数', async () => {
    const badge = makeBadge({ count: 3 })
    const first = stubRolling(badge)
    badge.setProps({ count: 4 })
    expect(badge.api().glyphs[0]!.key).toBe('n0:1')
    badge.setProps({ count: 5 })
    expect(badge.api().glyphs[0]).toEqual({ key: 'n0:2', char: '5', from: '4', change: 'swap' })
    first.finish()
    await settle()
    expect(badge.indicator()['data-animating']).toBeUndefined()
  })

  it('减弱动效下直接换字', () => {
    document.documentElement.dataset.motion = 'reduce'
    try {
      const badge = makeBadge({ count: 3 })
      stubRolling(badge)
      badge.setProps({ count: 4 })
      expect(badge.indicator()['data-animating']).toBeUndefined()
    }
    finally {
      delete document.documentElement.dataset.motion
    }
  })

  it('出现与清零不滚：交给角标自己的进退场', () => {
    const badge = makeBadge({ count: 0 })
    stubRolling(badge)
    badge.setProps({ count: 2 })
    expect(badge.indicator()['data-animating']).toBeUndefined()
    badge.setProps({ count: 0 })
    expect(badge.indicator()['data-animating']).toBeUndefined()
  })
})
