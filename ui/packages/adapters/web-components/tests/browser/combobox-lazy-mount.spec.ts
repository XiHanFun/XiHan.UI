// xh-combobox 的 lazy-mount / unmount-on-exit 要在真浏览器里验：按数据铺的候选第一次展开才生成，手写在 content 里 <template> 中的候选
// 第一次展开才克隆；两种写法方向键展开后高亮都落到首项、不闪空态。打开前输入框里的选中文字按 collection 算；unmount-on-exit 等退场动画真播完才撤。
import { afterEach, describe, expect, it } from 'vitest'
import { userEvent } from 'vitest/browser'
import { defineXhElements } from '../../src/define'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

defineXhElements()

interface ComboboxElement extends HTMLElement {
  collection?: unknown
  open?: boolean
  updateComplete: Promise<unknown>
}

const COLLECTION = [
  { value: 'apple', label: '苹果' },
  { value: 'banana', label: '香蕉' },
]

const HAND_WRITTEN = `
  <div data-xh-part="control"><input data-xh-part="input" aria-label="水果"></div>
  <div data-xh-part="positioner">
    <div data-xh-part="content">
      <template>
        <div data-xh-part="item" value="apple"><span data-xh-part="item-text">苹果</span></div>
        <div data-xh-part="item" value="banana"><span data-xh-part="item-text">香蕉</span></div>
      </template>
    </div>
    <div data-xh-part="empty">没有结果</div>
  </div>
`

let box: HTMLElement | null = null

afterEach(() => {
  box?.remove()
  box = null
})

function part(name: string): HTMLElement | null {
  return document.querySelector<HTMLElement>(`[data-scope='combobox'][data-part='${name}']`)
}

const items = (): HTMLElement[] => [...document.querySelectorAll<HTMLElement>(`[data-scope='combobox'][data-part='item']`)]
const highlighted = (): string | null => document.querySelector<HTMLElement>(`[data-scope='combobox'][data-part='item'][data-highlighted]`)?.getAttribute('data-value') ?? null

async function mount(attrs: Record<string, string>, handWritten = false): Promise<ComboboxElement> {
  box = document.createElement('div')
  const combobox = document.createElement('xh-combobox') as ComboboxElement
  for (const [name, value] of Object.entries(attrs))
    combobox.setAttribute(name, value)
  if (handWritten) {
    combobox.innerHTML = HAND_WRITTEN
  }
  else {
    combobox.setAttribute('label', '水果')
    combobox.collection = COLLECTION
  }
  box.append(combobox)
  document.body.append(box)
  await combobox.updateComplete
  await new Promise<void>(resolve => requestAnimationFrame(() => resolve()))
  return combobox
}

describe.each([
  { name: '按数据铺', handWritten: false },
  { name: '手写候选写进 <template>', handWritten: true },
])('xh-combobox lazy-mount（$name）', ({ handWritten }) => {
  it('第一次展开前 content 在、候选不在；方向键展开后候选挂上、高亮落在首项且不闪空态，收起后候选留着', async () => {
    await mount({ 'lazy-mount': '' }, handWritten)
    expect(part('content')).not.toBeNull()
    expect(items()).toHaveLength(0)

    const empties: boolean[] = []
    const watcher = new MutationObserver(() => empties.push(!part('empty')!.hidden))
    watcher.observe(part('empty')!, { attributes: true, attributeFilter: ['hidden'] })
    part('input')!.focus()
    await userEvent.keyboard('{ArrowDown}')
    await expect.poll(highlighted).toBe('apple')
    watcher.disconnect()
    expect(items()).toHaveLength(2)
    expect(empties).not.toContain(true)

    // 第一下 Escape 先清高亮，第二下才收起列表
    await userEvent.keyboard('{Escape}{Escape}')
    await expect.poll(() => getComputedStyle(part('content')!).display).toBe('none')
    expect(items()).toHaveLength(2)
  })
})

describe('xh-combobox lazy-mount 的选中文字', () => {
  it('打开前输入框里就是 collection 里的选中文字', async () => {
    await mount({ 'lazy-mount': '', 'default-value': 'banana' })
    await expect.poll(() => (part('input') as HTMLInputElement).value).toBe('香蕉')
    expect(items()).toHaveLength(0)
  })
})

describe.each([
  { name: '按数据铺', handWritten: false },
  { name: '手写候选写进 <template>', handWritten: true },
])('xh-combobox unmount-on-exit（$name）', ({ handWritten }) => {
  it('退场播完才撤候选，下次展开重新铺上', async () => {
    const combobox = await mount({ 'unmount-on-exit': '' }, handWritten)
    combobox.open = true
    await expect.poll(() => items().length).toBe(2)
    const first = items()[0]
    await expect.poll(() => part('positioner')!.hasAttribute('data-positioned')).toBe(true)

    combobox.open = false
    await combobox.updateComplete
    // 退场正在播：候选还在
    expect(items()[0]).toBe(first)
    await expect.poll(() => items().length).toBe(0)
    expect(getComputedStyle(part('content')!).display).toBe('none')

    combobox.open = true
    await expect.poll(() => items().length).toBe(2)
    expect(items()[0]).not.toBe(first)
  })
})
