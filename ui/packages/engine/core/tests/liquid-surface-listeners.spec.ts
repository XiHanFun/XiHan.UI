// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest'
import { trackLiquidSurface } from '../src/visual-environment/liquid/surface'

/** 等协调器那一帧的重新分组跑完：观察者回调是微任务，排帧之后再等一帧。 */
async function frame(): Promise<void> {
  await Promise.resolve()
  await new Promise<void>(resolve => requestAnimationFrame(() => resolve()))
}

/** 文档上当前挂着的、协调器那组监听里的类型。 */
function spyListeners() {
  const live = new Map<string, number>()
  const watched = new Set(['scroll', 'pointermove', 'pointerdown', 'transitionend'])
  const add = vi.spyOn(document, 'addEventListener').mockImplementation((type: string) => {
    if (watched.has(type))
      live.set(type, (live.get(type) ?? 0) + 1)
  })
  const remove = vi.spyOn(document, 'removeEventListener').mockImplementation((type: string) => {
    if (watched.has(type))
      live.set(type, (live.get(type) ?? 0) - 1)
  })
  return {
    count: (type: string) => live.get(type) ?? 0,
    restore: () => {
      add.mockRestore()
      remove.mockRestore()
    },
  }
}

afterEach(() => {
  document.documentElement.removeAttribute('data-material')
  document.body.innerHTML = ''
})

describe('trackLiquidSurface 文档级监听', () => {
  it('材质轴不是 liquid 时只登记、不挂滚动与指针监听；切到 liquid 才挂，切走即摘', async () => {
    const spy = spyListeners()
    const el = document.createElement('div')
    document.body.appendChild(el)
    const untrack = trackLiquidSurface(el)
    await frame()
    expect(spy.count('scroll')).toBe(0)
    expect(spy.count('pointermove')).toBe(0)

    document.documentElement.setAttribute('data-material', 'liquid')
    await frame()
    expect(spy.count('scroll')).toBe(1)
    expect(spy.count('pointermove')).toBe(1)
    expect(spy.count('transitionend')).toBe(1)

    document.documentElement.setAttribute('data-material', 'standard')
    await frame()
    expect(spy.count('scroll')).toBe(0)
    expect(spy.count('pointermove')).toBe(0)

    untrack()
    spy.restore()
  })

  it('撤走最后一个液态成员时摘掉监听，其余非液态成员仍在册', async () => {
    const spy = spyListeners()
    const plain = document.createElement('div')
    plain.setAttribute('data-material', 'standard')
    const liquid = document.createElement('div')
    liquid.setAttribute('data-material', 'liquid')
    document.body.append(plain, liquid)
    const untrackPlain = trackLiquidSurface(plain)
    const untrackLiquid = trackLiquidSurface(liquid)
    await frame()
    expect(spy.count('scroll')).toBe(1)

    untrackLiquid()
    await frame()
    expect(spy.count('scroll')).toBe(0)

    untrackPlain()
    expect(spy.count('scroll')).toBe(0)
    spy.restore()
  })
})
