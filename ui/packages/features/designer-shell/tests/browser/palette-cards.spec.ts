// 物料面板平铺的组在真实 Chromium 里排成方形小卡片的网格：图标在上、名称在下，按面板宽度自动分几列，名称放不下就截断；
// 真实键盘左右键按排列走、上下键走到上一行与下一行同一列的那张（跨组也是），Enter 与 Space 插入；悬停显示「名称 · 说明」；
// 卡片照旧能拖出；读屏仍是带名字的一组按钮，名字只有名称、说明另行念出；右到左排列时左右键随之对调；暗色下 axe 没有违规。
import type { DesignerPaletteDragPayload, DesignerPaletteEventMap, DesignerPaletteGroup, XhDesignerPaletteElement } from '../../src'
import { expectNoAxeViolations } from '@xihan-ui/testing/a11y'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { page, userEvent } from 'vitest/browser'
import { defineDesignerShell, registerDropTarget } from '../../src'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'
import '../../style.css'

defineDesignerShell()

const check = { name: 'check', viewBox: '0 0 24 24', nodes: [{ tag: 'path', attrs: { d: 'M5 12l5 5L20 7' } }] } as const

const groups: DesignerPaletteGroup[] = [
  { id: 'basic', label: '基础', items: [
    { id: 'text', label: '文本', icon: check, description: '一行或多行文字', payload: 'text' },
    { id: 'image', label: '图片', icon: check, payload: 'image' },
    { id: 'barcode', label: '条形码', icon: check, payload: 'barcode' },
    { id: 'qrcode', label: '二维码', icon: check, payload: 'qrcode' },
    { id: 'long', label: '一个名字特别长放不下的物料', icon: check, description: '名字很长', payload: 'long' },
    { id: 'page', label: '页码', icon: check, disabled: true },
  ] },
  { id: 'layout', label: '布局', items: [
    { id: 'line', label: '线条', icon: check, payload: 'line' },
    { id: 'rect', label: '矩形', icon: check, payload: 'rect' },
  ] },
]

let fixture: HTMLElement

beforeEach(() => {
  fixture = document.createElement('div')
  fixture.style.cssText = 'position:fixed;inset:0 auto auto 0;display:flex;gap:40px;padding:20px;width:1200px'
  document.body.prepend(fixture)
})

afterEach(() => {
  fixture.remove()
  document.documentElement.removeAttribute('data-theme')
})

async function mount(width = 240, dir?: 'rtl'): Promise<{ palette: XhDesignerPaletteElement, activated: string[] }> {
  const palette = document.createElement('xh-designer-palette')
  palette.style.cssText = `width:${width}px`
  if (dir)
    palette.setAttribute('dir', dir)
  palette.groups = groups
  fixture.append(palette)
  await palette.updateComplete
  await new Promise(resolve => requestAnimationFrame(resolve))
  const activated: string[] = []
  palette.addEventListener('item-activate', event => activated.push((event as DesignerPaletteEventMap['item-activate']).detail.id))
  return { palette, activated }
}

function card(palette: Element, id: string): HTMLButtonElement {
  return palette.querySelector<HTMLButtonElement>(`button[data-part="item"][data-id="${id}"]`)!
}

function box(element: Element): DOMRect {
  return element.getBoundingClientRect()
}

/** 同一行（顶边相差不到 1px）的卡片 id，按从左到右。 */
function rows(palette: Element, group: string): string[][] {
  const cards = [...palette.querySelectorAll<HTMLElement>(`[data-part="group"]:has([data-id="${group === 'basic' ? 'text' : 'line'}"]) button[data-part="item"]`)]
  const out: { top: number, ids: { id: string, left: number }[] }[] = []
  for (const element of cards) {
    const rect = box(element)
    const line = out.find(item => Math.abs(item.top - rect.top) < 1)
    if (line)
      line.ids.push({ id: element.dataset.id!, left: rect.left })
    else
      out.push({ top: rect.top, ids: [{ id: element.dataset.id!, left: rect.left }] })
  }
  return out.sort((a, b) => a.top - b.top).map(line => line.ids.sort((a, b) => a.left - b.left).map(item => item.id))
}

