// xh-select 的 unmount-on-exit 要在真浏览器里验：按数据铺的条目与 list 里 <template> 克隆出的条目，都等退场动画真播完才撤；
// Enter 再展开那一帧条目才铺回来，焦点照样落到选中项；条目撤走之后在触发器上连打照样按 collection 选中。
import { afterEach, describe, expect, it } from 'vitest'
import { userEvent } from 'vitest/browser'
import { defineXhElements } from '../../src/define'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

defineXhElements()

interface SelectElement extends HTMLElement {
  collection?: unknown
  open?: boolean
  updateComplete: Promise<unknown>
}

const COLLECTION = [
  { value: 'apple', label: 'Apple' },
  { value: 'banana', label: 'Banana' },
]

const HAND_WRITTEN = `
  <div data-xh-part="control">
    <button data-xh-part="trigger" aria-label="水果"><span data-xh-part="value-text"></span></button>
  </div>
  <div data-xh-part="positioner">
    <div data-xh-part="content">
      <div data-xh-part="list">
        <template>
          <div data-xh-part="item" value="apple"><span data-xh-part="item-text">Apple</span></div>
          <div data-xh-part="item" value="banana"><span data-xh-part="item-text">Banana</span></div>
        </template>
      </div>
    </div>
  </div>
`

let box: HTMLElement | null = null

afterEach(() => {
  box?.remove()
  box = null
})

function part(name: string): HTMLElement | null {
  return document.querySelector<HTMLElement>(`[data-scope='select'][data-part='${name}']`)
}

const items = (): HTMLElement[] => [...document.querySelectorAll<HTMLElement>(`[data-scope='select'][data-part='item']`)]

async function mount(attrs: Record<string, string>, handWritten = false): Promise<SelectElement> {
  box = document.createElement('div')
  const select = document.createElement('xh-select') as SelectElement
  for (const [name, value] of Object.entries(attrs))
    select.setAttribute(name, value)
  if (handWritten) {
    select.innerHTML = HAND_WRITTEN
  }
  else {
    select.setAttribute('label', '水果')
    select.collection = COLLECTION
  }
  // open 给过就是受控：键盘开合只派发 open-change，写回 open 才真开合
  select.addEventListener('open-change', (event) => {
    select.open = (event as CustomEvent<{ open: boolean }>).detail.open
  })
  box.append(select)
  document.body.append(box)
  await select.updateComplete
  await new Promise<void>(resolve => requestAnimationFrame(() => resolve()))
  return select
}

describe.each([
  { name: '按数据铺', handWritten: false },
  { name: '手写条目写进 <template>', handWritten: true },
])('xh-select unmount-on-exit（$name）', ({ handWritten }) => {
  it('退场播完才撤条目；Enter 再展开重新铺上，焦点落在选中项', async () => {
    const select = await mount({ 'unmount-on-exit': '', 'default-value': 'banana' }, handWritten)
    expect(part('content')).not.toBeNull()
    expect(items()).toHaveLength(0)

    select.open = true
    await expect.poll(() => items().length).toBe(2)
    const first = items()[0]
    await expect.poll(() => part('positioner')!.hasAttribute('data-positioned')).toBe(true)

    select.open = false
    await select.updateComplete
    // 退场正在播：条目还在
    expect(items()[0]).toBe(first)
    await expect.poll(() => items().length).toBe(0)
    expect(getComputedStyle(part('content')!).display).toBe('none')

    part('trigger')!.focus()
    await userEvent.keyboard('{Enter}')
    await expect.poll(() => document.activeElement?.getAttribute('data-value')).toBe('banana')
    expect(items()).toHaveLength(2)
    expect(items()[0]).not.toBe(first)
  })
})

describe('xh-select unmount-on-exit 收起之后的连打', () => {
  it('条目撤走之后在触发器上打字，按 collection 选中', async () => {
    const select = await mount({ 'unmount-on-exit': '' })
    select.open = true
    await expect.poll(() => items().length).toBe(2)
    select.open = false
    await expect.poll(() => items().length).toBe(0)

    part('trigger')!.focus()
    await userEvent.keyboard('b')
    await expect.poll(() => part('value-text')!.textContent).toBe('Banana')
    expect(items()).toHaveLength(0)
  })
})
