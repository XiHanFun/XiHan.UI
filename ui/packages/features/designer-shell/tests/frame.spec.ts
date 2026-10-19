// @vitest-environment jsdom

// 外框：作者内容按 slot 进区、没写 slot 的进中间区，按布局搭分隔条，隐藏再显示时内容还在，
// 产品自己登记的区与同一栏的堆叠（堆叠面板之间的分隔条、等分、恢复与按比例重分），分隔条的文案，恢复大小与 layout-change；
// 面板头的收起、「更多」菜单（换栏、调序、浮出、隐藏），浮出与吸回，全部显隐、还原与恢复默认，画布浮动件，宿主的缺省布局与管控。
import type { DesignerFrameEventMap, DesignerFrameRegion, DesignerLayoutChangeReason, ResolvedDesignerLayout, XhDesignerFrameElement } from '../src'
import { afterEach, describe, expect, it } from 'vitest'
import { defineDesignerShell, DESIGNER_FRAME_REGIONS } from '../src'

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

/** 记下派发的 layout-change。 */
function record(): { layout: ResolvedDesignerLayout, reason: DesignerLayoutChangeReason }[] {
  const seen: { layout: ResolvedDesignerLayout, reason: DesignerLayoutChangeReason }[] = []
  frame.addEventListener('layout-change', event => seen.push((event as DesignerFrameEventMap['layout-change']).detail))
  return seen
}

/** 带标题的一套区：三栏里的面板都是卡片。 */
const CARDS: readonly DesignerFrameRegion[] = [
  { name: 'toolbar', position: 'top' },
  { name: 'palette', position: 'start', title: '物料' },
  { name: 'canvas', position: 'center' },
  { name: 'properties', position: 'end', title: '属性' },
  { name: 'issues', position: 'bottom', title: '问题' },
]

