// @vitest-environment jsdom
// 接线前就已在场的部件：这一批元素的首轮更新跑完后，取消它们身上已经起播的 CSS 过渡；
// 关键帧动画、伪元素上的过渡、没登记的节点不碰，已离场的不碰，同一任务里登记的部件共用一次处理：
// 每个根只取一次动画，取齐了再一起取消。

import { describe, expect, it, vi } from 'vitest'
import { settleTransitionsAfterWiring } from '../src/dom/settle-transitions'

interface FakeAnimation {
  cancel: ReturnType<typeof vi.fn>
  effect: { target: Element | null, pseudoElement: string | null }
  transitionProperty?: string
  animationName?: string
}

interface FakeRoot {
  animations: FakeAnimation[]
  getAnimations: ReturnType<typeof vi.fn>
}

function root(): FakeRoot {
  const fake: FakeRoot = { animations: [], getAnimations: vi.fn(() => fake.animations) }
  return fake
}

function part(owner: FakeRoot | object, connected = true): Element {
  return { isConnected: connected, getRootNode: () => owner } as unknown as Element
}

function transition(owner: FakeRoot, target: Element, property: string, pseudoElement: string | null = null): FakeAnimation {
  const animation: FakeAnimation = { transitionProperty: property, effect: { target, pseudoElement }, cancel: vi.fn() }
  owner.animations.push(animation)
  return animation
}

const microtask = (): Promise<void> => Promise.resolve()

async function settled(): Promise<void> {
  await microtask()
  await microtask()
  await microtask()
}

describe('settleTransitionsAfterWiring', () => {
  it('只取消登记部件自己身上的 CSS 过渡：关键帧动画、伪元素上的过渡、没登记的节点都不碰', async () => {
    const doc = root()
    const el = part(doc)
    const other = part(doc)
    const own = transition(doc, el, 'border-top-color')
    const pseudo = transition(doc, el, 'background-color', '::before')
    const unregistered = transition(doc, other, 'border-top-color')
    const keyframes: FakeAnimation = { animationName: 'xh-fade-in', effect: { target: el, pseudoElement: null }, cancel: vi.fn() }
    doc.animations.push(keyframes)
    settleTransitionsAfterWiring([el])
    await settled()
    expect(own.cancel).toHaveBeenCalledTimes(1)
    expect(pseudo.cancel).not.toHaveBeenCalled()
    expect(unregistered.cancel).not.toHaveBeenCalled()
    expect(keyframes.cancel).not.toHaveBeenCalled()
  })

  it('排在登记时已排着的微任务（首轮更新）之后：隔一层微任务才处理', async () => {
    const doc = root()
    const el = part(doc)
    const animation = transition(doc, el, 'background-color')
    const order: string[] = []
    queueMicrotask(() => order.push('update'))
    settleTransitionsAfterWiring([el])
    queueMicrotask(() => order.push('later update'))
    animation.cancel.mockImplementation(() => order.push('settle'))
    await settled()
    expect(order).toEqual(['update', 'later update', 'settle'])
  })

  it('同一任务里多次登记共用一次处理：每个根只取一次动画，已离场的部件不查', async () => {
    const doc = root()
    const shadow = root()
    const a = part(doc)
    const b = part(doc)
    const c = part(shadow)
    const goneRoot = root()
    const gone = part(goneRoot, false)
    const animations = [transition(doc, a, 'border-left-color'), transition(doc, b, 'border-right-color'), transition(shadow, c, 'color')]
    settleTransitionsAfterWiring([a])
    settleTransitionsAfterWiring([b, gone, a, c])
    await settled()
    expect(doc.getAnimations).toHaveBeenCalledTimes(1)
    expect(shadow.getAnimations).toHaveBeenCalledTimes(1)
    expect(goneRoot.getAnimations).not.toHaveBeenCalled()
    expect(animations.map(animation => animation.cancel.mock.calls.length)).toEqual([1, 1, 1])
  })

  it('先取齐再取消：取消发生在所有根都取过动画之后', async () => {
    const order: string[] = []
    const first = root()
    const second = root()
    first.getAnimations.mockImplementation(() => {
      order.push('read first')
      return first.animations
    })
    second.getAnimations.mockImplementation(() => {
      order.push('read second')
      return second.animations
    })
    const a = part(first)
    const b = part(second)
    transition(first, a, 'color').cancel.mockImplementation(() => order.push('cancel a'))
    transition(second, b, 'color').cancel.mockImplementation(() => order.push('cancel b'))
    settleTransitionsAfterWiring([a, b])
    await settled()
    expect(order).toEqual(['read first', 'read second', 'cancel a', 'cancel b'])
  })

  it('根上没有 getAnimations 的环境与空列表什么都不做', async () => {
    const bare = part({})
    settleTransitionsAfterWiring([bare])
    settleTransitionsAfterWiring([])
    await settled()
    expect(true).toBe(true)
  })
})
