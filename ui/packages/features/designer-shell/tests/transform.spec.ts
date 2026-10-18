// @vitest-environment jsdom

import type { DesignerTransformEventMap, DesignerTransformItem, XhDesignerTransformElement } from '../src'
import { afterEach, describe, expect, it } from 'vitest'
import { defineDesignerShell } from '../src'

defineDesignerShell()

afterEach(() => {
  document.body.innerHTML = ''
})

const box: DesignerTransformItem = { id: 'a', rect: { x: 10, y: 20, width: 100, height: 50 } }

async function mount(setup: (overlay: XhDesignerTransformElement) => void = () => {}): Promise<XhDesignerTransformElement> {
  const overlay = document.createElement('xh-designer-transform')
  overlay.viewport = { x: 0, y: 0, zoom: 2 }
  setup(overlay)
  document.body.append(overlay)
  await overlay.updateComplete
  return overlay
}

function part(overlay: Element, name: string): HTMLElement {
  return overlay.querySelector<HTMLElement>(`[data-part="${name}"]`)!
}

function handle(overlay: Element, name: string): HTMLElement {
  return overlay.querySelector<HTMLElement>(`[data-part="handle"][data-handle="${name}"]`)!
}

function pointer(type: string, x: number, y: number, init: PointerEventInit = {}): PointerEvent {
  return new PointerEvent(type, { bubbles: true, cancelable: true, pointerId: 1, isPrimary: true, button: 0, clientX: x, clientY: y, ...init })
}

function move(x: number, y: number, init: PointerEventInit = {}): void {
  document.dispatchEvent(pointer('pointermove', x, y, init))
}

function up(x: number, y: number, init: PointerEventInit = {}): void {
  document.dispatchEvent(pointer('pointerup', x, y, init))
}

type TransformDetail = DesignerTransformEventMap['transform']['detail']

function record(overlay: Element): TransformDetail[] {
  const seen: TransformDetail[] = []
  overlay.addEventListener('transform', event => seen.push((event as DesignerTransformEventMap['transform']).detail))
  return seen
}

function rectOf(detail: TransformDetail | undefined, id = 'a') {
  return detail?.rects.get(id)
}

