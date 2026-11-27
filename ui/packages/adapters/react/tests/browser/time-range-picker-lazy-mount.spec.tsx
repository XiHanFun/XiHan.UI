// 时间范围选择器的 lazyMount / unmountOnExit 要在真浏览器里验：打开前起止两套时间列不在；
// Alt+ArrowDown 展开那一帧起止两套时间列才挂上，焦点照样落到起点时列里选中的那一格；退场动画得真播完才卸。
import type { Root } from 'react-dom/client'
import type { XhTimeRangePickerRootProps } from '../../src'
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { afterEach, describe, expect, it } from 'vitest'
import { userEvent } from 'vitest/browser'
import { XhTimeRangePickerRoot } from '../../src'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

const globals = globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }

let root: Root | null = null
let host: HTMLElement | null = null

async function inAct(fn: () => void | Promise<void>): Promise<void> {
  const previous = globals.IS_REACT_ACT_ENVIRONMENT
  globals.IS_REACT_ACT_ENVIRONMENT = true
  try {
    await act(fn)
  }
  finally {
    globals.IS_REACT_ACT_ENVIRONMENT = previous
  }
}

afterEach(async () => {
  await inAct(() => root?.unmount())
  root = null
  host?.remove()
  host = null
})

function part(name: string): HTMLElement | null {
  return document.querySelector<HTMLElement>(`[data-scope='time-range-picker'][data-part='${name}']`)
}

const cells = (): HTMLElement[] => [...document.querySelectorAll<HTMLElement>(`[data-scope='time-range-picker'][data-part='item']`)]
const focusedDay = (): string | null => document.activeElement?.closest<HTMLElement>(`[data-scope='time-range-picker'][data-part='item']`)?.getAttribute('data-value') ?? null

async function render(props: XhTimeRangePickerRootProps): Promise<(next: XhTimeRangePickerRootProps) => Promise<void>> {
  host = document.createElement('div')
  document.body.append(host)
  root = createRoot(host)
  await inAct(() => root!.render(<XhTimeRangePickerRoot {...props} label="时间" locale="zh-CN" />))
  return next => inAct(() => root!.render(<XhTimeRangePickerRoot {...next} label="时间" locale="zh-CN" />))
}

describe('时间范围选择器 lazyMount', () => {
  it('第一次展开前起止两套时间列不在；Alt+ArrowDown 展开后起止两套时间列挂上、焦点落在起点时列里选中的那一格，收起后留着', async () => {
    await render({ lazyMount: true, defaultValue: ['09:30', '17:00'] })
    expect(part('content')).not.toBeNull()
    expect(cells()).toHaveLength(0)

    // 有值时时钟入口钮让位给清空钮；键盘入口挂在输入段上
    document.querySelector<HTMLElement>(`[data-part='segment'][tabindex='0']`)!.focus()
    await userEvent.keyboard('{Alt>}{ArrowDown}{/Alt}')
    await expect.poll(focusedDay).toBe('09')
    expect(cells().length).toBeGreaterThan(23)

    await userEvent.keyboard('{Escape}')
    await expect.poll(() => getComputedStyle(part('content')!).display).toBe('none')
    expect(cells().length).toBeGreaterThan(23)
  })
})

describe('时间范围选择器 unmountOnExit', () => {
  it('退场播完才撤起止两套时间列，下次展开重新铺上', async () => {
    const rerender = await render({ unmountOnExit: true, defaultValue: ['09:30', '17:00'], open: true })
    await expect.poll(() => cells().length).toBeGreaterThan(23)
    const first = cells()[0]
    await expect.poll(() => part('positioner')!.hasAttribute('data-positioned')).toBe(true)

    await rerender({ unmountOnExit: true, defaultValue: ['09:30', '17:00'], open: false })
    // 退场正在播：起止两套时间列还在
    expect(cells()[0]).toBe(first)
    await expect.poll(() => cells().length).toBe(0)
    expect(getComputedStyle(part('content')!).display).toBe('none')

    await rerender({ unmountOnExit: true, defaultValue: ['09:30', '17:00'], open: true })
    await expect.poll(() => cells().length).toBeGreaterThan(23)
    expect(cells()[0]).not.toBe(first)
  })
})
