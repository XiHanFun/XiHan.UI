import type { SpringPhysical } from '../src/spring'
import { describe, expect, it } from 'vitest'
import { createSpring, springFromPerceptual, springPresets, springToLinearEasing } from '../src/spring'

/**
 * 独立于实现的对照：对 m·x″ + c·x′ + k·x = 0 做四阶龙格-库塔积分。
 * x 是相对终点的位移，起点 −1，终点 0；归一化位移即 1 + x。
 */
function integrate(physical: SpringPhysical, velocity: number, until: number, step = 1e-4): number[] {
  const { stiffness: k, damping: c, mass: m } = physical
  let x = -1
  let v = velocity
  const out: number[] = [1 + x]
  const steps = Math.round(until / step)
  const accel = (px: number, pv: number): number => (-k * px - c * pv) / m

  for (let i = 0; i < steps; i++) {
    const k1x = v
    const k1v = accel(x, v)
    const k2x = v + (step / 2) * k1v
    const k2v = accel(x + (step / 2) * k1x, v + (step / 2) * k1v)
    const k3x = v + (step / 2) * k2v
    const k3v = accel(x + (step / 2) * k2x, v + (step / 2) * k2v)
    const k4x = v + step * k3v
    const k4v = accel(x + step * k3x, v + step * k3v)
    x += (step / 6) * (k1x + 2 * k2x + 2 * k3x + k4x)
    v += (step / 6) * (k1v + 2 * k2v + 2 * k3v + k4v)
    out.push(1 + x)
  }
  return out
}

const BRANCHES: Array<[string, SpringPhysical, number]> = [
  ['欠阻尼', springPresets.bouncy, 0],
  ['接近临界', springPresets.gentle, 0],
  ['临界阻尼', springFromPerceptual({ duration: 0.5, bounce: 0 }), 0],
  ['过阻尼', springFromPerceptual({ duration: 0.5, bounce: -0.5 }), 0],
  ['带初速度', springPresets.snappy, 4],
  ['逆向初速度', springPresets.smooth, -3],
]

describe('解析解与数值积分一致', () => {
  for (const [label, physical, velocity] of BRANCHES) {
    it(label, () => {
      const solver = createSpring(physical, velocity)
      const until = (solver.durationMs / 1000) * 0.8
      const step = 1e-4
      const reference = integrate(physical, velocity, until, step)

      for (let i = 0; i < reference.length; i += Math.ceil(reference.length / 200))
        expect(solver(i * step)).toBeCloseTo(reference[i]!, 6)
    })
  }
})

describe('阻尼比分支', () => {
  it('bounce 为正得到欠阻尼', () => {
    expect(createSpring({ duration: 0.5, bounce: 0.4 }).dampingRatio).toBeCloseTo(0.6, 10)
  })

  it('bounce 为零得到临界阻尼', () => {
    expect(createSpring({ duration: 0.5, bounce: 0 }).dampingRatio).toBe(1)
  })

  it('bounce 为负得到过阻尼', () => {
    expect(createSpring({ duration: 0.5, bounce: -0.5 }).dampingRatio).toBeCloseTo(2, 10)
  })

  it('预设各自的阻尼比都在合理区间', () => {
    for (const [name, physical] of Object.entries(springPresets)) {
      const ratio = createSpring(physical).dampingRatio
      expect(ratio, name).toBeGreaterThan(0)
      expect(ratio, name).toBeLessThan(1.5)
    }
  })
})

describe('端点与沉降', () => {
  it('起点严格为 0，越界与非有限时间也是 0', () => {
    const solver = createSpring('smooth')
    expect(solver(0)).toBe(0)
    expect(solver(-1)).toBe(0)
    expect(solver(Number.NaN)).toBe(0)
  })

  it('沉降之后严格为 1', () => {
    const solver = createSpring('bouncy')
    expect(solver(solver.durationMs / 1000)).toBe(1)
    expect(solver(999)).toBe(1)
  })

  it('沉降时刻之前残差已小于静止阈值', () => {
    for (const [, physical, velocity] of BRANCHES) {
      const solver = createSpring(physical, velocity)
      const seconds = solver.durationMs / 1000
      expect(Math.abs(solver(seconds * 0.999) - 1)).toBeLessThan(2e-3)
    }
  })

  it('沉降时长随阻尼比增大而变长', () => {
    const light = createSpring({ duration: 0.5, bounce: 0 }).durationMs
    const heavy = createSpring({ duration: 0.5, bounce: -0.6 }).durationMs
    expect(heavy).toBeGreaterThan(light)
  })

  it('全程有限，不产出 NaN', () => {
    for (const [label, physical, velocity] of BRANCHES) {
      const solver = createSpring(physical, velocity)
      for (let i = 0; i <= 100; i++)
        expect(Number.isFinite(solver((solver.durationMs / 1000) * (i / 100))), label).toBe(true)
    }
  })
})

describe('过冲', () => {
  it('欠阻尼过冲，过阻尼不过冲', () => {
    expect(createSpring('bouncy').overshoot).toBeGreaterThan(0.05)
    expect(createSpring({ duration: 0.5, bounce: -0.5 }).overshoot).toBe(0)
  })

  it('临界阻尼且无初速度时全程单调不过冲', () => {
    const solver = createSpring({ duration: 0.4, bounce: 0 })
    expect(solver.overshoot).toBe(0)
    let previous = -1
    for (let i = 0; i <= 200; i++) {
      const value = solver((solver.durationMs / 1000) * (i / 200))
      expect(value).toBeGreaterThanOrEqual(previous)
      previous = value
    }
  })

  it('初速度越大过冲越多', () => {
    const slow = createSpring('snappy', 0).overshoot
    const fast = createSpring('snappy', 8).overshoot
    expect(fast).toBeGreaterThan(slow)
  })
})

describe('退化输入', () => {
  it('刚度为零视为一步到位', () => {
    const solver = createSpring({ stiffness: 0, damping: 10, mass: 1 })
    expect(solver.durationMs).toBe(0)
    expect(solver(0)).toBe(0)
    expect(solver(0.1)).toBe(1)
  })

  it('非有限参数不产出 NaN', () => {
    const solver = createSpring({ stiffness: Number.NaN, damping: Number.NaN, mass: 0 })
    expect(Number.isFinite(solver(0.1))).toBe(true)
  })

  it('认不出的预设名退回 smooth', () => {
    expect(createSpring('wobbly' as 'smooth').durationMs).toBe(createSpring('smooth').durationMs)
  })
})

describe('烘焙成 linear()', () => {
  it('产出 linear() 串，首尾为 0 与 1', () => {
    const text = springToLinearEasing(createSpring('smooth'), 16)
    expect(text.startsWith('linear(0, ')).toBe(true)
    expect(text.endsWith(', 1)')).toBe(true)
  })

  it('欠阻尼的烘焙串里出现大于 1 的采样点', () => {
    const values = springToLinearEasing(createSpring('bouncy'), 48)
      .slice('linear('.length, -1)
      .split(',')
      .map(part => Number.parseFloat(part))
    expect(values.some(value => value > 1)).toBe(true)
  })

  it('烘焙串逐点贴合求解器', () => {
    const solver = createSpring('snappy')
    const seconds = solver.durationMs / 1000
    const values = springToLinearEasing(solver, 20)
      .slice('linear('.length, -1)
      .split(',')
      .map(part => Number.parseFloat(part))
    values.forEach((value, index) => {
      expect(value).toBeCloseTo(solver((index / (values.length - 1)) * seconds), 3)
    })
  })
})
