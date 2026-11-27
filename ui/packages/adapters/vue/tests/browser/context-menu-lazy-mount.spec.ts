// 上下文菜单的 lazyMount / unmountOnExit 要在真浏览器里验：Shift+F10 展开那一帧条目才挂上，焦点照样落到首项；退场动画得真播完才卸。
import type { App, VNode } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import { userEvent } from 'vitest/browser'
import { createApp, h, nextTick, ref } from 'vue'
import { XhContextMenuContent, XhContextMenuItem, XhContextMenuItemText, XhContextMenuPositioner, XhContextMenuRoot, XhContextMenuTrigger } from '../../src'
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
  { value: 'copy', label: '复制' },
  { value: 'paste', label: '粘贴' },
]

function part(name: string): HTMLElement | null {
  return document.querySelector<HTMLElement>(`[data-scope='context-menu'][data-part='${name}']`)
}

const items = (): HTMLElement[] => [...document.querySelectorAll<HTMLElement>(`[data-scope='context-menu'][data-part='item']`)]

function mount(props: Record<string, unknown>, handWritten = false): { open: ReturnType<typeof ref<boolean>> } {
  host = document.createElement('div')
  document.body.append(host)
  const open = ref(false)
  const children = (): VNode[] => [
    h(XhContextMenuTrigger, null, () => '在这里右键'),
    h(XhContextMenuPositioner, null, () => h(XhContextMenuContent, null, () => COLLECTION.map(node => h(XhContextMenuItem, { key: node.value, value: node.value }, () => h(XhContextMenuItemText, null, () => node.label))))),
  ]
  app = createApp({
    render: () => h(XhContextMenuRoot, {
      ...props,
      'open': open.value,
      'onUpdate:open': (v: boolean) => { open.value = v },
      ...(handWritten ? {} : { collection: COLLECTION }),
    }, handWritten ? children : { trigger: () => '在这里右键' }),
  })
  app.mount(host)
  return { open }
}

describe.each([
  { name: '按数据铺', handWritten: false },
  { name: '手写条目', handWritten: true },
])('上下文菜单 lazyMount（$name）', ({ handWritten }) => {
  it('第一次展开前 content 在、条目不在；Shift+F10 展开后条目挂上、焦点落在首项，收起后条目留着', async () => {
    const t = mount({ lazyMount: true }, handWritten)
    await nextTick()
    expect(part('content')).not.toBeNull()
    expect(items()).toHaveLength(0)

    part('trigger')!.focus()
    await userEvent.keyboard('{Shift>}{F10}{/Shift}')
    await expect.poll(() => document.activeElement?.getAttribute('data-value')).toBe('copy')
    expect(items()).toHaveLength(2)

    t.open.value = false
    await expect.poll(() => getComputedStyle(part('content')!).display).toBe('none')
    expect(items()).toHaveLength(2)
  })
})

describe('上下文菜单 unmountOnExit', () => {
  it('退场播完才撤条目，下次展开重新铺上', async () => {
    const t = mount({ unmountOnExit: true })
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

    t.open.value = true
    await expect.poll(() => items().length).toBe(2)
    expect(items()[0]).not.toBe(first)
  })
})
