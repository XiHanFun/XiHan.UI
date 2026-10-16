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