async function settle(): Promise<void> {
  await new Promise(resolve => setTimeout(resolve))
  await frame.updateComplete
}

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

  it('顶栏与状态栏按段放内容：只写区名的进缺省段，有内容才显示，内容拿走就收起；不登记状态栏就不显示', async () => {
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
    await settle()
    const zone = (element: Element): string | null => element.parentElement!.getAttribute('data-zone')
    expect([logo, insert, save, selection, zoom].map(zone)).toEqual(['start', 'center', 'end', 'start', 'end'])
    expect([header.hidden, status.hidden, region('header')!.parentElement, region('status')!.parentElement]).toEqual([false, false, header, status])

    frame.regions = DESIGNER_FRAME_REGIONS.filter(item => item.name !== 'status')
    await frame.updateComplete
    expect([status.hidden, frame.showsPanel('status'), frame.showsPanel('header'), selection.parentElement]).toEqual([true, false, true, frame])

    logo.remove()
    insert.remove()
    save.remove()
    await settle()
    expect(header.hidden).toBe(true)
  })

  it('三栏的区给了标题就是卡片：面板头写标题、副标题，帮助、收起、更多与关闭钮，操作区按 slot 放内容；点关闭隐藏这块并派发 layout-change', async () => {
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
    const minimize = card.querySelector<HTMLElement>('[data-part="panel-minimize"]')!
    expect([minimize.hidden, minimize.getAttribute('aria-label'), minimize.getAttribute('aria-expanded')]).toEqual([false, 'Collapse 属性', 'true'])
    const more = card.querySelector<HTMLElement>('[data-part="panel-menu-trigger"]')!
    expect([more.hidden, more.getAttribute('aria-label'), more.getAttribute('aria-haspopup')]).toEqual([false, 'More actions for 属性', 'menu'])

    const palette = region('palette')!
    expect([palette.querySelector<HTMLElement>('[data-part="panel-subtitle"]')!.hidden, palette.querySelector<HTMLElement>('[data-part="panel-help-tip"]')!.hidden]).toEqual([true, true])
    expect(palette.querySelector<HTMLElement>('[data-part="panel-actions"]')!.hidden).toBe(true)
    const counts = document.createElement('span')
    counts.slot = 'issues-actions'
    frame.append(counts)
    await settle()
    expect(counts.parentElement!.getAttribute('data-part')).toBe('panel-actions')
    expect(counts.parentElement!.hidden).toBe(false)

    const seen = record()
    const close = palette.querySelector<HTMLElement>('[data-part="panel-close"]')!
    expect(close.getAttribute('aria-label')).toBe('Close 物料')
    close.click()
    await frame.updateComplete
    expect(seen.map(change => [change.reason, change.layout.hidden])).toEqual([['toggle', ['palette']]])
    expect([frame.layout, region('palette')]).toEqual([seen[0]!.layout, null])

    // 「面板」菜单的数据：三栏里没写 closable: false 的面板，名字取标题；togglePanel 与关闭钮同一条路
    expect(frame.panelEntries().map(entry => [entry.name, entry.label, entry.shown, entry.dock])).toEqual([['palette', '物料', false, 'start'], ['issues', '问题', true, 'bottom']])
    frame.togglePanel('palette')
    await frame.updateComplete
    frame.togglePanel('issues')
    await frame.updateComplete
    expect(seen.slice(1).map(change => change.layout.hidden)).toEqual([[], ['issues']])
    expect([region('palette') !== null, region('issues')]).toEqual([true, null])
  })

  it('没给 layout 时按缺省布局全部显示，togglePanel 隐藏一块并派发改完的整份布局', async () => {
    await mount()
    expect(frame.panelEntries().map(entry => [entry.name, entry.label, entry.shown])).toEqual([['palette', 'palette', true], ['properties', 'properties', true], ['issues', 'issues', true]])
    const seen = record()
    frame.togglePanel('properties')
    await frame.updateComplete
    expect(seen).toEqual([{
      reason: 'toggle',
      layout: { version: 1, docks: { start: ['palette'], end: ['properties'], bottom: ['issues'] }, hidden: ['properties'], minimized: [], floating: {}, sizes: {}, collapsed: [] },
    }])
  })

  it('宿主赋了 layout、regions 或管控，外框还没更新时 resolvedLayout、showsPanel 与 panelEntries 已经按新的算', async () => {
    await mount()
    frame.layout = { version: 1, hidden: ['palette'] }
    expect(frame.resolvedLayout.hidden).toEqual(['palette'])
    expect(frame.showsPanel('palette')).toBe(false)
    expect(frame.panelEntries().find(entry => entry.name === 'palette')!.shown).toBe(false)
    frame.layoutPolicy = { panels: { properties: 'hidden' } }
    expect(frame.panelEntries().map(entry => entry.name)).toEqual(['palette', 'issues'])
    frame.regions = DESIGNER_FRAME_REGIONS.filter(item => item.name !== 'issues')
    expect(frame.resolvedLayout.docks.bottom).toEqual([])
    await frame.updateComplete
    expect([frame.showsPanel('palette'), frame.resolvedLayout.hidden]).toEqual([false, ['palette']])
  })

  it('卡片先换成普通区再换回来：面板头操作区里的作者内容先回到宿主，再回到新面板头里', async () => {
    await mount(element => element.regions = CARDS)
    const counts = document.createElement('span')
    counts.slot = 'issues-actions'
    frame.append(counts)
    await settle()
    expect(counts.parentElement!.getAttribute('data-part')).toBe('panel-actions')

    frame.regions = CARDS.map(({ name, position }) => ({ name, position }))
    await frame.updateComplete
    expect([counts.parentElement, counts.isConnected]).toEqual([frame, true])

    frame.regions = CARDS
    await settle()
    const actions = region('issues')!.querySelector<HTMLElement>('[data-part="panel-actions"]')!
    expect([counts.parentElement, counts.isConnected, actions.hidden]).toEqual([actions, true, false])
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

  it('三栏在分隔条上可以收起：分隔条的面板配置写着 collapsible', async () => {
    await mount()
    const panels = (orientation: string): unknown => JSON.parse(splitter(orientation)!.getAttribute('panels')!)
    expect(panels('horizontal')).toEqual([{ id: 'start', min: 10, collapsible: true }, { id: 'center', min: 20 }, { id: 'end', min: 10, collapsible: true }])
    expect(panels('vertical')).toEqual([{ id: 'center', min: 20 }, { id: 'bottom', min: 10, collapsible: true }])
  })

  it('隐藏的面板不在文档里，再显示时内容还在；工具栏与中间区总是显示', async () => {
    const content = await mount(element => element.layout = { version: 1, hidden: ['properties', 'issues'] })
    expect([frame.showsPanel('palette'), frame.showsPanel('properties'), frame.showsPanel('canvas'), frame.showsPanel('toolbar'), frame.showsPanel('unknown')]).toEqual([true, false, true, true, false])
    expect(frame.querySelector<HTMLElement>('[data-part="top"]')!.hidden).toBe(false)
    expect(region('properties')).toBeNull()
    expect(splitter('vertical')).toBeNull()
    expect(splitter('horizontal')!.getAttribute('default-sizes')).toBe('18,82')

    frame.layout = { version: 1, hidden: ['palette', 'properties', 'issues'] }
    await frame.updateComplete
    expect(splitter('horizontal')).toBeNull()
    expect(frame.querySelector('[data-part="body"] > [data-part="main"]')).not.toBeNull()

    frame.layout = undefined
    await frame.updateComplete
    expect(content.properties!.parentElement).toBe(region('properties'))
    expect(region('properties')!.isConnected).toBe(true)
  })

  it('产品登记自己的区：同一栏的多块面板按顺序上下排列，分隔条按那一栏第一块面板命名', async () => {
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

  it('同一栏堆叠的面板之间有分隔条：缺省等分，layout.sizes.panels 恢复，隐藏其中一块后其余按比例重分，拖动松手后派发 layout-change', async () => {
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

    frame.layout = { version: 1, sizes: { panels: { properties: 50, outline: 25 } } }
    await frame.updateComplete
    expect(stack()!.getAttribute('default-sizes')).toBe('46.154,23.077,30.769')
    // layout 是整份：没写份额的面板按等分算
    frame.layout = { version: 1, sizes: { panels: { minimap: 25 } } }
    await frame.updateComplete
    expect(stack()!.getAttribute('default-sizes')).toBe('36.364,36.364,27.273')
    frame.layout = { version: 1, sizes: { panels: { minimap: 25 } }, hidden: ['outline'] }
    await frame.updateComplete
    expect(stack()!.getAttribute('default-sizes')).toBe('66.667,33.333')
    frame.layout = { version: 1, hidden: ['outline', 'minimap'] }
    await frame.updateComplete
    expect(stack()).toBeNull()
    expect(frame.querySelector('[data-part="stack"][data-position="end"] > [data-region="properties"]')).not.toBeNull()

    frame.layout = undefined
    await frame.updateComplete
    const seen = record()
    // 按着分隔条拖：拖动中不派发，松手才派发
    stack()!.dispatchEvent(new Event('pointerdown', { bubbles: true }))
    stack()!.dispatchEvent(new CustomEvent('sizes-change', { detail: { sizes: [20, 30, 50] }, bubbles: true }))
    expect(seen).toEqual([])
    stack()!.dispatchEvent(new CustomEvent('sizes-change-end', { detail: { sizes: [20, 30, 50], index: 0 }, bubbles: true }))
    splitter('horizontal')!.dispatchEvent(new CustomEvent('sizes-change', { detail: { sizes: [70, 30] }, bubbles: true }))
    splitter('horizontal')!.dispatchEvent(new CustomEvent('sizes-change-end', { detail: { sizes: [70, 30], index: 0 }, bubbles: true }))
    expect(seen.map(change => [change.reason, change.layout.sizes])).toEqual([
      ['resize', { panels: { properties: 20, outline: 30, minimap: 50 } }],
      ['resize', { panels: { properties: 20, outline: 30, minimap: 50 }, end: 30 }],
    ])
  })

  it('回填面板份额：过期 id 与无效值忽略，合计不是 100 的按比例归一，归一后低于 10% 的定在下限', async () => {
    await mount((element) => {
      element.regions = [
        { name: 'canvas', position: 'center' },
        { name: 'properties', position: 'end' },
        { name: 'outline', position: 'end' },
        { name: 'minimap', position: 'end' },
      ]
      element.layout = { version: 1, sizes: { end: Number.NaN, panels: { properties: 1000, outline: 1, ghost: 50, minimap: -5 } } }
    })
    const stack = frame.querySelector('[data-part="stack"][data-position="end"] [data-part="splitter"]')!
    expect(stack.getAttribute('default-sizes')).toBe('80,10,10')
    expect(splitter('horizontal')!.getAttribute('default-sizes')).toBe('80,20')
    const seen = record()
    stack.dispatchEvent(new CustomEvent('sizes-change', { detail: { sizes: [70, 15, 15] }, bubbles: true }))
    stack.dispatchEvent(new CustomEvent('sizes-change-end', { detail: { sizes: [70, 15, 15], index: 0 }, bubbles: true }))
    expect(seen.map(change => change.layout.sizes)).toEqual([{ panels: { properties: 70, outline: 15, minimap: 15 } }])
  })

  it('分隔条跟着外框的文字方向，外框的 dir 变了就重排', async () => {
    await mount(element => element.setAttribute('dir', 'rtl'))
    const dirs = (): (string | null)[] => Array.from(frame.querySelectorAll('xh-splitter'), splitter => splitter.getAttribute('dir'))
    expect(dirs()).toEqual(['rtl', 'rtl'])
    frame.setAttribute('dir', 'ltr')
    await settle()
    expect(dirs()).toEqual(['ltr', 'ltr'])
  })

  it('layout.sizes 恢复各栏的大小（夹在下限与中间区之间），不是指针拖动（方向键）调的大小当场派发', async () => {
    await mount(element => element.layout = { version: 1, sizes: { start: 25, end: 90 } })
    const row = splitter('horizontal')!
    expect(row.getAttribute('default-sizes')).toBe('25,20,55')
    const seen = record()
    row.dispatchEvent(new CustomEvent('sizes-change', { detail: { sizes: [20, 55, 25] }, bubbles: true }))
    row.dispatchEvent(new CustomEvent('sizes-change-end', { detail: { sizes: [20, 55, 25], index: 0 }, bubbles: true }))
    splitter('vertical')!.dispatchEvent(new CustomEvent('sizes-change', { detail: { sizes: [60, 40] }, bubbles: true }))
    splitter('vertical')!.dispatchEvent(new CustomEvent('sizes-change-end', { detail: { sizes: [60, 40], index: 0 }, bubbles: true }))
    expect(seen.map(change => change.layout.sizes)).toEqual([
      { start: 20, end: 25 },
      { start: 20, end: 25, bottom: 40 },
    ])
  })

  it('在分隔条上收起一栏当场派发，记着收起前的大小', async () => {
    await mount()
    const seen = record()
    const row = splitter('horizontal')!
    row.dispatchEvent(new CustomEvent('sizes-change', { detail: { sizes: [0, 76, 24] }, bubbles: true }))
    expect(seen.map(change => [change.reason, change.layout.collapsed, change.layout.sizes])).toEqual([['resize', ['start'], { start: 18, end: 24 }]])
    expect(frame.panelEntries().find(entry => entry.name === 'palette')!.shown).toBe(false)
    frame.togglePanel('palette')
    await frame.updateComplete
    expect(seen.at(-1)!.layout.collapsed).toEqual([])
  })
})

describe('<xh-designer-frame> 面板头与布局', () => {
  function menuOf(name: string): HTMLElement & { collection?: { value: string, label: string }[], open?: boolean } {
    return region(name)!.querySelector('xh-menu')!
  }

  async function openMenu(name: string): Promise<string[]> {
    region(name)!.querySelector<HTMLElement>('[data-part="panel-menu-trigger"]')!.click()
    await frame.updateComplete
    return menuOf(name).collection!.map(item => item.value)
  }

  function choose(name: string, value: string): void {
    menuOf(name).dispatchEvent(new CustomEvent('select', { detail: { value }, bubbles: true }))
  }

  it('收起钮把面板收成标题条：正文不显示，再点展开；改完派发 layout-change 并播报', async () => {
    await mount(element => element.regions = CARDS)
    const seen = record()
    const minimize = region('palette')!.querySelector<HTMLElement>('[data-part="panel-minimize"]')!
    minimize.click()
    await frame.updateComplete
    expect([region('palette')!.hasAttribute('data-minimized'), minimize.getAttribute('aria-expanded'), minimize.getAttribute('data-state'), minimize.getAttribute('aria-label')]).toEqual([true, 'false', 'closed', 'Expand 物料'])
    expect(seen.map(change => [change.reason, change.layout.minimized])).toEqual([['minimize', ['palette']]])
    await new Promise(resolve => setTimeout(resolve, 80))
    expect([document.querySelector('[data-xh-announcer]')!.parentElement, document.querySelector('[data-xh-announcer]')!.textContent]).toEqual([document.body, '物料 collapsed'])
    minimize.click()
    await frame.updateComplete
    expect([region('palette')!.hasAttribute('data-minimized'), seen.at(-1)!.layout.minimized]).toEqual([false, []])
  })

  it('「更多」菜单按此刻的布局列出能做的事：换栏、调序、浮出、收起、隐藏；选了就照做', async () => {
    await mount(element => element.regions = [...CARDS, { name: 'outline', position: 'end', title: '结构' }])
    expect(await openMenu('properties')).toEqual(['move:start', 'move:bottom', 'move:down', 'float', 'minimize', 'hide'])
    expect(await openMenu('outline')).toEqual(['move:start', 'move:bottom', 'move:up', 'float', 'minimize', 'hide'])
    const seen = record()
    choose('outline', 'move:up')
    await frame.updateComplete
    expect(seen.at(-1)!.layout.docks.end).toEqual(['outline', 'properties'])
    choose('outline', 'move:start')
    await frame.updateComplete
    expect(seen.at(-1)!.layout.docks).toEqual({ start: ['palette', 'outline'], end: ['properties'], bottom: ['issues'] })
    expect(region('outline')!.closest('[data-part="stack"]')!.getAttribute('data-position')).toBe('start')
    await new Promise(resolve => setTimeout(resolve, 80))
    expect(document.querySelector('[data-xh-announcer]')!.textContent).toBe('结构 moved to left side, position 2')
    choose('outline', 'hide')
    await frame.updateComplete
    expect([seen.at(-1)!.layout.hidden, region('outline')]).toEqual([['outline'], null])
  })

  it('从右往左写时左右两栏对调叫法', async () => {
    await mount((element) => {
      element.regions = CARDS
      element.setAttribute('dir', 'rtl')
    })
    region('properties')!.querySelector<HTMLElement>('[data-part="panel-menu-trigger"]')!.click()
    expect(menuOf('properties').collection!.find(item => item.value === 'move:start')!.label).toBe('Move to right side')
  })

  it('浮出：卡片搬进小窗，标题、停靠与关闭在小窗的标题栏上；停靠钮吸回原来的栏', async () => {
    await mount(element => element.regions = CARDS)
    const seen = record()
    frame.floatPanel('properties', { x: 40, y: 30, width: 280, height: 200 })
    await frame.updateComplete
    const float = frame.querySelector<HTMLElement & { open?: boolean }>('xh-floating-panel[data-part="float"][data-region="properties"]')!
    expect(float).not.toBeNull()
    expect(region('properties')!.closest('xh-floating-panel')).toBe(float)
    expect([region('properties')!.hasAttribute('data-floating'), float.open]).toEqual([true, true])
    expect(float.querySelector('[data-xh-part="title"]')!.textContent).toBe('属性')
    expect(seen.map(change => [change.reason, change.layout.floating])).toEqual([['float', { properties: { x: 40, y: 30, width: 280, height: 200 } }]])
    // 浮着的面板不在栏里，右栏没有别的面板就不出
    expect(frame.querySelector('[data-part="stack"][data-position="end"]')).toBeNull()
    expect(frame.panelEntries().find(entry => entry.name === 'properties')).toMatchObject({ shown: true, floating: true, dock: 'end' })

    const dock = float.querySelector<HTMLElement>('[data-part="float-dock"]')!
    expect(dock.getAttribute('aria-label')).toBe('Dock 属性')
    dock.click()
    await frame.updateComplete
    expect([seen.at(-1)!.reason, seen.at(-1)!.layout.floating]).toEqual(['dock', {}])
    expect(frame.querySelector('xh-floating-panel[data-part="float"]')).toBeNull()
    expect(region('properties')!.closest('[data-part="stack"]')!.getAttribute('data-position')).toBe('end')
  })

  it('全部显隐：有面板显示着就全部隐藏，再按一次放回；还原只管显隐，恢复默认连位置一起复原', async () => {
    await mount((element) => {
      element.regions = [...CARDS, { name: 'outline', position: 'start', title: '结构', defaultHidden: true }]
      element.layout = { version: 1, hidden: ['issues'], docks: { end: ['palette', 'properties'] } }
    })
    const seen = record()
    frame.toggleAllPanels()
    await frame.updateComplete
    expect(seen.at(-1)!.layout.hidden).toEqual(['issues', 'palette', 'properties', 'outline'])
    expect(frame.querySelector('[data-part="splitter"]')).toBeNull()
    frame.toggleAllPanels()
    await frame.updateComplete
    expect(seen.at(-1)!.layout.hidden).toEqual(['issues'])
    frame.restorePanels()
    await frame.updateComplete
    expect([seen.at(-1)!.layout.hidden, seen.at(-1)!.layout.docks.end]).toEqual([['outline'], ['palette', 'properties']])
    frame.resetLayout()
    await frame.updateComplete
    expect([seen.at(-1)!.reason, seen.at(-1)!.layout.docks]).toEqual(['reset', { start: ['palette', 'outline'], end: ['properties'], bottom: ['issues'] }])
  })

  it('宿主的缺省布局：没存过布局时用它，恢复默认也回到它', async () => {
    await mount((element) => {
      element.regions = CARDS
      element.defaultLayout = { version: 1, hidden: ['issues'], docks: { start: ['properties'] } }
    })
    expect([region('issues'), region('properties')!.closest('[data-part="stack"]')!.getAttribute('data-position')]).toEqual([null, 'start'])
    frame.layout = { version: 1, hidden: [] }
    await frame.updateComplete
    expect(region('issues')).not.toBeNull()
    const seen = record()
    frame.resetLayout()
    await frame.updateComplete
    expect(seen.at(-1)!.layout).toMatchObject({ hidden: ['issues'], docks: { start: ['properties', 'palette'], end: [] } })
  })

  it('宿主管控：整份锁定时面板头不出收起、更多与关闭，各种改法都不动；藏掉的面板不存在，锁定的面板固定', async () => {
    await mount((element) => {
      element.regions = CARDS
      element.layoutPolicy = { locked: true }
    })
    const card = region('palette')!
    expect(['panel-minimize', 'panel-menu-trigger', 'panel-close'].map(part => card.querySelector<HTMLElement>(`[data-part="${part}"]`)!.hidden)).toEqual([true, true, true])
    const seen = record()
    frame.setPanelVisible('palette', false)
    frame.movePanel('palette', 'end')
    frame.setPanelMinimized('palette', true)
    frame.floatPanel('palette')
    frame.toggleAllPanels()
    frame.resetLayout()
    await frame.updateComplete
    expect(seen).toEqual([])
    expect(frame.panelEntries().every(entry => entry.locked)).toBe(true)

    frame.layoutPolicy = { panels: { issues: 'hidden', palette: 'locked' } }
    await frame.updateComplete
    expect([region('issues'), frame.panelEntries().map(entry => [entry.name, entry.locked])]).toEqual([null, [['palette', true], ['properties', false]]])
    expect(region('properties')!.querySelector<HTMLElement>('[data-part="panel-close"]')!.hidden).toBe(false)
    frame.layout = { version: 1, hidden: ['issues'] }
    await frame.updateComplete
    expect(region('issues')).toBeNull()
  })

  it('画布浮动件按 anchor 放进画布的角上，作者在那个角的内容不动；隐藏时收起，进面板菜单', async () => {
    await mount((element) => {
      element.regions = [...CARDS, { name: 'minimap', position: 'overlay', anchor: 'bottom-end', label: '小地图' }]
    })
    const map = document.createElement('div')
    map.slot = 'minimap'
    const note = document.createElement('div')
    note.slot = 'canvas-bottom-end'
    frame.append(map, note)
    await settle()
    const overlay = region('minimap')!
    expect([overlay.parentElement!.getAttribute('data-overlay'), map.parentElement, note.parentElement]).toEqual(['bottom-end', overlay, overlay.parentElement])
    expect(frame.panelEntries().find(entry => entry.name === 'minimap')).toMatchObject({ label: '小地图', shown: true, minimized: false, floating: false })
    frame.togglePanel('minimap')
    await frame.updateComplete
    expect([overlay.hidden, overlay.isConnected, frame.showsPanel('minimap')]).toEqual([true, true, false])
  })

  it('revealPanel：隐藏的面板返回 false；收起的栏放回、收成标题条的展开', async () => {
    await mount((element) => {
      element.regions = CARDS
      element.layout = { version: 1, hidden: ['issues'], minimized: ['palette'], collapsed: ['start'] }
    })
    expect(frame.revealPanel('issues')).toBe(false)
    const seen = record()
    expect(frame.revealPanel('palette')).toBe(true)
    await frame.updateComplete
    expect([seen.at(-1)!.layout.collapsed, seen.at(-1)!.layout.minimized]).toEqual([[], []])
  })
})
