// 行首图标与正文上下居中：图标中线与正文中线相差不超过 0.5px。菜单族的 item-icon 盒按图标尺取高，不靠行高撑，
// 里面的图标居中；子菜单入口的图标同样。listbox 的 item-prefix 里放 <xh-icon> 时同样居中。
// Web Components 的图标外面还有一层 <xh-icon> 宿主，它不该自成一个行盒把图标顶到上沿。
// 菜单族按 sm、md 两档各量一次；打开的那一层与列表再装进有层与无层产物各量一次。
import { setDiagnosticsLevel } from '@xihan-ui/core'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { userEvent } from 'vitest/browser'
import { defineXhElements } from '../../src/define'
import { closeSheetFrame, SHEET_NAMES, stageSheet } from './sheet-frame'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

defineXhElements()

const LINE = { name: 'line', viewBox: '0 0 24 24', nodes: [{ tag: 'path' as const, attrs: { d: 'M4 12h16' } }] }

/** 一条带图标的普通条目、一条带图标的子菜单入口。 */
const ITEMS = [
  { value: 'tour', label: '开始引导', icon: LINE },
  { value: 'keys', label: '快捷键' },
  { value: 'more', label: '更多', icon: LINE, children: [{ value: 'docs', label: '文档' }] },
]

const SIZES = ['sm', 'md'] as const

async function settle(): Promise<void> {
  for (let round = 0; round < 4; round++) {
    await Promise.resolve()
    await new Promise<void>(resolve => requestAnimationFrame(() => resolve()))
  }
}

async function mount(tag: string, size: string, collection: unknown, trigger?: string): Promise<void> {
  const element = document.createElement(tag) as HTMLElement & { collection?: unknown }
  element.collection = collection
  element.setAttribute('size', size)
  if (tag === 'xh-menu')
    element.setAttribute('label', '帮助')
  if (trigger)
    element.innerHTML = `<span slot="trigger">${trigger}</span>`
  document.body.append(element)
  await settle()
}

function middle(element: Element): number {
  const box = element.getBoundingClientRect()
  return box.top + box.height / 2
}

/**
 * 条目里的图标中线与正文中线相差不超过 0.5px。菜单族的图标盒高等于图标尺：ruler 那一条的图标按图标尺画出，
 * 盒高与它相同（作者放进大一号的图标时，盒子也不跟着长）。
 */
function expectCentered(doc: Document, value: string, cell: 'item-icon' | 'item-prefix', ruler = value): void {
  const entry = doc.querySelector<HTMLElement>(`[data-part='item'][data-value='${value}']`)!
  const box = entry.querySelector<HTMLElement>(`[data-part='${cell}']`)!
  const svg = box.querySelector('svg')!
  expect(svg.getBoundingClientRect().height).toBeGreaterThan(8)
  expect(Math.abs(middle(svg) - middle(entry.querySelector(`[data-part='item-text']`)!))).toBeLessThanOrEqual(0.5)
  if (cell === 'item-icon') {
    const scale = doc.querySelector(`[data-part='item'][data-value='${ruler}'] [data-part='item-icon'] svg`)!
    expect(box.getBoundingClientRect().height).toBeCloseTo(scale.getBoundingClientRect().height, 1)
  }
}

/** 当前文档量一次，再把选出的那一块装进有层与无层产物各量一次（<xh-icon> 照标签名吃皮肤）。 */
async function expectCenteredEverywhere(selector: string, values: readonly string[], cell: 'item-icon' | 'item-prefix', ruler?: string): Promise<void> {
  for (const value of values)
    expectCentered(document, value, cell, ruler)
  const markup = document.querySelector<HTMLElement>(selector)!.outerHTML
  for (const sheet of SHEET_NAMES) {
    const doc = await stageSheet(`<div style="inline-size: 280px">${markup}</div>`, sheet)
    for (const value of values)
      expectCentered(doc, value, cell, ruler)
  }
  closeSheetFrame()
}

const menuLayer = (scope: string): string => `[data-scope='${scope}'][data-part='content']:not([hidden])`

beforeEach(() => setDiagnosticsLevel('silent'))

