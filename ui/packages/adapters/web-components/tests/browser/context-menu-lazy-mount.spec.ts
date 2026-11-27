// xh-context-menu 的 lazy-mount / unmount-on-exit 要在真浏览器里验：按数据铺的条目第一次展开才生成，手写在 content 里 <template> 中的条目
// 第一次展开才克隆；两种写法 Shift+F10 展开后焦点都落到首项。unmount-on-exit 等退场动画真播完才撤。
import { afterEach, describe, expect, it } from 'vitest'
import { userEvent } from 'vitest/browser'
import { defineXhElements } from '../../src/define'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

defineXhElements()

interface MenuElement extends HTMLElement {
  collection?: unknown
  open?: boolean
  updateComplete: Promise<unknown>
}

const COLLECTION = [
  { value: 'copy', label: '复制' },
  { value: 'paste', label: '粘贴' },
]

const HAND_WRITTEN = `
  <div data-xh-part="trigger">在这里右键</div>
  <div data-xh-part="positioner">
    <div data-xh-part="content">
      <template>
        <div data-xh-part="item" value="copy"><span data-xh-part="item-text">复制</span></div>
        <div data-xh-part="item" value="paste"><span data-xh-part="item-text">粘贴</span></div>
      </template>
    </div>
  </div>
`

let box: HTMLElement | null = null

afterEach(() => {
  box?.remove()
  box = null
})

function part(name: string): HTMLElement | null {
  return document.querySelector<HTMLElement>(`[data-scope='context-menu'][data-part='${name}']`)
}

const items = (): HTMLElement[] => [...document.querySelectorAll<HTMLElement>(`[data-scope='context-menu'][data-part='item']`)]

async function mount(attrs: Record<string, string>, handWritten = false): Promise<MenuElement> {
  box = document.createElement('div')
  const menu = document.createElement('xh-context-menu') as MenuElement
  for (const [name, value] of Object.entries(attrs))
    menu.setAttribute(name, value)
  if (handWritten)
    menu.innerHTML = HAND_WRITTEN
  if (!handWritten)
    menu.collection = COLLECTION
  box.append(menu)
  document.body.append(box)
  await menu.updateComplete
  await new Promise<void>(resolve => requestAnimationFrame(() => resolve()))
  return menu
}

describe.each([
  { name: '按数据铺', handWritten: false },
  { name: '手写条目写进 <template>', handWritten: true },
])('xh-context-menu lazy-mount（$name）', ({ handWritten }) => {
  it('第一次展开前 content 在、条目不在；Shift+F10 展开后条目挂上、焦点落在首项，收起后条目留着', async () => {
    await mount({ 'lazy-mount': '' }, handWritten)
    expect(part('content')).not.toBeNull()
    expect(items()).toHaveLength(0)

    part('trigger')!.focus()
    await userEvent.keyboard('{Shift>}{F10}{/Shift}')
    await expect.poll(() => document.activeElement?.getAttribute('data-value')).toBe('copy')
    expect(items()).toHaveLength(2)

    await userEvent.keyboard('{Escape}')
    await expect.poll(() => getComputedStyle(part('content')!).display).toBe('none')
    expect(items()).toHaveLength(2)
  })
})

describe.each([
  { name: '按数据铺', handWritten: false },
  { name: '手写条目写进 <template>', handWritten: true },
])('xh-context-menu unmount-on-exit（$name）', ({ handWritten }) => {
  it('退场播完才撤条目，下次展开重新铺上', async () => {
    const menu = await mount({ 'unmount-on-exit': '' }, handWritten)
    menu.open = true
    await expect.poll(() => items().length).toBe(2)
    const first = items()[0]
    await expect.poll(() => part('positioner')!.hasAttribute('data-positioned')).toBe(true)

    menu.open = false
    await menu.updateComplete
    // 退场正在播：条目还在
    expect(items()[0]).toBe(first)
    await expect.poll(() => items().length).toBe(0)
    expect(getComputedStyle(part('content')!).display).toBe('none')

    menu.open = true
    await expect.poll(() => items().length).toBe(2)
    expect(items()[0]).not.toBe(first)
  })
})
