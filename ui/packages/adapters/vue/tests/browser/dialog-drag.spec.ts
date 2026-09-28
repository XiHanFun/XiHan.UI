// 对话框的拖动在真实布局里：按住标题栏跟手挪、拖到视口外被夹住；把手上方向键挪一步；
// 拖过的面板收起时从拖到的位置退场，不先弹回居中。几何与退场的起点只有真实浏览器量得出来。
import type { App } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import { createApp, h, nextTick, ref } from 'vue'
import { XhDialogCloseTrigger, XhDialogContent, XhDialogDragTrigger, XhDialogHeader, XhDialogRoot, XhDialogTitle } from '../../src'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

let app: App | null = null
let host: HTMLElement | null = null
const open = ref(true)

afterEach(() => {
  app?.unmount()
  app = null
  host?.remove()
  host = null
  open.value = true
})

function part(name: string): HTMLElement {
  const el = document.querySelector<HTMLElement>(`[data-scope='dialog'][data-part='${name}']`)
  if (!el)
    throw new Error(`找不到 dialog/${name}`)
  return el
}

async function frames(count = 2): Promise<void> {
  for (let i = 0; i < count; i++)
    await new Promise(resolve => requestAnimationFrame(resolve))
}

async function mount(): Promise<void> {
  host = document.createElement('div')
  document.body.append(host)
  app = createApp({
    render: () => h(XhDialogRoot, { 'draggable': true, 'open': open.value, 'onUpdate:open': (v: boolean) => { open.value = v } }, () =>
      h(XhDialogContent, null, () => [
        h(XhDialogHeader, null, () => [h(XhDialogDragTrigger), h(XhDialogTitle, null, () => '字段设置')]),
        h('p', null, '拖动标题栏挪走面板'),
        h(XhDialogCloseTrigger),
      ])),
  })
  app.mount(host)
  await nextTick()
  // 等入场播完再量：进场关键帧的缩放会让矩形失真
  await expect.poll(() => part('content').getAnimations().length, { timeout: 2000 }).toBe(0)
}

function pointer(type: string, target: EventTarget, x: number, y: number): void {
  target.dispatchEvent(new PointerEvent(type, { clientX: x, clientY: y, button: 0, pointerId: 1, bubbles: true, cancelable: true }))
}

describe('dialog 拖动', () => {
  it('按住标题栏跟手挪，松手停在原处', async () => {
    await mount()
    const before = part('content').getBoundingClientRect()
    const header = part('header').getBoundingClientRect()
    const x = header.left + 20
    const y = header.top + 10
    pointer('pointerdown', part('title'), x, y)
    pointer('pointermove', document, x + 60, y + 40)
    await frames()
    expect(part('content').hasAttribute('data-dragging')).toBe(true)
    pointer('pointerup', document, x + 60, y + 40)
    await frames()
    const after = part('content').getBoundingClientRect()
    // 测试视口窄：横向能挪的只有面板右缘到视口右缘那一截，照夹取后的量比
    expect(after.left - before.left).toBeCloseTo(Math.min(60, window.innerWidth - before.right), 0)
    expect(after.top - before.top).toBeCloseTo(40, 0)
    expect(part('content').hasAttribute('data-dragging')).toBe(false)
  })

  it('拖到视口外的那一截被夹住：面板四边留在视口里', async () => {
    await mount()
    const header = part('header').getBoundingClientRect()
    pointer('pointerdown', part('title'), header.left + 20, header.top + 10)
    pointer('pointermove', document, -5000, -5000)
    pointer('pointerup', document, -5000, -5000)
    await frames()
    const rect = part('content').getBoundingClientRect()
    expect(rect.left).toBeCloseTo(0, 0)
    expect(rect.top).toBeCloseTo(0, 0)
  })

  it('把手上方向键挪一步，Enter 回到居中', async () => {
    await mount()
    const before = part('content').getBoundingClientRect()
    const handle = part('drag-trigger')
    handle.focus()
    handle.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true, cancelable: true }))
    await frames()
    expect(part('content').getBoundingClientRect().left - before.left).toBeCloseTo(10, 0)
    handle.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true }))
    await frames()
    expect(part('content').getBoundingClientRect().left).toBeCloseTo(before.left, 0)
  })

  it('拖过的面板收起时从拖到的位置退场，不先弹回居中', async () => {
    await mount()
    const header = part('header').getBoundingClientRect()
    pointer('pointerdown', part('title'), header.left + 20, header.top + 10)
    pointer('pointermove', document, header.left + 140, header.top + 10)
    pointer('pointerup', document, header.left + 140, header.top + 10)
    await frames()
    const dragged = part('content').getBoundingClientRect()
    open.value = false
    await nextTick()
    await frames(1)
    const content = document.querySelector<HTMLElement>(`[data-scope='dialog'][data-part='content']`)
    // 退场第一帧：不透明度才开始降，位置仍在拖到的地方（缩放按中心收，中线不动）
    expect(content).not.toBeNull()
    const exiting = content!.getBoundingClientRect()
    expect((exiting.left + exiting.right) / 2).toBeCloseTo((dragged.left + dragged.right) / 2, -1)
  })

  it('标题栏与把手上的指针样式：可拖动时是抓手', async () => {
    await mount()
    expect(getComputedStyle(part('header')).cursor).toBe('grab')
    expect(getComputedStyle(part('drag-trigger')).cursor).toBe('grab')
    expect(getComputedStyle(part('header')).touchAction).toBe('none')
  })
})
