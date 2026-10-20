// 菜单栏正中一段与状态栏右端在真实 Chromium 里：宿主写在设计器元素上的 slot="menubar-center" 经 forwardFrameSlots 进外框，
// 按整条菜单栏的宽度居中，不随两边内容的宽窄偏；放不下时截断加省略号、不压菜单与行尾，连几个字宽都放不下就藏起，变宽了回来。
// slot="status-end" 放在状态栏右端，排在设计器自己的状态项前面；状态栏去掉时一起收起，再登记时照原来的顺序放回。
// 截断那一档的结构分别装进只引有层与只引无层两种搭配的 iframe 再量一遍。
import type { XhDesignerFrameElement } from '../../src'
import shellUnlayeredUrl from '@xihan-ui/designer-shell/style.unlayered.css?url'
import layeredUrl from '@xihan-ui/styles/index.css?url'
import unlayeredUrl from '@xihan-ui/styles/index.unlayered.css?url'
import tokensUrl from '@xihan-ui/tokens/tokens.css?url'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { createStatusItem, defineDesignerShell, forwardFrameSlots } from '../../src'
import shellUrl from '../../style.css?url'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'
import '../../style.css'

defineDesignerShell()

const SHEETS = {
  layered: [tokensUrl, layeredUrl, shellUrl],
  unlayered: [tokensUrl, unlayeredUrl, shellUnlayeredUrl],
} as const

const REGIONS = [
  { name: 'menubar', position: 'menubar' },
  { name: 'canvas', position: 'center' },
  { name: 'status', position: 'status' },
] as const

let host: HTMLElement
let frame: XhDesignerFrameElement
let title: HTMLElement
let zoom: ReturnType<typeof createStatusItem>
const frames: HTMLIFrameElement[] = []

async function settle(): Promise<void> {
  for (let round = 0; round < 4; round++) {
    await frame.updateComplete
    await new Promise(resolve => requestAnimationFrame(resolve))
  }
}

/** 一块定宽的作者内容：充当菜单栏本身或行尾的内容。 */
function block(slot: string, width: number, text: string): HTMLElement {
  const element = document.createElement('div')
  element.slot = slot
  element.textContent = text
  element.style.cssText = `flex:none;box-sizing:border-box;width:${width}px;height:24px`
  return element
}

beforeEach(async () => {
  host = document.createElement('div')
  host.style.cssText = 'position:fixed;left:0;top:0;width:1000px;height:400px;display:flex'
  frame = document.createElement('xh-designer-frame')
  frame.style.cssText = 'flex:1;min-width:0'
  frame.regions = REGIONS
  zoom = createStatusItem(document, { value: '100%' })
  zoom.element.slot = 'status-end'
  frame.append(block('menubar', 320, 'File Edit View Help'), document.createElement('div'), zoom.element)
  title = document.createElement('span')
  title.slot = 'menubar-center'
  title.textContent = 'Purchase order approval template'
  host.append(frame, title, block('menubar-end', 80, 'Draft'))
  document.body.prepend(host)
  forwardFrameSlots(host, frame, ['menubar-center', 'menubar-end', 'status-end'])
  await settle()
})

afterEach(() => {
  host.remove()
  for (const element of frames)
    element.remove()
  frames.length = 0
})

function zone(doc: Document, region: string, name: string): HTMLElement {
  return doc.querySelector<HTMLElement>(`[data-part="region"][data-region="${region}"] > [data-part="zone"][data-zone="${name}"]`)!
}

function bar(doc: Document): HTMLElement {
  return doc.querySelector<HTMLElement>('[data-part="region"][data-region="menubar"]')!
}

function middle(element: Element): number {
  const box = element.getBoundingClientRect()
  return box.left + box.width / 2
}

/** 正中一段与两边的内容之间至少留出菜单栏的列间距，且两段都在菜单栏里。 */
function clearOfSides(doc: Document): boolean {
  const view = doc.defaultView!
  const gap = Number.parseFloat(view.getComputedStyle(bar(doc)).columnGap)
  const center = zone(doc, 'menubar', 'center').getBoundingClientRect()
  const start = zone(doc, 'menubar', 'start').getBoundingClientRect()
  const end = zone(doc, 'menubar', 'end').getBoundingClientRect()
  return center.left >= start.right + gap - 0.5 && center.right <= end.left - gap + 0.5
}

async function resize(width: number): Promise<void> {
  host.style.width = `${width}px`
  await settle()
}

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
  doc.body.innerHTML = document.body.innerHTML
  await Promise.all(loaded)
  return doc
}

