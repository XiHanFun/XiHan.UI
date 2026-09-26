// 手势松手的物理：橡皮筋越拉越沉、趋近尺寸上限且方向随越界；夹取只衰减越出的那段；
// 落点投影顺着速度走；最近吸附点等距取前一个；惯性滑行弹簧是指数衰减、停在投影落点。
import { describe, expect, it } from 'vitest'
import { glideSpring, nearestSnap, projectRelease, rubberBand, rubberClamp } from '../src/gesture'
import { solveSpring } from '../src/spring-value'

describe('rubberBand', () => {
  it('越拉越沉：位移增长越来越慢，趋近尺寸上限', () => {
    const near = rubberBand(10, 60)
    const far = rubberBand(100, 60)
    const farther = rubberBand(10000, 60)
    expect(near).toBeGreaterThan(0)
    expect(near).toBeLessThan(10)
    expect(far).toBeGreaterThan(near)
    expect(farther).toBeLessThan(60)
    expect(far / near).toBeLessThan(10)
  })

  it('方向随越界，零越界与零尺寸不动', () => {
    expect(rubberBand(-30, 60)).toBeCloseTo(-rubberBand(30, 60), 10)
    expect(rubberBand(0, 60)).toBe(0)
    expect(rubberBand(30, 0)).toBe(0)
  })

  it('与越界跟手曲线同一条：拉到尺寸那么远时走出尺寸的 0.55 / 1.55', () => {
    expect(rubberBand(80, 80)).toBeCloseTo(80 * (1 - 1 / 1.55), 10)
  })
})

describe('rubberClamp', () => {
  it('区间内原样，越出的部分按橡皮筋衰减', () => {
    expect(rubberClamp(50, 0, 100, 60)).toBe(50)
    expect(rubberClamp(130, 0, 100, 60)).toBeCloseTo(100 + rubberBand(30, 60), 10)
    expect(rubberClamp(-20, 0, 100, 60)).toBeCloseTo(rubberBand(-20, 60), 10)
  })

  it('上下界写反时按对调处理', () => {
    expect(rubberClamp(-20, 0, -100, 60)).toBe(-20)
    expect(rubberClamp(20, 0, -100, 60)).toBeCloseTo(rubberBand(20, 60), 10)
  })
})

describe('projectRelease / nearestSnap', () => {
  it('落点顺着速度走投影时间', () => {
    expect(projectRelease(10, 1000, 0.06)).toBeCloseTo(70, 10)
    expect(projectRelease(10, -500, 0.2)).toBeCloseTo(-90, 10)
  })

  it('取最近的吸附点，等距取前一个；没有吸附点时原样返回', () => {
    expect(nearestSnap([0, 100, 200], 140)).toBe(100)
    expect(nearestSnap([0, 100, 200], 160)).toBe(200)
    expect(nearestSnap([0, 100], 50)).toBe(0)
    expect(nearestSnap([], 42)).toBe(42)
  })
})

describe('glideSpring', () => {
  it('从松手速度出发、目标取投影落点：位移按指数衰减，起步速度等于松手速度、一路减速不甩过头', () => {
    const tau = 0.3
    const v = 1000
    // 相对目标的起始位移是 −v × τ，起始速度 v
    const motion = solveSpring(glideSpring(tau), -v * tau, v)
    expect(motion.velocity(0)).toBeCloseTo(v, 6)
    for (const t of [0.05, 0.1, 0.3, 0.6, 1]) {
      expect(motion.displacement(t)).toBeCloseTo(-v * tau * Math.exp(-t / tau), 6)
      expect(motion.velocity(t)).toBeLessThan(motion.velocity(t / 2))
      expect(motion.displacement(t)).toBeLessThanOrEqual(0)
    }
  })

  it('临界阻尼：阻尼比恰为 1', () => {
    const { stiffness, damping, mass } = glideSpring(0.3)
    expect(damping / (2 * Math.sqrt(stiffness * mass))).toBeCloseTo(1, 10)
  })
})
