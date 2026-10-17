// @vitest-environment jsdom
//
// 右键菜单不写 children 时照标准结构铺：renderItem 只接管条目文字，带 children 的条目铺成嵌套的子菜单。
import type { ContextMenuNode } from '@xihan-ui/headless'
import type { ReactNode } from 'react'
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { afterEach, describe, expect, it } from 'vitest'
import { XhContextMenuRoot } from '../src'

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

const COLLECTION: ContextMenuNode[] = [
  { value: 'open', label: '打开', shortcut: 'Ctrl+O' },
  { value: 'share', label: '发送到', children: [{ value: 'email', label: '邮件' }] },
]

describe('context-menu 的标准结构', () => {
  it('trigger 放进触发区；renderItem 只接管条目文字，快捷键照数据铺', async () => {
    await mount(<XhContextMenuRoot collection={COLLECTION} trigger={<p>右键这里</p>} renderItem={node => <b>{`${node.label}…`}</b>} />)

    const rootEl = document.querySelector('[data-scope="context-menu"][data-part="root"]')!
    // 定位层经 portal 落在别处
    expect(parts(rootEl)).toEqual(['trigger'])
    expect(parts(document.querySelector('[data-scope="context-menu"][data-part="positioner"]')!)[0]).toBe('content')
    expect(document.querySelector('[data-scope="context-menu"][data-part="trigger"]')!.innerHTML).toBe('<p>右键这里</p>')
    const open = document.querySelector('[data-scope="context-menu"][data-part="item"][data-value="open"]')!
    expect(parts(open)).toEqual(['item-text', 'item-shortcut'])
    expect(open.querySelector('[data-part="item-text"]')!.innerHTML).toBe('<b>打开…</b>')
  })

  it('带 children 的条目铺成子菜单：触发条目是右键菜单里的一条，文字取 label', async () => {
    await mount(<XhContextMenuRoot collection={COLLECTION} />)

    const trigger = document.querySelector<HTMLElement>('[data-scope="context-menu"][data-part="item"][data-value="share"]')!
    expect(trigger.textContent).toBe('发送到')
    expect(trigger.getAttribute('role')).toBe('menuitem')
    expect(trigger.getAttribute('aria-haspopup')).toBe('menu')
    expect(document.querySelector('[data-scope="menu"][data-part="item"][data-value="email"]')!.textContent).toBe('邮件')
  })
})
