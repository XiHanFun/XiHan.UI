// 按数据铺的菜单栏里，带 children 的条目写着子层的勾选与单选值：子层照它显示；勾选条目写了 closeOnSelect，
// 按 Enter 经根上的 item-select 交给宿主，宿主改了数据，再打开子层就是新的状态。全程只用键盘。
import type { MenubarNode } from '@xihan-ui/headless'
import { setDiagnosticsLevel } from '@xihan-ui/core'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { userEvent } from 'vitest/browser'
import { defineXhElements } from '../../src/define'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

interface MenubarElement extends HTMLElement {
  collection?: MenubarNode[]
  updateComplete: Promise<unknown>
}

defineXhElements()

function menus(panels: readonly string[], density: string): MenubarNode[] {
  return [
    { value: 'file', label: '文件', items: [{ value: 'save', label: '保存' }] },
    {
      value: 'view',
      label: '视图',
      items: [
        { value: 'zoom', label: '缩放' },
        {
          value: 'panels',
          label: '面板',
          checkboxValue: [...panels],
          radioValue: { density },
          children: [
            { value: 'outline', label: '页面结构', kind: 'checkbox', closeOnSelect: true },
            { value: 'history', label: '历史记录', kind: 'checkbox', closeOnSelect: true },
            { value: 'comfortable', label: '宽松', kind: 'radio', group: 'density', separatorBefore: true },
            { value: 'compact', label: '紧凑', kind: 'radio', group: 'density' },
          ],
        },
      ],
    },
  ]
}

async function settle(): Promise<void> {
  for (let round = 0; round < 4; round++) {
    await Promise.resolve()
    await new Promise<void>(resolve => requestAnimationFrame(() => resolve()))
  }
}

function trigger(value: string): HTMLElement {
  return document.querySelector<HTMLElement>(`[data-scope='menubar'][data-part='trigger'][value='${value}']`)!
}

function nested(value: string): HTMLElement {
  return document.querySelector<HTMLElement>(`[data-scope='menu'][data-part='item'][data-value='${value}']`)!
}

function checked(): Record<string, string | null> {
  return Object.fromEntries(['outline', 'history', 'comfortable', 'compact'].map(value => [value, nested(value).getAttribute('aria-checked')]))
}

beforeEach(() => setDiagnosticsLevel('silent'))

afterEach(() => {
  document.body.innerHTML = ''
  setDiagnosticsLevel('warn')
})

describe('wc menubar：子菜单那一层的勾选与单选', () => {
  it('子层照数据显示勾选与单选；Enter 选中勾选条目经 item-select 交给宿主，宿主改数据后再打开就是新状态', async () => {
    const menubar = document.createElement('xh-menubar') as MenubarElement
    menubar.collection = menus(['outline'], 'compact')
    const selected: unknown[] = []
    menubar.addEventListener('item-select', (event) => {
      const detail = (event as CustomEvent<{ menu: string, value: string }>).detail
      selected.push(detail)
      // 宿主照命令执行：切换这块面板，再按新的状态给一份数据
      menubar.collection = menus(detail.value === 'history' ? ['outline', 'history'] : [], 'compact')
    })
    document.body.append(menubar)
    await settle()

    trigger('view').focus()
    await userEvent.keyboard('{ArrowDown}')
    await settle()
    await userEvent.keyboard('{ArrowDown}')
    await settle()
    await userEvent.keyboard('{ArrowRight}')
    await settle()
    expect(checked()).toEqual({ outline: 'true', history: 'false', comfortable: 'false', compact: 'true' })
    expect(document.activeElement).toBe(nested('outline'))

    await userEvent.keyboard('{ArrowDown}')
    await settle()
    expect(document.activeElement).toBe(nested('history'))
    await userEvent.keyboard('{Enter}')
    await settle()
    expect(selected).toEqual([{ menu: 'view', value: 'history' }])
    expect(trigger('view').getAttribute('aria-expanded')).toBe('false')

    trigger('view').focus()
    await userEvent.keyboard('{ArrowDown}')
    await settle()
    await userEvent.keyboard('{ArrowDown}')
    await settle()
    await userEvent.keyboard('{ArrowRight}')
    await settle()
    expect(checked()).toEqual({ outline: 'true', history: 'true', comfortable: 'false', compact: 'true' })
  })
})
