// 日期选择器的 lazyMount / unmountOnExit 要在真浏览器里验：打开前日历不在；
// Alt+ArrowDown 展开那一帧日历才挂上，焦点照样落到选中的那一天；退场动画得真播完才卸。
import type { Root } from 'react-dom/client'
import type { XhDatePickerRootProps } from '../../src'
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { afterEach, describe, expect, it } from 'vitest'
import { userEvent } from 'vitest/browser'
import { XhDatePickerRoot } from '../../src'
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
  return document.querySelector<HTMLElement>(`[data-scope='date-picker'][data-part='${name}']`)
}

const cells = (): HTMLElement[] => [...document.querySelectorAll<HTMLElement>(`[data-part='cell-trigger']`)]
const focusedDay = (): string | null => document.activeElement?.closest<HTMLElement>(`[data-part='cell']`)?.getAttribute('data-value') ?? null

async function render(props: XhDatePickerRootProps): Promise<(next: XhDatePickerRootProps) => Promise<void>> {
  host = document.createElement('div')
  document.body.append(host)
  root = createRoot(host)
  await inAct(() => root!.render(<XhDatePickerRoot {...props} label="日期" locale="zh-CN" />))
  return next => inAct(() => root!.render(<XhDatePickerRoot {...next} label="日期" locale="zh-CN" />))
}

describe('日期选择器 lazyMount', () => {
  it('第一次展开前日历不在；Alt+ArrowDown 展开后日历挂上、焦点落在选中的那一天，收起后留着', async () => {
    await render({ lazyMount: true, defaultValue: '2026-11-15' })
    expect(part('content')).not.toBeNull()
    expect(cells()).toHaveLength(0)

    // 有值时日历入口钮让位给清空钮；键盘入口挂在输入段上
    document.querySelector<HTMLElement>(`[data-part='segment'][tabindex='0']`)!.focus()
    await userEvent.keyboard('{Alt>}{ArrowDown}{/Alt}')
    await expect.poll(focusedDay).toBe('2026-11-15')
    expect(cells().length).toBeGreaterThan(27)

    await userEvent.keyboard('{Escape}')
    await expect.poll(() => getComputedStyle(part('content')!).display).toBe('none')
    expect(cells().length).toBeGreaterThan(27)
  })
})

describe('日期选择器 unmountOnExit', () => {
  it('退场播完才撤日历，下次展开重新铺上', async () => {
    const rerender = await render({ unmountOnExit: true, defaultValue: '2026-11-15', open: true })
    await expect.poll(() => cells().length).toBeGreaterThan(27)
    const first = cells()[0]
    await expect.poll(() => part('positioner')!.hasAttribute('data-positioned')).toBe(true)

    await rerender({ unmountOnExit: true, defaultValue: '2026-11-15', open: false })
    // 退场正在播：日历还在
    expect(cells()[0]).toBe(first)
    await expect.poll(() => cells().length).toBe(0)
    expect(getComputedStyle(part('content')!).display).toBe('none')

    await rerender({ unmountOnExit: true, defaultValue: '2026-11-15', open: true })
    await expect.poll(() => cells().length).toBeGreaterThan(27)
    expect(cells()[0]).not.toBe(first)
  })
})
