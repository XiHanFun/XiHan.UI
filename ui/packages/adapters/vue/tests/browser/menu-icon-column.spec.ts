// 同一层里只要有一条带图标，所有条目都空出图标那一格，正文左缘对齐；整层都没有图标就不留。跨分组与分隔线算一层，
// 子菜单是另一层。menu、context-menu、menubar 各核一遍，全程键盘打开；打开的那一层再装进有层与无层产物各量一次。
import type { App } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import { userEvent } from 'vitest/browser'
import { createApp, h, nextTick } from 'vue'
import { XhContextMenuRoot, XhMenubarRoot, XhMenuRoot } from '../../src'
import { closeSheetFrame, SHEET_NAMES, stageSheet } from './sheet-frame'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

const LINE = { name: 'line', viewBox: '0 0 24 24', nodes: [{ tag: 'path' as const, attrs: { d: 'M4 12h16' } }] }

/** 一层里只有「开始引导」带图标；勾选条目、分组里的条目与子菜单入口都没有。子层整层都没有图标。 */
const ITEMS = [
  { value: 'tour', label: '开始引导', icon: LINE },
  { value: 'keys', label: '快捷键' },
  { value: 'pan', label: '拖动', kind: 'checkbox' as const },
  { value: 'about', label: '关于', group: 'info', groupLabel: '信息', separatorBefore: true },
  { value: 'more', label: '更多', children: [{ value: 'docs', label: '文档' }, { value: 'site', label: '官网' }] },
]

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

function textLeft(doc: Document, value: string): number {
  return item(doc, value).querySelector<HTMLElement>(`[data-part='item-text']`)!.getBoundingClientRect().left
}

/** 条目行首内距的内缘：没有图标列时正文从这里起。 */
function contentStart(doc: Document, value: string): number {
  const entry = item(doc, value)
  return entry.getBoundingClientRect().left + Number.parseFloat(doc.defaultView!.getComputedStyle(entry).paddingInlineStart)
}

function expectAligned(doc: Document): void {
  const anchor = textLeft(doc, 'tour')
  expect(anchor).toBeGreaterThan(contentStart(doc, 'tour') + 8)
  for (const value of ['keys', 'pan', 'about', 'more'])
    expect(textLeft(doc, value)).toBeCloseTo(anchor, 0)
}

async function expectBothSheets(scope: string): Promise<void> {
  const markup = document.querySelector<HTMLElement>(`[data-scope='${scope}'][data-part='content']:not([hidden])`)!.outerHTML
  for (const sheet of SHEET_NAMES)
    expectAligned(await stageSheet(`<div style="inline-size: 280px">${markup}</div>`, sheet))
  closeSheetFrame()
}

/** 子层整层都没有图标：正文贴着行首内距，不留图标那一格。 */
async function expectPlainSublayer(): Promise<void> {
  await userEvent.keyboard('{End}')
  await settle()
  expect(document.activeElement).toBe(item(document, 'more'))
  await userEvent.keyboard('{ArrowRight}')
  await settle()
  for (const value of ['docs', 'site'])
    expect(textLeft(document, value)).toBeCloseTo(contentStart(document, value), 0)
}

describe('vue 菜单族：同层有图标就整层留图标列', () => {
  it('menu', async () => {
    await mount(() => h(XhMenuRoot, { label: '帮助', collection: ITEMS }))
    document.querySelector<HTMLElement>(`[data-scope='menu'][data-part='trigger']`)!.focus()
    await userEvent.keyboard('{ArrowDown}')
    await settle()
    expectAligned(document)
    await expectBothSheets('menu')
    await expectPlainSublayer()
  })

  it('context-menu', async () => {
    await mount(() => h(XhContextMenuRoot, { collection: ITEMS }, { trigger: () => '画布' }))
    document.querySelector<HTMLElement>(`[data-scope='context-menu'][data-part='trigger']`)!.focus()
    await userEvent.keyboard('{Shift>}{F10}{/Shift}')
    await settle()
    expectAligned(document)
    await expectBothSheets('context-menu')
    await expectPlainSublayer()
  })

  it('menubar', async () => {
    await mount(() => h(XhMenubarRoot, { collection: [{ value: 'help', label: '帮助', items: ITEMS }] }))
    document.querySelector<HTMLElement>(`[data-scope='menubar'][data-part='trigger'][data-value='help']`)!.focus()
    await userEvent.keyboard('{ArrowDown}')
    await settle()
    expectAligned(document)
    await expectBothSheets('menubar')
    await expectPlainSublayer()
  })
})
