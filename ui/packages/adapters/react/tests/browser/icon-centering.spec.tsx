// 行首图标与正文上下居中：图标中线与正文中线相差不超过 0.5px。菜单族的 item-icon 盒按图标尺取高，不靠行高撑，
// 里面的图标居中；子菜单入口的图标同样。listbox 的 item-prefix 里的图标同样居中。
// 菜单族按 sm、md 两档各量一次；打开的那一层与列表再装进有层与无层产物各量一次。
import type { MenuNode } from '@xihan-ui/headless'
import type { ReactNode } from 'react'
import type { Root } from 'react-dom/client'
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { afterEach, describe, expect, it } from 'vitest'
import { userEvent } from 'vitest/browser'
import { XhContextMenuRoot, XhIcon, XhListboxContent, XhListboxItem, XhListboxItemPrefix, XhListboxItemText, XhListboxRoot, XhMenubarRoot, XhMenuRoot } from '../../src'
import { closeSheetFrame, SHEET_NAMES, stageSheet } from './sheet-frame'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

const LINE = { name: 'line', viewBox: '0 0 24 24', nodes: [{ tag: 'path' as const, attrs: { d: 'M4 12h16' } }] }

/** 一条带图标的普通条目、一条带图标的子菜单入口。 */
const ITEMS: MenuNode[] = [
  { value: 'tour', label: '开始引导', icon: LINE },
  { value: 'keys', label: '快捷键' },
  { value: 'more', label: '更多', icon: LINE, children: [{ value: 'docs', label: '文档' }] },
]

const SIZES = ['sm', 'md'] as const

let root: Root | null = null
let host: HTMLElement | null = null

afterEach(() => {
  closeSheetFrame()
  act(() => root?.unmount())
  host?.remove()
  document.getElementById('xh-portal-root')?.remove()
  root = null
  host = null
})

async function settle(): Promise<void> {
  for (let round = 0; round < 3; round++)
    await act(() => new Promise<void>(resolve => requestAnimationFrame(() => resolve())))
}

async function mount(view: ReactNode): Promise<void> {
  host = document.createElement('div')
  host.style.inlineSize = '240px'
  document.body.append(host)
  root = createRoot(host)
  act(() => root!.render(view))
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

/** 当前文档量一次，再把选出的那一块装进有层与无层产物各量一次。 */
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

describe('react 行首图标与正文上下居中', () => {
  for (const size of SIZES) {
    it(`menu（${size}）`, async () => {
      await mount(<XhMenuRoot label="帮助" size={size} collection={ITEMS} />)
      act(() => document.querySelector<HTMLElement>(`[data-scope='menu'][data-part='trigger']`)!.focus())
      await userEvent.keyboard('{ArrowDown}')
      await settle()
      await expectCenteredEverywhere(menuLayer('menu'), ['tour', 'more'], 'item-icon')
    })

    it(`context-menu（${size}）`, async () => {
      await mount(<XhContextMenuRoot size={size} collection={ITEMS} trigger="画布" />)
      act(() => document.querySelector<HTMLElement>(`[data-scope='context-menu'][data-part='trigger']`)!.focus())
      await userEvent.keyboard('{Shift>}{F10}{/Shift}')
      await settle()
      await expectCenteredEverywhere(menuLayer('context-menu'), ['tour', 'more'], 'item-icon')
    })

    it(`menubar（${size}）`, async () => {
      await mount(<XhMenubarRoot size={size} collection={[{ value: 'help', label: '帮助', items: ITEMS }]} />)
      act(() => document.querySelector<HTMLElement>(`[data-scope='menubar'][data-part='trigger'][data-value='help']`)!.focus())
      await userEvent.keyboard('{ArrowDown}')
      await settle()
      await expectCenteredEverywhere(menuLayer('menubar'), ['tour', 'more'], 'item-icon')
    })
  }

  it('menu：item-prefix 放进大一号的图标，图标格仍按图标尺取高，图标与正文居中', async () => {
    await mount(
      <XhMenuRoot
        label="编辑"
        size="sm"
        collection={[{ value: 'small', label: '复制' }, { value: 'big', label: '粘贴' }]}
        renderItemPrefix={node => node.value === 'big'
          ? <svg viewBox="0 0 24 24" width="24" height="24"><path d="M4 12h16" stroke="currentColor" /></svg>
          : <XhIcon icon={LINE} />}
      />,
    )
    act(() => document.querySelector<HTMLElement>(`[data-scope='menu'][data-part='trigger']`)!.focus())
    await userEvent.keyboard('{ArrowDown}')
    await settle()
    await expectCenteredEverywhere(menuLayer('menu'), ['small', 'big'], 'item-icon', 'small')
  })

  it('listbox：item-prefix 里的图标与正文居中', async () => {
    await mount(
      <XhListboxRoot aria-label="水果" size="sm">
        <XhListboxContent>
          <XhListboxItem value="apple">
            <XhListboxItemPrefix><XhIcon icon={LINE} /></XhListboxItemPrefix>
            <XhListboxItemText>苹果</XhListboxItemText>
          </XhListboxItem>
        </XhListboxContent>
      </XhListboxRoot>,
    )
    await expectCenteredEverywhere(`[data-scope='listbox'][data-part='root']`, ['apple'], 'item-prefix')
  })
})
