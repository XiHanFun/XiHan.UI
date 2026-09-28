// 角标出现与消失不再瞬切：计数从 0 变成有时弹出，清零时缩小淡出、播完才藏起，退场那几帧照清零前的数字写；
// 首帧就在的角标直接呈现。动画是否起播、节点何时藏起只有真实浏览器看得出。
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
  app = createApp({ render: () => h(XhBadge, { count: count.value, tone: 'danger' }, () => h('button', { type: 'button' }, '消息')) })
  app.mount(host)
  await nextTick()
  return host.querySelector<HTMLElement>(`[data-scope='badge'][data-part='indicator']`)!
}

async function set(next: number): Promise<void> {
  count.value = next
  await nextTick()
  await nextTick()
}

describe('badge 出现与消失', () => {
  it('首帧就在的角标直接呈现，不播进场', async () => {
    const indicator = await mount(3)
    expect(indicator.hidden).toBe(false)
    expect(indicator.dataset.state).toBe('visible')
    expect(getComputedStyle(indicator).animationName).toBe('none')
  })

  it('清零时缩小淡出、播完才藏起，退场途中照清零前的数字写；再有计数时弹出', async () => {
    const indicator = await mount(3)
    await set(0)
    expect(indicator.dataset.state).toBe('hidden')
    expect(indicator.hidden).toBe(false)
    expect(indicator.textContent).toBe('3')
    expect(getComputedStyle(indicator).animationName).toBe('xh-pop-out')
    await expect.poll(() => indicator.hidden, { timeout: 2000 }).toBe(true)

    await set(5)
    expect(indicator.hidden).toBe(false)
    expect(indicator.dataset.state).toBe('visible')
    expect(indicator.textContent).toBe('5')
    expect(getComputedStyle(indicator).animationName).toBe('xh-pop-in')
  })
})
