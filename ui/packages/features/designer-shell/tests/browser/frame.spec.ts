// 外框在真实 Chromium 里：区按缺省比例排开，拖动分隔条后区宽跟着变并派发 sizes-change；
// 收起再展开时保留拖过的大小；中间区始终填满剩下的空间；同一位置堆叠的区按分隔条等分，不随内容多少分高度。
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

  it('没有区的位置不占尺寸、不画边框：空的顶部条收起，左右与下方不留部件', async () => {
    const borders = (element: Element): number[] => {
      const style = getComputedStyle(element)
      return [style.borderTopWidth, style.borderRightWidth, style.borderBottomWidth, style.borderLeftWidth].map(Number.parseFloat)
    }
    const stacks: Readonly<Record<string, readonly string[]>> = { '': ['center'], 'palette': ['start', 'center'], 'properties': ['center', 'end'], 'issues': ['center', 'bottom'] }
    for (const [panels, expected] of Object.entries(stacks)) {
      frame.panels = panels
      await frame.updateComplete
      const top = frame.querySelector<HTMLElement>(':scope > [data-part="top"]')!
      expect(top.hidden).toBe(true)
      expect(getComputedStyle(top).display).toBe('none')
      expect(top.getBoundingClientRect().height).toBe(0)
      const body = frame.querySelector(':scope > [data-part="body"]')!.getBoundingClientRect()
      expect([body.top, body.height]).toEqual([20, 600])
      const positions = Array.from(frame.querySelectorAll<HTMLElement>('[data-part="stack"]'), stack => stack.dataset.position)
      expect(positions).toEqual(expected)
      for (const part of frame.querySelectorAll('[data-part="body"], [data-part="main"], [data-part="stack"], [data-part="region"]'))
        expect(borders(part)).toEqual([0, 0, 0, 0])
    }
    frame.panels = undefined
    await frame.updateComplete
    expect(getComputedStyle(frame.querySelector(':scope > [data-part="top"]')!).display).toBe('flex')
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

  it('从右到左时物料在右侧，往画布方向拖分隔条物料变宽', async () => {
    frame.setAttribute('dir', 'rtl')
    await new Promise(resolve => setTimeout(resolve))
    await frame.updateComplete
    await new Promise(resolve => requestAnimationFrame(resolve))
    const palette = frame.querySelector('[data-region="palette"]')!.getBoundingClientRect()
    const canvas = frame.querySelector('[data-region="canvas"]')!.getBoundingClientRect()
    expect(palette.left).toBeGreaterThan(canvas.left)
    const before = palette.width
    await drag(rowTriggers()[0]!, -100, 0)
    expect(width('palette')).toBeCloseTo(before + 100, -1)
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

  it('同一位置堆叠的两区缺省等分，内容多的不挤内容少的；拖动两区间的分隔条后高度跟着变，并进 sizes-change', async () => {
    frame.regions = [
      { name: 'toolbar', position: 'top' },
      { name: 'palette', position: 'start', size: 18 },
      { name: 'canvas', position: 'center' },
      { name: 'properties', position: 'end', size: 24 },
      { name: 'minimap', position: 'end' },
    ]
    frame.querySelector('[slot="properties"], [data-region="properties"] > div')!.replaceChildren(Object.assign(document.createElement('div'), { style: 'height:2000px' }))
    const minimap = document.createElement('div')
    minimap.setAttribute('slot', 'minimap')
    minimap.style.cssText = 'height:40px'
    frame.append(minimap)
    await frame.updateComplete
    await new Promise(resolve => requestAnimationFrame(resolve))
    const height = (name: string): number => frame.querySelector(`[data-part="region"][data-region="${name}"]`)!.getBoundingClientRect().height
    const stack = frame.querySelector('[data-part="stack"][data-position="end"]')!.getBoundingClientRect()
    expect(height('properties')).toBeCloseTo(height('minimap'), -1)
    expect(height('properties') + height('minimap')).toBeGreaterThan(stack.height - 20)
    expect(height('minimap')).toBeGreaterThan(200)

    const seen: DesignerFrameEventMap['sizes-change']['detail'][] = []
    frame.addEventListener('sizes-change', event => seen.push((event as DesignerFrameEventMap['sizes-change']).detail))
    const before = { properties: height('properties'), minimap: height('minimap') }
    const trigger = frame.querySelector('[data-part="stack"][data-position="end"] [data-xh-part="resize-trigger"]')!
    await drag(trigger, 0, 80)
    expect(height('properties')).toBeCloseTo(before.properties + 80, -1)
    expect(height('minimap')).toBeCloseTo(before.minimap - 80, -1)
    const shares = seen.at(-1)!.sizes.regions!
    expect(shares.properties! / 100).toBeCloseTo(height('properties') / (height('properties') + height('minimap')), 1)
  })
})
