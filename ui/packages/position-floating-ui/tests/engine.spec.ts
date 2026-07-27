// @vitest-environment jsdom

import type { PositionResult } from '@xihan-ui/core'
import { describe, expect, it } from 'vitest'
import { createFloatingUiPositionEngine } from '../src/index'

function mount(): { anchor: HTMLElement, floating: HTMLElement, cleanup: () => void } {
  const anchor = document.createElement('button')
  const floating = document.createElement('div')
  document.body.append(anchor, floating)
  const cleanup = (): void => {
    anchor.remove()
    floating.remove()
  }
  return { anchor, floating, cleanup }
}

/** 等一次 microtask 队列排空：computePosition 是 Promise。 */
const flush = (): Promise<void> => new Promise(resolve => setTimeout(resolve, 0))

describe('createFloatingUiPositionEngine', () => {
  it('元素锚点：产出结果并带回落定后的 placement', async () => {
    const { anchor, floating, cleanup } = mount()
    const engine = createFloatingUiPositionEngine()
    const results: PositionResult[] = []

    const stop = engine.attach(anchor, floating, { placement: 'top' }, r => results.push(r))
    await flush()

    expect(results.length).toBeGreaterThan(0)
    const first = results[0]!
    expect(typeof first.x).toBe('number')
    expect(typeof first.y).toBe('number')
    expect(typeof first.hidden).toBe('boolean')
    // jsdom 无布局，四周空间恒为 0，flip 会把 top 翻到 bottom；只断言取值合法
    expect(['top', 'bottom', 'left', 'right']).toContain(first.placement.split('-')[0])

    stop()
    cleanup()
  })

  // 端口的虚拟锚点只承诺 x/y/width/height，floating-ui 还要 top/right/bottom/left。
  // 阻抗匹配若漏了，computePosition 会拿到 undefined 边界并算出 NaN。
  it('虚拟锚点：只给 x/y/width/height 也能算出有限数值', async () => {
    const { floating, cleanup } = mount()
    const engine = createFloatingUiPositionEngine()
    const results: PositionResult[] = []

    const stop = engine.attach(
      { getBoundingClientRect: () => ({ x: 10, y: 20, width: 30, height: 40 }) },
      floating,
      { placement: 'bottom', offset: 4 },
      r => results.push(r),
    )
    await flush()

    expect(results.length).toBeGreaterThan(0)
    expect(Number.isFinite(results[0]!.x)).toBe(true)
    expect(Number.isFinite(results[0]!.y)).toBe(true)

    stop()
    cleanup()
  })

  it('停止跟随后不再产出结果', async () => {
    const { anchor, floating, cleanup } = mount()
    const engine = createFloatingUiPositionEngine()
    let count = 0

    const stop = engine.attach(anchor, floating, {}, () => {
      count += 1
    })
    await flush()
    const afterFirst = count
    expect(afterFirst).toBeGreaterThan(0)

    stop()
    window.dispatchEvent(new Event('resize'))
    await flush()
    expect(count).toBe(afterFirst)

    cleanup()
  })

  it('关掉 flip 与 shift 时保留请求的 placement', async () => {
    const { anchor, floating, cleanup } = mount()
    const engine = createFloatingUiPositionEngine()
    const results: PositionResult[] = []

    const stop = engine.attach(anchor, floating, { placement: 'right-start', flip: false, shift: false }, r => results.push(r))
    await flush()

    expect(results[0]!.placement).toBe('right-start')

    stop()
    cleanup()
  })
})
