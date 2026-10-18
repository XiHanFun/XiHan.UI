// 物料面板带下级的一组在真实 Chromium 里：真实键盘按树的约定移动与展开，确认键激活；树里的行能拖到画布上，
// 按在展开箭头上不起拖；面板按钮的样式不落到树的部件上；axe 没有违规。
import type { DesignerPaletteDragPayload, DesignerPaletteEventMap, DesignerPaletteGroup, XhDesignerPaletteElement } from '../../src'
import { expectNoAxeViolations } from '@xihan-ui/testing/a11y'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { userEvent } from 'vitest/browser'
import { defineDesignerShell, registerDropTarget } from '../../src'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'
import '../../style.css'

defineDesignerShell()

let fixture: HTMLElement

beforeEach(() => {
  fixture = document.createElement('div')
  fixture.style.cssText = 'position:fixed;inset:0 auto auto 0;display:flex;gap:40px;padding:20px;width:1200px'
  document.body.prepend(fixture)
})

afterEach(() => {
  fixture.remove()
})

const fields: DesignerPaletteGroup = {
  id: 'fields',
  label: '字段',
  items: [
    { id: 'no', label: '单号', description: 'order.no', payload: 'no' },
    { id: 'items', label: '明细', description: 'order.items', payload: 'items', children: [
      { id: 'items.qty', label: '数量', description: 'qty', browseOnly: true },
    ] },
  ],
}

async function mount(): Promise<{ palette: XhDesignerPaletteElement, activated: string[] }> {
  const palette = document.createElement('xh-designer-palette')
  palette.style.cssText = 'width:240px'
  palette.groups = [{ id: 'g', label: '元素', items: [{ id: 'text', label: '文本' }] }, fields]
  fixture.append(palette)
  await palette.updateComplete
  const activated: string[] = []
  palette.addEventListener('item-activate', event => activated.push((event as DesignerPaletteEventMap['item-activate']).detail.id))
  return { palette, activated }
}

function row(palette: Element, id: string): HTMLElement {
  return palette.querySelector<HTMLElement>(`[data-scope="tree"][data-id="${id}"]`)!
}

function treeitem(palette: Element, id: string): HTMLElement {
  return palette.querySelector<HTMLElement>(`[role="treeitem"][value="${id}"]`)!
}

function pointer(target: EventTarget, type: string, x: number, y: number): void {
  target.dispatchEvent(new PointerEvent(type, { bubbles: true, cancelable: true, composed: true, pointerId: 1, isPrimary: true, pointerType: 'mouse', button: 0, clientX: x, clientY: y }))
}

function center(element: Element): { x: number, y: number } {
  const rect = element.getBoundingClientRect()
  return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 }
}

describe('物料面板带下级的一组（Chromium）', () => {
  it('真实键盘：Tab 进到树里，上下键移动，右键展开，回车激活；只作浏览的条目能走到、不激活', async () => {
    const { palette, activated } = await mount()
    palette.querySelector<HTMLButtonElement>('button[data-part="item"]')!.focus()
    await userEvent.tab()
    expect(document.activeElement).toBe(treeitem(palette, 'no'))
    await userEvent.keyboard('{Enter}')
    expect(activated).toEqual(['no'])
    await userEvent.keyboard('{ArrowDown}')
    expect(document.activeElement).toBe(treeitem(palette, 'items'))
    expect(treeitem(palette, 'items').getAttribute('aria-expanded')).toBe('false')
    await userEvent.keyboard('{ArrowRight}')
    expect(treeitem(palette, 'items').getAttribute('aria-expanded')).toBe('true')
    await userEvent.keyboard('{ArrowDown}')
    expect(document.activeElement).toBe(treeitem(palette, 'items.qty'))
    await userEvent.keyboard('{Enter}')
    expect(activated).toEqual(['no'])
    await expectNoAxeViolations(palette)
  })

  it('树里的行拖到画布上交出载荷，不派发 item-activate；按在展开箭头上只展开、不起拖', async () => {
    const { palette, activated } = await mount()
    const canvas = document.createElement('div')
    canvas.style.cssText = 'width:600px;height:400px;background:#eee'
    fixture.append(canvas)
    const drops: DesignerPaletteDragPayload[] = []
    registerDropTarget<DesignerPaletteDragPayload>(canvas, { over: () => ({ accept: true }), drop: (_point, payload) => drops.push(payload) })
    const source = row(palette, 'items')
    const start = center(source)
    pointer(source, 'pointerdown', start.x, start.y)
    const target = center(canvas)
    pointer(document, 'pointermove', target.x, target.y)
    pointer(document, 'pointerup', target.x, target.y)
    source.click()
    expect(drops).toEqual([{ source: 'palette', id: 'items', payload: 'items' }])
    expect(activated).toEqual([])

    const trigger = source.querySelector('[data-part="branch-trigger"]')!
    const at = center(trigger)
    pointer(trigger, 'pointerdown', at.x, at.y)
    pointer(document, 'pointermove', target.x, target.y)
    pointer(document, 'pointerup', target.x, target.y)
    expect(document.querySelector('[data-xh-designer-drag-preview]')).toBeNull()
    expect(drops).toHaveLength(1)
    await userEvent.click(trigger)
    expect(treeitem(palette, 'items').getAttribute('aria-expanded')).toBe('true')
    expect(activated).toEqual([])
  })

  it('名称与说明都排得开：面板的按钮样式不落到树的部件上，能拖出的行是抓手', async () => {
    const { palette } = await mount()
    for (const [id, description] of [['no', '[data-part="item-description"]'], ['items', '[data-part="branch-description"]']] as const) {
      const line = row(palette, id)
      const label = line.querySelector('[data-part="item-text"], [data-part="branch-text"]')!.getBoundingClientRect()
      const text = line.querySelector(description)!.getBoundingClientRect()
      expect([label.width > 0, text.width > 0], id).toEqual([true, true])
    }
    expect(getComputedStyle(row(palette, 'no')).cursor).toBe('grab')
    await userEvent.click(row(palette, 'items').querySelector('[data-part="branch-trigger"]')!)
    expect(getComputedStyle(row(palette, 'items.qty')).cursor).not.toBe('grab')
  })
})
