// 级联选择的 lazyMount / unmountOnExit 要在真浏览器里验：打开前触发器里的选中文字照旧在、各列不在；
// Enter 展开那一帧各列才挂上，焦点照样落到选中路径的末项；退场动画得真播完才卸。
import type { App } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import { userEvent } from 'vitest/browser'
import { createApp, h, nextTick, ref } from 'vue'
import { XhCascaderRoot } from '../../src'
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
  { value: 'zj', label: '浙江', children: [{ value: 'hz', label: '杭州' }, { value: 'nb', label: '宁波' }] },
  { value: 'js', label: '江苏', children: [{ value: 'nj', label: '南京' }] },
]

function part(name: string): HTMLElement | null {
  return document.querySelector<HTMLElement>(`[data-scope='cascader'][data-part='${name}']`)
}

const items = (): HTMLElement[] => [...document.querySelectorAll<HTMLElement>(`[data-scope='cascader'][data-part='item']`)]

function mount(props: Record<string, unknown>): { open: ReturnType<typeof ref<boolean>> } {
  host = document.createElement('div')
  document.body.append(host)
  const open = ref(false)
  app = createApp({
    render: () => h(XhCascaderRoot, {
      ...props,
      'collection': COLLECTION,
      'label': '地区',
      'open': open.value,
      'onUpdate:open': (v: boolean) => { open.value = v },
    }),
  })
  app.mount(host)
  return { open }
}

describe('级联选择 lazyMount', () => {
  it('第一次展开前选中文字在、各列不在；Enter 展开后各列挂上、焦点落在选中路径末项，收起后留着', async () => {
    const t = mount({ lazyMount: true, defaultValue: [['zj', 'hz']] })
    await nextTick()
    expect(part('value-text')!.textContent).toBe('浙江 / 杭州')
    expect(part('content')).not.toBeNull()
    expect(items()).toHaveLength(0)

    part('trigger')!.focus()
    await userEvent.keyboard('{Enter}')
    await expect.poll(() => document.activeElement?.getAttribute('data-value')).toBe('hz')
    expect(items().length).toBeGreaterThan(0)

    t.open.value = false
    await expect.poll(() => getComputedStyle(part('content')!).display).toBe('none')
    expect(items().length).toBeGreaterThan(0)
  })
})

describe('级联选择 unmountOnExit', () => {
  it('退场播完才撤各列，下次展开重新铺上', async () => {
    const t = mount({ unmountOnExit: true })
    t.open.value = true
    await expect.poll(() => items().length).toBeGreaterThan(0)
    const first = items()[0]
    await expect.poll(() => part('positioner')!.hasAttribute('data-positioned')).toBe(true)

    t.open.value = false
    await nextTick()
    // 退场正在播：各列还在
    expect(items()[0]).toBe(first)
    await expect.poll(() => items().length).toBe(0)
    expect(getComputedStyle(part('content')!).display).toBe('none')

    t.open.value = true
    await expect.poll(() => items().length).toBeGreaterThan(0)
    expect(items()[0]).not.toBe(first)
  })
})
