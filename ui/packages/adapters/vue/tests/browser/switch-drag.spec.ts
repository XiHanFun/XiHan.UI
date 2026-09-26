// 开关的拖动：真指针按住滑块横向拖，松手按落点决定停在哪一端。
// 钉住：拖过中点松手切换且只切一次（浏览器补派的 click 被吞掉），滑块由弹簧收到那一端再交还样式层；
// 没过中点收回原端、不切换；不拖的点按照常切换；拖出两端越拉越沉；从右往左书写时往左拖是打开；
// 减弱动效下松手直接落定。
import type { App } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import { cdp } from 'vitest/browser'
import { createApp, h, nextTick } from 'vue'
import { XhSwitch } from '../../src'
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

function frames(count = 3): Promise<void> {
  return new Promise<void>((resolve) => {
    const step = (left: number): void => {
      if (left === 0)
        resolve()
      else requestAnimationFrame(() => step(left - 1))
    }
    step(count)
  })
}

interface Rig {
  track: HTMLElement
  thumb: HTMLElement
  changes: boolean[]
}

async function mount(dir?: 'rtl'): Promise<Rig> {
  host = document.createElement('div')
  host.style.cssText = 'padding: 40px'
  if (dir)
    host.dir = dir
  document.body.append(host)
  const changes: boolean[] = []
  app = createApp({
    render: () => h(XhSwitch, { 'aria-label': '通知', 'onCheckedChange': (details: { checked: boolean }) => changes.push(details.checked) }),
  })
  app.mount(host)
  await nextTick()
  await frames()
  return {
    track: host.querySelector<HTMLElement>('[data-scope="switch"][data-part="root"]')!,
    thumb: host.querySelector<HTMLElement>('[data-scope="switch"][data-part="thumb"]')!,
    changes,
  }
}

async function mouseScale(): Promise<number> {
  const seen = new Promise<number>(resolve => document.addEventListener('pointermove', event => resolve(event.clientX / 20), { once: true }))
  await cdp().send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: 20, y: 20 })
  return seen
}

/** 按住滑块中心、分几步横向拖过 dx、松手；每步隔一帧。 */
async function drag(thumb: HTMLElement, dx: number, steps = 6): Promise<void> {
  const scale = await mouseScale()
  const rect = thumb.getBoundingClientRect()
  const x = rect.left + rect.width / 2
  const y = rect.top + rect.height / 2
  const at = (px: number) => ({ x: px / scale, y: y / scale })
  await cdp().send('Input.dispatchMouseEvent', { type: 'mouseMoved', ...at(x) })
  await cdp().send('Input.dispatchMouseEvent', { type: 'mousePressed', button: 'left', clickCount: 1, ...at(x) })
  for (let i = 1; i <= steps; i++) {
    await frames(1)
    await cdp().send('Input.dispatchMouseEvent', { type: 'mouseMoved', button: 'left', ...at(x + (dx * i) / steps) })
  }
  await cdp().send('Input.dispatchMouseEvent', { type: 'mouseReleased', button: 'left', clickCount: 1, ...at(x + dx) })
}

/** 滑块的行程：轨道内宽减去滑块宽。 */
function travel(rig: Rig): number {
  const style = getComputedStyle(rig.track)
  return rig.track.clientWidth - Number.parseFloat(style.paddingLeft) - Number.parseFloat(style.paddingRight) - rig.thumb.offsetHeight
}

describe('开关拖动', () => {
  it('拖过中点松手：切换且只切一次，滑块由弹簧收到那一端再交还样式层', async () => {
    const rig = await mount()
    await drag(rig.thumb, travel(rig) * 0.8)
    await nextTick()
    expect(rig.changes).toEqual([true])
    expect(rig.track.getAttribute('aria-checked')).toBe('true')
    expect(rig.thumb.hasAttribute('data-animating')).toBe(true)
    await expect.poll(() => rig.thumb.hasAttribute('data-animating'), { timeout: 2000 }).toBe(false)
    expect(rig.thumb.style.translate).toBe('')
    // 浏览器补派的那次 click 被吞掉之后，下一次点按照常切换
    rig.track.click()
    await nextTick()
    expect(rig.changes).toEqual([true, false])
  })

  it('没过中点：收回原端，不切换', async () => {
    const rig = await mount()
    await drag(rig.thumb, travel(rig) * 0.3, 10)
    await nextTick()
    expect(rig.changes).toEqual([])
    expect(rig.track.getAttribute('aria-checked')).toBe('false')
    await expect.poll(() => rig.thumb.style.translate, { timeout: 2000 }).toBe('')
  })

  it('不拖的点按照常切换', async () => {
    const rig = await mount()
    await drag(rig.thumb, 1, 1)
    await nextTick()
    expect(rig.changes).toEqual([true])
    expect(rig.thumb.hasAttribute('data-dragging')).toBe(false)
  })

  it('拖出两端越拉越沉：滑块只出去一小截', async () => {
    const rig = await mount()
    const scale = await mouseScale()
    const rect = rig.thumb.getBoundingClientRect()
    const at = (px: number) => ({ x: px / scale, y: (rect.top + rect.height / 2) / scale })
    const x = rect.left + rect.width / 2
    await cdp().send('Input.dispatchMouseEvent', { type: 'mouseMoved', ...at(x) })
    await cdp().send('Input.dispatchMouseEvent', { type: 'mousePressed', button: 'left', clickCount: 1, ...at(x) })
    await cdp().send('Input.dispatchMouseEvent', { type: 'mouseMoved', button: 'left', ...at(x - 5) })
    await cdp().send('Input.dispatchMouseEvent', { type: 'mouseMoved', button: 'left', ...at(x - 200) })
    await nextTick()
    const pulled = Number.parseFloat(rig.thumb.style.translate)
    expect(pulled).toBeLessThan(0)
    // 橡皮筋上限 24px：往外拖了 200px，滑块只出去不到 24px
    expect(pulled).toBeGreaterThan(-24)
    await cdp().send('Input.dispatchMouseEvent', { type: 'mouseReleased', button: 'left', clickCount: 1, ...at(x - 200) })
    await expect.poll(() => rig.thumb.style.translate, { timeout: 2000 }).toBe('')
    expect(rig.changes).toEqual([])
  })

  it('从右往左书写：往左拖是打开', async () => {
    const rig = await mount('rtl')
    await drag(rig.thumb, -travel(rig) * 0.8)
    await nextTick()
    expect(rig.changes).toEqual([true])
    expect(Number.parseFloat(rig.thumb.style.translate)).toBeLessThan(0)
    await expect.poll(() => rig.thumb.hasAttribute('data-animating'), { timeout: 2000 }).toBe(false)
  })

  it('减弱动效：松手直接落定', async () => {
    const rig = await mount()
    host!.dataset.motion = 'reduce'
    await drag(rig.thumb, travel(rig) * 0.8)
    await nextTick()
    expect(rig.changes).toEqual([true])
    expect(rig.thumb.hasAttribute('data-animating')).toBe(false)
    expect(rig.thumb.style.translate).toBe('')
  })
})
