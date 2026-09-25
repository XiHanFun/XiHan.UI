import { describe, expect, it } from 'vitest'
import { springPresets } from '../src/spring'
import { createSpringValue, solveSpring } from '../src/spring-value'

/** 手动推进时间与帧的宿主窗口，以及挂在它上面的元素。 */
function createHost(motion?: 'reduce' | 'default') {
  const queue = new Map<number, () => void>()
  let nextId = 1
  let now = 0
  const win = {
    requestAnimationFrame: (fn: () => void) => {
      const id = nextId++
      queue.set(id, fn)
      return id
    },
    cancelAnimationFrame: (id: number) => {
      queue.delete(id)
    },
    performance: { now: () => now },
    matchMedia: () => ({ matches: false }),
  } as unknown as Window
  const scope = motion ? { getAttribute: () => motion } : null
  const element = {
    nodeType: 1,
    closest: () => scope,
    ownerDocument: { defaultView: win },
  } as unknown as Element
  return {
    element,
    /** 时间前进 ms 毫秒并跑一帧。 */
    advance(ms: number) {
      now += ms
      const entries = [...queue.values()]
      queue.clear()
      for (const fn of entries) fn()
    },
    pending: () => queue.size,
  }
}

function track(host: ReturnType<typeof createHost>, spring: Parameters<typeof createSpringValue>[0]['spring'], value = 0) {
  const frames: Array<[number, number]> = []
  const spring$ = createSpringValue({ spring, value, target: host.element, onUpdate: (v, vel) => frames.push([v, vel]) })
  return { spring: spring$, frames }
}

describe('solveSpring', () => {
  const cases = [
    ['欠阻尼', springPresets.toggle],
    ['临界阻尼', { stiffness: 100, damping: 20, mass: 1 }],
    ['过阻尼', { stiffness: 100, damping: 24, mass: 1 }],
  ] as const

  it.each(cases)('%s：起点的位移与速度等于给定的初始条件', (_, physical) => {
    const segment = solveSpring(physical, -120, 800)
    expect(segment.displacement(0)).toBeCloseTo(-120, 9)
    expect(segment.velocity(0)).toBeCloseTo(800, 6)
  })

  it.each(cases)('%s：速度是位移的导数', (_, physical) => {
    const segment = solveSpring(physical, -120, 800)
    const t = 0.05
    const h = 1e-6
    const numeric = (segment.displacement(t + h) - segment.displacement(t - h)) / (2 * h)
    expect(segment.velocity(t)).toBeCloseTo(numeric, 3)
  })

  it.each(cases)('%s：两秒后回到目标', (_, physical) => {
    const segment = solveSpring(physical, -120, 800)
    expect(Math.abs(segment.displacement(2))).toBeLessThan(0.01)
  })

  it('standard 档用到的预设超调不超过 3%，liquid 档的切换预设不超过 8%', () => {
    const overshoot = (name: keyof typeof springPresets) => {
      const segment = solveSpring(springPresets[name], -1, 0)
      let peak = 0
      for (let t = 0; t < 2; t += 0.001) peak = Math.max(peak, segment.displacement(t))
      return peak
    }
    expect(overshoot('smooth')).toBeLessThan(0.03)
    expect(overshoot('stiff')).toBeLessThan(0.03)
    expect(overshoot('toggle')).toBeLessThan(0.08)
    expect(overshoot('lead')).toBeLessThan(0.08)
  })
})

describe('createSpringValue', () => {
  it('朝目标运动，落定时写出目标值与零速度并以 rest 结算', async () => {
    const host = createHost()
    const { spring, frames } = track(host, 'smooth')
    const settled = spring.to(100)
    expect(spring.animating).toBe(true)
    for (let i = 0; i < 120; i++) host.advance(16)
    await expect(settled).resolves.toBe('rest')
    expect(frames.at(-1)).toEqual([100, 0])
    expect(spring.animating).toBe(false)
    expect(host.pending()).toBe(0)
  })

  it('中途改目标时位置与速度连续', () => {
    const host = createHost()
    const { spring } = track(host, 'smooth')
    void spring.to(100)
    host.advance(80)
    const before = { value: spring.value, velocity: spring.velocity }
    void spring.to(-50)
    expect(spring.value).toBeCloseTo(before.value, 9)
    expect(spring.velocity).toBeCloseTo(before.velocity, 9)
    host.advance(1)
    // 改向后第一毫秒仍沿原来的方向走：速度被保留，不从静止重新起步
    expect(spring.value).toBeGreaterThan(before.value)
  })

  it('在目标处带着速度松手也会运动：先被速度带离，再回到目标', async () => {
    const host = createHost()
    const { spring } = track(host, 'smooth', 40)
    const settled = spring.to(40, { velocity: 900 })
    host.advance(30)
    expect(spring.value).toBeGreaterThan(40)
    for (let i = 0; i < 120; i++) host.advance(16)
    await expect(settled).resolves.toBe('rest')
    expect(spring.value).toBe(40)
  })

  it('新的 to()、set() 与 stop() 都把上一次结算为 interrupted', async () => {
    const host = createHost()
    const { spring } = track(host, 'smooth')
    const first = spring.to(100)
    const second = spring.to(200)
    await expect(first).resolves.toBe('interrupted')
    host.advance(50)
    spring.set(10)
    await expect(second).resolves.toBe('interrupted')
    expect(spring.value).toBe(10)
    expect(spring.velocity).toBe(0)
    const third = spring.to(80)
    host.advance(50)
    const where = spring.value
    spring.stop()
    await expect(third).resolves.toBe('interrupted')
    expect(spring.value).toBe(where)
    expect(spring.animating).toBe(false)
  })

  it('宿主在减弱动效作用域里时直接落到终态，不排帧', async () => {
    const host = createHost('reduce')
    const { spring, frames } = track(host, 'smooth')
    await expect(spring.to(100, { velocity: 900 })).resolves.toBe('rest')
    expect(frames).toEqual([[100, 0]])
    expect(host.pending()).toBe(0)
  })

  it('非法输入立即报错', () => {
    const host = createHost()
    const make = (overrides: Partial<Parameters<typeof createSpringValue>[0]>) => () =>
      createSpringValue({ spring: 'smooth', value: 0, target: host.element, onUpdate: () => {}, ...overrides })
    expect(make({ spring: 'wobbly' as never })).toThrow(/未知的弹簧预设/)
    expect(make({ spring: { stiffness: 0, damping: 10, mass: 1 } })).toThrow(/大于 0/)
    expect(make({ value: Number.NaN })).toThrow(/有限数值/)
    expect(make({ precision: -1 })).toThrow(/precision/)
    expect(make({ target: { ownerDocument: null } as unknown as Element })).toThrow(/窗口/)
    const spring = make({})()
    expect(() => spring.to(Number.POSITIVE_INFINITY)).toThrow(/有限数值/)
    expect(() => spring.to(1, { velocity: Number.NaN })).toThrow(/有限数值/)
  })
})
