// 选择器的 unmountOnExit 要在真浏览器里验：退场动画得真播完才撤条目；Enter 再展开那一帧条目才铺回来，焦点照样落到选中项；
// 条目撤走之后在触发器上连打照样按 collection 选中。
import type { App, VNode } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import { userEvent } from 'vitest/browser'
import { createApp, h, nextTick, ref } from 'vue'
import { XhSelectContent, XhSelectControl, XhSelectItem, XhSelectItemText, XhSelectList, XhSelectPositioner, XhSelectRoot, XhSelectTrigger, XhSelectValueText } from '../../src'
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
  { value: 'apple', label: 'Apple' },
  { value: 'banana', label: 'Banana' },
]

function part(name: string): HTMLElement | null {
  return document.querySelector<HTMLElement>(`[data-scope='select'][data-part='${name}']`)
}

const items = (): HTMLElement[] => [...document.querySelectorAll<HTMLElement>(`[data-scope='select'][data-part='item']`)]

function mount(props: Record<string, unknown>, handWritten = false): { open: ReturnType<typeof ref<boolean>> } {
  host = document.createElement('div')
  document.body.append(host)
  const open = ref(false)
  const children = (): VNode[] => [
    h(XhSelectControl, null, () => h(XhSelectTrigger, { 'aria-label': '水果' }, () => h(XhSelectValueText))),
    h(XhSelectPositioner, null, () => h(XhSelectContent, null, () => h(XhSelectList, null, () =>
      COLLECTION.map(node => h(XhSelectItem, { key: node.value, value: node.value }, () => h(XhSelectItemText, null, () => node.label)))))),
  ]
  app = createApp({
    render: () => h(XhSelectRoot, {
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
  { name: '手写条目', handWritten: true },
])('选择器 unmountOnExit（$name）', ({ handWritten }) => {
  it('退场播完才撤条目；Enter 再展开重新铺上，焦点落在选中项', async () => {
    const t = mount({ unmountOnExit: true, defaultValue: 'banana' }, handWritten)
    await nextTick()
    expect(part('content')).not.toBeNull()
    expect(items()).toHaveLength(0)

    t.open.value = true
    await expect.poll(() => items().length).toBe(2)
    const first = items()[0]
    await expect.poll(() => part('positioner')!.hasAttribute('data-positioned')).toBe(true)

    t.open.value = false
    await nextTick()
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

describe('选择器 unmountOnExit 收起之后的连打', () => {
  it('条目撤走之后在触发器上打字，按 collection 选中', async () => {
    const t = mount({ unmountOnExit: true })
    t.open.value = true
    await expect.poll(() => items().length).toBe(2)
    t.open.value = false
    await expect.poll(() => items().length).toBe(0)

    part('trigger')!.focus()
    await userEvent.keyboard('b')
    await expect.poll(() => part('value-text')!.textContent).toBe('Banana')
    expect(items()).toHaveLength(0)
  })
})
