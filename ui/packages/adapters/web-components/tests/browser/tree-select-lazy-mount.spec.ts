// xh-tree-select 的 lazy-mount / unmount-on-exit 要在真浏览器里验：生成的树第一次展开才铺，手写在 content 里 <template> 中的树
// 第一次展开才克隆；打开前触发器里的选中文字照旧在，Enter 展开后焦点落到选中的那一行。unmount-on-exit 等退场动画真播完才撤。
import { afterEach, describe, expect, it } from 'vitest'
import { userEvent } from 'vitest/browser'
import { defineXhElements } from '../../src/define'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

defineXhElements()

interface TreeSelectElement extends HTMLElement {
  collection?: unknown
  defaultValue?: unknown
  open?: boolean
  updateComplete: Promise<unknown>
}

const COLLECTION = [
  { value: 'zj', label: '浙江', children: [{ value: 'hz', label: '杭州' }, { value: 'nb', label: '宁波' }] },
  { value: 'sh', label: '上海' },
]

const LEAF = (value: string, label: string): string =>
  `<div data-xh-part="item" value="${value}"><span data-xh-part="item-indicator"></span><span data-xh-part="item-text">${label}</span></div>`

const HAND_WRITTEN = `
  <div data-xh-part="control">
    <button data-xh-part="trigger"><span data-xh-part="value-text"></span><span data-xh-part="indicator"></span></button>
  </div>
  <div data-xh-part="positioner">
    <div data-xh-part="content">
      <template>
        <div data-xh-part="tree">
          <div data-xh-part="branch" value="zj">
            <div data-xh-part="branch-control"><span data-xh-part="branch-trigger"></span><span data-xh-part="branch-text">浙江</span><span data-xh-part="item-indicator"></span></div>
            <div data-xh-part="branch-content">${LEAF('hz', '杭州')}${LEAF('nb', '宁波')}</div>
          </div>
          ${LEAF('sh', '上海')}
        </div>
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
  return document.querySelector<HTMLElement>(`[data-scope='tree-select'][data-part='${name}']`)
}

const nodes = (): HTMLElement[] => [...document.querySelectorAll<HTMLElement>(`[data-scope='tree-select'][data-part='item'], [data-scope='tree-select'][data-part='branch']`)]

async function mount(attrs: Record<string, string>, handWritten: boolean, value?: string): Promise<TreeSelectElement> {
  box = document.createElement('div')
  const select = document.createElement('xh-tree-select') as TreeSelectElement
  for (const [name, v] of Object.entries(attrs))
    select.setAttribute(name, v)
  if (handWritten)
    select.innerHTML = HAND_WRITTEN
  else
    select.setAttribute('label', '地区')
  select.collection = COLLECTION
  if (value)
    select.defaultValue = value
  box.append(select)
  document.body.append(box)
  await select.updateComplete
  await new Promise<void>(resolve => requestAnimationFrame(() => resolve()))
  return select
}

describe.each([
  { name: '生成的树', handWritten: false },
  { name: '手写的树写进 <template>', handWritten: true },
])('xh-tree-select lazy-mount（$name）', ({ handWritten }) => {
  it('第一次展开前选中文字在、树不在；Enter 展开后树挂上、焦点落在选中的那一行，收起后留着', async () => {
    await mount({ 'lazy-mount': '' }, handWritten, 'sh')
    await expect.poll(() => part('value-text')!.textContent).toBe('上海')
    expect(part('content')).not.toBeNull()
    expect(nodes()).toHaveLength(0)

    part('trigger')!.focus()
    await userEvent.keyboard('{Enter}')
    await expect.poll(() => document.activeElement?.getAttribute('data-value')).toBe('sh')
    expect(nodes().length).toBeGreaterThan(0)

    await userEvent.keyboard('{Escape}')
    await expect.poll(() => getComputedStyle(part('content')!).display).toBe('none')
    expect(nodes().length).toBeGreaterThan(0)
  })
})

describe.each([
  { name: '生成的树', handWritten: false },
  { name: '手写的树写进 <template>', handWritten: true },
])('xh-tree-select unmount-on-exit（$name）', ({ handWritten }) => {
  it('退场播完才撤树，下次展开重新铺上', async () => {
    const select = await mount({ 'unmount-on-exit': '' }, handWritten)
    select.open = true
    await expect.poll(() => nodes().length).toBeGreaterThan(0)
    const first = nodes()[0]
    await expect.poll(() => part('positioner')!.hasAttribute('data-positioned')).toBe(true)

    select.open = false
    await select.updateComplete
    // 退场正在播：树还在
    expect(nodes()[0]).toBe(first)
    await expect.poll(() => nodes().length).toBe(0)
    expect(getComputedStyle(part('content')!).display).toBe('none')

    select.open = true
    await expect.poll(() => nodes().length).toBeGreaterThan(0)
    expect(nodes()[0]).not.toBe(first)
  })
})
