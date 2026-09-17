import { setDiagnosticsLevel } from '@xihan-ui/core'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { defineXhElements } from '../../src/define'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

interface MenubarElement extends HTMLElement {
  value?: string | null
  updateComplete: Promise<unknown>
}

defineXhElements()

function items(prefix: string, count: number): string {
  return Array.from({ length: count }, (_, i) => `<div data-xh-part="item" value="${prefix}-${i}"><span data-xh-part="item-text">条目 ${i}</span></div>`).join('')
}

async function settle(element: MenubarElement): Promise<void> {
  for (let round = 0; round < 4; round++) {
    await Promise.resolve()
    await element.updateComplete
  }
  await new Promise<void>(resolve => requestAnimationFrame(() => resolve()))
}

function mount(): MenubarElement {
  document.body.innerHTML = `<xh-menubar value="file"><div data-xh-part="root">
    <button data-xh-part="trigger" value="file">文件</button>
    <div data-xh-part="positioner" value="file"><div data-xh-part="content" value="file" style="inline-size: 200px; max-block-size: 160px">${items('file', 40)}</div></div>
    <button data-xh-part="trigger" value="edit">编辑</button>
    <div data-xh-part="positioner" value="edit"><div data-xh-part="content" value="edit" style="inline-size: 200px; max-block-size: 160px">${items('edit', 40)}</div></div>
  </div></xh-menubar>`
  return document.querySelector<MenubarElement>('xh-menubar')!
}

function content(value: string): HTMLElement {
  return document.querySelector<HTMLElement>(`[data-scope='menubar'][data-part='content'][data-value='${value}']`)
    ?? document.querySelector<HTMLElement>(`[data-part='content'][value='${value}']`)!
}

beforeEach(() => setDiagnosticsLevel('silent'))

afterEach(() => {
  document.body.innerHTML = ''
  setDiagnosticsLevel('warn')
})

describe('wc menubar 自绘条', () => {
  it('条子挂在开着那张菜单的 positioner 里、走 4px 档；换张后整套跟着搬到新开的那张', async () => {
    const element = mount()
    await settle(element)

    const file = content('file')
    expect(file.scrollHeight).toBeGreaterThan(file.clientHeight)
    expect(file.hasAttribute('data-xh-scrollbar')).toBe(true)
    const filePositioner = file.parentElement!
    const bar = filePositioner.querySelector<HTMLElement>('[data-scope="scrollbar"][data-part="root"]')
    expect(bar).not.toBeNull()
    expect(bar!.getAttribute('data-size')).toBe('sm')
    expect(getComputedStyle(filePositioner).getPropertyValue('--xh-scrollbar-track-bg').trim()).toBe('transparent')
    // 没开着的那张不配条子
    expect(content('edit').parentElement!.querySelector('[data-scope="scrollbar"]')).toBeNull()

    element.value = 'edit'
    await settle(element)
    const edit = content('edit')
    expect(edit.hasAttribute('data-xh-scrollbar')).toBe(true)
    expect(edit.parentElement!.querySelector('[data-scope="scrollbar"][data-part="root"]')).not.toBeNull()
    expect(filePositioner.querySelector('[data-scope="scrollbar"]')).toBeNull()
  })
})
