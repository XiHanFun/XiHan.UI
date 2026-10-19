// 外框的面板布局在真实 Chromium 里：按住面板头拖到外框边上换栏、拖进一栏两块面板之间调序、拖到画布上浮出；
// 浮出的小窗夹在外框里，挪完停一会儿派发 layout-change；收成标题条的面板只占面板头的高度，一栏全收起时几条面板头贴着栏顶。
// 小窗与菜单的宿主不占排版；「更多」菜单选了条目就收起、焦点回到面板头；小窗里正文能滚，帮助钮在小窗标题栏上；
// 面板头的标题至少留四个字宽，操作区放不下的钮收进面板头的「更多」菜单。
import type { DiagnosticRecord } from '@xihan-ui/core'
import type { DesignerFrameEventMap, DesignerLayoutChangeReason, ResolvedDesignerLayout, XhDesignerFrameElement } from '../../src'
import { onDiagnostic, resetDiagnostics, setDiagnosticsConsoleOutput, setDiagnosticsDedupe, setDiagnosticsLevel } from '@xihan-ui/core'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { page, userEvent } from 'vitest/browser'
import { createPanelActions, defineDesignerShell } from '../../src'
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

  it('浮出的小窗挪出外框时夹回框内，松手时派发一次 float', async () => {
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
    expect(seen.map(change => [change.reason, change.layout.floating.properties])).toEqual([['float', { x: 0, y: 0, width: 260, height: 200 }]])
    await new Promise(resolve => setTimeout(resolve, 400))
    expect(seen).toHaveLength(1)
  })

  it('拖着小窗的标题栏：拖动中出现停靠条，松在左边的停靠条上吸回左栏末尾，派发 dock', async () => {
    frame.floatPanel('properties', { x: 400, y: 200, width: 260, height: 200 })
    await settle()
    seen.length = 0
    const float = frame.querySelector<HTMLElement>('xh-floating-panel[data-part="float"]')!
    const trigger = float.querySelector<HTMLElement>('[data-xh-part="drag-trigger"]')!
    const handle = trigger.getBoundingClientRect()
    const x = handle.left + handle.width / 2
    const y = handle.top + handle.height / 2
    pointer(trigger, 'pointerdown', x, y)
    pointer(document, 'pointermove', x - 20, y)
    pointer(document, 'pointermove', x - 40, y)
    await new Promise(resolve => requestAnimationFrame(resolve))
    expect(frame.hasAttribute('data-panel-drag')).toBe(true)
    const strip = frame.querySelector<HTMLElement>('[data-part="drop-edge"][data-dock="start"]')!
    const edge = strip.getBoundingClientRect()
    pointer(document, 'pointermove', edge.left + edge.width / 2, edge.top + edge.height / 2)
    expect(strip.hasAttribute('data-active')).toBe(true)
    pointer(document, 'pointerup', edge.left + edge.width / 2, edge.top + edge.height / 2)
    await settle()
    expect(frame.hasAttribute('data-panel-drag')).toBe(false)
    expect(seen.map(change => [change.reason, change.layout.docks.start, change.layout.floating])).toEqual([['dock', ['palette', 'outline', 'properties'], {}]])
    expect([frame.querySelector('xh-floating-panel[data-part="float"]'), stackOf('properties')]).toEqual([null, 'start'])
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

  it('面板头的收起、更多、关闭与小窗的停靠各画各的图形；收成标题条后收起钮换成朝下的图形', async () => {
    const glyph = (element: Element): string => {
      const style = getComputedStyle(element, '::before')
      return style.getPropertyValue('mask-image') || style.getPropertyValue('-webkit-mask-image')
    }
    const button = (name: string, part: string): HTMLElement => headerOf(name).querySelector<HTMLElement>(`[data-part="${part}"]`)!
    const [minimize, menu, close] = ['panel-minimize', 'panel-menu-trigger', 'panel-close'].map(part => glyph(button('properties', part)))
    expect(new Set([minimize, menu, close]).size).toBe(3)
    frame.setPanelMinimized('properties', true)
    await settle()
    expect(glyph(button('properties', 'panel-minimize'))).not.toBe(minimize)
    expect(glyph(button('properties', 'panel-minimize'))).not.toBe(close)
    frame.floatPanel('issues', { x: 200, y: 200, width: 260, height: 200 })
    await settle()
    const dock = frame.querySelector<HTMLElement>('xh-floating-panel[data-part="float"] [data-part="float-dock"]')!
    expect([glyph(dock) === close, glyph(dock) === menu]).toEqual([false, false])
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

/** 一块面板的「更多」钮。 */
function menuTriggerOf(name: string): HTMLButtonElement {
  return headerOf(name).querySelector<HTMLButtonElement>('[data-part="panel-menu-trigger"]')!
}

/** 此刻开着的面板菜单。 */
function openMenus(): HTMLElement[] {
  return Array.from(frame.querySelectorAll<HTMLElement & { open?: boolean }>('[data-part="menus"] > xh-menu')).filter(menu => menu.open === true)
}

describe('<xh-designer-frame> 小窗与面板菜单（Chromium）', () => {
  it('小窗与菜单的宿主不占排版：往里放一块升级前那样的静态大块，画布的位置与大小不变', async () => {
    const before = region('canvas').getBoundingClientRect()
    for (const part of ['floats', 'menus']) {
      const block = document.createElement('div')
      block.style.cssText = 'width:1200px;height:520px'
      frame.querySelector(`[data-part="${part}"]`)!.append(block)
      const after = region('canvas').getBoundingClientRect()
      expect([after.left, after.top, after.width, after.height]).toEqual([before.left, before.top, before.width, before.height])
      block.remove()
    }
  })

  it('键盘在「更多」菜单里选「移到右侧」：面板挪到右栏，菜单收起，焦点回到挪过去的那块面板的「更多」钮', async () => {
    menuTriggerOf('palette').focus()
    await userEvent.keyboard('{Enter}')
    await settle()
    expect(openMenus()).toHaveLength(1)
    const first = document.activeElement as HTMLElement
    expect(first.textContent).toBe('Move to right side')
    await userEvent.keyboard('{Enter}')
    await settle()
    expect(stackOf('palette')).toBe('end')
    expect(openMenus()).toEqual([])
    expect(document.activeElement).toBe(menuTriggerOf('palette'))
    expect(menuTriggerOf('palette').getAttribute('aria-expanded')).not.toBe('true')
  })

  it('窄屏抽屉里用「更多」菜单隐藏最后一块面板：抽屉随之收起，菜单收起，不报 core.layer.dispose-not-top', async () => {
    const records: DiagnosticRecord[] = []
    resetDiagnostics()
    setDiagnosticsLevel('warn')
    setDiagnosticsDedupe(false)
    setDiagnosticsConsoleOutput(false)
    const off = onDiagnostic(record => void records.push(record))
    await page.viewport(375, 700)
    try {
      frame.style.cssText = 'position:fixed;inset:0'
      frame.setPanelVisible('outline', false)
      await settle()
      expect(frame.narrow).toBe(true)
      frame.openDrawer = 'start'
      await settle()
      await userEvent.click(menuTriggerOf('palette'))
      await settle()
      const hide = Array.from(document.querySelectorAll<HTMLElement>('[role="menuitem"]')).find(item => item.textContent === 'Hide')!
      await userEvent.click(hide)
      for (let round = 0; round < 30; round++)
        await new Promise(resolve => requestAnimationFrame(resolve))
      expect(frame.resolvedLayout.hidden).toContain('palette')
      expect(frame.openDrawer).toBeUndefined()
      expect(openMenus()).toEqual([])
      expect(records.map(record => record.code)).not.toContain('core.layer.dispose-not-top')
    }
    finally {
      off()
      resetDiagnostics()
      await page.viewport(1280, 800)
    }
  })

  it('浮出的小窗：缺省大小有下限；帮助钮在小窗的标题栏上，面板头没别的就收起；内容比小窗高时正文能滚；吸回后帮助钮回到面板头', async () => {
    frame.regions = frame.regions!.map(item => item.name === 'outline' ? { ...item, help: '页面上的元素' } : item)
    frame.querySelector<HTMLElement>('[slot="outline"]')!.style.cssText = 'flex:none;height:900px'
    await settle()
    frame.floatPanel('outline')
    await settle()
    const float = frame.querySelector<HTMLElement>('xh-floating-panel[data-region="outline"]')!
    const content = float.querySelector<HTMLElement>('[data-part="content"]')!.getBoundingClientRect()
    expect(content.width).toBeGreaterThanOrEqual(280)
    expect(content.height).toBeGreaterThanOrEqual(240)
    expect(float.querySelector('[data-xh-part="header"] [data-part="panel-help-tip"], [data-part="header"] [data-part="panel-help-tip"]')).not.toBeNull()
    expect(headerOf('outline').hidden).toBe(true)
    const body = region('outline').querySelector<HTMLElement>(':scope > [data-part="panel-body"]')!
    expect(body.scrollHeight).toBeGreaterThan(body.clientHeight)
    expect(body.getBoundingClientRect().bottom).toBeLessThanOrEqual(content.bottom + 1)
    body.scrollTop = 120
    expect(body.scrollTop).toBeGreaterThan(0)
    frame.dockPanel('outline')
    await settle()
    expect(headerOf('outline').querySelector('[data-part="panel-help-tip"]')).not.toBeNull()
    expect(headerOf('outline').hidden).toBe(false)
  })
})

describe('<xh-designer-frame> 面板头的操作区（Chromium）', () => {
  it('左栏窄时标题至少留四个字宽，操作区放不下的钮收进面板头的「更多」菜单、排在最前，命令条自己的「更多」不出现；选了就执行', async () => {
    const ran: string[] = []
    const icon = { name: 'dot', viewBox: '0 0 24 24', nodes: [{ tag: 'circle' as const, attrs: { cx: '12', cy: '12', r: '6' } }] }
    const ids = ['a', 'b', 'c', 'd', 'e', 'f']
    const commands = new Map(ids.map(id => [id, { id, label: `操作 ${id}`, icon, run: () => void ran.push(id) }]))
    const actions = createPanelActions<undefined>(document, 'palette')
    frame.append(actions.element)
    actions.update(ids, commands, undefined, '物料操作')
    await settle()
    await settle()
    const heading = headerOf('palette').querySelector<HTMLElement>('[data-part="panel-heading"]')!
    const fontSize = Number.parseFloat(getComputedStyle(headerOf('palette').querySelector('[data-part="panel-title"]')!).fontSize)
    expect(heading.getBoundingClientRect().width).toBeGreaterThanOrEqual(fontSize * 4 - 1)
    const buttons = Array.from(headerOf('palette').querySelectorAll<HTMLButtonElement>('[data-part="panel-actions"] button[value]'))
    const hidden = buttons.filter(button => button.hidden).map(button => button.value)
    expect(hidden.length).toBeGreaterThan(0)
    expect(buttons.filter(button => !button.hidden).every(button => button.getBoundingClientRect().right <= headerOf('palette').getBoundingClientRect().right + 1)).toBe(true)
    const own = headerOf('palette').querySelector<HTMLElement>('[data-part="panel-actions"] [data-part="overflow-trigger"]')
    expect(own === null || own.getBoundingClientRect().width === 0).toBe(true)
    await userEvent.click(menuTriggerOf('palette'))
    await settle()
    const items = (): HTMLElement[] => Array.from(document.querySelectorAll<HTMLElement>('[role="menuitem"]')).filter(item => item.checkVisibility())
    expect(items().slice(0, hidden.length).map(item => item.textContent)).toEqual(hidden.map(id => `操作 ${id}`))
    await userEvent.click(items()[0]!)
    await settle()
    expect(ran).toEqual([hidden[0]])
    actions.element.remove()
  })
})