describe('<xh-designer-transform>', () => {
  it('按视口把选中框画到屏幕坐标，绕中心旋转；画的部件 aria-hidden，容器带生成标记', async () => {
    const overlay = await mount(element => element.items = [{ id: 'a', rect: { x: 10, y: 20, width: 100, height: 50, rotation: 30 } }])
    expect(overlay.hasAttribute('aria-hidden')).toBe(false)
    expect(Array.from(overlay.children).every(child => child.hasAttribute('data-xh-gen'))).toBe(true)
    expect(Array.from(overlay.children).filter(child => child.getAttribute('aria-hidden') !== 'true').map(child => child.getAttribute('data-part'))).toEqual(['toolbar'])
    const frame = part(overlay, 'frame')
    expect(frame.style.inlineSize).toBe('200px')
    expect(frame.style.blockSize).toBe('100px')
    expect(frame.style.transform).toBe('translate(20px, 40px) rotate(30deg)')
    expect(part(overlay, 'bounds').hidden).toBe(true)
  })

  it('多选时各自画细框，另画整体包围框；每项都能八向缩放时包围框上出八个控制柄，不出旋转柄', async () => {
    const overlay = await mount(element => element.items = [{ ...box, rotatable: true }, { id: 'b', rect: { x: 200, y: 20, width: 50, height: 50 } }])
    expect(overlay.querySelectorAll('[data-part="frame"]')).toHaveLength(2)
    const bounds = part(overlay, 'bounds')
    expect(bounds.hidden).toBe(false)
    expect(bounds.style.inlineSize).toBe('480px')
    const shown = (): string[] => Array.from(overlay.querySelectorAll<HTMLElement>('[data-part="handle"]')).filter(element => !element.hidden).map(element => element.dataset.handle!)
    expect(shown()).toEqual(['nw', 'n', 'ne', 'e', 'se', 's', 'sw', 'w'])
    expect(handle(overlay, 'se').style.transform).toBe('translate(500px, 140px) translate(-50%, -50%) rotate(0deg)')
    overlay.items = [box, { id: 'b', rect: { x: 200, y: 20, width: 50, height: 50 }, handles: ['e', 'w'] }]
    await overlay.updateComplete
    expect(shown()).toEqual([])
    overlay.items = [box, { id: 'b', rect: { x: 200, y: 20, width: 50, height: 50 } }]
    overlay.readonly = true
    await overlay.updateComplete
    expect(shown()).toEqual([])
  })

  it('单选按每项能力出控制柄；指针形状随旋转角换；只读时不出控制柄', async () => {
    const overlay = await mount(element => element.items = [{ ...box, handles: ['e', 'w'], rotatable: true }])
    const shown = Array.from(overlay.querySelectorAll<HTMLElement>('[data-part="handle"]')).filter(element => !element.hidden).map(element => element.dataset.handle)
    expect(shown).toEqual(['e', 'w', 'rotate'])
    expect(handle(overlay, 'e').dataset.cursor).toBe('ew')
    expect(handle(overlay, 'e').style.transform).toBe('translate(220px, 90px) translate(-50%, -50%) rotate(0deg)')
    expect(handle(overlay, 'rotate').style.transform).toBe('translate(120px, 16px) translate(-50%, -50%) rotate(0deg)')
    overlay.items = [{ id: 'a', rect: { ...box.rect, rotation: 90 } }]
    await overlay.updateComplete
    expect(handle(overlay, 'e').dataset.cursor).toBe('ns')
    expect(handle(overlay, 'ne').dataset.cursor).toBe('nwse')
    expect(handle(overlay, 'rotate').hidden).toBe(true)
    overlay.readonly = true
    await overlay.updateComplete
    expect(Array.from(overlay.querySelectorAll<HTMLElement>('[data-part="handle"]')).every(element => element.hidden)).toBe(true)
  })

  it('startMove 越过激活距离才开始，按世界坐标移动全部选中项，松手派发 end', async () => {
    const overlay = await mount(element => element.items = [box, { id: 'b', rect: { x: 200, y: 0, width: 10, height: 10 } }])
    const seen = record(overlay)
    overlay.startMove(pointer('pointerdown', 100, 100))
    move(101, 101)
    expect(seen).toEqual([])
    move(120, 110)
    expect(seen.map(detail => detail.phase)).toEqual(['start', 'move'])
    expect(rectOf(seen[0])).toEqual(box.rect)
    expect(rectOf(seen[1])).toEqual({ x: 20, y: 25, width: 100, height: 50 })
    expect(rectOf(seen[1], 'b')).toEqual({ x: 210, y: 5, width: 10, height: 10 })
    expect(seen[1]!.copy).toBe(false)
    await overlay.updateComplete
    expect(part(overlay, 'frame').style.transform).toBe('translate(40px, 50px) rotate(0deg)')
    up(140, 100)
    expect(seen.at(-1)!.phase).toBe('end')
    expect(rectOf(seen.at(-1))).toEqual({ x: 30, y: 20, width: 100, height: 50 })
    move(200, 200)
    expect(seen.at(-1)!.phase).toBe('end')
  })

  it('移动时 Shift 锁定水平或竖直、Alt 为复制，修饰键在拖动中按下也算', async () => {
    const overlay = await mount(element => element.items = [box])
    const seen = record(overlay)
    overlay.startMove(pointer('pointerdown', 100, 100))
    move(140, 110, { shiftKey: true })
    expect(rectOf(seen.at(-1))).toEqual({ x: 30, y: 20, width: 100, height: 50 })
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Alt', altKey: true, bubbles: true, cancelable: true }))
    expect(seen.at(-1)!.copy).toBe(true)
    expect(rectOf(seen.at(-1))).toEqual({ x: 30, y: 25, width: 100, height: 50 })
    up(140, 110, { altKey: true })
    expect(seen.at(-1)).toMatchObject({ phase: 'end', copy: true })
  })

  it('吸附选项在手势开始时取一次，阈值按屏幕像素除以 zoom；对齐线画到屏幕坐标', async () => {
    const kinds: string[] = []
    const overlay = await mount((element) => {
      element.items = [box]
      element.getSnap = (kind) => {
        kinds.push(kind)
        return { targets: [{ x: 120, y: 200, width: 10, height: 10 }] }
      }
    })
    const seen = record(overlay)
    overlay.startMove(pointer('pointerdown', 100, 100))
    move(118, 100)
    expect(rectOf(seen.at(-1))).toEqual({ x: 20, y: 20, width: 100, height: 50 })
    move(112, 100)
    expect(rectOf(seen.at(-1))!.x).toBe(16)
    expect(seen.at(-1)!.guides).toEqual([])
    move(118, 100)
    expect(seen.at(-1)!.guides).toEqual([{ axis: 'x', position: 120, from: 20, to: 210 }])
    await overlay.updateComplete
    const guide = part(overlay, 'guide')
    expect(guide.dataset.axis).toBe('x')
    expect(guide.style.transform).toBe('translate(240px, 40px)')
    expect(guide.style.blockSize).toBe('380px')
    up(118, 100)
    expect(kinds).toEqual(['move'])
    await overlay.updateComplete
    expect(overlay.querySelector('[data-part="guide"]')).toBeNull()
  })

  it('按 Esc 取消，派发 cancel 并带开始时的矩形，选中框回到原处', async () => {
    const overlay = await mount(element => element.items = [box])
    const seen = record(overlay)
    overlay.startMove(pointer('pointerdown', 100, 100))
    move(150, 150)
    const escape = new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true })
    document.dispatchEvent(escape)
    expect(escape.defaultPrevented).toBe(true)
    expect(seen.at(-1)).toMatchObject({ phase: 'cancel', kind: 'move' })
    expect(rectOf(seen.at(-1))).toEqual(box.rect)
    await overlay.updateComplete
    expect(part(overlay, 'frame').style.transform).toBe('translate(20px, 40px) rotate(0deg)')
    up(150, 150)
    expect(seen.at(-1)!.phase).toBe('cancel')
  })

  it('拖动缩放控制柄：对边不动，Shift 等比、Alt 以中心为基准，不小于 minSize', async () => {
    const overlay = await mount(element => element.items = [{ ...box, minSize: { width: 20, height: 20 } }])
    const seen = record(overlay)
    const east = handle(overlay, 'e')
    const down = pointer('pointerdown', 220, 90)
    east.dispatchEvent(down)
    expect(down.defaultPrevented).toBe(true)
    move(260, 90)
    expect(seen.at(-1)).toMatchObject({ phase: 'move', kind: 'resize' })
    expect(rectOf(seen.at(-1))).toEqual({ x: 10, y: 20, width: 120, height: 50 })
    await overlay.updateComplete
    expect(Array.from(overlay.querySelectorAll<HTMLElement>('[data-part="handle"]')).filter(element => !element.hidden).map(element => element.dataset.handle)).toEqual(['e'])
    move(260, 90, { altKey: true })
    expect(rectOf(seen.at(-1))).toEqual({ x: -10, y: 20, width: 140, height: 50 })
    move(0, 90)
    expect(rectOf(seen.at(-1))!.width).toBe(20)
    up(0, 90)
    const corner = handle(overlay, 'se')
    overlay.items = [box]
    await overlay.updateComplete
    corner.dispatchEvent(pointer('pointerdown', 220, 140))
    move(260, 140, { shiftKey: true })
    expect(rectOf(seen.at(-1))).toEqual({ x: 10, y: 20, width: 120, height: 60 })
    up(260, 140, { shiftKey: true })
    expect(seen.at(-1)).toMatchObject({ phase: 'end', kind: 'resize' })
    expect(seen.at(-1)!.copy).toBeUndefined()
  })

  it('多选拖动整体控制柄：按包围框等比缩放全部选中项，旋转角不变，Alt 以中心为基准，任一项不小于 minSize', async () => {
    const other: DesignerTransformItem = { id: 'b', rect: { x: 200, y: 20, width: 50, height: 50, rotation: 90 }, minSize: { width: 25, height: 25 } }
    const overlay = await mount(element => element.items = [box, other])
    const seen = record(overlay)
    handle(overlay, 'se').dispatchEvent(pointer('pointerdown', 500, 140))
    move(740, 140)
    expect(seen.at(-1)).toMatchObject({ phase: 'move', kind: 'resize' })
    expect(rectOf(seen.at(-1))).toEqual({ x: 10, y: 20, width: 150, height: 75 })
    expect(rectOf(seen.at(-1), 'b')).toEqual({ x: 295, y: 20, width: 75, height: 75, rotation: 90 })
    await overlay.updateComplete
    expect(part(overlay, 'bounds').style.inlineSize).toBe('720px')
    expect(Array.from(overlay.querySelectorAll<HTMLElement>('[data-part="handle"]')).filter(element => !element.hidden).map(element => element.dataset.handle)).toEqual(['se'])
    move(740, 140, { altKey: true })
    expect(rectOf(seen.at(-1))).toEqual({ x: -110, y: -5, width: 200, height: 100 })
    expect(rectOf(seen.at(-1), 'b')).toEqual({ x: 270, y: -5, width: 100, height: 100, rotation: 90 })
    move(20, 40)
    expect(rectOf(seen.at(-1))).toEqual({ x: 10, y: 20, width: 50, height: 25 })
    expect(rectOf(seen.at(-1), 'b')).toEqual({ x: 105, y: 20, width: 25, height: 25, rotation: 90 })
    up(20, 40)
    expect(seen.at(-1)).toMatchObject({ phase: 'end', kind: 'resize' })
    expect([...seen.at(-1)!.rects.keys()]).toEqual(['a', 'b'])
  })

  it('拖动旋转柄得到旋转角，Shift 按 rotateStep 吸附', async () => {
    const overlay = await mount((element) => {
      element.items = [{ ...box, rotatable: true }]
      element.rotateStep = 45
    })
    const seen = record(overlay)
    handle(overlay, 'rotate').dispatchEvent(pointer('pointerdown', 120, 16))
    move(220, 90)
    expect(seen.at(-1)).toMatchObject({ phase: 'move', kind: 'rotate' })
    expect(rectOf(seen.at(-1))!.rotation).toBeCloseTo(90)
    move(200, 20, { shiftKey: true })
    expect(rectOf(seen.at(-1))!.rotation).toBe(45)
    up(200, 20, { shiftKey: true })
    expect(seen.at(-1)!.phase).toBe('end')
  })

  it('startMarquee 派发 marquee：选框为世界坐标，方向决定包住还是碰到；只读时照常可框选', async () => {
    const overlay = await mount(element => element.readonly = true)
    const seen: DesignerTransformEventMap['marquee']['detail'][] = []
    overlay.addEventListener('marquee', event => seen.push((event as DesignerTransformEventMap['marquee']).detail))
    overlay.startMarquee(pointer('pointerdown', 100, 100), { additive: true })
    move(140, 120)
    expect(seen.map(detail => detail.phase)).toEqual(['start', 'move'])
    expect(seen[1]).toEqual({ phase: 'move', rect: { x: 50, y: 50, width: 20, height: 10 }, mode: 'contain', additive: true })
    await overlay.updateComplete
    const marquee = part(overlay, 'marquee')
    expect(marquee.hidden).toBe(false)
    expect(marquee.style.inlineSize).toBe('40px')
    move(60, 120)
    expect(seen.at(-1)!.mode).toBe('intersect')
    up(60, 120)
    expect(seen.at(-1)!.phase).toBe('end')
    await overlay.updateComplete
    expect(part(overlay, 'marquee').hidden).toBe(true)
  })

  it('只读时 startMove 不起作用；悬停框不在手势中显示；度量标签取 formatMeasure', async () => {
    const overlay = await mount((element) => {
      element.items = [box]
      element.hover = { x: 0, y: 0, width: 10, height: 10 }
      element.formatMeasure = rect => `${rect.width} × ${rect.height}`
    })
    expect(part(overlay, 'hover').hidden).toBe(false)
    expect(part(overlay, 'measure').hidden).toBe(true)
    overlay.startMove(pointer('pointerdown', 0, 0))
    move(20, 0)
    await overlay.updateComplete
    expect(part(overlay, 'hover').hidden).toBe(true)
    expect(overlay.dataset.gesture).toBe('move')
    const measure = part(overlay, 'measure')
    expect(measure.textContent).toBe('100 × 50')
    expect(measure.style.transform).toBe('translate(140px, 140px) translate(-50%, 0)')
    up(20, 0)
    await overlay.updateComplete
    expect(overlay.dataset.gesture).toBeUndefined()

    const seen = record(overlay)
    overlay.readonly = true
    overlay.startMove(pointer('pointerdown', 0, 0))
    move(40, 0)
    expect(seen).toEqual([])
  })

  it('上下文工具条：slot="toolbar" 的子节点挪进工具条部件，有选中才显示；只读、没有选中或没有内容时收起；后放进来的也挪进去', async () => {
    const bar = document.createElement('div')
    bar.slot = 'toolbar'
    bar.innerHTML = '<button type="button">B</button>'
    const overlay = await mount((element) => {
      element.append(bar)
      element.items = [box]
    })
    const toolbar = part(overlay, 'toolbar')
    expect([bar.parentElement, toolbar.hidden, toolbar.hasAttribute('aria-hidden')]).toEqual([toolbar, false, false])
    overlay.readonly = true
    await overlay.updateComplete
    expect(toolbar.hidden).toBe(true)
    overlay.readonly = false
    overlay.items = []
    await overlay.updateComplete
    expect(toolbar.hidden).toBe(true)
    bar.remove()
    overlay.items = [box]
    await overlay.updateComplete
    expect(toolbar.hidden).toBe(true)
    const later = document.createElement('div')
    later.slot = 'toolbar'
    later.innerHTML = '<button type="button">I</button>'
    overlay.append(later)
    await new Promise(resolve => setTimeout(resolve))
    await overlay.updateComplete
    expect([later.parentElement, toolbar.hidden]).toEqual([toolbar, false])
  })

  it('focusToolbar 先交给 roving 的当前条目；在工具条里按 Esc 焦点回到交之前的位置；收起时什么都不做', async () => {
    const canvas = document.createElement('div')
    canvas.tabIndex = 0
    document.body.append(canvas)
    const bar = document.createElement('div')
    bar.slot = 'toolbar'
    bar.innerHTML = '<button type="button" tabindex="-1">A</button><button type="button" tabindex="0">B</button>'
    const overlay = await mount((element) => {
      element.append(bar)
      element.items = [box]
    })
    canvas.focus()
    expect(overlay.focusToolbar()).toBe(true)
    expect(document.activeElement!.textContent).toBe('B')
    document.activeElement!.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true }))
    expect(document.activeElement).toBe(canvas)
    overlay.items = []
    await overlay.updateComplete
    expect(overlay.focusToolbar()).toBe(false)
    expect(document.activeElement).toBe(canvas)
  })
})
