// 菜单族勾选与单选条目的对号排在行尾：正文与快捷键之后，与子菜单箭头同一列；勾选条目的图标与普通条目左缘对齐，
// 同一张菜单里的快捷键同列（没勾的条目占位不塌，普通条目在行尾留出同宽的一格）；没有勾选条目的一层不留这一格。
// menu、context-menu、menubar 各核一遍，全程键盘打开。
import type { MenuNode } from '@xihan-ui/headless'
import type { ReactNode } from 'react'
import type { Root } from 'react-dom/client'
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { afterEach, describe, expect, it } from 'vitest'
import { userEvent } from 'vitest/browser'
import { XhContextMenuRoot, XhMenubarRoot, XhMenuRoot } from '../../src'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

const LINE = { name: 'line', viewBox: '0 0 24 24', nodes: [{ tag: 'path' as const, attrs: { d: 'M4 12h16' } }] }

const ITEMS: MenuNode[] = [
  { value: 'zoom-in', label: '放大', icon: LINE, shortcut: 'Ctrl+=' },
  { value: 'pan', label: '拖动', icon: LINE, kind: 'checkbox', shortcut: 'H' },
  { value: 'grid', label: '网格', icon: LINE, kind: 'checkbox', shortcut: 'Ctrl+G' },
  { value: 'design', label: '设计', icon: LINE, kind: 'radio', group: 'mode', shortcut: 'D', separatorBefore: true },
  { value: 'more', label: '更多', icon: LINE, children: [{ value: 'about', label: '关于', shortcut: 'F1' }] },
]

const CHOICE = { defaultCheckboxValue: ['pan'], defaultRadioValue: { mode: 'design' } }

let root: Root | null = null
let host: HTMLElement | null = null

afterEach(() => {
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
  document.body.append(host)
  root = createRoot(host)
  act(() => root!.render(view))
  await settle()
}

function item(value: string): HTMLElement {
  return document.querySelector<HTMLElement>(`[data-part='item'][data-value='${value}']`)!
}

function rect(value: string, part: string): DOMRect {
  return item(value).querySelector<HTMLElement>(`[data-part='${part}']`)!.getBoundingClientRect()
}

/** 条目行尾内距的内缘：子菜单箭头与对号的右缘都贴着它。 */
function trailingEdge(value: string): number {
  const entry = item(value)
  return entry.getBoundingClientRect().right - Number.parseFloat(getComputedStyle(entry).paddingInlineEnd)
}

async function expectTrailingChoice(): Promise<void> {
  for (const value of ['pan', 'design']) {
    expect(rect(value, 'item-shortcut').left).toBeGreaterThanOrEqual(rect(value, 'item-text').right - 0.5)
    expect(rect(value, 'item-indicator').left).toBeGreaterThanOrEqual(rect(value, 'item-shortcut').right - 0.5)
  }
  const arrowRight = trailingEdge('more')
  const arrowLeft = arrowRight - Number.parseFloat(getComputedStyle(item('more'), '::after').width)
  for (const value of ['pan', 'grid', 'design']) {
    expect(rect(value, 'item-indicator').left).toBeCloseTo(arrowLeft, 0)
    expect(rect(value, 'item-indicator').right).toBeCloseTo(arrowRight, 0)
    expect(rect(value, 'item-icon').left).toBeCloseTo(rect('zoom-in', 'item-icon').left, 0)
    expect(rect(value, 'item-shortcut').right).toBeCloseTo(rect('zoom-in', 'item-shortcut').right, 0)
  }

  // 子层没有勾选条目：快捷键贴着行尾内距，不留对号那一格
  await userEvent.keyboard('{End}')
  await settle()
  expect(document.activeElement).toBe(item('more'))
  await userEvent.keyboard('{ArrowRight}')
  await settle()
  expect(rect('about', 'item-shortcut').right).toBeCloseTo(trailingEdge('about'), 0)
}

describe('react 菜单族：勾选与单选的对号排在行尾', () => {
  it('menu', async () => {
    await mount(<XhMenuRoot label="视图" collection={ITEMS} {...CHOICE} />)
    act(() => document.querySelector<HTMLElement>(`[data-scope='menu'][data-part='trigger']`)!.focus())
    await userEvent.keyboard('{ArrowDown}')
    await settle()
    await expectTrailingChoice()
  })

  it('context-menu', async () => {
    await mount(<XhContextMenuRoot collection={ITEMS} trigger="画布" {...CHOICE} />)
    act(() => document.querySelector<HTMLElement>(`[data-scope='context-menu'][data-part='trigger']`)!.focus())
    await userEvent.keyboard('{Shift>}{F10}{/Shift}')
    await settle()
    await expectTrailingChoice()
  })

  it('menubar', async () => {
    await mount(<XhMenubarRoot collection={[{ value: 'view', label: '视图', items: ITEMS }]} {...CHOICE} />)
    act(() => document.querySelector<HTMLElement>(`[data-scope='menubar'][data-part='trigger'][data-value='view']`)!.focus())
    await userEvent.keyboard('{ArrowDown}')
    await settle()
    await expectTrailingChoice()
  })
})
