// 按数据铺的菜单栏，条目写了 keyshortcuts：键盘走到这一条时，焦点所在的条目带着 aria-keyshortcuts，读屏念得出快捷键；
// 看得见的快捷键提示照旧 aria-hidden。
import type { MenubarNode } from '@xihan-ui/headless'
import type { App } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import { userEvent } from 'vitest/browser'
import { createApp, h, nextTick } from 'vue'
import { XhMenubarRoot } from '../../src'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

let app: App | null = null
let host: HTMLElement | null = null

afterEach(() => {
  app?.unmount()
  host?.remove()
  document.getElementById('xh-portal-root')?.remove()
  app = null
  host = null
})

const MENUS: MenubarNode[] = [
  { value: 'edit', label: '编辑', items: [
    { value: 'undo', label: '撤销', shortcut: 'Ctrl+Z', keyshortcuts: 'Control+Z' },
    { value: 'redo', label: '重做', shortcut: 'Ctrl+Y', keyshortcuts: 'Control+Y Control+Shift+Z' },
    { value: 'json', label: '编辑 JSON' },
  ] },
]

async function settle(): Promise<void> {
  for (let round = 0; round < 3; round++) {
    await nextTick()
    await new Promise<void>(resolve => requestAnimationFrame(() => resolve()))
  }
}

describe('vue menubar：条目的 aria-keyshortcuts', () => {
  it('键盘走到哪一条，焦点所在的条目就带着那一条的 aria-keyshortcuts；没写的不带，快捷键提示只是看的', async () => {
    host = document.createElement('div')
    document.body.append(host)
    app = createApp({ setup: () => () => h(XhMenubarRoot, { collection: MENUS }) })
    app.mount(host)
    await settle()

    document.querySelector<HTMLElement>(`[data-scope='menubar'][data-part='trigger'][data-value='edit']`)!.focus()
    await userEvent.keyboard('{ArrowDown}')
    await settle()
    const active = (): HTMLElement => document.activeElement as HTMLElement
    expect([active().getAttribute('data-value'), active().getAttribute('aria-keyshortcuts')]).toEqual(['undo', 'Control+Z'])
    const shortcut = active().querySelector<HTMLElement>(`[data-part='item-shortcut']`)!
    expect([shortcut.textContent, shortcut.getAttribute('aria-hidden')]).toEqual(['Ctrl+Z', 'true'])

    await userEvent.keyboard('{ArrowDown}')
    await settle()
    expect([active().getAttribute('data-value'), active().getAttribute('aria-keyshortcuts')]).toEqual(['redo', 'Control+Y Control+Shift+Z'])
    await userEvent.keyboard('{ArrowDown}')
    await settle()
    expect([active().getAttribute('data-value'), active().getAttribute('aria-keyshortcuts')]).toEqual(['json', null])
  })
})
