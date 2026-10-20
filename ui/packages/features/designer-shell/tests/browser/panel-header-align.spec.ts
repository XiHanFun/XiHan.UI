// 面板头在真实 Chromium 里：标题第一行与同一排的钮（帮助、收起、更多、关闭，操作区的内容）中线对齐，副标题在下面一行；
// 收成标题条、操作区另起一行时照样对齐；浮出的小窗标题栏里标题与停靠、收拢、关闭钮对齐，正文顶上的面板头副标题与操作区对齐。
// 有层（@xihan-ui/styles 配 style.css）与无层（index.unlayered.css 配 style.unlayered.css）两种搭配分别装进 iframe 量。
import type { XhDesignerFrameElement } from '../../src'
import shellUnlayeredUrl from '@xihan-ui/designer-shell/style.unlayered.css?url'
import layeredUrl from '@xihan-ui/styles/index.css?url'
import unlayeredUrl from '@xihan-ui/styles/index.unlayered.css?url'
import tokensUrl from '@xihan-ui/tokens/tokens.css?url'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { defineDesignerShell } from '../../src'
import shellUrl from '../../style.css?url'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'
import '../../style.css'

defineDesignerShell()

const SHEETS = {
  layered: [tokensUrl, layeredUrl, shellUrl],
  unlayered: [tokensUrl, unlayeredUrl, shellUnlayeredUrl],
} as const

let frame: XhDesignerFrameElement
let markup = ''
const frames: HTMLIFrameElement[] = []

async function nextFrames(count = 2): Promise<void> {
  for (let i = 0; i < count; i++)
    await new Promise(resolve => requestAnimationFrame(resolve))
}

/** 操作区里的一样作者内容：比面板头的钮矮一档。 */
function action(region: string, width: number): HTMLElement {
  const element = document.createElement('button')
  element.slot = `${region}-actions`
  element.textContent = region
  element.style.cssText = `flex:none;box-sizing:border-box;width:${width}px;height:24px;margin:0`
  return element
}

beforeAll(async () => {
  frame = document.createElement('xh-designer-frame')
  frame.style.cssText = 'position:absolute;left:0;top:0;width:1200px;height:760px'
  frame.regions = [
    { name: 'palette', position: 'start', title: 'Palette', subtitle: 'Drag onto the canvas', help: 'Drop at the center', closable: true, minimizable: true },
    { name: 'layers', position: 'start', title: 'Layers', help: 'Layer order', closable: true, minimizable: true },
    { name: 'canvas', position: 'center' },
    { name: 'properties', position: 'end', title: 'Properties', help: 'Selected node', closable: true, minimizable: true },
    { name: 'outline', position: 'end', title: 'Outline', help: 'Document tree', closable: true, minimizable: true },
    { name: 'history', position: 'end', title: 'History', subtitle: 'Undo steps', help: 'Go back', closable: true, minimizable: true, floatable: true },
  ]
  for (const name of ['palette', 'layers', 'properties', 'outline', 'history']) {
    const content = document.createElement('div')
    content.slot = name
    content.textContent = name
    frame.append(content)
  }
  frame.append(action('layers', 160), action('properties', 48), action('history', 48), document.createElement('div'))
  document.body.prepend(frame)
  await frame.updateComplete
  await nextFrames()
  frame.setPanelMinimized('outline', true)
  frame.floatPanel('history', { x: 420, y: 160, width: 300, height: 220 })
  await frame.updateComplete
  await nextFrames(4)
  markup = document.body.innerHTML
})

afterAll(() => {
  frame.remove()
  for (const element of frames)
    element.remove()
})

/** 把同一份标记装进只引一种搭配的 iframe，样式表装载完再交出文档。 */
async function stage(sheets: readonly string[]): Promise<Document> {
  const element = document.createElement('iframe')
  element.style.cssText = 'position: fixed; inset: 0 auto auto 0; width: 1280px; height: 800px; border: 0; visibility: hidden'
  document.body.append(element)
  frames.push(element)
  const doc = element.contentDocument!
  doc.documentElement.setAttribute('data-theme', 'light')
  doc.documentElement.setAttribute('lang', 'en')
  const loaded = sheets.map(href => new Promise<void>((resolve, reject) => {
    const link = doc.createElement('link')
    link.rel = 'stylesheet'
    link.href = href
    link.addEventListener('load', () => resolve())
    link.addEventListener('error', () => reject(new Error(`样式表装不上：${href}`)))
    doc.head.append(link)
  }))
  const still = doc.createElement('style')
  still.textContent = '*, *::before, *::after { transition: none !important; animation: none !important; }'
  doc.head.append(still)
  doc.body.style.margin = '0'
  doc.body.innerHTML = markup
  await Promise.all(loaded)
  return doc
}

function visible(element: Element): boolean {
  return element.checkVisibility()
}

function middle(element: Element): number {
  const box = element.getBoundingClientRect()
  return box.top + box.height / 2
}

