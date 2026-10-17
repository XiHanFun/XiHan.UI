// @vitest-environment jsdom
//
// 菜单栏不写 children 时照标准结构铺：入口按钮文字取 label，renderItem 只接管条目文字，带 children 的条目铺成嵌套的子菜单。
import type { MenubarNode } from '@xihan-ui/headless'
import type { ReactNode } from 'react'
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { afterEach, describe, expect, it } from 'vitest'
import { XhMenubarRoot } from '../src'

let host: HTMLElement | null = null
let root: ReturnType<typeof createRoot> | null = null

afterEach(async () => {
  await act(async () => root?.unmount())
  host?.remove()
  document.body.innerHTML = ''
  root = null
  host = null
})

async function mount(node: ReactNode): Promise<void> {
  host = document.createElement('div')
  document.body.append(host)
  root = createRoot(host)
  ;(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true
  await act(async () => root!.render(node))
}

function parts(parent: Element): string[] {
  return Array.from(parent.children).map(node => node.getAttribute('data-part') ?? node.localName)
}

const COLLECTION: MenubarNode[] = [
  {
    value: 'file',
    label: '文件',
    items: [
      { value: 'open', label: '打开', shortcut: 'Ctrl+O' },
      { value: 'share', label: '发送到', children: [{ value: 'email', label: '邮件' }] },
    ],
  },
]

describe('menubar 的标准结构', () => {
  it('入口按钮文字取 label；renderItem 只接管条目文字，快捷键照数据铺', async () => {
    await mount(<XhMenubarRoot collection={COLLECTION} renderItem={node => <b>{`${node.label}…`}</b>} />)

    const trigger = document.querySelector('[data-scope="menubar"][data-part="trigger"]')!
    expect(trigger.localName).toBe('button')
    expect(trigger.textContent).toBe('文件')
    const open = document.querySelector('[data-scope="menubar"][data-part="item"][data-value="open"]')!
    expect(parts(open)).toEqual(['item-text', 'item-shortcut'])
    expect(open.querySelector('[data-part="item-text"]')!.innerHTML).toBe('<b>打开…</b>')
  })

  it('带 children 的条目铺成子菜单：触发条目是菜单栏里的一条，文字取 label', async () => {
    await mount(<XhMenubarRoot collection={COLLECTION} />)

    const trigger = document.querySelector<HTMLElement>('[data-scope="menubar"][data-part="item"][data-value="share"]')!
    expect(trigger.textContent).toBe('发送到')
    expect(trigger.getAttribute('role')).toBe('menuitem')
    expect(trigger.getAttribute('aria-haspopup')).toBe('menu')
    expect(document.querySelector('[data-scope="menu"][data-part="item"][data-value="email"]')!.textContent).toBe('邮件')
  })
})
