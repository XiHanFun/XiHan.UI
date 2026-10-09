// PinInput 的格子：边长取控件高档（sm / md / lg 随密度），格间距 --xh-space-1，字号取控件字号档；
// 当前格与字段外壳的聚焦态同一副面（承载面 + 聚焦描边），不另画环。几何与计算样式只有真实浏览器量得出。
import type { Size } from '@xihan-ui/core'
import type { App } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import { createApp, h, nextTick } from 'vue'
import { XhPinInputInput, XhPinInputRoot } from '../../src'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

let app: App | null = null
let host: HTMLElement | null = null

afterEach(() => {
  app?.unmount()
  host?.remove()
  app = null
  host = null
})

async function mount(size?: Size, density: 'comfortable' | 'compact' = 'comfortable'): Promise<HTMLInputElement[]> {
  host = document.createElement('div')
  host.dataset.density = density
  document.body.append(host)
  app = createApp({
    render: () => h(XhPinInputRoot, { 'size': size, 'aria-label': '验证码' } as never, () => h('div', { style: 'display: flex' }, Array.from({ length: 4 }, (_, i) => h(XhPinInputInput, { index: i })))),
  })
  app.mount(host)
  await nextTick()
  await nextTick()
  return [...host.querySelectorAll<HTMLInputElement>(`[data-scope='pin-input'][data-part='input']`)]
}

function resolve(value: string, property: string): string {
  const probe = document.createElement('span')
  probe.style.setProperty(property, value)
  host!.append(probe)
  const out = getComputedStyle(probe).getPropertyValue(property)
  probe.remove()
  return out
}

function px(token: string): number {
  return Number.parseFloat(resolve(`var(${token})`, 'inline-size'))
}

describe('pin-input 的格子', () => {
  it.each([
    ['sm', 'comfortable'],
    ['md', 'comfortable'],
    ['lg', 'comfortable'],
    ['sm', 'compact'],
    ['md', 'compact'],
    ['lg', 'compact'],
  ] as const)('%s / %s：边长取控件高档，格间距 --xh-space-1，字号取控件字号档', async (size, density) => {
    const [first, second] = await mount(size, density)
    const rect = first!.getBoundingClientRect()
    expect(rect.width).toBe(px(`--xh-control-h-${size}`))
    expect(rect.height).toBe(px(`--xh-control-h-${size}`))
    expect(Math.round(second!.getBoundingClientRect().left - rect.right)).toBe(px('--xh-space-1'))
    expect(getComputedStyle(first!).fontSize).toBe(resolve(`var(--xh-control-font-${size})`, 'font-size'))
  })

  it('当前格换承载面 + 聚焦描边，压在别的格子的字段淡底之间分得出', async () => {
    const [first, second] = await mount()
    first!.focus()
    await expect.poll(() => getComputedStyle(first!).backgroundColor).toBe(resolve('var(--xh-bg-surface)', 'background-color'))
    await expect.poll(() => getComputedStyle(first!).borderTopColor).toBe(resolve('var(--xh-border-control-focus)', 'color'))
    expect(getComputedStyle(second!).backgroundColor).toBe(resolve('var(--xh-bg-field)', 'background-color'))
  })
})
