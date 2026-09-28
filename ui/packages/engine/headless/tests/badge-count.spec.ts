// @vitest-environment jsdom
// 角标说的是「有事情发生了」：计数、上限截断、0 值收起、小红点都归它算，
// 不该由每个宿主各拼一遍——上限口径散在各处迟早不一致。
// 这些属性住在 indicator 那一层：root 只是锚点，被标记的东西放在它里面。
import type { BadgeProps } from '../src/badge'
import { createService, normalizeProps } from '@xihan-ui/core'
import { createVanillaRuntime } from '@xihan-ui/core/vanilla'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { badgeMachine, connectBadge } from '../src/badge'

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
