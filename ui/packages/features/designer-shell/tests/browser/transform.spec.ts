// 变换覆盖层在真实 Chromium 里：选中框按视口落在画布上的正确位置并绕中心旋转，覆盖层除控制柄外不挡指针，
// 控制柄的指针形状随旋转角换，移动拖到画布边缘时逐帧派发 pan-request，选中项跟着平移后的视口走；尺寸徽标的排位、定宽与按格计的换算；
// 窄画布里选中工具条与尺寸徽标都不出画布，工具条放不下的钮收进「更多」。
import type { IconRecord } from '@xihan-ui/core'
import type { Viewport } from '@xihan-ui/designer-kit'
import type { DesignerCommandTable, DesignerTransformEventMap, XhDesignerTransformElement } from '../../src'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { userEvent } from 'vitest/browser'
import { createCommandToolbar, defineDesignerShell } from '../../src'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'
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

  it('上下文工具条落在选中框上方居中、让开旋转柄，贴顶时翻到下方，左右不出覆盖层；接指针；移动中收起、松手再出现', async () => {
    const bar = document.createElement('div')
    bar.slot = 'toolbar'
    bar.style.cssText = 'display:flex'
    const button = document.createElement('button')
    button.type = 'button'
    button.textContent = 'Bold'
    let clicks = 0
    button.addEventListener('click', () => clicks++)
    bar.append(button)
    overlay.append(bar)
    overlay.items = [{ id: 'a', rect: { x: 100, y: 80, width: 100, height: 50 }, rotatable: true }]
    await new Promise(resolve => setTimeout(resolve))
    await overlay.updateComplete
    const toolbar = overlay.querySelector<HTMLElement>('[data-part="toolbar"]')!
    const frame = overlay.querySelector('[data-part="frame"]')!.getBoundingClientRect()
    let box = toolbar.getBoundingClientRect()
    const rotate = handle('rotate').getBoundingClientRect()
    expect(toolbar.dataset.placement).toBe('top')
    expect(box.bottom).toBeLessThanOrEqual(rotate.top + 1)
    expect(Math.abs((box.left + box.right) / 2 - (frame.left + frame.right) / 2)).toBeLessThanOrEqual(1)
    expect(getComputedStyle(toolbar).pointerEvents).toBe('auto')
    button.click()
    expect(clicks).toBe(1)

    overlay.items = [{ id: 'a', rect: { x: -20, y: -15, width: 60, height: 30 } }]
    await overlay.updateComplete
    const near = overlay.querySelector('[data-part="frame"]')!.getBoundingClientRect()
    box = toolbar.getBoundingClientRect()
    const host = overlay.getBoundingClientRect()
    expect(toolbar.dataset.placement).toBe('bottom')
    expect(box.top).toBeGreaterThanOrEqual(near.bottom)
    expect(box.left).toBeGreaterThanOrEqual(host.left)

    const center = { x: (near.left + near.right) / 2, y: (near.top + near.bottom) / 2 }
    const start = new PointerEvent('pointerdown', { bubbles: true, pointerId: 1, isPrimary: true, pointerType: 'mouse', button: 0, clientX: center.x, clientY: center.y })
    overlay.startMove(start)
    pointer(document, 'pointermove', center.x + 30, center.y + 30)
    await frames(2)
    await overlay.updateComplete
    expect(toolbar.hidden).toBe(true)
    pointer(document, 'pointerup', center.x + 30, center.y + 30)
    await overlay.updateComplete
    overlay.items = [{ id: 'a', rect: { x: 100, y: 80, width: 60, height: 30 } }]
    await overlay.updateComplete
    expect(toolbar.hidden).toBe(false)
  })
})

