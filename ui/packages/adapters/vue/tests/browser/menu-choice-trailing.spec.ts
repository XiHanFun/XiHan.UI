// 菜单族勾选与单选条目的对号排在行尾：正文与快捷键之后，与子菜单箭头同一列；勾选条目的图标与普通条目左缘对齐，
// 同一张菜单里的快捷键同列（没勾的条目占位不塌，普通条目在行尾留出同宽的一格）；没有勾选条目的一层不留这一格。
// 标准结构里对号排在正文与快捷键之后，是条目的最后一个部件。menu、context-menu、menubar 各核一遍，全程键盘打开；打开后的这一层再装进有层与无层产物各量一次。
import type { App } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import { userEvent } from 'vitest/browser'
import { createApp, h, nextTick } from 'vue'
import { XhContextMenuRoot, XhMenubarRoot, XhMenuRoot } from '../../src'
import { closeSheetFrame, SHEET_NAMES, stageSheet } from './sheet-frame'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

const LINE = { name: 'line', viewBox: '0 0 24 24', nodes: [{ tag: 'path' as const, attrs: { d: 'M4 12h16' } }] }

const ITEMS = [
  { value: 'zoom-in', label: '放大', icon: LINE, shortcut: 'Ctrl+=' },
  { value: 'pan', label: '拖动', icon: LINE, kind: 'checkbox' as const, shortcut: 'H' },
  { value: 'grid', label: '网格', icon: LINE, kind: 'checkbox' as const, shortcut: 'Ctrl+G' },
  { value: 'design', label: '设计', icon: LINE, kind: 'radio' as const, group: 'mode', shortcut: 'D', separatorBefore: true },
  { value: 'more', label: '更多', icon: LINE, children: [{ value: 'about', label: '关于', shortcut: 'F1' }] },
]

const CHOICE = { checkboxValue: ['pan'], radioValue: { mode: 'design' } }

let app: App | null = null
let host: HTMLElement | null = null

afterEach(() => {
  closeSheetFrame()
  app?.unmount()
  host?.remove()
  document.getElementById('xh-portal-root')?.remove()
  app = null
  host = null
})

async function settle(): Promise<void> {
  for (let round = 0; round < 3; round++) {
    await nextTick()
    await new Promise<void>(resolve => requestAnimationFrame(() => resolve()))
  }
}

async function mount(view: () => ReturnType<typeof h>): Promise<void> {
  host = document.createElement('div')
  document.body.append(host)
  app = createApp({ setup: () => view })
  app.mount(host)
  await settle()
}

function item(doc: Document, value: string): HTMLElement {
  return doc.querySelector<HTMLElement>(`[data-part='item'][data-value='${value}']`)!
}

function rect(doc: Document, value: string, part: string): DOMRect {
  return item(doc, value).querySelector<HTMLElement>(`[data-part='${part}']`)!.getBoundingClientRect()
}

/** 条目行尾内距的内缘：子菜单箭头与对号的右缘都贴着它。 */
function trailingEdge(doc: Document, value: string): number {
  const entry = item(doc, value)
  return entry.getBoundingClientRect().right - Number.parseFloat(doc.defaultView!.getComputedStyle(entry).paddingInlineEnd)
}

function expectTrailingLayout(doc: Document): void {
  // 文档序：对号是勾选与单选条目的最后一个部件，读屏先念正文与快捷键
  for (const value of ['pan', 'grid', 'design'])
    expect([...item(doc, value).children].map(child => child.getAttribute('data-part'))).toEqual(['item-icon', 'item-text', 'item-shortcut', 'item-indicator'])
  for (const value of ['pan', 'design']) {
    expect(rect(doc, value, 'item-shortcut').left).toBeGreaterThanOrEqual(rect(doc, value, 'item-text').right - 0.5)
    expect(rect(doc, value, 'item-indicator').left).toBeGreaterThanOrEqual(rect(doc, value, 'item-shortcut').right - 0.5)
  }
  const arrowRight = trailingEdge(doc, 'more')
  const arrowLeft = arrowRight - Number.parseFloat(doc.defaultView!.getComputedStyle(item(doc, 'more'), '::after').width)
  for (const value of ['pan', 'grid', 'design']) {
    expect(rect(doc, value, 'item-indicator').left).toBeCloseTo(arrowLeft, 0)
    expect(rect(doc, value, 'item-indicator').right).toBeCloseTo(arrowRight, 0)
    expect(rect(doc, value, 'item-icon').left).toBeCloseTo(rect(doc, 'zoom-in', 'item-icon').left, 0)
    expect(rect(doc, value, 'item-shortcut').right).toBeCloseTo(rect(doc, 'zoom-in', 'item-shortcut').right, 0)
  }
}

/** 打开着的那一层装进只引一份产物的 iframe，有层与无层各量一次。 */
async function expectBothSheets(scope: string): Promise<void> {
  const markup = document.querySelector<HTMLElement>(`[data-scope='${scope}'][data-part='content']:not([hidden])`)!.outerHTML
  for (const sheet of SHEET_NAMES)
    expectTrailingLayout(await stageSheet(`<div style="inline-size: 280px">${markup}</div>`, sheet))
  closeSheetFrame()
}

/** 子层没有勾选条目：快捷键贴着行尾内距，不留对号那一格。 */
async function expectPlainSublayer(): Promise<void> {
  await userEvent.keyboard('{End}')
  await settle()
  expect(document.activeElement).toBe(item(document, 'more'))
  await userEvent.keyboard('{ArrowRight}')
  await settle()
  expect(rect(document, 'about', 'item-shortcut').right).toBeCloseTo(trailingEdge(document, 'about'), 0)
}

describe('vue 菜单族：勾选与单选的对号排在行尾', () => {
  it('menu', async () => {
    await mount(() => h(XhMenuRoot, { label: '视图', collection: ITEMS, ...CHOICE }))
    document.querySelector<HTMLElement>(`[data-scope='menu'][data-part='trigger']`)!.focus()
    await userEvent.keyboard('{ArrowDown}')
    await settle()
    expectTrailingLayout(document)
    await expectBothSheets('menu')
    await expectPlainSublayer()
  })

  it('context-menu', async () => {
    await mount(() => h(XhContextMenuRoot, { collection: ITEMS, ...CHOICE }, { trigger: () => '画布' }))
    document.querySelector<HTMLElement>(`[data-scope='context-menu'][data-part='trigger']`)!.focus()
    await userEvent.keyboard('{Shift>}{F10}{/Shift}')
    await settle()
    expectTrailingLayout(document)
    await expectBothSheets('context-menu')
    await expectPlainSublayer()
  })

  it('menubar', async () => {
    await mount(() => h(XhMenubarRoot, { collection: [{ value: 'view', label: '视图', items: ITEMS }], ...CHOICE }))
    document.querySelector<HTMLElement>(`[data-scope='menubar'][data-part='trigger'][data-value='view']`)!.focus()
    await userEvent.keyboard('{ArrowDown}')
    await settle()
    expectTrailingLayout(document)
    await expectBothSheets('menubar')
    await expectPlainSublayer()
  })
})
