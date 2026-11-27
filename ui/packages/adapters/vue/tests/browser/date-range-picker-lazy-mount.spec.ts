// 日期范围选择器的 lazyMount / unmountOnExit 要在真浏览器里验：打开前输入行照旧显示选中日期、两张日历不在；
// Alt+ArrowDown 展开那一帧两张日历才挂上，焦点照样落到起点那一天；退场动画得真播完才卸。
import type { App } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import { userEvent } from 'vitest/browser'
import { createApp, h, nextTick, ref } from 'vue'
import { XhDateRangePickerRoot } from '../../src'
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
  return document.querySelector<HTMLElement>(`[data-scope='date-range-picker'][data-part='${name}']`)
}

const cells = (): HTMLElement[] => [...document.querySelectorAll<HTMLElement>(`[data-part='cell-trigger']`)]
const focusedDay = (): string | null => document.activeElement?.closest<HTMLElement>(`[data-part='cell']`)?.getAttribute('data-value') ?? null

function mount(props: Record<string, unknown>): { open: ReturnType<typeof ref<boolean>> } {
  host = document.createElement('div')
  document.body.append(host)
  const open = ref(false)
  app = createApp({
    render: () => h(XhDateRangePickerRoot, {
      ...props,
      'label': '日期',
      'locale': 'zh-CN',
      'open': open.value,
      'onUpdate:open': (v: boolean) => { open.value = v },
    }),
  })
  app.mount(host)
  return { open }
}

describe('日期范围选择器 lazyMount', () => {
  it('第一次展开前两张日历不在；Alt+ArrowDown 展开后两张日历挂上、焦点落在起点那一天，收起后留着', async () => {
    const t = mount({ lazyMount: true, defaultValue: ['2026-11-10', '2026-11-15'] })
    await nextTick()
    expect(part('content')).not.toBeNull()
    expect(cells()).toHaveLength(0)

    // 有值时日历入口钮让位给清空钮；键盘入口挂在输入段上
    document.querySelector<HTMLElement>(`[data-part='segment'][tabindex='0']`)!.focus()
    await userEvent.keyboard('{Alt>}{ArrowDown}{/Alt}')
    await expect.poll(focusedDay).toBe('2026-11-10')
    expect(cells().length).toBeGreaterThan(27)

    t.open.value = false
    await expect.poll(() => getComputedStyle(part('content')!).display).toBe('none')
    expect(cells().length).toBeGreaterThan(27)
  })
})

describe('日期范围选择器 unmountOnExit', () => {
  it('退场播完才撤两张日历，下次展开重新铺上', async () => {
    const t = mount({ unmountOnExit: true, defaultValue: ['2026-11-10', '2026-11-15'] })
    t.open.value = true
    await expect.poll(() => cells().length).toBeGreaterThan(27)
    const first = cells()[0]
    await expect.poll(() => part('positioner')!.hasAttribute('data-positioned')).toBe(true)

    t.open.value = false
    await nextTick()
    // 退场正在播：两张日历还在
    expect(cells()[0]).toBe(first)
    await expect.poll(() => cells().length).toBe(0)
    expect(getComputedStyle(part('content')!).display).toBe('none')

    t.open.value = true
    await expect.poll(() => cells().length).toBeGreaterThan(27)
    expect(cells()[0]).not.toBe(first)
  })
})
