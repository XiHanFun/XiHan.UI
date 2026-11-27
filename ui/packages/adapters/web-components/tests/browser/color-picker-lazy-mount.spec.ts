// xh-color-picker 的 lazy-mount / unmount-on-exit 要在真浏览器里验：生成的面板第一次展开才铺，Enter 展开后焦点进到面板里；
// unmount-on-exit 等退场动画真播完才撤；inline 常驻形态不受影响。模板克隆的规则与其他浮层共用，这里只验生成的结构。
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
  return document.querySelector<HTMLElement>(`[data-scope='color-picker'][data-part='${name}']`)
}

const areas = (): HTMLElement[] => [...document.querySelectorAll<HTMLElement>(`[data-scope='color-picker'][data-part='saturation-area']`)]

async function mount(attrs: Record<string, string>): Promise<PickerElement> {
  box = document.createElement('div')
  const picker = document.createElement('xh-color-picker') as PickerElement
  for (const [name, v] of Object.entries({ 'label': '主题色', 'default-value': '#3366ff', ...attrs }))
    picker.setAttribute(name, v)
  box.append(picker)
  document.body.append(box)
  await picker.updateComplete
  await new Promise<void>(resolve => requestAnimationFrame(() => resolve()))
  return picker
}

describe('xh-color-picker lazy-mount', () => {
  it('第一次展开前面板不在；Enter 展开后面板挂上、焦点进到面板里，收起后留着', async () => {
    await mount({ 'lazy-mount': '' })
    expect(part('content')).not.toBeNull()
    expect(areas()).toHaveLength(0)

    part('trigger')!.focus()
    await userEvent.keyboard('{Enter}')
    await expect.poll(() => part('content')!.contains(document.activeElement)).toBe(true)
    expect(areas()).toHaveLength(1)

    await userEvent.keyboard('{Escape}')
    await expect.poll(() => getComputedStyle(part('content')!).display).toBe('none')
    expect(areas()).toHaveLength(1)
  })

  it('inline 常驻形态：面板首屏就在', async () => {
    await mount({ 'inline': '', 'lazy-mount': '', 'unmount-on-exit': '' })
    await expect.poll(() => areas().length).toBe(1)
  })
})

describe('xh-color-picker unmount-on-exit', () => {
  it('退场播完才撤面板，下次展开重新铺上', async () => {
    const picker = await mount({ 'unmount-on-exit': '' })
    picker.open = true
    await expect.poll(() => areas().length).toBe(1)
    const first = areas()[0]
    await expect.poll(() => part('positioner')!.hasAttribute('data-positioned')).toBe(true)

    picker.open = false
    await picker.updateComplete
    // 退场正在播：面板还在
    expect(areas()[0]).toBe(first)
    await expect.poll(() => areas().length).toBe(0)
    expect(getComputedStyle(part('content')!).display).toBe('none')

    picker.open = true
    await expect.poll(() => areas().length).toBe(1)
    expect(areas()[0]).not.toBe(first)
  })
})
