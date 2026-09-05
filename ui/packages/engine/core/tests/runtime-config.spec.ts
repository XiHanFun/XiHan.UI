// @vitest-environment jsdom
import { setMotionOverride } from '@xihan-ui/motion'
import { afterEach, describe, expect, it } from 'vitest'
import { createRuntimeConfig } from '../src/kernel/runtime-config'

afterEach(() => {
  setMotionOverride(null)
})

describe('createRuntimeConfig · reducedMotion', () => {
  it('无 matchMedia 的宿主不抛、按不降级返回 false', () => {
    expect(typeof window.matchMedia).not.toBe('function')
    expect(createRuntimeConfig().reducedMotion()).toBe(false)
  })

  it('应用级 override 压过系统偏好', () => {
    const config = createRuntimeConfig()
    setMotionOverride('reduce')
    expect(config.reducedMotion()).toBe(true)
    setMotionOverride('no-preference')
    expect(config.reducedMotion()).toBe(false)
  })

  it('显式传入的 reducedMotion 原样保留', () => {
    const config = createRuntimeConfig({ reducedMotion: () => true })
    expect(config.reducedMotion()).toBe(true)
  })
})