describe('<xh-designer-transform> 尺寸徽标（Chromium）', () => {
  it('常驻在选中框下方居中、接指针，数字框按内容定宽；工具条翻到下方时排在徽标下面，两者不重叠', async () => {
    overlay.measure = 'selection'
    overlay.measureOptions = { unit: 'mm' }
    overlay.items = [{ id: 'a', rect: { x: 100, y: 80, width: 100, height: 50 } }]
    await overlay.updateComplete
    await frames(2)
    const measure = overlay.querySelector<HTMLElement>('[data-part="measure"]')!
    const frame = overlay.querySelector('[data-part="frame"]')!.getBoundingClientRect()
    const badge = measure.getBoundingClientRect()
    const fields = Array.from(measure.querySelectorAll('[data-part="measure-field"]'), field => field.getBoundingClientRect())
    expect(getComputedStyle(measure).pointerEvents).toBe('auto')
    expect(badge.top).toBeGreaterThanOrEqual(frame.bottom)
    expect(Math.abs((badge.left + badge.right) / 2 - (frame.left + frame.right) / 2)).toBeLessThanOrEqual(1)
    expect(fields).toHaveLength(2)
    for (const field of fields)
      expect(field.width).toBeLessThan(160)
    expect(Math.abs(fields[0]!.top - fields[1]!.top)).toBeLessThanOrEqual(1)

    const bar = document.createElement('div')
    bar.slot = 'toolbar'
    bar.style.cssText = 'display:flex'
    bar.innerHTML = '<button type="button">Copy</button>'
    overlay.append(bar)
    overlay.items = [{ id: 'a', rect: { x: -20, y: -15, width: 60, height: 30 } }]
    await new Promise(resolve => setTimeout(resolve))
    await overlay.updateComplete
    await frames(2)
    const toolbar = overlay.querySelector<HTMLElement>('[data-part="toolbar"]')!
    expect(toolbar.dataset.placement).toBe('bottom')
    expect(toolbar.getBoundingClientRect().top).toBeGreaterThanOrEqual(measure.getBoundingClientRect().bottom)
  })

  it('给了 convert 按格计：两轴的距与间隙不同，点加号与键盘步进一格，输入格数按 Enter 后换回模型的长度', async () => {
    // 列距 100、列间隙 10，行距 40、行间隙 8
    const pitch = { width: 100, height: 40 }
    const gap = { width: 10, height: 8 }
    overlay.measure = 'selection'
    overlay.measureOptions = {
      convert: { toDisplay: (value, axis) => (value + gap[axis]) / pitch[axis], toModel: (value, axis) => value * pitch[axis] - gap[axis] },
      unitLabel: 'cells',
      fractionDigits: 0,
    }
    overlay.viewport = { x: 0, y: 0, zoom: 1 }
    overlay.items = [{ id: 'card', rect: { x: 0, y: 0, width: 390, height: 152 }, minSize: { width: 90, height: 32 } }]
    await overlay.updateComplete
    await frames(2)
    const seen: DesignerTransformEventMap['measure-change']['detail'][] = []
    overlay.addEventListener('measure-change', event => seen.push((event as DesignerTransformEventMap['measure-change']).detail))
    const field = (axis: string): HTMLElement => overlay.querySelector<HTMLElement>(`[data-part="measure-field"][data-axis="${axis}"]`)!
    const input = (axis: string): HTMLInputElement => field(axis).querySelector('input')!
    expect([input('width').value, input('height').value, overlay.querySelector('[data-part="measure-unit"]')!.textContent]).toEqual(['4', '4', 'cells'])
    await userEvent.hover(input('width'))
    await userEvent.click(field('width').querySelector<HTMLElement>('[data-part="increment-trigger"]')!)
    await userEvent.click(input('height'))
    await userEvent.keyboard('{ArrowDown}')
    await userEvent.tripleClick(input('width'))
    await userEvent.keyboard('7{Enter}')
    expect(seen.map(change => [change.axis, change.source, change.rect.width, change.rect.height])).toEqual([
      ['width', 'step', 490, 152],
      ['height', 'step', 390, 112],
      ['width', 'input', 690, 152],
    ])
  })
})

describe('<xh-designer-transform> 窄画布里的选中工具条与尺寸徽标（Chromium）', () => {
  const DOT: IconRecord = { name: 'dot', viewBox: '0 0 24 24', nodes: [{ tag: 'circle', attrs: { cx: '12', cy: '12', r: '6' } }] }

  /** 一条十二颗钮的命令工具条，与各款的选中工具条同一种做法。 */
  function commandBar(): HTMLElement {
    const bar = createCommandToolbar<undefined>(document)
    const commands: DesignerCommandTable<undefined> = new Map(Array.from({ length: 12 }, (_, index) => {
      const id = `command-${index}`
      return [id, { id, label: `Command ${index}`, icon: DOT, run: () => {} }] as const
    }))
    bar.update([[...commands.keys()]], commands, undefined, 'Selection')
    bar.element.slot = 'toolbar'
    return bar.element
  }

  it('工具条放不下时缩在画布里，多的钮收进「更多」；徽标在元素贴着画布左缘时也不被裁掉', async () => {
    canvas.style.width = '260px'
    overlay.measure = 'selection'
    overlay.measureOptions = { unit: 'mm' }
    overlay.viewport = { x: 0, y: 0, zoom: 1 }
    overlay.append(commandBar())
    overlay.items = [{ id: 'a', rect: { x: 4, y: 120, width: 40, height: 20 } }]
    await new Promise(resolve => setTimeout(resolve))
    await overlay.updateComplete
    await frames(4)
    await overlay.updateComplete
    const host = overlay.getBoundingClientRect()
    const toolbar = overlay.querySelector<HTMLElement>('[data-part="toolbar"]')!.getBoundingClientRect()
    expect(toolbar.left).toBeGreaterThanOrEqual(host.left)
    expect(toolbar.right).toBeLessThanOrEqual(host.right)
    const more = overlay.querySelector<HTMLElement>('[data-scope="toolbar"][data-part="overflow-trigger"]')!
    const moreBox = more.getBoundingClientRect()
    expect(more.hidden).toBe(false)
    expect(moreBox.width).toBeGreaterThan(0)
    expect(moreBox.right).toBeLessThanOrEqual(host.right)
    const shown = Array.from(overlay.querySelectorAll<HTMLElement>('[data-scope="toolbar"][data-part="item"]')).filter(item => !item.hidden)
    expect(shown.length).toBeLessThan(12)
    const measure = overlay.querySelector<HTMLElement>('[data-part="measure"]')!.getBoundingClientRect()
    expect(measure.left).toBeGreaterThanOrEqual(host.left)
    expect(measure.right).toBeLessThanOrEqual(host.right)

    overlay.items = [{ id: 'a', rect: { x: 210, y: 120, width: 40, height: 20 } }]
    await overlay.updateComplete
    await frames(2)
    await overlay.updateComplete
    const right = overlay.querySelector<HTMLElement>('[data-part="measure"]')!.getBoundingClientRect()
    expect(right.right).toBeLessThanOrEqual(host.right)
  })
})
