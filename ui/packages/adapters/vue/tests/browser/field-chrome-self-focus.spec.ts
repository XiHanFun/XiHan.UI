// 字段外壳就是输入框本身的几处（Field 里作者自己的原生控件、Mention 输入框、Pagination 跳页框、PinInput 的格子）：
// 聚焦与 TextField 同一副面——换承载面 + 聚焦描边、不画聚焦环，强制色档补一圈 Highlight 环；
// 指针停在聚焦着的字段上时聚焦面不让位给悬停面。计算样式与过渡只有真实浏览器量得出。
import type { App, VNode } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import { cdp, userEvent } from 'vitest/browser'
import { createApp, h, nextTick } from 'vue'
import {
  XhFieldControl,
  XhFieldLabel,
  XhFieldRoot,
  XhMentionRoot,
  XhPaginationItem,
  XhPaginationJumper,
  XhPaginationRoot,
  XhPinInputInput,
  XhPinInputRoot,
  XhTextFieldControl,
  XhTextFieldInput,
  XhTextFieldRoot,
} from '../../src'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

let app: App | null = null
let host: HTMLElement | null = null

afterEach(async () => {
  await cdp().send('Emulation.setEmulatedMedia', { media: '', features: [] })
  app?.unmount()
  host?.remove()
  app = null
  host = null
})

async function mount(render: () => VNode): Promise<void> {
  host = document.createElement('div')
  host.style.cssText = 'padding: 24px'
  document.body.append(host)
  app = createApp({ render })
  app.mount(host)
  await nextTick()
  await nextTick()
}

function resolve(value: string, property: 'color' | 'background-color' = 'color'): string {
  const probe = document.createElement('span')
  probe.style.setProperty(property, value)
  host!.append(probe)
  const out = getComputedStyle(probe).getPropertyValue(property)
  probe.remove()
  return out
}

const CASES: Array<[string, () => VNode, string]> = [
  [
    'Field 里的原生控件',
    () => h(XhFieldRoot, null, () => [h(XhFieldLabel, null, () => '邮箱'), h(XhFieldControl, null, () => h('input'))]),
    `[data-scope='field'][data-part='control']`,
  ],
  [
    'Mention 输入框',
    () => h(XhMentionRoot, { collection: [{ value: 'a', label: '甲' }], 'aria-label': '正文' } as never),
    `[data-scope='mention'][data-part='input']`,
  ],
  [
    'Pagination 跳页框',
    () => h(XhPaginationRoot, { count: 196, defaultPageSize: 20 }, () => [
      h(XhPaginationItem, { value: 1 }, () => '1'),
      h(XhPaginationJumper),
    ]),
    `[data-scope='pagination'][data-part='jumper']`,
  ],
  [
    'PinInput 的格子',
    () => h(XhPinInputRoot, { 'aria-label': '验证码' } as never, () => Array.from({ length: 4 }, (_, i) => h(XhPinInputInput, { index: i }))),
    `[data-scope='pin-input'][data-part='input']`,
  ],
]

describe('外壳就是输入框本身的字段', () => {
  it.each(CASES)('%s：键盘聚焦换承载面与聚焦描边，不画聚焦环', async (_name, render, selector) => {
    await mount(render)
    const input = host!.querySelector<HTMLElement>(selector)!
    expect(input.hasAttribute('data-xh-field-chrome')).toBe(true)
    input.focus()
    expect(input.matches(':focus-visible')).toBe(true)
    expect(getComputedStyle(input).outlineStyle).toBe('none')
    await expect.poll(() => getComputedStyle(input).borderTopColor).toBe(resolve('var(--xh-border-control-focus)'))
    await expect.poll(() => getComputedStyle(input).backgroundColor)
      .toBe(resolve('var(--xh-bg-surface)', 'background-color'))
  })

  it.each(CASES)('%s：强制色档聚焦补一圈 Highlight 环', async (_name, render, selector) => {
    await cdp().send('Emulation.setEmulatedMedia', { media: '', features: [{ name: 'forced-colors', value: 'active' }] })
    await mount(render)
    const input = host!.querySelector<HTMLElement>(selector)!
    input.focus()
    const style = getComputedStyle(input)
    expect(style.outlineStyle).toBe('solid')
    expect(style.outlineColor).toBe(resolve('Highlight'))
  })
})

describe('聚焦压过悬停', () => {
  it('指针停在聚焦着的字段上：仍是承载面 + 聚焦描边，不退回悬停的淡底与强描边', async () => {
    await mount(() => h(XhTextFieldRoot, null, () => h(XhTextFieldControl, null, () => h(XhTextFieldInput, { 'aria-label': '名称' }))))
    const control = host!.querySelector<HTMLElement>(`[data-scope='text-field'][data-part='control']`)!
    await userEvent.hover(control)
    await expect.poll(() => getComputedStyle(control).borderTopColor).toBe(resolve('var(--xh-border-strong)'))
    host!.querySelector<HTMLInputElement>('input')!.focus()
    await expect.poll(() => getComputedStyle(control).borderTopColor).toBe(resolve('var(--xh-border-control-focus)'))
    await expect.poll(() => getComputedStyle(control).backgroundColor)
      .toBe(resolve('var(--xh-bg-surface)', 'background-color'))
  })
})
