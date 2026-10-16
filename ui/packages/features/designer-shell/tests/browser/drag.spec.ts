// 通用拖放与物料面板在真实 Chromium 里：命中判断走 elementFromPoint，预览不挡命中、按下处保持在指针下，
// 贴着接受的目标边缘逐帧派发 pan-request，触屏长按到时才开始拖。
import type { DesignerPaletteDragPayload, PanRequestDetail } from '../../src'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { defineDesignerShell, registerDropTarget } from '../../src'
import '../../style.css'

defineDesignerShell()

let fixture: HTMLElement

beforeEach(() => {
  fixture = document.createElement('div')
  fixture.style.cssText = 'position:fixed;inset:0 auto auto 0;display:flex;gap:40px;padding:20px;width:1200px'
  document.body.prepend(fixture)
})

afterEach(() => {
  fixture.remove()
})

function pointer(target: EventTarget, type: string, x: number, y: number, init: PointerEventInit = {}): void {
  target.dispatchEvent(new PointerEvent(type, { bubbles: true, cancelable: true, composed: true, pointerId: 1, isPrimary: true, pointerType: 'mouse', button: 0, clientX: x, clientY: y, ...init }))
}

function frames(count: number): Promise<void> {
  return new Promise((resolve) => {
    let left = count
    const step = (): void => {
      if (--left <= 0)
        resolve()
      else
        requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
  })
}

function center(element: Element): { x: number, y: number } {
  const rect = element.getBoundingClientRect()
  return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 }
}

async function mountPalette(): Promise<{ palette: HTMLElement, canvas: HTMLElement, item: HTMLButtonElement }> {
  const palette = document.createElement('xh-designer-palette')
  palette.style.cssText = 'width:200px'
  palette.groups = [{ id: 'g', label: '人工处理', items: [{ id: 'approve', label: '审批', payload: { type: 'approve' } }] }]
  const canvas = document.createElement('div')
  canvas.style.cssText = 'width:600px;height:400px;background:#eee'
  fixture.append(palette, canvas)
  await palette.updateComplete
  return { palette, canvas, item: palette.querySelector<HTMLButtonElement>('button[data-part="item"]')! }
}

describe('通用拖放（Chromium）', () => {
  it('从物料拖到画布上松手：预览跟手且不挡命中，放下的位置与载荷交给目标，不派发 item-activate', async () => {
    const { palette, canvas, item } = await mountPalette()
    const overs: { x: number, y: number }[] = []
    const drops: [{ x: number, y: number }, DesignerPaletteDragPayload][] = []
    registerDropTarget<DesignerPaletteDragPayload>(canvas, {
      over: (point) => {
        overs.push(point)
        return { accept: true }
      },
      drop: (point, payload) => drops.push([point, payload]),
    })
    const activated: unknown[] = []
    palette.addEventListener('item-activate', event => activated.push(event))
    const box = item.getBoundingClientRect()
    const start = { x: box.left + 10, y: box.top + 8 }
    pointer(item, 'pointerdown', start.x, start.y)
    const target = center(canvas)
    pointer(document, 'pointermove', target.x, target.y)
    const preview = document.querySelector<HTMLElement>('[data-xh-designer-drag-preview]')!
    expect(preview).not.toBeNull()
    expect(getComputedStyle(preview).pointerEvents).toBe('none')
    const shown = preview.getBoundingClientRect()
    expect(shown.left).toBeCloseTo(target.x - 10 * 0.8, 0)
    expect(shown.top).toBeCloseTo(target.y - 8 * 0.8, 0)
    expect(shown.width).toBeCloseTo(box.width * 0.8, 0)
    expect(overs.at(-1)).toEqual(target)
    pointer(document, 'pointerup', target.x, target.y)
    item.click()
    expect(drops).toEqual([[target, { source: 'palette', id: 'approve', payload: { type: 'approve' } }]])
    expect(document.querySelector('[data-xh-designer-drag-preview]')).toBeNull()
    expect(activated).toEqual([])
  })

  it('最内层的目标优先；ghost 为 hide 时预览不显示', async () => {
    const { canvas, item } = await mountPalette()
    const inner = document.createElement('div')
    inner.style.cssText = 'margin:100px;width:200px;height:100px;background:#ccc'
    canvas.append(inner)
    const seen: string[] = []
    registerDropTarget(canvas, {
      over: () => {
        seen.push('outer')
        return { accept: true }
      },
      drop: () => {},
    })
    registerDropTarget(inner, {
      over: () => {
        seen.push('inner')
        return { accept: true, ghost: 'hide' }
      },
      drop: () => {},
    })
    const box = item.getBoundingClientRect()
    pointer(item, 'pointerdown', box.left + 5, box.top + 5)
    const point = center(inner)
    pointer(document, 'pointermove', point.x, point.y)
    expect(seen).toEqual(['inner'])
    expect(getComputedStyle(document.querySelector('[data-xh-designer-drag-preview]')!).display).toBe('none')
    const rect = canvas.getBoundingClientRect()
    pointer(document, 'pointermove', rect.left + 20, rect.top + 20)
    expect(seen).toEqual(['inner', 'outer'])
    expect(getComputedStyle(document.querySelector('[data-xh-designer-drag-preview]')!).display).not.toBe('none')
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true }))
    expect(document.querySelector('[data-xh-designer-drag-preview]')).toBeNull()
  })

  it('停在接受的目标边缘时逐帧派发 pan-request，移回中间即停', async () => {
    const { canvas, item } = await mountPalette()
    let accept = true
    registerDropTarget(canvas, { over: () => ({ accept }), drop: () => {} })
    const pans: PanRequestDetail[] = []
    canvas.addEventListener('pan-request', event => pans.push((event as CustomEvent<PanRequestDetail>).detail))
    const box = item.getBoundingClientRect()
    pointer(item, 'pointerdown', box.left + 5, box.top + 5)
    const rect = canvas.getBoundingClientRect()
    pointer(document, 'pointermove', rect.right - 4, rect.top + rect.height / 2)
    await frames(5)
    expect(pans.length).toBeGreaterThanOrEqual(3)
    expect(pans.every(pan => pan.dx > 0 && pan.dy === 0)).toBe(true)
    const middle = center(canvas)
    pointer(document, 'pointermove', middle.x, middle.y)
    await frames(2)
    const settled = pans.length
    await frames(4)
    expect(pans.length).toBe(settled)
    accept = false
    pointer(document, 'pointermove', rect.left + 3, middle.y)
    await frames(4)
    expect(pans.length).toBe(settled)
    pointer(document, 'pointerup', rect.left + 3, middle.y)
  })

  it('触屏长按到时开始拖，之后移动不滚动页面，松手放下', async () => {
    const { canvas, item } = await mountPalette()
    const drops: unknown[] = []
    registerDropTarget(canvas, { over: () => ({ accept: true }), drop: (_point, payload) => drops.push(payload) })
    const box = item.getBoundingClientRect()
    pointer(item, 'pointerdown', box.left + 5, box.top + 5, { pointerType: 'touch' })
    await new Promise(resolve => setTimeout(resolve, 300))
    expect(document.querySelector('[data-xh-designer-drag-preview]')).toBeNull()
    await new Promise(resolve => setTimeout(resolve, 300))
    expect(document.querySelector('[data-xh-designer-drag-preview]')).not.toBeNull()
    const point = center(canvas)
    pointer(document, 'pointermove', point.x, point.y, { pointerType: 'touch' })
    pointer(document, 'pointerup', point.x, point.y, { pointerType: 'touch' })
    expect(drops).toEqual([{ source: 'palette', id: 'approve', payload: { type: 'approve' } }])
  })
})
