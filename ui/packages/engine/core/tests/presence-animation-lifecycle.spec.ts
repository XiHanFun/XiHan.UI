// @vitest-environment jsdom
import type { RuntimeConfig } from '../src/kernel'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { attachCssExit, createPresence } from '../src/behavior/presence'

const cleanup: Array<() => void> = []
afterEach(() => {
  for (const dispose of cleanup.splice(0).reverse()) dispose()
  vi.restoreAllMocks()
  document.body.innerHTML = ''
})

function animation(name: string, endTime = 400) {
  let finish!: () => void
  let cancel!: () => void
  const finished = new Promise<Animation>((resolve, reject) => {
    finish = () => resolve({} as Animation)
    cancel = () => reject(new Error('动画取消'))
  })
  return {
    animation: { animationName: name, playState: 'running', effect: { getComputedTiming: () => ({ endTime }) }, finished } as unknown as Animation,
    finish,
    cancel,
  }
}

function fixture(names: string, animations: Animation[], reducedMotion = false) {
  const node = document.createElement('div')
  document.body.append(node)
  vi.spyOn(window, 'getComputedStyle').mockReturnValue({ animationName: names, display: 'block' } as CSSStyleDeclaration)
  Object.defineProperty(node, 'getAnimations', { configurable: true, value: () => animations })
  const presence = createPresence({ config: { reducedMotion: () => reducedMotion } as RuntimeConfig, open: true, onRenderedChange: () => {} })
  const detach = attachCssExit(node, presence)
  cleanup.push(detach, () => presence.dispose())
  return { node, presence, detach }
}

async function settle(): Promise<void> {
  await new Promise(resolve => setTimeout(resolve, 0))
}

describe('浏览器动画对象与 Presence 租约', () => {
  it('同一表面的所有有限动画结束后才完成', async () => {
    const first = animation('fade')
    const second = animation('move')
    const { presence } = fixture('fade, move', [first.animation, second.animation])
    const complete = vi.fn()
    presence.onExitComplete(complete)
    presence.update(false)
    first.finish()
    await settle()
    expect(presence.rendered).toBe(true)
    second.cancel()
    await settle()
    expect(presence.rendered).toBe(false)
    expect(complete).toHaveBeenCalledTimes(1)
  })

  it('同名的两个动画对象也必须分别完成', async () => {
    const first = animation('fade')
    const second = animation('fade')
    const { presence } = fixture('fade, fade', [first.animation, second.animation])
    presence.update(false)
    first.finish()
    await settle()
    expect(presence.rendered).toBe(true)
    second.finish()
    await settle()
    expect(presence.rendered).toBe(false)
  })

  it('没有真实动画对象时不因声明名字等待', () => {
    const { presence } = fixture('不存在的关键帧', [])
    presence.update(false)
    expect(presence.rendered).toBe(false)
  })

  it('无限装饰动画不阻止有限退场动画结束', async () => {
    const decoration = animation('shine', Infinity)
    const finite = animation('fade')
    const { presence } = fixture('shine, fade', [decoration.animation, finite.animation])
    presence.update(false)
    finite.finish()
    await settle()
    expect(presence.rendered).toBe(false)
  })

  it('重新打开后旧动画完成不能结束新的退出', async () => {
    const old = animation('fade')
    const next = animation('fade')
    const animations = [old.animation]
    const { presence } = fixture('fade', animations)
    const complete = vi.fn()
    presence.onExitComplete(complete)
    presence.update(false)
    presence.update(true)
    animations[0] = next.animation
    presence.update(false)
    old.finish()
    await settle()
    expect(presence.rendered).toBe(true)
    expect(complete).not.toHaveBeenCalled()
    next.finish()
    await settle()
    expect(complete).toHaveBeenCalledTimes(1)
  })

  it('销毁后迟到完成不再通知，观察可以重复清理', async () => {
    const pending = animation('fade')
    const { presence, detach } = fixture('fade', [pending.animation])
    const complete = vi.fn()
    presence.onExitComplete(complete)
    presence.update(false)
    presence.dispose()
    detach()
    detach()
    pending.finish()
    await settle()
    expect(complete).not.toHaveBeenCalled()
  })

  it('减弱动效不等待动画对象兑现', () => {
    const pending = animation('fade')
    const { presence } = fixture('fade', [pending.animation], true)
    presence.update(false)
    expect(presence.rendered).toBe(false)
  })
})
