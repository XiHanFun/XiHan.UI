// xh-date-picker 的 lazy-mount / unmount-on-exit 要在真浏览器里验：生成的面板第一次展开才铺，Alt+ArrowDown 展开后焦点落到选中的那一天；
// unmount-on-exit 等退场动画真播完才撤。手写面板要作者自己画格子，模板克隆的规则与其他浮层共用，这里只验生成的结构。
import { afterEach, describe, expect, it } from 'vitest'
import { userEvent } from 'vitest/browser'
import { defineXhElements } from '../../src/define'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

defineXhElements()

interface PickerElement extends HTMLElement {
  open?: boolean
  updateComplete: Promise<unknown>
}

let box: HTMLElement | null = null

afterEach(() => {
  box?.remove()
  box = null
})

function part(name: string): HTMLElement | null {
  return document.querySelector<HTMLElement>(`[data-scope='date-picker'][data-part='${name}']`)
}

const cells = (): HTMLElement[] => [...document.querySelectorAll<HTMLElement>(`[data-part='cell-trigger']`)]
const focusedDay = (): string | null => document.activeElement?.closest<HTMLElement>(`[data-part='cell']`)?.getAttribute('data-value') ?? null

async function mount(attrs: Record<string, string>): Promise<PickerElement> {
  box = document.createElement('div')
  const picker = document.createElement('xh-date-picker') as PickerElement
  for (const [name, v] of Object.entries({ label: '日期', locale: 'zh-CN', 'default-value': '2026-11-15', ...attrs }))
    picker.setAttribute(name, v)
  box.append(picker)
  document.body.append(box)
  await picker.updateComplete
  await new Promise<void>(resolve => requestAnimationFrame(() => resolve()))
  return picker
}

describe('xh-date-picker lazy-mount', () => {
  it('第一次展开前日历不在；Alt+ArrowDown 展开后日历挂上、焦点落在选中的那一天，收起后留着', async () => {
    await mount({ 'lazy-mount': '' })
    expect(part('content')).not.toBeNull()
    expect(cells()).toHaveLength(0)

    // 有值时日历入口钮让位给清空钮；键盘入口挂在输入段上
    await expect.poll(() => document.querySelector(`[data-part='segment'][tabindex='0']`)).not.toBeNull()
    document.querySelector<HTMLElement>(`[data-part='segment'][tabindex='0']`)!.focus()
    await userEvent.keyboard('{Alt>}{ArrowDown}{/Alt}')
    await expect.poll(focusedDay).toBe('2026-11-15')
    expect(cells().length).toBeGreaterThan(27)

    await userEvent.keyboard('{Escape}')
    await expect.poll(() => getComputedStyle(part('content')!).display).toBe('none')
    expect(cells().length).toBeGreaterThan(27)
  })
})

describe('xh-date-picker unmount-on-exit', () => {
  it('退场播完才撤日历，下次展开重新铺上', async () => {
    const picker = await mount({ 'unmount-on-exit': '' })
    picker.open = true
    await expect.poll(() => cells().length).toBeGreaterThan(27)
    const first = cells()[0]
    await expect.poll(() => part('positioner')!.hasAttribute('data-positioned')).toBe(true)

    picker.open = false
    await picker.updateComplete
    // 退场正在播：日历还在
    expect(cells()[0]).toBe(first)
    await expect.poll(() => cells().length).toBe(0)
    expect(getComputedStyle(part('content')!).display).toBe('none')

    picker.open = true
    await expect.poll(() => cells().length).toBeGreaterThan(27)
    expect(cells()[0]).not.toBe(first)
  })
})
