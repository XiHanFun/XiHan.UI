// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vitest'
import { easing, resolveEasing } from '../src/easing'
import { readMotion } from '../src/read'
import { resolveMotionPreference, setMotionOverride } from '../src/reduced-motion'
import { motionDurations } from '../src/semantic'

function mount(attrs: Record<string, string> = {}): { host: HTMLElement, el: HTMLElement } {
  const host = document.createElement('div')
  for (const [name, value] of Object.entries(attrs))
    host.setAttribute(name, value)
  const el = document.createElement('div')
  host.append(el)
  document.body.append(host)
  return { host, el }
}

afterEach(() => {
  setMotionOverride(null)
  document.body.innerHTML = ''
})

describe('readMotion', () => {
  it('读元素计算样式里的时长，ms 与 s 两种写法都认', () => {
    const { el } = mount()
    el.style.setProperty('--xh-motion-duration-move', '250ms')
    el.style.setProperty('--xh-motion-duration-slide', '0.4s')
    const motion = readMotion(el)
    expect(motion.duration('move')).toBe(250)
    expect(motion.duration('slide')).toBe(400)
  })

  it('读不到令牌时取与令牌同值的常量', () => {
    const { el } = mount()
    const motion = readMotion(el)
    expect(motion.duration('expand')).toBe(motionDurations.expand)
    expect(motion.duration('collapse')).toBe(motionDurations.collapse)
  })

  it('读不到令牌且处在减弱动效作用域时取减弱档', () => {
    const { el } = mount({ 'data-motion': 'reduce' })
    expect(readMotion(el).duration('move')).toBe(1)
  })

  it('读不到令牌且应用级偏好为减弱时取减弱档', () => {
    setMotionOverride('reduce')
    const { el } = mount()
    expect(readMotion(el).duration('nudge')).toBe(1)
  })

  it('读元素上的曲线；读不到时取语义名对应的曲线', () => {
    const { el } = mount()
    el.style.setProperty('--xh-motion-ease-continuous', 'cubic-bezier(0, 0, 1, 1)')
    const motion = readMotion(el)
    expect(motion.easing('continuous')(0.3)).toBeCloseTo(0.3, 5)
    expect(motion.easing('enter-strong')(0.3)).toBeCloseTo(resolveEasing(easing.outStrong)(0.3), 10)
  })
})

describe('resolveMotionPreference 传入元素', () => {
  it('最近祖先的 data-motion 优先于应用级偏好', () => {
    setMotionOverride('no-preference')
    const { el } = mount({ 'data-motion': 'reduce' })
    expect(resolveMotionPreference(el)).toBe('reduce')
  })

  it('default 作用域在应用级偏好要求减弱时仍给出完整动效', () => {
    setMotionOverride('reduce')
    const { el } = mount({ 'data-motion': 'default' })
    expect(resolveMotionPreference(el)).toBe('no-preference')
  })

  it('嵌套作用域取最近的一层', () => {
    const outer = document.createElement('div')
    outer.setAttribute('data-motion', 'reduce')
    const inner = document.createElement('div')
    inner.setAttribute('data-motion', 'default')
    const el = document.createElement('span')
    inner.append(el)
    outer.append(inner)
    document.body.append(outer)
    expect(resolveMotionPreference(el)).toBe('no-preference')
  })

  it('没有 data-motion 时取应用级偏好', () => {
    setMotionOverride('reduce')
    const { el } = mount()
    expect(resolveMotionPreference(el)).toBe('reduce')
  })

  it('传入窗口时不看 DOM', () => {
    mount({ 'data-motion': 'reduce' })
    setMotionOverride('no-preference')
    expect(resolveMotionPreference(window)).toBe('no-preference')
  })
})
