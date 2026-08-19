// @vitest-environment jsdom
// JS 驱动的两类动效（整页平滑滚动、数值逐帧补间）要自己查减弱动效偏好：
// 皮肤那条 reduce 通道只关得掉 CSS 动画与过渡，压不到 scrollTo 与 requestAnimationFrame。
import { resolveScrollBehavior } from '@xihan-ui/behavior'
import { setMotionOverride } from '@xihan-ui/motion'
import { createCounterIdGenerator, createScope } from '@xihan-ui/kernel'
import { afterEach, describe, expect, it, vi } from 'vitest'

/** 装一个 matchMedia 替身，只对减弱动效那条查询作答。 */
function stubReducedMotion(reduced: boolean) {
  vi.stubGlobal('matchMedia', (query: string) => ({
    matches: query.includes('prefers-reduced-motion: reduce') ? reduced : false,
    media: query,
    addEventListener: () => {},
    removeEventListener: () => {},
  }))
}

function scope() {
  return createScope(document.body, createCounterIdGenerator())
}

afterEach(() => {
  vi.unstubAllGlobals()
  setMotionOverride(null)
})

describe('平滑滚动在减弱动效档下降成瞬移', () => {
  it('reduce 开启时 smooth 降成 auto', () => {
    stubReducedMotion(true)
    expect(resolveScrollBehavior('smooth', scope())).toBe('auto')
  })

  it('reduce 关闭时 smooth 原样保留', () => {
    stubReducedMotion(false)
    expect(resolveScrollBehavior('smooth', scope())).toBe('smooth')
  })

  it('作者显式要 auto / instant 的，两档下都不改写', () => {
    stubReducedMotion(true)
    expect(resolveScrollBehavior('auto', scope())).toBe('auto')
    expect(resolveScrollBehavior('instant', scope())).toBe('instant')
  })
})

describe('应用级强制偏好优先于系统设置', () => {
  it('系统没开、应用强制 reduce 时也降级', () => {
    stubReducedMotion(false)
    setMotionOverride('reduce')
    expect(resolveScrollBehavior('smooth', scope())).toBe('auto')
  })

  it('系统开了、应用强制不降级时保持 smooth', () => {
    stubReducedMotion(true)
    setMotionOverride('no-preference')
    expect(resolveScrollBehavior('smooth', scope())).toBe('smooth')
  })
})
