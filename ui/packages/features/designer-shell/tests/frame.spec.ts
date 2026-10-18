// @vitest-environment jsdom

// 外框：panels 的解析，作者内容按 slot 进区、没写 slot 的进中间区，按显示的区搭分隔条，收起再展开时内容还在，
// 产品自己登记的区与同一位置的堆叠（堆叠区之间的分隔条、等分、恢复与按比例重分），分隔条的文案，以及恢复大小与 sizes-change。
import type { DesignerFrameEventMap, XhDesignerFrameElement } from '../src'
import { afterEach, describe, expect, it } from 'vitest'
import { defineDesignerShell, parseDesignerPanels } from '../src'

defineDesignerShell()

let frame: XhDesignerFrameElement

afterEach(() => {
  frame?.remove()
})

async function mount(setup: (element: XhDesignerFrameElement) => void = () => {}): Promise<Record<string, HTMLElement>> {
  frame = document.createElement('xh-designer-frame')
  const content: Record<string, HTMLElement> = {}
  for (const name of ['toolbar', 'palette', 'properties', 'issues']) {
    content[name] = document.createElement('div')
    content[name].setAttribute('slot', name)
    frame.append(content[name])
  }
  content.canvas = document.createElement('div')
  frame.append(content.canvas)
  setup(frame)
  document.body.append(frame)
  await frame.updateComplete
  return content
}

function region(name: string): HTMLElement | null {
  return frame.querySelector<HTMLElement>(`[data-part="region"][data-region="${name}"]`)
}

function splitter(orientation: string): HTMLElement | null {
  return frame.querySelector<HTMLElement>(`[data-part="splitter"][data-orientation="${orientation}"]`)
}

describe('parseDesignerPanels', () => {
  it('没写为全部显示，空串为全部收起，空白与制表符都当分隔', () => {
    expect(parseDesignerPanels(undefined)).toBeUndefined()
    expect(parseDesignerPanels(null)).toBeUndefined()
    expect([...parseDesignerPanels('')!]).toEqual([])
    expect([...parseDesignerPanels('  toolbar\tpalette   issues ')!]).toEqual(['toolbar', 'palette', 'issues'])
  })
})

