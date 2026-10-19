// 外框的面板布局在真实 Chromium 里：按住面板头拖到外框边上换栏、拖进一栏两块面板之间调序、拖到画布上浮出；
// 浮出的小窗夹在外框里，挪完停一会儿派发 layout-change；收成标题条的面板只占面板头的高度，一栏全收起时几条面板头贴着栏顶。
import type { DesignerFrameEventMap, DesignerLayoutChangeReason, ResolvedDesignerLayout, XhDesignerFrameElement } from '../../src'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { defineDesignerShell } from '../../src'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'
import '../../style.css'

defineDesignerShell()

let frame: XhDesignerFrameElement
let seen: { layout: ResolvedDesignerLayout, reason: DesignerLayoutChangeReason }[]

async function settle(): Promise<void> {
  for (let round = 0; round < 3; round++) {
    await frame.updateComplete
    await new Promise(resolve => requestAnimationFrame(resolve))
  }
}

beforeEach(async () => {
  frame = document.createElement('xh-designer-frame')
  frame.style.cssText = 'position:fixed;left:20px;top:20px;width:1100px;height:640px'
  frame.regions = [
    { name: 'toolbar', position: 'top' },
    { name: 'palette', position: 'start', title: '物料' },
    { name: 'outline', position: 'start', title: '结构' },
    { name: 'canvas', position: 'center' },
    { name: 'properties', position: 'end', title: '属性' },
    { name: 'issues', position: 'bottom', title: '问题' },
  ]
  for (const name of ['toolbar', 'palette', 'outline', 'properties', 'issues']) {
    const content = document.createElement('div')
    content.setAttribute('slot', name)
    content.textContent = name
    content.style.cssText = name === 'toolbar' ? 'height:40px' : 'min-height:0'
    frame.append(content)
  }
  frame.append(document.createElement('div'))
  seen = []
  frame.addEventListener('layout-change', event => seen.push((event as DesignerFrameEventMap['layout-change']).detail))
  document.body.prepend(frame)
  await settle()
})

afterEach(() => {
  frame.remove()
})

function region(name: string): HTMLElement {
  return frame.querySelector<HTMLElement>(`[data-part="region"][data-region="${name}"]`)!
}

function headerOf(name: string): HTMLElement {
  return region(name).querySelector<HTMLElement>(':scope > [data-part="panel-header"]')!
}

function pointer(target: EventTarget, type: string, x: number, y: number): void {
  target.dispatchEvent(new PointerEvent(type, { bubbles: true, cancelable: true, composed: true, pointerId: 1, isPrimary: true, pointerType: 'mouse', button: 0, buttons: type === 'pointerup' ? 0 : 1, clientX: x, clientY: y }))
}

/** 按住面板头的标题处拖到 (x, y) 松手。 */
async function dragHeader(name: string, x: number, y: number): Promise<void> {
  const title = headerOf(name).querySelector('[data-part="panel-title"]')!.getBoundingClientRect()
  const startX = title.left + 4
  const startY = title.top + title.height / 2
  pointer(headerOf(name), 'pointerdown', startX, startY)
  pointer(document, 'pointermove', startX + 12, startY + 12)
  pointer(document, 'pointermove', (startX + x) / 2, (startY + y) / 2)
  pointer(document, 'pointermove', x, y)
  await new Promise(resolve => requestAnimationFrame(resolve))
  pointer(document, 'pointermove', x, y)
  pointer(document, 'pointerup', x, y)
  await settle()
}

function stackOf(name: string): string | null {
  return region(name).closest('[data-part="stack"]')?.getAttribute('data-position') ?? null
}

