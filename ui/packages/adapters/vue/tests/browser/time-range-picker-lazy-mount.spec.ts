// 时间范围选择器的 lazyMount / unmountOnExit 要在真浏览器里验：打开前起止两套时间列不在；
// Alt+ArrowDown 展开那一帧起止两套时间列才挂上，焦点照样落到起点时列里选中的那一格；退场动画得真播完才卸。
import type { App } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import { userEvent } from 'vitest/browser'
import { createApp, h, nextTick, ref } from 'vue'
import { XhTimeRangePickerRoot } from '../../src'
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

function part(name: string): HTMLElement | null {
  return document.querySelector<HTMLElement>(`[data-scope='time-range-picker'][data-part='${name}']`)
}

const cells = (): HTMLElement[] => [...document.querySelectorAll<HTMLElement>(`[data-scope='time-range-picker'][data-part='item']`)]
const focusedDay = (): string | null => document.activeElement?.closest<HTMLElement>(`[data-scope='time-range-picker'][data-part='item']`)?.getAttribute('data-value') ?? null

function mount(props: Record<string, unknown>): { open: ReturnType<typeof ref<boolean>> } {
  host = document.createElement('div')
  document.body.append(host)
  const open = ref(false)
  app = createApp({
    render: () => h(XhTimeRangePickerRoot, {
      ...props,
      'label': '时间',
      'locale': 'zh-CN',
      'open': open.value,
      'onUpdate:open': (v: boolean) => { open.value = v },
    }),
  })
  app.mount(host)
  return { open }
}

describe('时间范围选择器 lazyMount', () => {
  it('第一次展开前起止两套时间列不在；Alt+ArrowDown 展开后起止两套时间列挂上、焦点落在起点时列里选中的那一格，收起后留着', async () => {
    const t = mount({ lazyMount: true, defaultValue: ['09:30', '17:00'] })
    await nextTick()
    expect(part('content')).not.toBeNull()
    expect(cells()).toHaveLength(0)

    // 有值时时钟入口钮让位给清空钮；键盘入口挂在输入段上
    document.querySelector<HTMLElement>(`[data-part='segment'][tabindex='0']`)!.focus()
    await userEvent.keyboard('{Alt>}{ArrowDown}{/Alt}')
    await expect.poll(focusedDay).toBe('09')
    expect(cells().length).toBeGreaterThan(23)

    t.open.value = false
    await expect.poll(() => getComputedStyle(part('content')!).display).toBe('none')
    expect(cells().length).toBeGreaterThan(23)
  })
})

describe('时间范围选择器 unmountOnExit', () => {
  it('退场播完才撤起止两套时间列，下次展开重新铺上', async () => {
    const t = mount({ unmountOnExit: true, defaultValue: ['09:30', '17:00'] })
    t.open.value = true
    await expect.poll(() => cells().length).toBeGreaterThan(23)
    const first = cells()[0]
    await expect.poll(() => part('positioner')!.hasAttribute('data-positioned')).toBe(true)

    t.open.value = false
    await nextTick()
    // 退场正在播：起止两套时间列还在
    expect(cells()[0]).toBe(first)
    await expect.poll(() => cells().length).toBe(0)
    expect(getComputedStyle(part('content')!).display).toBe('none')

    t.open.value = true
    await expect.poll(() => cells().length).toBeGreaterThan(23)
    expect(cells()[0]).not.toBe(first)
  })
})
