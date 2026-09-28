// 回到顶部作为浮动按钮展开列表里的一项（Web Components）：宿主写 display: contents，
// 根直接成为列表的一项、按列表排布；没滚过阈值时整项收起，列表里不留空位。
//
// 定位模式、盒尺寸与收起后的排布都要真实浏览器才量得出来。
import { afterEach, describe, expect, it } from 'vitest'
import { defineXhElements } from '../../src/define'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

interface XhHost extends HTMLElement {
  updateComplete: Promise<unknown>
  target?: HTMLElement | null
}

defineXhElements()

let host: HTMLElement | null = null

afterEach(() => {
  host?.remove()
  host = null
})

async function settle(...elements: XhHost[]): Promise<void> {
  for (let round = 0; round < 3; round++) {
    await Promise.resolve()
    await Promise.all(elements.map(element => element.updateComplete))
  }
}

async function mount(): Promise<{ scroller: HTMLElement, list: HTMLElement, root: HTMLElement }> {
  host = document.createElement('div')
  host.innerHTML = `
    <div data-testid="scroller" style="block-size: 120px; overflow: auto"><div style="block-size: 600px"></div></div>
    <xh-float-button default-open>
      <div data-xh-part="root" style="position: static">
        <button data-xh-part="trigger"></button>
        <div data-xh-part="list">
          <xh-back-top visibility-height="120" style="display: contents">
            <div data-xh-part="root" style="position: static">
              <button data-xh-part="trigger"></button>
            </div>
          </xh-back-top>
          <button type="button" aria-label="消息">✉</button>
        </div>
      </div>
    </xh-float-button>`
  document.body.append(host)
  const scroller = host.querySelector<HTMLElement>('[data-testid="scroller"]')!
  const floatButton = host.querySelector<XhHost>('xh-float-button')!
  const backTop = host.querySelector<XhHost>('xh-back-top')!
  backTop.target = scroller
  await settle(floatButton, backTop)
  return {
    scroller,
    list: floatButton.querySelector<HTMLElement>('[data-part="list"]')!,
    root: backTop.querySelector<HTMLElement>('[data-part="root"]')!,
  }
}

describe('web components：back-top 作为 float-button 列表里的一项', () => {
  it('没滚过阈值时整项收起，列表里只剩其余动作', async () => {
    const { list, root } = await mount()
    expect(root.hidden).toBe(true)
    const visible = [...list.querySelectorAll<HTMLElement>('button')].filter(button => button.getClientRects().length > 0)
    expect(visible.map(button => button.getAttribute('aria-label'))).toEqual(['消息'])
  })

  it('滚过阈值后根按列表排布，钮与触发器同一副身量', async () => {
    const { scroller, list, root } = await mount()
    scroller.scrollTop = 300
    await expect.poll(() => root.hidden).toBe(false)
    await Promise.all(document.getAnimations().map(animation => animation.finished))

    expect(getComputedStyle(root).position).toBe('static')
    const trigger = root.querySelector<HTMLElement>('[data-part="trigger"]')!
    const main = host!.querySelector<HTMLElement>('[data-scope="float-button"][data-part="trigger"]')!
    expect([trigger.offsetWidth, trigger.offsetHeight]).toEqual([main.offsetWidth, main.offsetHeight])
    const box = list.getBoundingClientRect()
    const rect = trigger.getBoundingClientRect()
    expect(rect.left).toBeGreaterThanOrEqual(box.left)
    expect(rect.right).toBeLessThanOrEqual(box.right)
    expect(rect.top).toBeGreaterThanOrEqual(box.top)
    expect(rect.bottom).toBeLessThanOrEqual(box.bottom)

    trigger.click()
    await expect.poll(() => scroller.scrollTop).toBe(0)
  })
})
