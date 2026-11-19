// 角标换数：元素按 key 逐位写节点，在动的位换一个节点让滚动从头播；少掉的一位滚走、收回宽度，播完才摘掉。
import { afterEach, describe, expect, it } from 'vitest'
import { defineXhElements } from '../../src/define'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

defineXhElements()

type BadgeHost = HTMLElement & { count?: number, updateComplete: Promise<unknown> }

let host: HTMLElement | null = null

afterEach(() => {
  host?.remove()
  host = null
})

async function settle(el: BadgeHost): Promise<void> {
  for (let round = 0; round < 5; round++) {
    await Promise.resolve()
    await el.updateComplete
  }
  await new Promise<void>(resolve => requestAnimationFrame(() => resolve()))
  await new Promise<void>(resolve => requestAnimationFrame(() => resolve()))
}

async function mount(count: number): Promise<{ el: BadgeHost, indicator: HTMLElement }> {
  host = document.createElement('div')
  // 拉长滚动，确认写进去之后它真的在播
  host.style.setProperty('--xh-motion-duration-move', '10s')
  document.body.append(host)
  const el = document.createElement('xh-badge') as BadgeHost
  el.count = count
  el.setAttribute('size', 'sm')
  el.innerHTML = '<span data-xh-part="root"><button type="button">消息</button><span data-xh-part="indicator"></span></span>'
  host.append(el)
  await settle(el)
  return { el, indicator: el.querySelector<HTMLElement>(`[data-part='indicator']`)! }
}

describe('badge 换数滚动（Web Components）', () => {
  it('10 → 9：十位往下滚走、收回宽度，个位换字；播完摘掉滚走的那一位', async () => {
    const { el, indicator } = await mount(10)
    el.count = 9
    await settle(el)

    expect(indicator.hasAttribute('data-animating')).toBe(true)
    const [tens, ones] = Array.from(indicator.querySelectorAll<HTMLElement>(`[data-part='glyph']`))
    expect(tens!.dataset).toMatchObject({ presence: 'leave', roll: 'down' })
    expect(tens!.getAnimations().map(animation => (animation as CSSAnimation).animationName)).toEqual(['xh-badge-roll-down-out', 'xh-badge-glyph-collapse'])
    expect(ones!.dataset).toMatchObject({ roll: 'down', from: '0' })
    expect(ones!.getAnimations()[0]!.playState).toBe('running')

    for (const animation of indicator.getAnimations({ subtree: true }))
      animation.finish()
    await expect.poll(async () => {
      await settle(el)
      return indicator.querySelectorAll(`[data-part='glyph']`).length
    }, { timeout: 2000 }).toBe(1)
    expect(indicator.hasAttribute('data-animating')).toBe(false)
    expect(indicator.textContent).toBe('9')
  })
})
