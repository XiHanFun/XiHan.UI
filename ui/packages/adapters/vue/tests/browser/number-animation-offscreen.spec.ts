// 数值滚动在屏幕外不空转：入场那一轮根节点不在视口里时停在起点，进了视口再从头滚；
// 换目标时不在视口里直接落到终点。视口判定靠 IntersectionObserver，只有真实浏览器有。
import type { App } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import { createApp, h, nextTick, ref } from 'vue'
import { XhNumberAnimation } from '../../src'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

let app: App | null = null
let host: HTMLElement | null = null

afterEach(() => {
  app?.unmount()
  app = null
  host?.remove()
  host = null
  window.scrollTo(0, 0)
})

function frames(n: number): Promise<void> {
  return new Promise((resolve) => {
    let left = n
    const tick = (): void => {
      left -= 1
      if (left <= 0)
        resolve()
      else
        requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  })
}

function root(): HTMLElement {
  return host!.querySelector<HTMLElement>('[data-scope="number-animation"][data-part="root"]')!
}

async function mount(to: { value: number }): Promise<void> {
  host = document.createElement('div')
  // 远在视口之下：首帧就不在视口里
  host.style.marginBlockStart = '300vh'
  document.body.append(host)
  app = createApp({ render: () => h(XhNumberAnimation, { from: 0, to: to.value, duration: 200 }) })
  app.mount(host)
  await nextTick()
}

describe('number-animation 屏幕外不空转', () => {
  it('入场那一轮在视口外停在起点，滚进视口才从头滚到终点', async () => {
    await mount({ value: 500 })
    await frames(20)
    expect(root().textContent).toBe('0')

    root().scrollIntoView()
    await frames(4)
    const midway = Number(root().textContent)
    expect(midway).toBeGreaterThanOrEqual(0)
    expect(midway).toBeLessThan(500)
    await expect.poll(() => root().textContent, { timeout: 2000 }).toBe('500')
  })

  it('换目标时不在视口里，直接落到终点', async () => {
    const to = ref(500)
    host = document.createElement('div')
    document.body.append(host)
    app = createApp({ render: () => h(XhNumberAnimation, { from: 0, to: to.value, duration: 200 }) })
    app.mount(host)
    await expect.poll(() => root().textContent, { timeout: 2000 }).toBe('500')

    // 把它推到视口之下再换目标
    host.style.marginBlockStart = '300vh'
    await frames(4)
    to.value = 900
    await nextTick()
    await frames(3)
    expect(root().textContent).toBe('900')
  })
})
