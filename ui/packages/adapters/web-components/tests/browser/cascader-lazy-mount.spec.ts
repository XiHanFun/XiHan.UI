// xh-cascader 的 lazy-mount / unmount-on-exit 要在真浏览器里验：生成的各列第一次展开才铺，手写在 content 里 <template> 中的列
// 第一次展开才克隆；打开前触发器里的选中文字照旧在，Enter 展开后焦点落到选中路径的末项。unmount-on-exit 等退场动画真播完才撤。
import { afterEach, describe, expect, it } from 'vitest'
import { userEvent } from 'vitest/browser'
import { defineXhElements } from '../../src/define'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

defineXhElements()

interface CascaderElement extends HTMLElement {
  collection?: unknown
  defaultValue?: unknown
  open?: boolean
  updateComplete: Promise<unknown>
}

const COLLECTION = [
  { value: 'zj', label: '浙江', children: [{ value: 'hz', label: '杭州' }, { value: 'nb', label: '宁波' }] },
  { value: 'js', label: '江苏', children: [{ value: 'nj', label: '南京' }] },
]

function ITEM(value: string, label: string): string {
  return `<div data-xh-part="item" value="${value}"><span data-xh-part="item-text">${label}</span><span data-xh-part="item-indicator"></span></div>`
}

const HAND_WRITTEN = `
  <div data-xh-part="control">
    <button data-xh-part="trigger"><span data-xh-part="value-text"></span><span data-xh-part="indicator"></span></button>
  </div>
  <div data-xh-part="positioner">
    <div data-xh-part="content">
      <template>
        <div data-xh-part="column" level="0">${ITEM('zj', '浙江')}${ITEM('js', '江苏')}</div>
        <div data-xh-part="column" level="1">${ITEM('hz', '杭州')}${ITEM('nb', '宁波')}${ITEM('nj', '南京')}</div>
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
  return document.querySelector<HTMLElement>(`[data-scope='cascader'][data-part='${name}']`)
}

const items = (): HTMLElement[] => [...document.querySelectorAll<HTMLElement>(`[data-scope='cascader'][data-part='item']`)]

async function mount(attrs: Record<string, string>, handWritten: boolean, value?: string[][]): Promise<CascaderElement> {
  box = document.createElement('div')
  const cascader = document.createElement('xh-cascader') as CascaderElement
  for (const [name, v] of Object.entries(attrs))
    cascader.setAttribute(name, v)
  if (handWritten)
    cascader.innerHTML = HAND_WRITTEN
  else
    cascader.setAttribute('label', '地区')
  cascader.collection = COLLECTION
  if (value)
    cascader.defaultValue = value
  box.append(cascader)
  document.body.append(box)
  await cascader.updateComplete
  await new Promise<void>(resolve => requestAnimationFrame(() => resolve()))
  return cascader
}

describe.each([
  { name: '生成的列', handWritten: false },
  { name: '手写的列写进 <template>', handWritten: true },
])('xh-cascader lazy-mount（$name）', ({ handWritten }) => {
  it('第一次展开前选中文字在、各列不在；Enter 展开后各列挂上、焦点落在选中路径末项，收起后留着', async () => {
    await mount({ 'lazy-mount': '' }, handWritten, [['zj', 'hz']])
    await expect.poll(() => part('value-text')!.textContent).toBe('浙江 / 杭州')
    expect(part('content')).not.toBeNull()
    expect(items()).toHaveLength(0)

    part('trigger')!.focus()
    await userEvent.keyboard('{Enter}')
    await expect.poll(() => document.activeElement?.getAttribute('data-value')).toBe('hz')
    expect(items().length).toBeGreaterThan(0)

    await userEvent.keyboard('{Escape}')
    await expect.poll(() => getComputedStyle(part('content')!).display).toBe('none')
    expect(items().length).toBeGreaterThan(0)
  })
})

describe.each([
  { name: '生成的列', handWritten: false },
  { name: '手写的列写进 <template>', handWritten: true },
])('xh-cascader unmount-on-exit（$name）', ({ handWritten }) => {
  it('退场播完才撤各列，下次展开重新铺上', async () => {
    const cascader = await mount({ 'unmount-on-exit': '' }, handWritten)
    cascader.open = true
    await expect.poll(() => items().length).toBeGreaterThan(0)
    const first = items()[0]
    await expect.poll(() => part('positioner')!.hasAttribute('data-positioned')).toBe(true)

    cascader.open = false
    await cascader.updateComplete
    // 退场正在播：各列还在
    expect(items()[0]).toBe(first)
    await expect.poll(() => items().length).toBe(0)
    expect(getComputedStyle(part('content')!).display).toBe('none')

    cascader.open = true
    await expect.poll(() => items().length).toBeGreaterThan(0)
    expect(items()[0]).not.toBe(first)
  })
})
