// 同一层里只要有一条带图标，所有条目都空出图标那一格，正文左缘对齐；整层都没有图标就不留。跨分组与分隔线算一层，
// 子菜单是另一层（Web Components 的子菜单铺在父层 DOM 里，照样不算这一层）。menu、context-menu、menubar 与 listbox 各核一遍。
import { setDiagnosticsLevel } from '@xihan-ui/core'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { userEvent } from 'vitest/browser'
import { defineXhElements } from '../../src/define'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

defineXhElements()

const LINE = { name: 'line', viewBox: '0 0 24 24', nodes: [{ tag: 'path' as const, attrs: { d: 'M4 12h16' } }] }

const ITEMS = [
  { value: 'tour', label: '开始引导', icon: LINE },
  { value: 'keys', label: '快捷键' },
  { value: 'pan', label: '拖动', kind: 'checkbox' },
  { value: 'about', label: '关于', group: 'info', groupLabel: '信息', separatorBefore: true },
  { value: 'more', label: '更多', children: [{ value: 'docs', label: '文档' }, { value: 'site', label: '官网' }] },
]

async function settle(): Promise<void> {
  for (let round = 0; round < 4; round++) {
    await Promise.resolve()
    await new Promise<void>(resolve => requestAnimationFrame(() => resolve()))
  }
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

async function mount(tag: string, collection: unknown, trigger?: string): Promise<void> {
  const element = document.createElement(tag) as HTMLElement & { collection?: unknown }
  element.collection = collection
  if (tag === 'xh-menu')
    element.setAttribute('label', '帮助')
  if (trigger)
    element.innerHTML = `<span slot="trigger">${trigger}</span>`
  document.body.append(element)
  await settle()
}

beforeEach(() => setDiagnosticsLevel('silent'))

afterEach(() => {
  document.body.innerHTML = ''
  setDiagnosticsLevel('warn')
})

describe('wc 同层有图标就整层留图标列', () => {
  it('menu', async () => {
    await mount('xh-menu', ITEMS)
    document.querySelector<HTMLElement>(`[data-scope='menu'][data-part='trigger']`)!.focus()
    await userEvent.keyboard('{ArrowDown}')
    await settle()
    await expectMenuLayers()
  })

  it('context-menu', async () => {
    await mount('xh-context-menu', ITEMS, '画布')
    document.querySelector<HTMLElement>(`[data-scope='context-menu'][data-part='trigger']`)!.focus()
    await userEvent.keyboard('{Shift>}{F10}{/Shift}')
    await settle()
    await expectMenuLayers()
  })

  it('menubar', async () => {
    await mount('xh-menubar', [{ value: 'help', label: '帮助', items: ITEMS }])
    document.querySelector<HTMLElement>(`[data-scope='menubar'][data-part='trigger'][value='help']`)!.focus()
    await userEvent.keyboard('{ArrowDown}')
    await settle()
    await expectMenuLayers()
  })

  it('图标只在子菜单里：子层铺在父层 DOM 里，本层的条目照样不留图标那一格', async () => {
    await mount('xh-menu', [
      { value: 'keys', label: '快捷键' },
      { value: 'more', label: '更多', children: [{ value: 'docs', label: '文档', icon: LINE }] },
    ])
    expect(item('more').closest('xh-menu[submenu]')?.querySelector('[data-part="item-icon"]')).not.toBeNull()
    document.querySelector<HTMLElement>(`[data-scope='menu'][data-part='trigger']`)!.focus()
    await userEvent.keyboard('{ArrowDown}')
    await settle()
    for (const value of ['keys', 'more'])
      expect(textLeft(value)).toBeCloseTo(contentStart(value), 0)
  })

  it('listbox：带行首格的一条、不带的几条（含分组里的）正文左缘对齐', async () => {
    document.body.innerHTML = `<xh-listbox style="inline-size: 240px"><div data-xh-part="root" aria-label="水果"><div data-xh-part="content">
      <div data-xh-part="item" value="iconed"><span data-xh-part="item-prefix"><svg viewBox="0 0 24 24" width="18" height="18"><path d="M4 12h16" stroke="currentColor"/></svg></span><span data-xh-part="item-text">带图标</span></div>
      <div data-xh-part="item" value="plain"><span data-xh-part="item-text">不带</span></div>
      <div data-xh-part="group" value="more"><div data-xh-part="item" value="grouped"><span data-xh-part="item-text">分组里的</span></div></div>
    </div></div></xh-listbox>`
    await settle()
    expectAligned(['iconed', 'plain', 'grouped'])
  })
})
