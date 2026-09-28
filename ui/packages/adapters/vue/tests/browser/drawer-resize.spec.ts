// 抽屉改尺在真实布局里：把手贴在朝向页面的那条边上；拖动把手面板跟手变宽、夹在上下限之间；
// 从右往左排版时把手换到另一条边、推的方向跟着翻；键盘推一步。几何只有真实浏览器量得出来。
import type { App } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import { createApp, h, nextTick } from 'vue'
import { XhDrawerContent, XhDrawerResizeTrigger, XhDrawerRoot, XhDrawerTitle } from '../../src'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

let app: App | null = null
let host: HTMLElement | null = null

afterEach(() => {
  app?.unmount()
  app = null
  host?.remove()
  host = null
  document.documentElement.removeAttribute('dir')
})

function part(name: string): HTMLElement {
  const el = document.querySelector<HTMLElement>(`[data-scope='drawer'][data-part='${name}']`)
  if (!el)
    throw new Error(`找不到 drawer/${name}`)
  return el
}

async function frames(count = 2): Promise<void> {
  for (let i = 0; i < count; i++)
    await new Promise(resolve => requestAnimationFrame(resolve))
}

async function mount(props: Record<string, unknown> = {}): Promise<void> {
  host = document.createElement('div')
  document.body.append(host)
  app = createApp({
    render: () => h(XhDrawerRoot, { defaultOpen: true, resizable: true, minPanelSize: 180, maxPanelSize: 300, ...props }, () =>
      h(XhDrawerContent, null, () => [h(XhDrawerTitle, null, () => '字段设置'), h(XhDrawerResizeTrigger)])),
  })
  app.mount(host)
  await nextTick()
  // 等滑入播完再量：整幅位移会让矩形失真
  await expect.poll(() => part('content').getAnimations().length, { timeout: 3000 }).toBe(0)
}

function pointer(type: string, target: EventTarget, x: number, y: number): void {
  target.dispatchEvent(new PointerEvent(type, { clientX: x, clientY: y, button: 0, pointerId: 1, bubbles: true, cancelable: true }))
}

describe('drawer 改尺', () => {
  it('把手贴在朝向页面的那条边上：贴右边的面板，把手在它的左缘', async () => {
    await mount()
    const content = part('content').getBoundingClientRect()
    const handle = part('resize-trigger').getBoundingClientRect()
    // 命中区在面板的描边以内：离左缘不超过一道描边
    expect(Math.abs(handle.left - content.left)).toBeLessThanOrEqual(1)
    // 纵向铺满面板的内框：上下各让出一道描边
    expect(content.height - handle.height).toBeLessThanOrEqual(2)
    expect(getComputedStyle(part('resize-trigger')).cursor).toBe('ew-resize')
  })

  it('拖动把手面板跟手变宽，夹在上下限之间', async () => {
    await mount()
    const before = part('content').getBoundingClientRect()
    const handle = part('resize-trigger').getBoundingClientRect()
    const x = handle.left + handle.width / 2
    const y = handle.top + handle.height / 2
    // 每一帧都按按下时的厚度加指针总位移算：往右推是变薄，推过下限就停在下限
    pointer('pointerdown', part('resize-trigger'), x, y)
    pointer('pointermove', document, x + 2000, y)
    await frames()
    expect(part('content').getBoundingClientRect().width).toBeCloseTo(180, 0)
    expect(part('content').hasAttribute('data-resizing')).toBe(true)
    pointer('pointermove', document, x + before.width - 240, y)
    await frames()
    expect(part('content').getBoundingClientRect().width).toBeCloseTo(240, 0)
    pointer('pointermove', document, x - 5000, y)
    pointer('pointerup', document, x - 5000, y)
    await frames()
    expect(part('content').getBoundingClientRect().width).toBeCloseTo(Math.min(300, window.innerWidth), 0)
    expect(part('content').hasAttribute('data-resizing')).toBe(false)
    expect(part('content').getBoundingClientRect().right).toBeCloseTo(before.right, 0)
  })

  it('从右往左排版：贴行尾的面板落在屏幕左边，把手在它的右缘，往右推是变厚', async () => {
    document.documentElement.setAttribute('dir', 'rtl')
    await mount()
    const content = part('content').getBoundingClientRect()
    const handle = part('resize-trigger')
    expect(Math.abs(handle.getBoundingClientRect().right - content.right)).toBeLessThanOrEqual(1)
    handle.focus()
    handle.dispatchEvent(new KeyboardEvent('keydown', { key: 'Home', bubbles: true, cancelable: true }))
    await frames()
    expect(part('content').getBoundingClientRect().width).toBeCloseTo(180, 0)
    handle.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true, cancelable: true }))
    await frames()
    expect(part('content').getBoundingClientRect().width).toBeCloseTo(188, 0)
  })

  it('没开改尺：把手收起', async () => {
    await mount({ resizable: false })
    expect(getComputedStyle(part('resize-trigger')).display).toBe('none')
  })
})
