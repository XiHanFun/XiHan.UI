// 外框在真实 Chromium 里：区按缺省比例排开，拖动分隔条后区宽跟着变，松手派发 layout-change；
// 隐藏再显示时保留拖过的大小；中间区始终填满剩下的空间；同一栏堆叠的面板按分隔条等分，不随内容多少分高度。
import type { DesignerFrameEventMap, ResolvedDesignerLayout, XhDesignerFrameElement } from '../../src'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { createStatusItem, defineDesignerShell, DESIGNER_FRAME_REGIONS } from '../../src'
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

/** 记下派发的 layout-change。 */
function layouts(): ResolvedDesignerLayout[] {
  const seen: ResolvedDesignerLayout[] = []
  frame.addEventListener('layout-change', event => seen.push((event as DesignerFrameEventMap['layout-change']).detail.layout))
  return seen
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
    frame.regions = DESIGNER_FRAME_REGIONS.filter(region => region.name !== 'toolbar')
    for (const [shown, expected] of Object.entries(stacks)) {
      frame.layout = { version: 1, hidden: ['palette', 'properties', 'issues'].filter(name => name !== shown) }
      await frame.updateComplete
      const top = frame.querySelector<HTMLElement>(':scope > [data-part="top"]')!
      expect(top.hidden).toBe(true)
      expect(getComputedStyle(top).display).toBe('none')
      expect(top.getBoundingClientRect().height).toBe(0)
      const body = frame.querySelector(':scope > [data-part="body"]')!.getBoundingClientRect()
      expect([body.top, body.height]).toEqual([20, 600])
      const positions = Array.from(frame.querySelectorAll<HTMLElement>('[data-part="stack"]'), stack => stack.dataset.position)
      expect(positions).toEqual(expected)
      for (const part of frame.querySelectorAll(':scope > [data-part="body"], :scope > [data-part="body"] :is([data-part="main"], [data-part="stack"], [data-part="region"])'))
        expect(borders(part)).toEqual([0, 0, 0, 0])
    }
    frame.regions = undefined
    frame.layout = undefined
    await frame.updateComplete
    expect(getComputedStyle(frame.querySelector(':scope > [data-part="top"]')!).display).toBe('flex')
  })

  it('拖动分隔条后区宽跟着变，松手派发 layout-change；隐藏再显示时保留拖过的大小', async () => {
    const seen = layouts()
    const before = width('palette')
    const canvasBefore = width('canvas')
    await drag(rowTriggers()[0]!, 100, 0)
    expect(width('palette')).toBeCloseTo(before + 100, -1)
    expect(width('canvas')).toBeCloseTo(canvasBefore - 100, -1)
    expect(seen.length).toBeGreaterThan(0)
    const body = frame.querySelector('[data-part="body"]')!.getBoundingClientRect()
    expect(seen.at(-1)!.sizes.start! / 100).toBeCloseTo(width('palette') / body.width, 1)

    const dragged = width('palette')
    frame.layout = { ...frame.resolvedLayout, hidden: ['palette'] }
    await frame.updateComplete
    expect(frame.querySelector('[data-region="palette"]')).toBeNull()
    frame.layout = { ...frame.resolvedLayout, hidden: [] }
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

  it('同一栏堆叠的两块面板缺省等分，内容多的不挤内容少的；拖动两块之间的分隔条后高度跟着变，松手并进 layout-change', async () => {
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

    const seen = layouts()
    const before = { properties: height('properties'), minimap: height('minimap') }
    const trigger = frame.querySelector('[data-part="stack"][data-position="end"] [data-xh-part="resize-trigger"]')!
    await drag(trigger, 0, 80)
    expect(height('properties')).toBeCloseTo(before.properties + 80, -1)
    expect(height('minimap')).toBeCloseTo(before.minimap - 80, -1)
    const shares = seen.at(-1)!.sizes.panels!
    expect(shares.properties! / 100).toBeCloseTo(height('properties') / (height('properties') + height('minimap')), 1)
  })

  it('堆叠面板之间的分隔条带名称，可用方向键调高度；回填含过期 id、合计不是 100 的份额时按比例排开', async () => {
    frame.regions = [
      { name: 'toolbar', position: 'top' },
      { name: 'canvas', position: 'center' },
      { name: 'properties', position: 'end', size: 24, label: '属性' },
      { name: 'minimap', position: 'end' },
    ]
    frame.translations = { resize: label => `调整「${label}」的大小` }
    frame.layout = { version: 1, sizes: { panels: { properties: 300, ghost: 40, minimap: 100 } } }
    await frame.updateComplete
    await new Promise(resolve => requestAnimationFrame(resolve))
    const height = (name: string): number => frame.querySelector(`[data-part="region"][data-region="${name}"]`)!.getBoundingClientRect().height
    const total = (): number => height('properties') + height('minimap')
    expect(height('properties') / total()).toBeCloseTo(0.75, 1)
    expect(frame.querySelector('[data-region="ghost"]')).toBeNull()

    const trigger = frame.querySelector<HTMLElement>('[data-part="stack"][data-position="end"] [data-xh-part="resize-trigger"]')!
    expect([trigger.getAttribute('role'), trigger.getAttribute('aria-label')]).toEqual(['separator', '调整「属性」的大小'])
    const seen = layouts()
    const before = height('properties')
    trigger.focus()
    trigger.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp', shiftKey: true, bubbles: true, cancelable: true }))
    await frame.updateComplete
    await new Promise(resolve => requestAnimationFrame(resolve))
    expect(height('properties')).toBeCloseTo(before - total() * 0.1, -1)
    expect(seen.at(-1)!.sizes.panels).toEqual({ properties: expect.closeTo(65, 0), minimap: expect.closeTo(35, 0) })
  })
  it('尺寸槽给的下限按外框的宽高折成百分比：外框窄时侧栏不小于槽的像素宽；在分隔条上按 Enter 收起，再按一次展开回来', async () => {
    frame.style.width = '800px'
    await new Promise(resolve => requestAnimationFrame(resolve))
    await frame.updateComplete
    await new Promise(resolve => requestAnimationFrame(resolve))
    const rem = Number.parseFloat(getComputedStyle(document.documentElement).fontSize)
    expect(width('palette')).toBeGreaterThanOrEqual(14 * rem - 1)
    expect(width('properties')).toBeGreaterThanOrEqual(18 * rem - 1)
    const trigger = rowTriggers()[0] as HTMLElement
    const enter = async (): Promise<void> => {
      trigger.focus()
      trigger.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true }))
      await frame.updateComplete
      await new Promise(resolve => requestAnimationFrame(resolve))
    }
    await enter()
    expect(width('palette')).toBeLessThan(1)
    await enter()
    expect(width('palette')).toBeGreaterThanOrEqual(14 * rem - 1)
  })

  it('给了标题的区画成卡片：承载面的底、描边与圆角，面板头在上、正文滚动；顶栏与状态栏有内容时各占一条', async () => {
    frame.regions = [
      { name: 'header', position: 'header' },
      { name: 'toolbar', position: 'top' },
      { name: 'palette', position: 'start', title: '物料', subtitle: '拖到画布上', help: '点一下放到视口中间' },
      { name: 'canvas', position: 'center' },
      { name: 'properties', position: 'end', title: '属性' },
      { name: 'issues', position: 'bottom', title: '问题' },
      { name: 'status', position: 'status' },
    ]
    const name = document.createElement('strong')
    name.slot = 'header-start'
    name.textContent = '流程设计器'
    const zoom = document.createElement('span')
    zoom.slot = 'status-end'
    zoom.textContent = '100%'
    frame.append(name, zoom)
    await new Promise(resolve => setTimeout(resolve))
    await frame.updateComplete
    await new Promise(resolve => requestAnimationFrame(resolve))
    const card = frame.querySelector<HTMLElement>('[data-part="region"][data-region="palette"]')!
    const style = getComputedStyle(card)
    expect([style.borderTopStyle, Number.parseFloat(style.borderTopWidth) > 0, Number.parseFloat(style.borderTopLeftRadius) > 0, style.overflow]).toEqual(['solid', true, true, 'hidden'])
    const header = card.querySelector<HTMLElement>('[data-part="panel-header"]')!.getBoundingClientRect()
    const body = card.querySelector<HTMLElement>('[data-part="panel-body"]')!.getBoundingClientRect()
    expect(header.bottom).toBeLessThanOrEqual(body.top + 1)
    expect(getComputedStyle(card.querySelector('[data-part="panel-body"]')!).overflowY).toBe('auto')
    const top = frame.querySelector<HTMLElement>(':scope > [data-part="header"]')!.getBoundingClientRect()
    const status = frame.querySelector<HTMLElement>(':scope > [data-part="status"]')!.getBoundingClientRect()
    const frameBox = frame.getBoundingClientRect()
    expect([top.height > 0, Math.round(top.top), status.height > 0, Math.round(status.bottom)]).toEqual([true, Math.round(frameBox.top), true, Math.round(frameBox.bottom)])
    expect(zoom.getBoundingClientRect().right).toBeGreaterThan(frameBox.right - 40)
  })

  it('问题列表的 summary 移进面板头的操作区：带计数的开关排在标题右边，零件自己的头部收起', async () => {
    frame.regions = [
      { name: 'canvas', position: 'center' },
      { name: 'issues', position: 'bottom', title: '问题' },
    ]
    const issues = document.createElement('xh-designer-issues')
    issues.headless = true
    issues.items = [{ issue: { code: 'graph.no-end', path: [] }, message: '缺少结束节点' }]
    issues.slot = 'issues'
    frame.append(issues)
    await issues.updateComplete
    const summary = issues.summary
    summary.slot = 'issues-actions'
    frame.append(summary)
    await new Promise(resolve => setTimeout(resolve))
    await issues.updateComplete
    await new Promise(resolve => requestAnimationFrame(resolve))
    const card = frame.querySelector<HTMLElement>('[data-part="region"][data-region="issues"]')!
    const header = card.querySelector<HTMLElement>('[data-part="panel-header"]')!.getBoundingClientRect()
    const title = card.querySelector<HTMLElement>('[data-part="panel-title"]')!.getBoundingClientRect()
    const box = summary.getBoundingClientRect()
    expect([box.width > 0, box.top >= header.top - 1, box.bottom <= header.bottom + 1, box.left >= title.right]).toEqual([true, true, true, true])
    expect(summary.textContent).toContain('1')
    expect(issues.querySelector<HTMLElement>(':scope > [data-part="header"]')!.getBoundingClientRect().height).toBe(0)
  })

  it('状态栏：状态项标签弱一档、值按语气着色，相邻两项之间一道分隔；可点的项是 ghost 小按钮，不撑高状态栏', async () => {
    frame.regions = [
      { name: 'canvas', position: 'center' },
      { name: 'status', position: 'status' },
    ]
    const selection = createStatusItem(document, { label: '已选', value: '2 个节点' })
    const saved = createStatusItem(document, { value: '保存失败', tone: 'danger' })
    const zoom = createStatusItem(document, { label: '缩放', value: '80%', action: () => {} })
    selection.element.slot = 'status-start'
    saved.element.slot = 'status-end'
    zoom.element.slot = 'status-end'
    frame.append(selection.element, saved.element, zoom.element)
    await new Promise(resolve => setTimeout(resolve))
    await frame.updateComplete
    await new Promise(resolve => requestAnimationFrame(resolve))
    const color = (element: Element): string => getComputedStyle(element).color
    const probe = (token: string): string => {
      const span = document.createElement('span')
      span.style.color = `var(${token})`
      frame.append(span)
      const value = getComputedStyle(span).color
      span.remove()
      return value
    }
    expect(color(selection.element.querySelector('[data-part="status-label"]')!)).toBe(probe('--xh-fg-subtle'))
    expect(color(saved.element.querySelector('[data-part="status-value"]')!)).toBe(probe('--xh-fg-danger'))
    expect(getComputedStyle(zoom.element).borderInlineStartStyle).toBe('solid')
    expect(getComputedStyle(saved.element).borderInlineStartStyle).toBe('none')
    const bar = frame.querySelector<HTMLElement>(':scope > [data-part="status"]')!.getBoundingClientRect()
    const button = zoom.element.querySelector('button')!.getBoundingClientRect()
    const rest = Number.parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--xh-control-h-sm'))
    expect([button.top >= bar.top - 1, button.bottom <= bar.bottom + 1, bar.height <= rest + 2]).toEqual([true, true, true])
    expect(zoom.element.getBoundingClientRect().left).toBeGreaterThan(saved.element.getBoundingClientRect().right - 1)
  })

  it('区里的作者内容不受外框样式影响：带同名部件的作者元素保持自己的 display 与 overflow', async () => {
    const plant = (host: Element): HTMLElement[] => {
      host.insertAdjacentHTML('beforeend', [
        '<div data-part="region">',
        '<div data-part="stack" data-position="center"><div data-part="region"></div></div>',
        '<div data-part="main"></div>',
        '<div data-part="splitter"><div data-scope="splitter" data-part="root"><div data-scope="splitter" data-part="panel"></div></div></div>',
        '</div>',
      ].join(''))
      const root = host.lastElementChild as HTMLElement
      return [root, ...root.querySelectorAll<HTMLElement>('[data-part]')]
    }
    const planted = [
      ...plant(frame.querySelector('[data-part="region"][data-region="canvas"] > div')!),
      ...plant(frame.querySelector('[data-part="region"][data-region="palette"] > [slot="palette"]')!),
    ]
    await new Promise(resolve => requestAnimationFrame(resolve))
    expect(planted).toHaveLength(14)
    for (const element of planted) {
      const style = getComputedStyle(element)
      expect([element.dataset.part, style.display, style.overflow, style.flexGrow, style.borderRadius]).toEqual([element.dataset.part, 'block', 'visible', '0', '0px'])
    }
    const region = (name: string): CSSStyleDeclaration => getComputedStyle(frame.querySelector(`[data-part="region"][data-region="${name}"]`)!)
    expect([region('canvas').display, region('canvas').overflow]).toEqual(['flex', 'hidden'])
    expect([region('palette').display, region('palette').overflow]).toEqual(['flex', 'auto'])
    expect(['body', 'main', 'stack', 'region', 'splitter'].every(part => frame.querySelector(`[data-part="${part}"][data-scope="designer-frame"]`) !== null)).toBe(true)
    expect(['canvas', 'palette', 'properties', 'issues', 'toolbar'].map(name => frame.querySelector(`[data-region="${name}"]`)!.getAttribute('data-position'))).toEqual(['center', 'start', 'end', 'bottom', 'top'])
  })

  it('带 slot 而外框没有对应位置的作者内容藏起来、不占版面，自带 display 的也一样', async () => {
    const own = document.createElement('style')
    own.textContent = '.own-flex { display: flex; block-size: 120px; }'
    document.head.append(own)
    const before = frame.querySelector('[data-part="body"]')!.getBoundingClientRect().height
    const stray = document.createElement('div')
    stray.slot = 'nowhere'
    stray.className = 'own-flex'
    stray.textContent = '没有位置'
    frame.append(stray)
    await frame.updateComplete
    await new Promise(resolve => requestAnimationFrame(resolve))
    expect([frame.contains(stray), stray.checkVisibility()]).toEqual([true, false])
    expect(frame.querySelector('[data-part="body"]')!.getBoundingClientRect().height).toBe(before)
    own.remove()
  })

  it('区从 regions 里拿掉以后，里面的作者内容藏起来，不露在外框里；再登记时领回去', async () => {
    const own = document.createElement('style')
    own.textContent = '.own-flex { display: flex; }'
    document.head.append(own)
    frame.regions = [...DESIGNER_FRAME_REGIONS]
    const status = document.createElement('div')
    status.slot = 'status'
    status.className = 'own-flex'
    status.textContent = '已选中 3 个元素'
    const corner = document.createElement('button')
    corner.slot = 'canvas-top-end'
    corner.className = 'own-flex'
    corner.textContent = '角落'
    frame.append(status, corner)
    await frame.updateComplete
    await new Promise(resolve => requestAnimationFrame(resolve))
    const statusRegion = (): Element => frame.querySelector('[data-part="region"][data-region="status"]')!
    expect([statusRegion().contains(status), status.checkVisibility(), corner.checkVisibility()]).toEqual([true, true, true])

    frame.regions = DESIGNER_FRAME_REGIONS.filter(region => region.name !== 'status' && region.name !== 'canvas')
    await frame.updateComplete
    await new Promise(resolve => requestAnimationFrame(resolve))
    expect([frame.contains(status), status.checkVisibility(), corner.checkVisibility()]).toEqual([true, false, false])

    frame.regions = [...DESIGNER_FRAME_REGIONS]
    await frame.updateComplete
    await new Promise(resolve => requestAnimationFrame(resolve))
    expect([statusRegion().contains(status), status.checkVisibility(), corner.checkVisibility()]).toEqual([true, true, true])
    own.remove()
  })
})
