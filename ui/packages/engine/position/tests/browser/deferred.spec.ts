import type { PositionResult } from '@xihan-ui/core'
import { overlayKit } from '@xihan-ui/core'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { createDeferredPositionEngine, createPositionEngine } from '../../src/index'

// 本文件不预取：第一条用例跑的时候引擎本体与 core 的浮层按需块都还没到，量的正是第一次 attach 那条路径。
// 两条用例有先后：第二条跑时第一条已经把两块取到了。

function scene(): { anchor: HTMLElement, floating: HTMLElement } {
  const anchor = document.createElement('button')
  anchor.style.cssText = 'position:fixed;left:200px;top:200px;width:80px;height:30px'
  const floating = document.createElement('div')
  floating.style.cssText = 'position:fixed;left:0;top:0;width:120px;height:60px'
  document.body.append(anchor, floating)
  return { anchor, floating }
}

afterEach(() => {
  document.body.replaceChildren()
})

describe('延迟定位引擎', () => {
  it('第一次 attach：两块都没到时不回报，到了再挂；结果与引擎本体一致，到达前撤掉的那一次不再挂', async () => {
    expect(overlayKit()).toBeNull()
    const { anchor, floating } = scene()
    const engine = createDeferredPositionEngine()
    const results: PositionResult[] = []
    const cancelled: PositionResult[] = []
    const options = { placement: 'bottom-start', offset: 8, strategy: 'fixed' } as const

    const stop = engine.attach(anchor, floating, options, result => results.push(result))
    const stopEarly = engine.attach(anchor, floating, options, result => cancelled.push(result))
    stopEarly()
    expect(results).toEqual([])

    await vi.waitFor(() => expect(results.length).toBeGreaterThan(0))
    expect(overlayKit()).not.toBeNull()
    expect(cancelled).toEqual([])

    const direct: PositionResult[] = []
    const stopDirect = createPositionEngine().attach(anchor, floating, options, result => direct.push(result))
    const { x, y, placement } = direct[0]!
    expect(results.at(-1)).toMatchObject({ x, y, placement })
    stopDirect()
    stop()
  })

  it('两块都到了之后：attach 当场回报，与引擎本体一样同步', () => {
    const { anchor, floating } = scene()
    const results: PositionResult[] = []
    const stop = createDeferredPositionEngine().attach(anchor, floating, { placement: 'top', offset: 8, strategy: 'fixed' }, result => results.push(result))
    expect(results).toHaveLength(1)
    expect(results[0]!.placement).toBe('top')
    stop()
  })
})