/** 文字第一行的中线：行高是定值时取内容框顶加半个行高，否则取第一行字形框的中线。 */
function firstLine(element: Element): number {
  const view = element.ownerDocument.defaultView!
  const style = view.getComputedStyle(element)
  const lineHeight = Number.parseFloat(style.lineHeight)
  if (Number.isFinite(lineHeight))
    return element.getBoundingClientRect().top + Number.parseFloat(style.borderTopWidth) + Number.parseFloat(style.paddingTop) + lineHeight / 2
  const range = element.ownerDocument.createRange()
  range.selectNodeContents(element)
  const line = range.getClientRects()[0]!
  return line.top + line.height / 2
}

function nameOf(element: Element): string {
  return element.getAttribute('data-part') ?? element.getAttribute('data-xh-part') ?? element.textContent ?? element.localName
}

/** 文字第一行与每一样钮的中线差，超过 0.5px 的记成「钮：差」。 */
function misaligned(text: Element, controls: readonly Element[]): string[] {
  expect(visible(text)).toBe(true)
  expect(controls.length).toBeGreaterThan(0)
  const line = firstLine(text)
  return controls
    .filter(control => Math.abs(middle(control) - line) > 0.5)
    .map(control => `${nameOf(control)}: ${(middle(control) - line).toFixed(2)}px`)
}

function header(doc: Document, region: string): Element {
  return doc.querySelector(`[data-part="region"][data-region="${region}"] > [data-part="panel-header"]`)!
}

/** 面板头上和标题同一排的钮：帮助、收起、更多与关闭；操作区没有另起一行时还有操作区里的内容。 */
function rowControls(row: Element): Element[] {
  const buttons = Array.from(row.querySelectorAll(':scope > button, :scope > [data-part="panel-help-tip"] > button'))
  const actions = row.hasAttribute('data-wrapped') ? [] : Array.from(row.querySelectorAll(':scope > [data-part="panel-actions"] > *'))
  return [...buttons, ...actions].filter(visible)
}

describe.each(Object.keys(SHEETS) as (keyof typeof SHEETS)[])('面板头的标题与钮中线对齐（%s）', (kind) => {
  let doc: Document

  beforeAll(async () => {
    doc = await stage(SHEETS[kind])
  })

  it('有副标题：标题第一行与钮对齐，副标题在下面一行', () => {
    const row = header(doc, 'palette')
    const title = row.querySelector('[data-part="panel-title"]')!
    const subtitle = row.querySelector('[data-part="panel-subtitle"]')!
    expect(misaligned(title, rowControls(row))).toEqual([])
    expect(subtitle.getBoundingClientRect().top).toBeGreaterThanOrEqual(title.getBoundingClientRect().bottom - 0.5)
  })

  it('没有副标题：标题与钮、操作区里的内容对齐', () => {
    const row = header(doc, 'properties')
    expect(row.querySelector('[data-part="panel-actions"] > button')!.checkVisibility()).toBe(true)
    expect(misaligned(row.querySelector('[data-part="panel-title"]')!, rowControls(row))).toEqual([])
  })

  it('收成标题条：标题与展开、更多、关闭钮对齐', () => {
    const row = header(doc, 'outline')
    expect(row.parentElement!.hasAttribute('data-minimized')).toBe(true)
    expect(misaligned(row.querySelector('[data-part="panel-title"]')!, rowControls(row))).toEqual([])
  })

  it('操作区另起一行：标题仍与面板头的钮对齐，操作区在钮的下面', () => {
    const row = header(doc, 'layers')
    expect(row.hasAttribute('data-wrapped')).toBe(true)
    const buttons = rowControls(row)
    expect(misaligned(row.querySelector('[data-part="panel-title"]')!, buttons)).toEqual([])
    const actions = row.querySelector('[data-part="panel-actions"]')!
    expect(actions.getBoundingClientRect().top).toBeGreaterThanOrEqual(Math.max(...buttons.map(button => button.getBoundingClientRect().bottom)) - 0.5)
  })

  it('浮出窗口：小窗标题栏的标题与帮助、停靠、收拢、关闭钮对齐；正文顶上的副标题与操作区对齐', () => {
    const float = doc.querySelector('xh-floating-panel[data-region="history"]')!
    const bar = float.querySelector('[data-scope="floating-panel"][data-part="header"]')!
    const controls = Array.from(bar.querySelectorAll(':scope > button, :scope > [data-part="panel-help-tip"] > button'))
      .filter(control => visible(control) && control.getAttribute('data-part') !== 'drag-trigger')
    expect(controls.map(nameOf)).toEqual(expect.arrayContaining(['trigger', 'float-dock', 'window-state-trigger', 'close-trigger']))
    expect(misaligned(bar.querySelector('[data-scope="floating-panel"][data-part="title"]')!, controls)).toEqual([])
    const row = header(doc, 'history')
    expect(misaligned(row.querySelector('[data-part="panel-subtitle"]')!, rowControls(row))).toEqual([])
  })
})
