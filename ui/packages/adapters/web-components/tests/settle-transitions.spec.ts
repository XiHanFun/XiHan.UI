// @vitest-environment jsdom
// 接线前就已在场的部件：这一批元素的首轮更新跑完后，取消它们身上已经起播的 CSS 过渡；
// 关键帧动画不碰，已离场的不碰，同一任务里登记的部件共用一次处理。

import { describe, expect, it, vi } from 'vitest'
import { settleTransitionsAfterWiring } from '../src/dom/settle-transitions'

interface FakeAnimation {
  cancel: ReturnType<typeof vi.fn>
  transitionProperty?: string
  animationName?: string
}

function part(animations: FakeAnimation[], connected = true): { el: Element, getAnimations: ReturnType<typeof vi.fn> } {
  const getAnimations = vi.fn(() => animations)
  const el = { isConnected: connected, getAnimations } as unknown as Element
  return { el, getAnimations }
}

const microtask = (): Promise<void> => Promise.resolve()

describe('settleTransitionsAfterWiring', () => {
  it('只取消 CSS 过渡，关键帧动画不碰', async () => {
    const transition: FakeAnimation = { transitionProperty: 'border-top-color', cancel: vi.fn() }
    const keyframes: FakeAnimation = { animationName: 'xh-fade-in', cancel: vi.fn() }
    settleTransitionsAfterWiring([part([transition, keyframes]).el])
    await microtask()
    await microtask()
    await microtask()
    expect(transition.cancel).toHaveBeenCalledTimes(1)
    expect(keyframes.cancel).not.toHaveBeenCalled()
  })

  it('排在登记时已排着的微任务（首轮更新）之后：隔一层微任务才处理', async () => {
    const transition: FakeAnimation = { transitionProperty: 'background-color', cancel: vi.fn() }
    const order: string[] = []
    queueMicrotask(() => order.push('update'))
    settleTransitionsAfterWiring([part([transition]).el])
    queueMicrotask(() => order.push('later update'))
    transition.cancel.mockImplementation(() => order.push('settle'))
    await microtask()
    await microtask()
    await microtask()
    expect(order).toEqual(['update', 'later update', 'settle'])
  })

  it('同一任务里多次登记共用一次处理，已离场的部件不查', async () => {
    const a = part([{ transitionProperty: 'border-left-color', cancel: vi.fn() }])
    const b = part([{ transitionProperty: 'border-right-color', cancel: vi.fn() }])
    const gone = part([], false)
    settleTransitionsAfterWiring([a.el])
    settleTransitionsAfterWiring([b.el, gone.el, a.el])
    await microtask()
    await microtask()
    await microtask()
    expect(a.getAnimations).toHaveBeenCalledTimes(1)
    expect(b.getAnimations).toHaveBeenCalledTimes(1)
    expect(gone.getAnimations).not.toHaveBeenCalled()
  })

  it('没有 getAnimations 的环境与空列表什么都不做', async () => {
    const bare = { isConnected: true } as unknown as Element
    settleTransitionsAfterWiring([bare])
    settleTransitionsAfterWiring([])
    await microtask()
    await microtask()
    await microtask()
    expect(true).toBe(true)
  })
})
