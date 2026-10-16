// 外框在真实 Chromium 里：区按缺省比例排开，拖动分隔条后区宽跟着变并派发 sizes-change；
// 收起再展开时保留拖过的大小；中间区始终填满剩下的空间。
import type { DesignerFrameEventMap, XhDesignerFrameElement } from '../../src'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { defineDesignerShell } from '../../src'
import '@xihan-ui/tokens/tokens.css'
import '../../style.css'

defineDesignerShell()

let frame: XhDesignerFrameElement

beforeEach(async () => {
  frame = document.createElement('xh-designer-frame')
  frame.style.cssText = 'position:fixed;left:20px;top:20px;width:1000px;height:600px'
  for (const name of ['toolbar', 'palette', 'properties', 'issues']) {
    const content = document.createElement('div')
    content.setAttribute('slot', name)
    content.style.cssText = name === 'toolbar' ? 'height:40px' : 'min-height:0'
    frame.append(content)
  }
  frame.append(document.createElement('div'))
  document.body.prepend(frame)
  await frame.updateComplete
  await new Promise(resolve => requestAnimationFrame(resolve))
})

afterEach(() => {
  frame.remove()
})

function width(name: string): number {
  return frame.querySelector(`[data-part="region"][data-region="${name}"]`)!.getBoundingClientRect().width
}

function pointer(target: EventTarget, type: string, x: number, y: number): void {
  target.dispatchEvent(new PointerEvent(type, { bubbles: true, cancelable: true, composed: true, pointerId: 1, isPrimary: true, pointerType: 'mouse', button: 0, buttons: type === 'pointerup' ? 0 : 1, clientX: x, clientY: y }))
}

async function drag(trigger: Element, dx: number, dy: number): Promise<void> {
  const box = trigger.getBoundingClientRect()
  const x = box.left + box.width / 2
  const y = box.top + box.height / 2
  pointer(trigger, 'pointerdown', x, y)
  pointer(document, 'pointermove', x + dx / 2, y + dy / 2)
  pointer(document, 'pointermove', x + dx, y + dy)
  pointer(document, 'pointerup', x + dx, y + dy)
  await frame.updateComplete
  await new Promise(resolve => requestAnimationFrame(resolve))
}

function rowTriggers(): Element[] {
  const row = frame.querySelector('[data-part="splitter"][data-orientation="horizontal"]')!
  return Array.from(row.querySelectorAll(':scope > div > [data-xh-part="resize-trigger"]'))
}

describe('<xh-designer-frame>（Chromium）', () => {
  it('左中右按缺省比例排开，中间区填满；工具栏在上方占满宽度', () => {
    const body = frame.querySelector('[data-part="body"]')!.getBoundingClientRect()
    expect(width('palette') / body.width).toBeCloseTo(0.18, 1)
    expect(width('properties') / body.width).toBeCloseTo(0.24, 1)
    expect(width('palette') + width('canvas') + width('properties')).toBeLessThanOrEqual(body.width + 1)
    expect(width('canvas')).toBeGreaterThan(body.width * 0.5)
    expect(width('toolbar')).toBeCloseTo(1000, 0)
  })

  it('拖动分隔条后区宽跟着变，派发 sizes-change；收起再展开时保留拖过的大小', async () => {
    const seen: DesignerFrameEventMap['sizes-change']['detail'][] = []
    frame.addEventListener('sizes-change', event => seen.push((event as DesignerFrameEventMap['sizes-change']).detail))
    const before = width('palette')
    const canvasBefore = width('canvas')
    await drag(rowTriggers()[0]!, 100, 0)
    expect(width('palette')).toBeCloseTo(before + 100, -1)
    expect(width('canvas')).toBeCloseTo(canvasBefore - 100, -1)
    expect(seen.length).toBeGreaterThan(0)
    const body = frame.querySelector('[data-part="body"]')!.getBoundingClientRect()
    expect(seen.at(-1)!.sizes.start! / 100).toBeCloseTo(width('palette') / body.width, 1)

    const dragged = width('palette')
    frame.panels = 'toolbar properties issues'
    await frame.updateComplete
    expect(frame.querySelector('[data-region="palette"]')).toBeNull()
    frame.panels = undefined
    await frame.updateComplete
    await new Promise(resolve => requestAnimationFrame(resolve))
    expect(width('palette')).toBeCloseTo(dragged, -1)
  })

  it('下方的问题区在中间一列里，可上下拖动', async () => {
    const issues = frame.querySelector('[data-region="issues"]')!.getBoundingClientRect()
    const canvas = frame.querySelector('[data-region="canvas"]')!.getBoundingClientRect()
    expect(issues.top).toBeGreaterThanOrEqual(canvas.bottom - 1)
    expect(issues.left).toBeCloseTo(canvas.left, 0)
    const column = frame.querySelector('[data-part="splitter"][data-orientation="vertical"]')!
    const trigger = column.querySelector(':scope > div > [data-xh-part="resize-trigger"]')!
    const before = issues.height
    await drag(trigger, 0, -60)
    expect(frame.querySelector('[data-region="issues"]')!.getBoundingClientRect().height).toBeCloseTo(before + 60, -1)
  })
})
