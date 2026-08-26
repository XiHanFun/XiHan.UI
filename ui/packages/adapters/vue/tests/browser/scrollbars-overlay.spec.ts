// 浮层族的自绘条：贴着 positioner 的盒、不占宽度、露出后拖得动、轨道不上底色。
//
// 这四件只有真实浏览器量得出来：jsdom 不排版，getBoundingClientRect 恒是 0；
// pointer-events 与轨道底色都要皮肤真的加载进来才算得出计算值。
import type { App } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import { createApp, h, nextTick } from 'vue'
import { XhPopoverContent, XhPopoverPositioner, XhPopoverRoot } from '../../src'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

let app: App | null = null
let host: HTMLElement | null = null

afterEach(() => {
  app?.unmount()
  host?.remove()
  app = null
  host = null
  // 浮层搬去了 body，卸载后确认没留下
  document.querySelectorAll('[data-scope="popover"][data-part="positioner"]').forEach(el => el.remove())
})

async function tick(times = 4): Promise<void> {
  for (let i = 0; i < times; i++) {
    await nextTick()
    await new Promise(r => requestAnimationFrame(() => r(null)))
  }
}

/** 面板限高 120px、正文远超它：竖轴溢出。 */
async function mount(): Promise<void> {
  host = document.createElement('div')
  document.body.append(host)
  const lines = Array.from({ length: 40 }, (_, i) => `第 ${i + 1} 行`)
  app = createApp({
    setup: () => () =>
      h(XhPopoverRoot, { defaultOpen: true }, () => [
        h(XhPopoverPositioner, null, () => [
          h(XhPopoverContent, { style: 'max-block-size: 120px' }, () =>
            lines.map(line => h('div', { key: line }, line))),
        ]),
      ]),
  })
  app.mount(host)
  await tick()
}

function positioner(): HTMLElement {
  return document.querySelector<HTMLElement>('[data-scope="popover"][data-part="positioner"]')!
}

function content(): HTMLElement {
  return document.querySelector<HTMLElement>('[data-scope="popover"][data-part="content"]')!
}

function bar(): HTMLElement {
  return positioner().querySelector<HTMLElement>('[data-scope="scrollbar"][data-part="root"]')!
}

function track(): HTMLElement {
  return positioner().querySelector<HTMLElement>('[data-scope="scrollbar"][data-part="track"]')!
}

/** 滚一下把条子叫出来：缺省档静止即收起。 */
async function reveal(): Promise<void> {
  content().scrollTop = 60
  content().dispatchEvent(new Event('scroll'))
  await tick(2)
}

describe('浮层里的自绘条', () => {
  it('缺省档静止时收着并让指针穿过去', async () => {
    await mount()

    expect(bar().getAttribute('data-state')).toBe('hidden')
    expect(getComputedStyle(bar()).pointerEvents).toBe('none')
  })

  it('露出后吃指针：positioner 那句 pointer-events: none 不该传染给条子', async () => {
    await mount()
    await reveal()

    expect(bar().getAttribute('data-state')).toBe('visible')
    expect(getComputedStyle(bar()).pointerEvents).toBe('auto')
    expect(getComputedStyle(track()).pointerEvents).toBe('auto')
  })

  it('轨道不上底色，不在面板右缘糊出灰带', async () => {
    await mount()
    await reveal()

    expect(getComputedStyle(track()).backgroundColor).toBe('rgba(0, 0, 0, 0)')
  })

  it('不占宽度：壳与面板一样宽，条子贴壳的右缘、压在正文之上', async () => {
    await mount()
    await reveal()

    // 排版宽度不受面板那支入场动画的缩放影响，直接比即可
    expect(positioner().offsetWidth).toBe(content().offsetWidth)

    const shell = positioner().getBoundingClientRect()
    const box = bar().getBoundingClientRect()
    expect(box.right).toBeCloseTo(shell.right, 1)
    // 左缘落在面板之内：条子浮在正文上，不是排在正文右边
    expect(box.left).toBeLessThan(content().getBoundingClientRect().right)
  })
})