describe('<xh-designer-frame> 面板布局（Chromium）', () => {
  it('把右栏的面板拖到外框左边的停靠条上：停到左栏末尾，派发 move', async () => {
    const body = frame.querySelector('[data-part="body"]')!.getBoundingClientRect()
    await dragHeader('properties', body.left + 6, body.top + body.height / 2)
    expect(stackOf('properties')).toBe('start')
    expect(seen.map(change => [change.reason, change.layout.docks.start])).toEqual([['move', ['palette', 'outline', 'properties']]])
    // 右栏空了就不出
    expect(frame.querySelector('[data-part="stack"][data-position="end"]')).toBeNull()
    expect(frame.hasAttribute('data-panel-drag')).toBe(false)
  })

  it('拖进一栏两块面板之间：插在那里，落点线只在拖动中出现', async () => {
    const palette = region('palette').getBoundingClientRect()
    const title = headerOf('properties').querySelector('[data-part="panel-title"]')!.getBoundingClientRect()
    pointer(headerOf('properties'), 'pointerdown', title.left + 4, title.top + 4)
    pointer(document, 'pointermove', title.left + 20, title.top + 20)
    pointer(document, 'pointermove', palette.left + palette.width / 2, palette.bottom - 8)
    await new Promise(resolve => requestAnimationFrame(resolve))
    pointer(document, 'pointermove', palette.left + palette.width / 2, palette.bottom - 8)
    const line = frame.querySelector<HTMLElement>('[data-part="drop-line"]')!
    expect([frame.hasAttribute('data-panel-drag'), line.hidden, line.getAttribute('data-kind')]).toEqual([true, false, 'dock'])
    pointer(document, 'pointerup', palette.left + palette.width / 2, palette.bottom - 8)
    await settle()
    expect(seen.at(-1)!.layout.docks.start).toEqual(['palette', 'properties', 'outline'])
    expect(Array.from(frame.querySelectorAll('[data-part="stack"][data-position="start"] [data-part="region"]'), node => node.getAttribute('data-region'))).toEqual(['palette', 'properties', 'outline'])
    expect([frame.hasAttribute('data-panel-drag'), line.hidden]).toEqual([false, true])
  })

  it('拖到画布上松手：在松手处浮出成小窗，卡片搬进小窗，小窗的位置按外框算', async () => {
    const canvas = region('canvas').getBoundingClientRect()
    const x = canvas.left + canvas.width / 2
    const y = canvas.top + canvas.height / 2
    await dragHeader('properties', x, y)
    const float = frame.querySelector<HTMLElement>('xh-floating-panel[data-part="float"][data-region="properties"]')!
    expect(float).not.toBeNull()
    const change = seen.at(-1)!
    expect(change.reason).toBe('float')
    const rect = change.layout.floating.properties!
    const content = float.querySelector('[data-xh-part="content"]')!.getBoundingClientRect()
    const box = frame.getBoundingClientRect()
    expect([Math.round(content.left - box.left), Math.round(content.top - box.top)]).toEqual([rect.x, rect.y])
    expect(content.left).toBeLessThan(x)
    expect(content.top).toBeLessThan(y)
    expect(region('properties').closest('xh-floating-panel')).toBe(float)
  })

  it('浮出的小窗挪出外框时夹回框内，停一会儿派发一次 float', async () => {
    frame.floatPanel('properties', { x: 100, y: 100, width: 260, height: 200 })
    await settle()
    seen.length = 0
    const float = frame.querySelector<HTMLElement>('xh-floating-panel[data-part="float"]')!
    const handle = float.querySelector<HTMLElement>('[data-xh-part="drag-trigger"]')!.getBoundingClientRect()
    const x = handle.left + handle.width / 2
    const y = handle.top + handle.height / 2
    pointer(float.querySelector('[data-xh-part="drag-trigger"]')!, 'pointerdown', x, y)
    pointer(document, 'pointermove', x - 50, y - 50)
    pointer(document, 'pointermove', x - 600, y - 600)
    pointer(document, 'pointerup', x - 600, y - 600)
    await settle()
    const box = frame.getBoundingClientRect()
    const content = float.querySelector('[data-xh-part="content"]')!.getBoundingClientRect()
    expect([Math.round(content.left), Math.round(content.top)]).toEqual([Math.round(box.left), Math.round(box.top)])
    expect(seen).toEqual([])
    await new Promise(resolve => setTimeout(resolve, 400))
    expect(seen.map(change => [change.reason, change.layout.floating.properties])).toEqual([['float', { x: 0, y: 0, width: 260, height: 200 }]])
  })

  it('收成标题条的面板只占面板头的高度，同一栏的另一块占满其余；一栏全收起时两条面板头贴着栏顶', async () => {
    const stack = (): DOMRect => frame.querySelector('[data-part="stack"][data-position="start"]')!.getBoundingClientRect()
    frame.setPanelMinimized('palette', true)
    await settle()
    const header = headerOf('palette').getBoundingClientRect().height
    const palette = region('palette').getBoundingClientRect()
    const outline = region('outline').getBoundingClientRect()
    expect(palette.height).toBeLessThan(header + 24)
    expect(palette.height).toBeGreaterThanOrEqual(header - 1)
    expect(outline.top).toBeGreaterThanOrEqual(palette.bottom - 1)
    expect(outline.height).toBeGreaterThan(stack().height - header - 48)
    expect(getComputedStyle(region('palette').querySelector('[data-part="panel-body"]')!).display).toBe('none')

    frame.setPanelMinimized('outline', true)
    await settle()
    const top = stack().top
    expect(region('palette').getBoundingClientRect().top - top).toBeLessThan(16)
    expect(region('outline').getBoundingClientRect().top).toBeLessThan(region('palette').getBoundingClientRect().bottom + 24)
    expect(region('outline').getBoundingClientRect().bottom).toBeLessThan(top + header * 2 + 48)
  })

  it('下栏只有一块面板且收成了标题条：下栏只剩面板头那么高，画布多出来', async () => {
    const canvasBefore = region('canvas').getBoundingClientRect().height
    frame.setPanelMinimized('issues', true)
    await settle()
    const header = headerOf('issues').getBoundingClientRect().height
    expect(region('issues').getBoundingClientRect().height).toBeLessThan(header + 24)
    expect(region('issues').getBoundingClientRect().height).toBeGreaterThanOrEqual(header - 1)
    expect(region('canvas').getBoundingClientRect().height).toBeGreaterThan(canvasBefore + 40)
  })
})
