// 组合框的 lazyMount / unmountOnExit 要在真浏览器里验：方向键展开那一帧候选才挂上，高亮照样落到首项、不闪空态；
// 打开前输入框里的选中文字按 collection 算；退场动画得真播完才卸。
import type { App, VNode } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import { userEvent } from 'vitest/browser'
import { createApp, h, nextTick, ref } from 'vue'
import { XhComboboxContent, XhComboboxControl, XhComboboxEmpty, XhComboboxInput, XhComboboxItem, XhComboboxItemText, XhComboboxPositioner, XhComboboxRoot } from '../../src'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

let app: App | null = null
let host: HTMLElement | null = null

afterEach(() => {
  app?.unmount()
  app = null
  host?.remove()
  host = null
})

const COLLECTION = [
  { value: 'apple', label: '苹果' },
  { value: 'banana', label: '香蕉' },
]

function part(name: string): HTMLElement | null {
  return document.querySelector<HTMLElement>(`[data-scope='combobox'][data-part='${name}']`)
}

const items = (): HTMLElement[] => [...document.querySelectorAll<HTMLElement>(`[data-scope='combobox'][data-part='item']`)]
const highlighted = (): string | null => document.querySelector<HTMLElement>(`[data-scope='combobox'][data-part='item'][data-highlighted]`)?.getAttribute('data-value') ?? null

function mount(props: Record<string, unknown>, handWritten = false): { open: ReturnType<typeof ref<boolean>> } {
  host = document.createElement('div')
  document.body.append(host)
  const open = ref(false)
  const children = (): VNode[] => [
    h(XhComboboxControl, null, () => h(XhComboboxInput, { 'aria-label': '水果' })),
    h(XhComboboxPositioner, null, () => [
      h(XhComboboxContent, null, () => COLLECTION.map(node => h(XhComboboxItem, { key: node.value, value: node.value }, () => h(XhComboboxItemText, null, () => node.label)))),
      h(XhComboboxEmpty, null, () => '没有结果'),
    ]),
  ]
  app = createApp({
    render: () => h(XhComboboxRoot, {
      ...props,
      'open': open.value,
      'onUpdate:open': (v: boolean) => { open.value = v },
      ...(handWritten ? {} : { collection: COLLECTION, label: '水果' }),
    }, handWritten ? children : undefined),
  })
  app.mount(host)
  return { open }
}

describe.each([
  { name: '按数据铺', handWritten: false },
  { name: '手写候选', handWritten: true },
])('组合框 lazyMount（$name）', ({ handWritten }) => {
  it('第一次展开前 content 在、候选不在；方向键展开后候选挂上、高亮落在首项且不闪空态，收起后候选留着', async () => {
    const t = mount({ lazyMount: true }, handWritten)
    await nextTick()
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

    t.open.value = false
    await expect.poll(() => getComputedStyle(part('content')!).display).toBe('none')
    expect(items()).toHaveLength(2)
  })
})

describe('组合框 lazyMount 的选中文字', () => {
  it('打开前输入框里就是 collection 里的选中文字', async () => {
    mount({ lazyMount: true, defaultValue: 'banana' })
    await nextTick()
    await expect.poll(() => (part('input') as HTMLInputElement).value).toBe('香蕉')
    expect(items()).toHaveLength(0)
  })
})

describe('组合框 unmountOnExit', () => {
  it('退场播完才撤候选，下次展开重新铺上', async () => {
    const t = mount({ unmountOnExit: true })
    t.open.value = true
    await expect.poll(() => items().length).toBe(2)
    const first = items()[0]
    await expect.poll(() => part('positioner')!.hasAttribute('data-positioned')).toBe(true)

    t.open.value = false
    await nextTick()
    // 退场正在播：候选还在
    expect(items()[0]).toBe(first)
    await expect.poll(() => items().length).toBe(0)
    expect(getComputedStyle(part('content')!).display).toBe('none')

    t.open.value = true
    await expect.poll(() => items().length).toBe(2)
    expect(items()[0]).not.toBe(first)
  })
})