describe('菜单栏正中一段（Chromium）', () => {
  it('按整条菜单栏的宽度居中：行首一段宽、行尾一段窄时也在正中，不是两段之间剩下那块的正中；换了文字照样居中', async () => {
    const center = zone(document, 'menubar', 'center')
    expect(title.parentElement).toBe(center)
    expect(Math.abs(middle(center) - middle(bar(document)))).toBeLessThanOrEqual(0.5)
    const between = (zone(document, 'menubar', 'start').getBoundingClientRect().right + zone(document, 'menubar', 'end').getBoundingClientRect().left) / 2
    expect(Math.abs(between - middle(bar(document)))).toBeGreaterThan(50)
    expect([title.scrollWidth <= title.clientWidth, clearOfSides(document)]).toEqual([true, true])
    title.textContent = 'PO'
    await settle()
    expect(Math.abs(middle(center) - middle(bar(document)))).toBeLessThanOrEqual(0.5)
    title.textContent = 'Purchase order approval template with a much longer name'
    await settle()
    expect(Math.abs(middle(center) - middle(bar(document)))).toBeLessThanOrEqual(0.5)
  })

  it('两边留给它的空当放不下时截断加省略号，仍在正中，不压菜单与行尾；空当连几个字宽都不到就藏起，变宽了回来', async () => {
    const center = zone(document, 'menubar', 'center')
    await resize(820)
    expect([center.checkVisibility(), clearOfSides(document)]).toEqual([true, true])
    expect(Math.abs(middle(center) - middle(bar(document)))).toBeLessThanOrEqual(0.5)
    expect([title.scrollWidth > title.clientWidth, getComputedStyle(title).textOverflow]).toEqual([true, 'ellipsis'])
    expect(zone(document, 'menubar', 'start').getBoundingClientRect().width).toBeCloseTo(320, 0)

    await resize(700)
    expect(center.checkVisibility()).toBe(false)
    expect(zone(document, 'menubar', 'start').getBoundingClientRect().width).toBeCloseTo(320, 0)

    await resize(1000)
    expect([center.checkVisibility(), title.scrollWidth <= title.clientWidth, clearOfSides(document)]).toEqual([true, true, true])
    expect(Math.abs(middle(center) - middle(bar(document)))).toBeLessThanOrEqual(0.5)
  })

  describe.each(Object.keys(SHEETS) as (keyof typeof SHEETS)[])('截断那一档的结构（%s）', (kind) => {
    it('正中一段仍在整条菜单栏的正中，不压两边，里面的文字截断加省略号', async () => {
      await resize(820)
      const doc = await stage(SHEETS[kind])
      const center = zone(doc, 'menubar', 'center')
      const text = center.firstElementChild!
      expect(center.checkVisibility()).toBe(true)
      expect(Math.abs(middle(center) - middle(bar(doc)))).toBeLessThanOrEqual(0.5)
      expect(clearOfSides(doc)).toBe(true)
      expect([text.scrollWidth > text.clientWidth, doc.defaultView!.getComputedStyle(text).textOverflow]).toEqual([true, 'ellipsis'])
    })
  })
})

describe('状态栏右端的宿主内容（Chromium）', () => {
  it('slot="status-end" 贴在状态栏右端，排在设计器自己的状态项前面，后加的也一样；去掉状态栏时一起收起，再登记时照原来的顺序放回', async () => {
    const saved = document.createElement('span')
    saved.slot = 'status-end'
    saved.textContent = 'Saved'
    host.append(saved)
    await settle()
    const order = (): string[] => [...zone(document, 'status', 'end').children].map(node => node.textContent!)
    expect(order()).toEqual(['Saved', '100%'])
    const region = document.querySelector('[data-part="region"][data-region="status"]')!
    const padding = Number.parseFloat(getComputedStyle(region).paddingRight)
    expect(zoom.element.getBoundingClientRect().right).toBeCloseTo(region.getBoundingClientRect().right - padding, 0)
    expect(saved.getBoundingClientRect().right).toBeLessThanOrEqual(zoom.element.getBoundingClientRect().left + 0.5)

    const conn = document.createElement('span')
    conn.slot = 'status-end'
    conn.textContent = 'Online'
    host.append(conn)
    await settle()
    expect(order()).toEqual(['Saved', 'Online', '100%'])

    frame.regions = REGIONS.filter(item => item.name !== 'status')
    await settle()
    expect([saved.checkVisibility(), conn.checkVisibility(), zoom.element.checkVisibility()]).toEqual([false, false, false])
    frame.regions = REGIONS
    await settle()
    expect(order()).toEqual(['Saved', 'Online', '100%'])
    expect(saved.checkVisibility()).toBe(true)
  })
})