describe('<xh-designer-frame>', () => {
  it('作者内容按 slot 进区，没写 slot 的进中间区；中间一行与中间一列各一条分隔条', async () => {
    const content = await mount()
    for (const name of ['toolbar', 'palette', 'canvas', 'properties', 'issues'])
      expect(content[name]!.parentElement).toBe(region(name))
    expect(region('toolbar')!.parentElement!.getAttribute('data-part')).toBe('top')
    const row = splitter('horizontal')!
    expect(row.getAttribute('default-sizes')).toBe('18,58,24')
    expect(Array.from(row.querySelectorAll(':scope > div > [data-xh-part="panel"]'), panel => panel.getAttribute('index'))).toEqual(['0', '1', '2'])
    const column = splitter('vertical')!
    expect(column.getAttribute('default-sizes')).toBe('72,28')
    expect(row.contains(column)).toBe(true)
    expect(region('canvas')!.closest('[data-part="stack"]')!.getAttribute('data-position')).toBe('center')
  })

  it('顶栏与状态栏按段放内容：只写区名的进缺省段，有内容才显示，内容拿走就收起；状态栏另受 panels 控制', async () => {
    await mount()
    const header = frame.querySelector<HTMLElement>(':scope > [data-part="header"]')!
    const status = frame.querySelector<HTMLElement>(':scope > [data-part="status"]')!
    expect([header.hidden, status.hidden, frame.showsPanel('header'), frame.showsPanel('status')]).toEqual([true, true, false, false])

    const logo = document.createElement('span')
    logo.slot = 'header-start'
    const insert = document.createElement('div')
    insert.slot = 'header'
    const save = document.createElement('button')
    save.slot = 'header-end'
    const selection = document.createElement('span')
    selection.slot = 'status'
    const zoom = document.createElement('span')
    zoom.slot = 'status-end'
    frame.append(logo, insert, save, selection, zoom)
    await new Promise(resolve => setTimeout(resolve))
    await frame.updateComplete
    const zone = (element: Element): string | null => element.parentElement!.getAttribute('data-zone')
    expect([logo, insert, save, selection, zoom].map(zone)).toEqual(['start', 'center', 'end', 'start', 'end'])
    expect([header.hidden, status.hidden, region('header')!.parentElement, region('status')!.parentElement]).toEqual([false, false, header, status])

    frame.panels = 'palette properties issues'
    await frame.updateComplete
    expect([status.hidden, frame.showsPanel('status'), frame.showsPanel('header')]).toEqual([true, false, true])

    logo.remove()
    insert.remove()
    save.remove()
    await new Promise(resolve => setTimeout(resolve))
    await frame.updateComplete
    expect(header.hidden).toBe(true)
  })

  it('左右与下方的区给了标题就是卡片：面板头写标题、副标题，帮助与关闭钮，操作区按 slot 放内容；点关闭收起这块并派发 panels-change', async () => {
    const content = await mount((element) => {
      element.regions = [
        { name: 'toolbar', position: 'top' },
        { name: 'palette', position: 'start', title: '物料' },
        { name: 'canvas', position: 'center' },
        { name: 'properties', position: 'end', title: '属性', subtitle: '审批', help: '选中节点或连线，在这里编辑它们的属性', closable: false },
        { name: 'issues', position: 'bottom', title: '问题' },
      ]
    })
    const card = region('properties')!
    const title = card.querySelector('[data-part="panel-title"]')!
    expect([card.hasAttribute('data-card'), card.getAttribute('role'), card.getAttribute('aria-labelledby')]).toEqual([true, 'region', title.id])
    expect([title.textContent, card.querySelector('[data-part="panel-subtitle"]')!.textContent]).toEqual(['属性', '审批'])
    expect(content.properties!.parentElement!.getAttribute('data-part')).toBe('panel-body')
    const help = card.querySelector<HTMLElement>('[data-part="panel-help-tip"] > button')!
    expect([help.getAttribute('aria-label'), card.querySelector('[data-xh-part="content"]')!.textContent]).toEqual(['About 属性', '选中节点或连线，在这里编辑它们的属性'])
    expect(card.querySelector<HTMLElement>('[data-part="panel-close"]')!.hidden).toBe(true)

    const palette = region('palette')!
    expect([palette.querySelector<HTMLElement>('[data-part="panel-subtitle"]')!.hidden, palette.querySelector<HTMLElement>('[data-part="panel-help-tip"]')!.hidden]).toEqual([true, true])
    expect(palette.querySelector<HTMLElement>('[data-part="panel-actions"]')!.hidden).toBe(true)
    const counts = document.createElement('span')
    counts.slot = 'issues-actions'
    frame.append(counts)
    await new Promise(resolve => setTimeout(resolve))
    await frame.updateComplete
    expect(counts.parentElement!.getAttribute('data-part')).toBe('panel-actions')
    expect(counts.parentElement!.hidden).toBe(false)

    const changes: string[] = []
    frame.addEventListener('panels-change', event => changes.push((event as DesignerFrameEventMap['panels-change']).detail.panels))
    const close = palette.querySelector<HTMLElement>('[data-part="panel-close"]')!
    expect(close.getAttribute('aria-label')).toBe('Close 物料')
    close.click()
    await frame.updateComplete
    expect([changes, frame.panels, region('palette')]).toEqual([['toolbar properties issues'], 'toolbar properties issues', null])

    // 「面板」菜单的数据：左右与下方没写 closable: false 的区，名字取标题；togglePanel 与关闭钮同一条路
    expect(frame.panelEntries()).toEqual([{ name: 'palette', label: '物料', shown: false }, { name: 'issues', label: '问题', shown: true }])
    frame.togglePanel('palette')
    await frame.updateComplete
    frame.togglePanel('issues')
    await frame.updateComplete
    expect(changes.slice(1)).toEqual(['toolbar palette properties issues', 'toolbar palette properties'])
    expect([frame.panels, region('palette') !== null, region('issues')]).toEqual(['toolbar palette properties', true, null])
  })

  it('没写 panels 时全部显示，togglePanel 收起一块就把其余的列出来', async () => {
    await mount()
    expect(frame.panelEntries().map(entry => [entry.name, entry.label, entry.shown])).toEqual([['palette', 'palette', true], ['properties', 'properties', true], ['issues', 'issues', true]])
    frame.togglePanel('properties')
    await frame.updateComplete
    expect(frame.panels).toBe('header toolbar palette issues status')
  })

  it('区后来加了标题就换成卡片，已经搬进去的内容挪进正文；画布区的作者内容可以放进四角与右侧的浮动条', async () => {
    const content = await mount()
    expect(region('properties')!.hasAttribute('data-card')).toBe(false)
    frame.regions = [
      { name: 'toolbar', position: 'top' },
      { name: 'palette', position: 'start' },
      { name: 'canvas', position: 'center' },
      { name: 'properties', position: 'end', title: '属性' },
      { name: 'issues', position: 'bottom' },
    ]
    await frame.updateComplete
    expect(region('properties')!.hasAttribute('data-card')).toBe(true)
    expect(content.properties!.parentElement!.getAttribute('data-part')).toBe('panel-body')

    const minimap = document.createElement('div')
    minimap.slot = 'canvas-bottom-end'
    const pager = document.createElement('div')
    pager.slot = 'canvas-end'
    frame.append(minimap, pager)
    await new Promise(resolve => setTimeout(resolve))
    expect([minimap.parentElement!.getAttribute('data-overlay'), pager.parentElement!.getAttribute('data-overlay')]).toEqual(['bottom-end', 'end'])
    expect(minimap.parentElement!.parentElement).toBe(region('canvas'))
    expect(content.canvas!.parentElement).toBe(region('canvas'))
  })

  it('左右与下方的面板在分隔条上可以收起：分隔条的面板配置写着 collapsible', async () => {
    await mount()
    const panels = (orientation: string): unknown => JSON.parse(splitter(orientation)!.getAttribute('panels')!)
    expect(panels('horizontal')).toEqual([{ id: 'start', min: 10, collapsible: true }, { id: 'center', min: 20 }, { id: 'end', min: 10, collapsible: true }])
    expect(panels('vertical')).toEqual([{ id: 'center', min: 20 }, { id: 'bottom', min: 10, collapsible: true }])
  })

  it('panels 只列出的区显示：收起的区不在文档里，再展开时内容还在；中间区总是显示', async () => {
    const content = await mount(element => element.setAttribute('panels', 'palette'))
    expect(frame.showsPanel('palette')).toBe(true)
    expect(frame.showsPanel('properties')).toBe(false)
    expect(frame.showsPanel('canvas')).toBe(true)
    expect(frame.showsPanel('unknown')).toBe(false)
    expect(frame.querySelector<HTMLElement>('[data-part="top"]')!.hidden).toBe(true)
    expect(region('properties')).toBeNull()
    expect(splitter('vertical')).toBeNull()
    expect(splitter('horizontal')!.getAttribute('default-sizes')).toBe('18,82')

    frame.panels = ''
    await frame.updateComplete
    expect(splitter('horizontal')).toBeNull()
    expect(frame.querySelector('[data-part="body"] > [data-part="main"]')).not.toBeNull()

    frame.removeAttribute('panels')
    await frame.updateComplete
    expect(content.properties!.parentElement).toBe(region('properties'))
    expect(region('properties')!.isConnected).toBe(true)
  })

  it('产品登记自己的区：同一位置的多个区按顺序上下排列，分隔条按位置上第一个区命名', async () => {
    await mount((element) => {
      element.regions = [
        { name: 'toolbar', position: 'top' },
        { name: 'pages', position: 'top' },
        { name: 'canvas', position: 'center' },
        { name: 'properties', position: 'end', size: 30, label: '属性' },
        { name: 'minimap', position: 'end' },
      ]
      element.translations = { layout: '布局', resize: label => `调整「${label}」` }
    })
    expect(Array.from(frame.querySelectorAll('[data-part="top"] > [data-region]'), node => node.getAttribute('data-region'))).toEqual(['toolbar', 'pages'])
    const end = frame.querySelector('[data-part="stack"][data-position="end"]')!
    expect(Array.from(end.querySelectorAll('[data-part="region"]'), node => node.getAttribute('data-region'))).toEqual(['properties', 'minimap'])
    expect(splitter('horizontal')!.getAttribute('default-sizes')).toBe('70,30')
    expect(frame.querySelector('[data-xh-part="resize-trigger"], [data-part="resize-trigger"]')!.getAttribute('aria-label')).toBe('调整「属性」')
    expect(region('palette')).toBeNull()
  })

  it('同一位置堆叠的区之间有分隔条：缺省等分，sizes.regions 恢复，收起其中一个后其余按比例重分，拖动后并进 sizes-change', async () => {
    const regions = [
      { name: 'canvas', position: 'center' as const },
      { name: 'properties', position: 'end' as const, label: '属性' },
      { name: 'outline', position: 'end' as const },
      { name: 'minimap', position: 'end' as const },
    ]
    await mount(element => element.regions = regions)
    const stack = (): HTMLElement | null => frame.querySelector('[data-part="stack"][data-position="end"] [data-part="splitter"]')
    expect([stack()!.getAttribute('data-orientation'), stack()!.getAttribute('default-sizes')]).toEqual(['vertical', '33.333,33.333,33.333'])
    const panels = Array.from(stack()!.querySelectorAll(':scope > div > [data-xh-part="panel"]'), panel => panel.querySelector('[data-part="region"]')!.getAttribute('data-region'))
    expect(panels).toEqual(['properties', 'outline', 'minimap'])
    expect(Array.from(stack()!.querySelectorAll('[data-xh-part="resize-trigger"]'), trigger => trigger.getAttribute('aria-label'))).toEqual(['Resize 属性', 'Resize outline'])

    frame.sizes = { regions: { properties: 50, outline: 25 } }
    await frame.updateComplete
    expect(stack()!.getAttribute('default-sizes')).toBe('46.154,23.077,30.769')
    frame.sizes = { regions: { minimap: 25 } }
    await frame.updateComplete
    expect(stack()!.getAttribute('default-sizes')).toBe('50,25,25')
    frame.panels = 'properties minimap'
    await frame.updateComplete
    expect(stack()!.getAttribute('default-sizes')).toBe('66.667,33.333')
    frame.panels = 'properties'
    await frame.updateComplete
    expect(stack()).toBeNull()
    expect(frame.querySelector('[data-part="stack"][data-position="end"] > [data-region="properties"]')).not.toBeNull()

    frame.panels = undefined
    await frame.updateComplete
    const seen: DesignerFrameEventMap['sizes-change']['detail'][] = []
    frame.addEventListener('sizes-change', event => seen.push((event as DesignerFrameEventMap['sizes-change']).detail))
    stack()!.dispatchEvent(new CustomEvent('sizes-change', { detail: { sizes: [20, 30, 50] }, bubbles: true }))
    splitter('horizontal')!.dispatchEvent(new CustomEvent('sizes-change', { detail: { sizes: [70, 30] }, bubbles: true }))
    expect(seen).toEqual([
      { sizes: { regions: { properties: 20, outline: 30, minimap: 50 } } },
      { sizes: { end: 30, regions: { properties: 20, outline: 30, minimap: 50 } } },
    ])
  })

  it('回填堆叠区大小：过期区名与无效值忽略，合计不是 100 的按比例归一，归一后低于 10% 的定在下限；sizes-change 只带登记着的区', async () => {
    await mount((element) => {
      element.regions = [
        { name: 'canvas', position: 'center' },
        { name: 'properties', position: 'end' },
        { name: 'outline', position: 'end' },
        { name: 'minimap', position: 'end' },
      ]
      element.sizes = { end: Number.NaN, regions: { properties: 1000, outline: 1, ghost: 50, minimap: -5 } }
    })
    const stack = frame.querySelector('[data-part="stack"][data-position="end"] [data-part="splitter"]')!
    expect(stack.getAttribute('default-sizes')).toBe('80,10,10')
    expect(splitter('horizontal')!.getAttribute('default-sizes')).toBe('80,20')
    const seen: DesignerFrameEventMap['sizes-change']['detail'][] = []
    frame.addEventListener('sizes-change', event => seen.push((event as DesignerFrameEventMap['sizes-change']).detail))
    stack.dispatchEvent(new CustomEvent('sizes-change', { detail: { sizes: [70, 15, 15] }, bubbles: true }))
    expect(seen).toEqual([{ sizes: { regions: { properties: 70, outline: 15, minimap: 15 } } }])
  })

  it('分隔条跟着外框的文字方向，外框的 dir 变了就重排', async () => {
    await mount(element => element.setAttribute('dir', 'rtl'))
    const dirs = (): (string | null)[] => Array.from(frame.querySelectorAll('xh-splitter'), splitter => splitter.getAttribute('dir'))
    expect(dirs()).toEqual(['rtl', 'rtl'])
    frame.setAttribute('dir', 'ltr')
    await new Promise(resolve => setTimeout(resolve))
    await frame.updateComplete
    expect(dirs()).toEqual(['ltr', 'ltr'])
  })

  it('sizes 恢复各位置的大小（夹在下限与中间区之间），分隔条变化时派发 sizes-change', async () => {
    await mount(element => element.sizes = { start: 25, end: 90 })
    const row = splitter('horizontal')!
    expect(row.getAttribute('default-sizes')).toBe('25,20,55')
    const seen: DesignerFrameEventMap['sizes-change']['detail'][] = []
    frame.addEventListener('sizes-change', event => seen.push((event as DesignerFrameEventMap['sizes-change']).detail))
    row.dispatchEvent(new CustomEvent('sizes-change', { detail: { sizes: [20, 55, 25] }, bubbles: true }))
    splitter('vertical')!.dispatchEvent(new CustomEvent('sizes-change', { detail: { sizes: [60, 40] }, bubbles: true }))
    expect(seen).toEqual([
      { sizes: { start: 20, end: 25 } },
      { sizes: { start: 20, end: 25, bottom: 40 } },
    ])
  })
})