function pointer(target: EventTarget, type: string, x: number, y: number): void {
  target.dispatchEvent(new PointerEvent(type, { bubbles: true, cancelable: true, composed: true, pointerId: 1, isPrimary: true, pointerType: 'mouse', button: 0, clientX: x, clientY: y }))
}

function center(element: Element): { x: number, y: number } {
  const rect = box(element)
  return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 }
}

async function until(check: () => boolean, message: string): Promise<void> {
  const start = performance.now()
  while (!check()) {
    if (performance.now() - start > 3000)
      throw new Error(`等了 3 秒仍没到：${message}`)
    await new Promise(resolve => requestAnimationFrame(resolve))
  }
}

describe('物料面板的卡片网格（Chromium）', () => {
  it('方形小卡片：图标在上、名称在下，240 宽排三列，各组是组名一行、下面是卡片；名称放不下就截断，面板不横向溢出', async () => {
    const { palette } = await mount()
    expect(rows(palette, 'basic')).toEqual([['text', 'image', 'barcode'], ['qrcode', 'long', 'page']])
    expect(rows(palette, 'layout')).toEqual([['line', 'rect']])
    for (const id of ['text', 'long', 'line']) {
      const rect = box(card(palette, id))
      expect(Math.abs(rect.width - rect.height), id).toBeLessThanOrEqual(1)
      const icon = box(card(palette, id).querySelector('[data-part="item-icon"]')!)
      const label = box(card(palette, id).querySelector('[data-part="item-label"]')!)
      expect(icon.bottom, id).toBeLessThanOrEqual(label.top + 1)
      expect(Math.abs(icon.left + icon.width / 2 - (rect.left + rect.width / 2)), id).toBeLessThanOrEqual(1)
    }
    const groupLabel = box(palette.querySelector('[data-part="group"]:has([data-id="line"]) [data-part="group-label"]')!)
    expect(groupLabel.bottom).toBeLessThanOrEqual(box(card(palette, 'line')).top + 1)
    const long = card(palette, 'long').querySelector<HTMLElement>('[data-part="item-label"]')!
    expect(long.scrollWidth).toBeGreaterThan(long.clientWidth)
    expect(getComputedStyle(long).textOverflow).toBe('ellipsis')
    const body = palette.querySelector<HTMLElement>('[data-part="body"]')!
    expect(body.scrollWidth).toBeLessThanOrEqual(body.clientWidth)
  })

  it('列数跟着面板宽度变：160 宽两列，460 宽一行放下六张', async () => {
    const narrow = await mount(160)
    expect(rows(narrow.palette, 'basic').map(line => line.length)).toEqual([2, 2, 2])
    narrow.palette.remove()
    const wide = await mount(460)
    expect(rows(wide.palette, 'basic').map(line => line.length)).toEqual([6])
  })

  it('读屏仍是带名字的一组按钮：名字只有名称，说明另行念出；整块一个 Tab 位', async () => {
    const { palette } = await mount()
    const group = page.getByRole('group', { name: '基础' }).element()
    expect(group.contains(card(palette, 'text'))).toBe(true)
    expect(page.getByRole('button', { name: '文本', exact: true }).element()).toBe(card(palette, 'text'))
    const describedBy = card(palette, 'text').getAttribute('aria-describedby')!
    expect(document.getElementById(describedBy)!.textContent).toBe('一行或多行文字')
    expect([...palette.querySelectorAll('button[data-part="item"]')].filter(item => item.getAttribute('tabindex') === '0')).toHaveLength(1)
  })

  it('真实键盘：左右键按排列走，上下键走到上一行与下一行同一列的那张，跨组也是；Home、End 到头尾，Enter 与 Space 插入', async () => {
    const { activated } = await mount()
    const before = document.createElement('button')
    before.textContent = 'before'
    fixture.prepend(before)
    before.focus()
    await userEvent.keyboard('{Tab}')
    const focused = (): string | undefined => (document.activeElement as HTMLElement | null)?.dataset.id
    expect(focused()).toBe('text')
    await userEvent.keyboard('{ArrowRight}')
    expect(focused()).toBe('image')
    await userEvent.keyboard('{ArrowDown}')
    expect(focused()).toBe('long')
    await userEvent.keyboard('{ArrowDown}')
    expect(focused()).toBe('rect')
    await userEvent.keyboard('{ArrowUp}')
    expect(focused()).toBe('long')
    await userEvent.keyboard('{ArrowLeft}')
    expect(focused()).toBe('qrcode')
    await userEvent.keyboard('{End}')
    expect(focused()).toBe('rect')
    await userEvent.keyboard('{Home}')
    expect(focused()).toBe('text')
    await userEvent.keyboard('{Enter}')
    await userEvent.keyboard('{ArrowRight} ')
    expect(activated).toEqual(['text', 'image'])
    before.remove()
  })

  it('右到左排列：第一张在最右，右键往排列的前一张走、左键往后一张走', async () => {
    const { palette } = await mount(240, 'rtl')
    expect(box(card(palette, 'text')).left).toBeGreaterThan(box(card(palette, 'barcode')).left)
    card(palette, 'image').focus()
    await userEvent.keyboard('{ArrowLeft}')
    expect((document.activeElement as HTMLElement).dataset.id).toBe('barcode')
    await userEvent.keyboard('{ArrowRight}{ArrowRight}')
    expect((document.activeElement as HTMLElement).dataset.id).toBe('text')
  })

  it('悬停一张卡片显示「名称 · 说明」，没有说明的只显示名称', async () => {
    const { palette } = await mount()
    const text = (): string | undefined => document.querySelector<HTMLElement>('[data-scope="tooltip"][data-part="content"][data-state="open"] [data-scope="tooltip"][data-part="text"]')?.textContent ?? undefined
    await userEvent.hover(card(palette, 'long'))
    await until(() => text() !== undefined, '提示打开')
    expect(text()).toBe('一个名字特别长放不下的物料 · 名字很长')
    await userEvent.hover(card(palette, 'image'))
    await until(() => text() === '图片', '提示换到图片')
    expect(card(palette, 'image').hasAttribute('aria-describedby')).toBe(false)
  })

  it('卡片照旧能拖到画布上交出载荷，不派发 item-activate；禁用的卡片拖不起来', async () => {
    const { palette, activated } = await mount()
    const canvas = document.createElement('div')
    canvas.style.cssText = 'width:600px;height:400px'
    fixture.append(canvas)
    const drops: DesignerPaletteDragPayload[] = []
    registerDropTarget<DesignerPaletteDragPayload>(canvas, { over: () => ({ accept: true }), drop: (_point, payload) => drops.push(payload) })
    for (const id of ['barcode', 'page']) {
      const source = card(palette, id)
      const start = center(source)
      pointer(source, 'pointerdown', start.x, start.y)
      const target = center(canvas)
      pointer(document, 'pointermove', target.x, target.y)
      pointer(document, 'pointerup', target.x, target.y)
      source.click()
    }
    expect(drops).toEqual([{ source: 'palette', id: 'barcode', payload: 'barcode' }])
    expect(activated).toEqual([])
  })

  it('亮色与暗色下 axe 都没有违规，卡片在暗色下仍是方形', async () => {
    for (const theme of ['light', 'dark'] as const) {
      document.documentElement.setAttribute('data-theme', theme)
      const { palette } = await mount()
      palette.style.background = 'var(--xh-bg-surface)'
      await expectNoAxeViolations(palette)
      const rect = box(card(palette, 'text'))
      expect(Math.abs(rect.width - rect.height)).toBeLessThanOrEqual(1)
      palette.remove()
    }
  })
})
