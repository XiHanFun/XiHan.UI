// 同一层里只要有一条带图标，所有条目都空出图标那一格，正文左缘对齐；整层都没有图标就不留。跨分组与分隔线算一层，
// 子菜单是另一层。menu、context-menu、menubar 与 listbox 各核一遍，菜单全程键盘打开。
import type { MenuNode } from '@xihan-ui/headless'
import type { ReactNode } from 'react'
import type { Root } from 'react-dom/client'
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { afterEach, describe, expect, it } from 'vitest'
import { userEvent } from 'vitest/browser'
import { XhContextMenuRoot, XhIcon, XhListboxContent, XhListboxGroup, XhListboxItem, XhListboxItemPrefix, XhListboxItemText, XhListboxRoot, XhMenubarRoot, XhMenuRoot } from '../../src'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

const LINE = { name: 'line', viewBox: '0 0 24 24', nodes: [{ tag: 'path' as const, attrs: { d: 'M4 12h16' } }] }

const ITEMS: MenuNode[] = [
  { value: 'tour', label: '开始引导', icon: LINE },
  { value: 'keys', label: '快捷键' },
  { value: 'pan', label: '拖动', kind: 'checkbox' },
  { value: 'about', label: '关于', group: 'info', groupLabel: '信息', separatorBefore: true },
  { value: 'more', label: '更多', children: [{ value: 'docs', label: '文档' }, { value: 'site', label: '官网' }] },
]

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
  host.style.inlineSize = '240px'
  document.body.append(host)
  root = createRoot(host)
  act(() => root!.render(view))
  await settle()
}

function item(value: string): HTMLElement {
  return document.querySelector<HTMLElement>(`[data-part='item'][data-value='${value}']`)!
}

function textLeft(value: string): number {
  return item(value).querySelector<HTMLElement>(`[data-part='item-text']`)!.getBoundingClientRect().left
}

function contentStart(value: string): number {
  const entry = item(value)
  return entry.getBoundingClientRect().left + Number.parseFloat(getComputedStyle(entry).paddingInlineStart)
}

function expectAligned(values: readonly string[]): void {
  const anchor = textLeft(values[0]!)
  expect(anchor).toBeGreaterThan(contentStart(values[0]!) + 8)
  for (const value of values.slice(1))
    expect(textLeft(value)).toBeCloseTo(anchor, 0)
}

async function expectMenuLayers(): Promise<void> {
  expectAligned(['tour', 'keys', 'pan', 'about', 'more'])
  // 子层整层都没有图标：正文贴着行首内距，不留图标那一格
  await userEvent.keyboard('{End}')
  await settle()
  expect(document.activeElement).toBe(item('more'))
  await userEvent.keyboard('{ArrowRight}')
  await settle()
  for (const value of ['docs', 'site'])
    expect(textLeft(value)).toBeCloseTo(contentStart(value), 0)
}

describe('react 同层有图标就整层留图标列', () => {
  it('menu', async () => {
    await mount(<XhMenuRoot label="帮助" collection={ITEMS} />)
    act(() => document.querySelector<HTMLElement>(`[data-scope='menu'][data-part='trigger']`)!.focus())
    await userEvent.keyboard('{ArrowDown}')
    await settle()
    await expectMenuLayers()
  })

  it('context-menu', async () => {
    await mount(<XhContextMenuRoot collection={ITEMS} trigger="画布" />)
    act(() => document.querySelector<HTMLElement>(`[data-scope='context-menu'][data-part='trigger']`)!.focus())
    await userEvent.keyboard('{Shift>}{F10}{/Shift}')
    await settle()
    await expectMenuLayers()
  })

  it('menubar', async () => {
    await mount(<XhMenubarRoot collection={[{ value: 'help', label: '帮助', items: ITEMS }]} />)
    act(() => document.querySelector<HTMLElement>(`[data-scope='menubar'][data-part='trigger'][data-value='help']`)!.focus())
    await userEvent.keyboard('{ArrowDown}')
    await settle()
    await expectMenuLayers()
  })

  it('listbox：带行首格的一条、不带的几条（含分组里的）正文左缘对齐', async () => {
    await mount(
      <XhListboxRoot aria-label="水果">
        <XhListboxContent>
          <XhListboxItem value="iconed">
            <XhListboxItemPrefix><XhIcon icon={LINE} /></XhListboxItemPrefix>
            <XhListboxItemText>带图标</XhListboxItemText>
          </XhListboxItem>
          <XhListboxItem value="plain"><XhListboxItemText>不带</XhListboxItemText></XhListboxItem>
          <XhListboxGroup value="more">
            <XhListboxItem value="grouped"><XhListboxItemText>分组里的</XhListboxItemText></XhListboxItem>
          </XhListboxGroup>
        </XhListboxContent>
      </XhListboxRoot>,
    )
    expectAligned(['iconed', 'plain', 'grouped'])
  })
})