afterEach(() => {
  closeSheetFrame()
  document.body.innerHTML = ''
  setDiagnosticsLevel('warn')
})

describe('wc 行首图标与正文上下居中', () => {
  for (const size of SIZES) {
    it(`menu（${size}）`, async () => {
      await mount('xh-menu', size, ITEMS)
      document.querySelector<HTMLElement>(`[data-scope='menu'][data-part='trigger']`)!.focus()
      await userEvent.keyboard('{ArrowDown}')
      await settle()
      await expectCenteredEverywhere(menuLayer('menu'), ['tour', 'more'], 'item-icon')
    })

    it(`context-menu（${size}）`, async () => {
      await mount('xh-context-menu', size, ITEMS, '画布')
      document.querySelector<HTMLElement>(`[data-scope='context-menu'][data-part='trigger']`)!.focus()
      await userEvent.keyboard('{Shift>}{F10}{/Shift}')
      await settle()
      await expectCenteredEverywhere(menuLayer('context-menu'), ['tour', 'more'], 'item-icon')
    })

    it(`menubar（${size}）`, async () => {
      await mount('xh-menubar', size, [{ value: 'help', label: '帮助', items: ITEMS }])
      document.querySelector<HTMLElement>(`[data-scope='menubar'][data-part='trigger'][value='help']`)!.focus()
      await userEvent.keyboard('{ArrowDown}')
      await settle()
      await expectCenteredEverywhere(menuLayer('menubar'), ['tour', 'more'], 'item-icon')
    })
  }

  it('menu：item-prefix 放进大一号的图标，图标格仍按图标尺取高，图标与正文居中', async () => {
    await mount('xh-menu', 'sm', [{ value: 'small', label: '复制' }, { value: 'big', label: '粘贴' }])
    const menu = document.querySelector<HTMLElement>('xh-menu')!
    menu.insertAdjacentHTML('beforeend', '<xh-icon slot="item-prefix:small"></xh-icon><svg slot="item-prefix:big" viewBox="0 0 24 24" width="24" height="24"><path d="M4 12h16" stroke="currentColor"/></svg>')
    menu.querySelector<HTMLElement & { icon?: unknown }>('xh-icon')!.icon = LINE
    await settle()
    document.querySelector<HTMLElement>(`[data-scope='menu'][data-part='trigger']`)!.focus()
    await userEvent.keyboard('{ArrowDown}')
    await settle()
    await expectCenteredEverywhere(menuLayer('menu'), ['small', 'big'], 'item-icon', 'small')
  })

  it('行内文字里 <xh-icon> 的图标与直接渲染的 <svg>（Vue / React 的写法）落在同一高度', async () => {
    document.body.innerHTML = `<p style="font-size: 14px">文字<xh-icon></xh-icon>文字<svg class="xh-scope-icon" data-scope="icon" data-part="root" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 12h16"/></svg>文字</p>`
    document.querySelector<HTMLElement & { icon?: unknown }>('xh-icon')!.icon = LINE
    await settle()
    const expectSameHeight = (doc: Document): void => {
      const [hosted, bare] = [...doc.querySelectorAll('p svg')].map(svg => svg.getBoundingClientRect())
      expect(hosted!.height).toBeGreaterThan(8)
      expect(hosted!.top).toBeCloseTo(bare!.top, 1)
    }
    expectSameHeight(document)
    const markup = document.querySelector('p')!.outerHTML
    for (const sheet of SHEET_NAMES)
      expectSameHeight(await stageSheet(markup, sheet))
  })

  it('listbox：item-prefix 里的 <xh-icon> 与正文居中', async () => {
    document.body.innerHTML = `<xh-listbox size="sm" style="inline-size: 240px"><div data-xh-part="root" aria-label="水果"><div data-xh-part="content">
      <div data-xh-part="item" value="apple"><span data-xh-part="item-prefix"><xh-icon></xh-icon></span><span data-xh-part="item-text">苹果</span></div>
    </div></div></xh-listbox>`
    document.querySelector<HTMLElement & { icon?: unknown }>('xh-icon')!.icon = LINE
    await settle()
    await expectCenteredEverywhere(`[data-scope='listbox'][data-part='root']`, ['apple'], 'item-prefix')
  })
})
