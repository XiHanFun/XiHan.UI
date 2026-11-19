// 角标换数不再瞬切：一直露着时计数变了，变了的那几位沿块向滚过去（变大往上、变小往下），
// 多出、少掉的一位列宽在 0 与字宽之间补，角标宽度跟着走；减弱动效下直接换字。
// 动画是否起播、位移与宽度走到哪、节点何时摘掉只有真实浏览器看得出。
import type { App } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import { createApp, h, nextTick, ref } from 'vue'
import { XhBadge } from '../../src'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

let app: App | null = null
let host: HTMLElement | null = null
const count = ref(3)

afterEach(() => {
  app?.unmount()
  app = null
  host?.remove()
  host = null
  delete document.documentElement.dataset.motion
})

async function mount(initial: number): Promise<HTMLElement> {
  count.value = initial
  host = document.createElement('div')
  host.style.padding = '24px'
  document.body.append(host)
  app = createApp({ render: () => h(XhBadge, { count: count.value, size: 'sm' }, () => h('button', { type: 'button' }, '消息')) })
  app.mount(host)
  await nextTick()
  return host.querySelector<HTMLElement>(`[data-scope='badge'][data-part='indicator']`)!
}

async function set(next: number): Promise<void> {
  count.value = next
  await nextTick()
  await nextTick()
}

const glyphs = (indicator: HTMLElement): HTMLElement[] => Array.from(indicator.querySelectorAll<HTMLElement>(`[data-part='glyph']`))
const names = (node: Element): string[] => getComputedStyle(node).animationName.split(',').map(name => name.trim())

/** 把角标里在播的动画都停在同一时刻，量这一帧的几何。 */
function freezeAt(indicator: HTMLElement, progress: number): void {
  for (const animation of indicator.getAnimations({ subtree: true })) {
    const duration = Number(animation.effect?.getComputedTiming().duration ?? 0)
    animation.pause()
    animation.currentTime = duration * progress
  }
}

describe('badge 换数滚动', () => {
  it('变大：个位换字往上滚，多出的十位从无到有，列宽跟着长开；播完各位回到不动的写法', async () => {
    const indicator = await mount(9)
    const before = indicator.getBoundingClientRect().width
    await set(10)

    const [tens, ones] = glyphs(indicator)
    expect(indicator.textContent).toBe('10')
    expect(indicator.hasAttribute('data-animating')).toBe(true)
    expect(getComputedStyle(indicator).overflowY).toBe('clip')
    expect(tens!.dataset.presence).toBe('enter')
    expect(names(tens!)).toEqual(['xh-badge-roll-up', 'xh-badge-glyph-expand'])
    expect(ones!.dataset).toMatchObject({ roll: 'up', from: '9' })
    expect(ones!.dataset.presence).toBeUndefined()
    expect(names(ones!)).toEqual(['xh-badge-roll-up'])

    // 走到一半：新字从下面上来了一半，十位只长开了一半，角标宽度在一位与两位之间
    freezeAt(indicator, 0.5)
    const valueTop = indicator.querySelector(`[data-part='value']`)!.getBoundingClientRect().top
    const rect = ones!.getBoundingClientRect()
    expect(rect.top - valueTop).toBeGreaterThan(0)
    expect(rect.top - valueTop).toBeLessThan(rect.height)
    const half = indicator.getBoundingClientRect().width
    for (const animation of indicator.getAnimations({ subtree: true }))
      animation.finish()
    await expect.poll(() => indicator.hasAttribute('data-animating'), { timeout: 2000 }).toBe(false)
    const after = indicator.getBoundingClientRect().width
    expect(after).toBeGreaterThan(before)
    expect(half).toBeGreaterThanOrEqual(before)
    expect(half).toBeLessThan(after)

    expect(glyphs(indicator).map(glyph => glyph.dataset.roll)).toEqual([undefined, undefined])
    expect(indicator.textContent).toBe('10')
  })

  it('变小：往下滚，少掉的十位滚走、收回列宽，播完才摘掉', async () => {
    const indicator = await mount(10)
    await set(9)

    const [tens, ones] = glyphs(indicator)
    expect(tens!.dataset).toMatchObject({ presence: 'leave', roll: 'down' })
    expect(tens!.getAttribute('aria-hidden')).toBe('true')
    expect(names(tens!)).toEqual(['xh-badge-roll-down-out', 'xh-badge-glyph-collapse'])
    expect(ones!.dataset).toMatchObject({ roll: 'down', from: '0' })
    expect(names(ones!)).toEqual(['xh-badge-roll-down'])

    await expect.poll(() => glyphs(indicator).length, { timeout: 2000 }).toBe(1)
    expect(indicator.textContent).toBe('9')
    expect(indicator.hasAttribute('data-animating')).toBe(false)
  })

  it('越过上限：数字不动，只有「+」从无到有', async () => {
    const indicator = await mount(99)
    await set(100)
    expect(glyphs(indicator).map(glyph => glyph.dataset.roll)).toEqual([undefined, undefined])
    const suffix = indicator.querySelector<HTMLElement>(`[data-part='suffix']`)!
    expect(suffix.dataset.presence).toBe('enter')
    expect(names(suffix)).toEqual(['xh-badge-roll-up', 'xh-badge-glyph-expand'])
    await expect.poll(() => indicator.querySelector<HTMLElement>(`[data-part='suffix']`)?.dataset.roll, { timeout: 2000 }).toBeUndefined()
    expect(indicator.textContent).toBe('99+')
  })

  it('rtl 下数字仍从左往右写，「+」落在数字左边', async () => {
    const indicator = await mount(120)
    indicator.closest('div')!.dir = 'rtl'
    const value = indicator.querySelector<HTMLElement>(`[data-part='value']`)!
    const suffix = indicator.querySelector<HTMLElement>(`[data-part='suffix']`)!
    const [first, second] = glyphs(indicator)
    expect(first!.getBoundingClientRect().left).toBeLessThan(second!.getBoundingClientRect().left)
    expect(suffix.getBoundingClientRect().right).toBeLessThanOrEqual(value.getBoundingClientRect().left + 0.5)
  })

  it('减弱动效下直接换字，不滚', async () => {
    document.documentElement.dataset.motion = 'reduce'
    const indicator = await mount(9)
    await set(10)
    expect(indicator.hasAttribute('data-animating')).toBe(false)
    expect(glyphs(indicator).map(glyph => glyph.dataset.roll)).toEqual([undefined, undefined])
    expect(indicator.textContent).toBe('10')
  })
})
