// 回到顶部作为浮动按钮展开列表里的一项：根按列表排布（static），钮与列表里的其它动作、
// 与浮动按钮的触发器同一副身量，点下去仍然滚回顶部。
//
// 定位模式、盒尺寸与真实滚动都要真实浏览器才量得出来。
import type { App } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import { createApp, h, nextTick } from 'vue'
import { XhBackTopRoot, XhBackTopTrigger, XhFloatButtonList, XhFloatButtonRoot, XhFloatButtonTrigger } from '../../src'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

let app: App | null = null
let host: HTMLElement | null = null

afterEach(() => {
  app?.unmount()
  app = null
  host?.remove()
  host = null
})

function part(scope: string, name: string): HTMLElement {
  const el = host?.querySelector<HTMLElement>(`[data-scope='${scope}'][data-part='${name}']`)
  if (!el)
    throw new Error(`找不到 ${scope} 的 ${name}`)
  return el
}

async function mount(): Promise<HTMLElement> {
  host = document.createElement('div')
  document.body.append(host)
  const scroller = document.createElement('div')
  scroller.style.blockSize = '120px'
  scroller.style.overflow = 'auto'
  scroller.innerHTML = '<div style="block-size: 600px"></div>'
  host.append(scroller)
  const mountPoint = document.createElement('div')
  host.append(mountPoint)
  app = createApp({
    setup: () => () => h(XhFloatButtonRoot, { defaultOpen: true, style: { position: 'static' } }, () => [
      h(XhFloatButtonTrigger),
      h(XhFloatButtonList, null, () => [
        h(XhBackTopRoot, { target: scroller, visibilityHeight: 120, style: { position: 'static' } }, () => h(XhBackTopTrigger)),
        h('button', { 'type': 'button', 'aria-label': '消息' }, '✉'),
      ]),
    ]),
  })
  app.mount(mountPoint)
  await nextTick()
  // 滚过阈值，回到顶部才露面
  scroller.scrollTop = 300
  await expect.poll(() => part('back-top', 'root').hidden).toBe(false)
  // 量的是落定后的盒：列表逐条冒出与钮的进场都带缩放，等它们播完
  await Promise.all(document.getAnimations().map(animation => animation.finished))
  return scroller
}

describe('back-top 作为 float-button 列表里的一项', () => {
  it('根按列表排布，钮与触发器、同列的原生动作同一副身量', async () => {
    await mount()
    const list = part('float-button', 'list')
    const root = part('back-top', 'root')
    expect(root.parentElement).toBe(list)
    expect(getComputedStyle(root).position).toBe('static')

    const trigger = part('back-top', 'trigger').getBoundingClientRect()
    const main = part('float-button', 'trigger').getBoundingClientRect()
    const sibling = list.querySelector('button[aria-label="消息"]')!.getBoundingClientRect()
    const box = list.getBoundingClientRect()
    expect([trigger.width, trigger.height]).toEqual([main.width, main.height])
    expect([trigger.width, trigger.height]).toEqual([sibling.width, sibling.height])
    // 钮落在列表盒里，没有被定位壳带到视口角落
    expect(trigger.left).toBeGreaterThanOrEqual(box.left)
    expect(trigger.right).toBeLessThanOrEqual(box.right)
    expect(trigger.top).toBeGreaterThanOrEqual(box.top)
    expect(trigger.bottom).toBeLessThanOrEqual(box.bottom)
  })

  it('钮有可及名，点下去把目标容器滚回顶部', async () => {
    const scroller = await mount()
    const trigger = part('back-top', 'trigger')
    expect(trigger.getAttribute('aria-label') ?? trigger.textContent).toBeTruthy()
    trigger.click()
    await expect.poll(() => scroller.scrollTop).toBe(0)
  })
})
