// 变换覆盖层在真实 Chromium 里：选中框按视口落在画布上的正确位置并绕中心旋转，覆盖层除控制柄外不挡指针，
// 控制柄的指针形状随旋转角换，移动拖到画布边缘时逐帧派发 pan-request，选中项跟着平移后的视口走。
import type { Viewport } from '@xihan-ui/designer-kit'
import type { DesignerTransformEventMap, XhDesignerTransformElement } from '../../src'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { defineDesignerShell } from '../../src'
import '@xihan-ui/tokens/tokens.css'
import '../../style.css'

defineDesignerShell()

let canvas: HTMLElement
let overlay: XhDesignerTransformElement

beforeEach(async () => {
  canvas = document.createElement('div')
  canvas.style.cssText = 'position:fixed;left:100px;top:80px;width:600px;height:400px;background:#eee'
  overlay = document.createElement('xh-designer-transform')
  overlay.viewport = { x: 50, y: 40, zoom: 2 }
  overlay.items = [{ id: 'a', rect: { x: 10, y: 20, width: 100, height: 50 }, rotatable: true }]
  canvas.append(overlay)
  document.body.prepend(canvas)
  await overlay.updateComplete
})

afterEach(() => {
  canvas.remove()
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

function handle(name: string): HTMLElement {
  return overlay.querySelector<HTMLElement>(`[data-part="handle"][data-handle="${name}"]`)!
}

describe('<xh-designer-transform>（Chromium）', () => {
  it('选中框按视口落在画布上，旋转后的包围与世界矩形一致', async () => {
    const frame = overlay.querySelector('[data-part="frame"]')!
    let rect = frame.getBoundingClientRect()
    expect(rect.left).toBeCloseTo(100 + 50 + 10 * 2, 1)
    expect(rect.top).toBeCloseTo(80 + 40 + 20 * 2, 1)
    expect(rect.width).toBeCloseTo(200, 1)
    expect(rect.height).toBeCloseTo(100, 1)
    overlay.items = [{ id: 'a', rect: { x: 10, y: 20, width: 100, height: 50, rotation: 90 } }]
    await overlay.updateComplete
    rect = frame.getBoundingClientRect()
    expect(rect.width).toBeCloseTo(100, 1)
    expect(rect.height).toBeCloseTo(200, 1)
    expect(rect.left + rect.width / 2).toBeCloseTo(100 + 50 + 60 * 2, 1)
    expect(rect.top + rect.height / 2).toBeCloseTo(80 + 40 + 45 * 2, 1)
  })

  it('除控制柄外不挡指针；控制柄的指针形状随旋转角换', async () => {
    const inside = overlay.querySelector('[data-part="frame"]')!.getBoundingClientRect()
    expect(document.elementFromPoint(inside.left + 50, inside.top + 50)).toBe(canvas)
    const east = handle('e').getBoundingClientRect()
    expect(document.elementFromPoint(east.left + east.width / 2, east.top + east.height / 2)).toBe(handle('e'))
    expect(getComputedStyle(handle('e')).cursor).toBe('ew-resize')
    expect(getComputedStyle(handle('rotate')).cursor).toBe('grab')
    overlay.items = [{ id: 'a', rect: { x: 10, y: 20, width: 100, height: 50, rotation: 90 } }]
    await overlay.updateComplete
    expect(getComputedStyle(handle('e')).cursor).toBe('ns-resize')
  })

  it('拖控制柄缩放：按在控制柄上派发的指针事件经文档跟随，松手得到新矩形', async () => {
    const seen: DesignerTransformEventMap['transform']['detail'][] = []
    overlay.addEventListener('transform', event => seen.push((event as DesignerTransformEventMap['transform']).detail))
    const east = handle('e').getBoundingClientRect()
    const x = east.left + east.width / 2
    const y = east.top + east.height / 2
    pointer(handle('e'), 'pointerdown', x, y)
    pointer(document, 'pointermove', x + 40, y)
    pointer(document, 'pointerup', x + 40, y)
    expect(seen.map(detail => detail.phase)).toEqual(['start', 'move', 'move', 'end'])
    expect(seen.at(-1)!.rects.get('a')).toEqual({ x: 10, y: 20, width: 120, height: 50 })
  })

  it('多选时控制柄落在整体包围框的角上，拖动按包围框等比缩放全部选中项', async () => {
    overlay.items = [
      { id: 'a', rect: { x: 10, y: 20, width: 100, height: 50 } },
      { id: 'b', rect: { x: 150, y: 20, width: 50, height: 50 } },
    ]
    await overlay.updateComplete
    const bounds = overlay.querySelector('[data-part="bounds"]')!.getBoundingClientRect()
    const corner = handle('se').getBoundingClientRect()
    const x = corner.left + corner.width / 2
    const y = corner.top + corner.height / 2
    expect([x, y]).toEqual([bounds.right, bounds.bottom])
    expect(document.elementFromPoint(x, y)).toBe(handle('se'))
    const seen: DesignerTransformEventMap['transform']['detail'][] = []
    overlay.addEventListener('transform', event => seen.push((event as DesignerTransformEventMap['transform']).detail))
    pointer(handle('se'), 'pointerdown', x, y)
    pointer(document, 'pointermove', x + 190, y)
    pointer(document, 'pointerup', x + 190, y)
    expect(seen.at(-1)!.phase).toBe('end')
    expect(Object.fromEntries(seen.at(-1)!.rects)).toEqual({
      a: { x: 10, y: 20, width: 150, height: 75 },
      b: { x: 220, y: 20, width: 75, height: 75 },
    })
  })

  it('移动拖到画布右边缘时逐帧派发 pan-request，视口平移后选中项跟着指针走', async () => {
    const seen: DesignerTransformEventMap['transform']['detail'][] = []
    overlay.addEventListener('transform', event => seen.push((event as DesignerTransformEventMap['transform']).detail))
    let pans = 0
    overlay.addEventListener('pan-request', (event) => {
      pans++
      const { dx, dy } = (event as DesignerTransformEventMap['pan-request']).detail
      const viewport = overlay.viewport as Viewport
      overlay.viewport = { ...viewport, x: viewport.x - dx, y: viewport.y - dy }
    })
    pointer(canvas, 'pointerdown', 300, 200)
    overlay.startMove(new PointerEvent('pointerdown', { pointerId: 1, isPrimary: true, clientX: 300, clientY: 200 }))
    pointer(document, 'pointermove', 696, 200)
    const first = seen.at(-1)!.rects.get('a')!.x
    await frames(6)
    expect(pans).toBeGreaterThanOrEqual(3)
    const later = seen.at(-1)!.rects.get('a')!.x
    expect(later).toBeGreaterThan(first)
    pointer(document, 'pointermove', 400, 200)
    await frames(2)
    const settled = pans
    await frames(4)
    expect(pans).toBe(settled)
    pointer(document, 'pointerup', 400, 200)
    expect(seen.at(-1)!.phase).toBe('end')
  })
})
