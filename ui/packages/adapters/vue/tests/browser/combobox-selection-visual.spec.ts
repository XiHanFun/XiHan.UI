// Combobox 的焦点留在输入框，候选仅用 data-highlighted 表达导航位置。
// 这里在真实 Chromium 中同时验证选择语义、作者内容几何与逻辑方向。
import type { App } from 'vue'
import { userEvent } from '@vitest/browser/context'
import { afterEach, describe, expect, it } from 'vitest'
import { createApp, h, nextTick } from 'vue'
import {
  XhComboboxContent,
  XhComboboxControl,
  XhComboboxInput,
  XhComboboxItem,
  XhComboboxItemIndicator,
  XhComboboxItemText,
  XhComboboxPositioner,
  XhComboboxRoot,
} from '../../src'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

const OPTIONS = [
  { value: 'plain', label: '普通候选' },
  { value: 'custom', label: '带作者内容的候选' },
  { value: 'disabled', label: '不可用候选', disabled: true },
]

let app: App | null = null
let host: HTMLElement | null = null

function byTestId(id: string): HTMLElement {
  const element = document.querySelector<HTMLElement>(`[data-testid='${id}']`)
  if (!element)
    throw new Error(`找不到 ${id}`)
  return element
}

async function mountCombobox(multiple: boolean, dir: 'ltr' | 'rtl' = 'ltr'): Promise<void> {
  host = document.createElement('div')
  host.dir = dir
  document.body.append(host)
  app = createApp({
    render: () => h(XhComboboxRoot, {
      collection: OPTIONS,
      dir,
      multiple,
      open: true,
      value: multiple ? ['custom', 'disabled'] : 'custom',
    }, () => [
      h(XhComboboxControl, null, () => [h(XhComboboxInput)]),
      h(XhComboboxPositioner, null, () => [
        h(XhComboboxContent, { style: { inlineSize: '280px' } }, () => [
          h(XhComboboxItem, { 'value': 'plain', 'data-testid': 'plain' }, () => [
            h(XhComboboxItemText, null, () => '普通候选'),
            h(XhComboboxItemIndicator, { 'data-testid': 'plain-indicator' }),
          ]),
          h(XhComboboxItem, { 'value': 'custom', 'data-testid': 'selected' }, () => [
            h('span', {
              'data-testid': 'leading',
              'aria-hidden': 'true',
              'style': 'display:inline-block;flex:none;inline-size:16px;block-size:16px;background:currentColor',
            }),
            h(
              XhComboboxItemText,
              { 'data-testid': 'long-text' },
              () => '一段需要在作者图标、尾部提示与对号之间稳定截断的很长候选文字 ABCDEFGHIJKLMN',
            ),
            h('span', { 'data-testid': 'trailing', 'style': 'flex:none' }, '⌘K'),
            h(XhComboboxItemIndicator, { 'data-testid': 'selected-indicator' }),
          ]),
          h(XhComboboxItem, { 'value': 'disabled', 'data-testid': 'disabled' }, () => [
            h(XhComboboxItemText, null, () => '不可用候选'),
            h(XhComboboxItemIndicator, { 'data-testid': 'disabled-indicator' }),
          ]),
        ]),
      ]),
    ]),
  })
  app.mount(host)
  await nextTick()
  await nextTick()
  await new Promise<void>(resolve => requestAnimationFrame(() => resolve()))

  document.querySelectorAll<HTMLElement>(`[data-scope='combobox'][data-part='item']`)
    .forEach(item => item.style.transition = 'none')
}

function alpha(color: string): number {
  const canvas = document.createElement('canvas')
  canvas.width = 1
  canvas.height = 1
  const context = canvas.getContext('2d')!
  context.clearRect(0, 0, 1, 1)
  context.fillStyle = color
  context.fillRect(0, 0, 1, 1)
  return context.getImageData(0, 0, 1, 1).data[3]!
}

function expectOrderedWithoutOverlap(ids: string[], dir: 'ltr' | 'rtl'): void {
  const rects = ids.map(id => byTestId(id).getBoundingClientRect())
  for (let index = 1; index < rects.length; index++) {
    const previous = rects[index - 1]!
    const current = rects[index]!
    if (dir === 'ltr')
      expect(previous.right, `${ids[index - 1]} / ${ids[index]}`).toBeLessThanOrEqual(current.left)
    else
      expect(previous.left, `${ids[index - 1]} / ${ids[index]}`).toBeGreaterThanOrEqual(current.right)
  }
}

afterEach(() => {
  app?.unmount()
  host?.remove()
  document.getElementById('xh-portal-root')?.remove()
  app = null
  host = null
})

describe('combobox 统一选中反馈', () => {
  it.each([false, true])('multiple=%s：选中只显示末端对号，正文颜色与字重保持正常', async (multiple) => {
    await mountCombobox(multiple)
    const selected = byTestId('selected')
    const plain = byTestId('plain')
    const selectedIndicator = byTestId('selected-indicator')
    const plainIndicator = byTestId('plain-indicator')

    await userEvent.hover(plain)
    await nextTick()

    expect(selected.getAttribute('data-state')).toBe('checked')
    expect(alpha(getComputedStyle(selected).backgroundColor)).toBe(0)
    expect(getComputedStyle(selected).color).toBe(getComputedStyle(plain).color)
    expect(getComputedStyle(selected).fontWeight).toBe(getComputedStyle(plain).fontWeight)
    expect(getComputedStyle(selectedIndicator).visibility).toBe('visible')
    expect(getComputedStyle(plainIndicator).visibility).toBe('hidden')
    expect(getComputedStyle(selectedIndicator, '::before').maskImage).not.toBe('none')
  })

  it('选中叠加指针高亮时只增加中性底，对号与正常正文保持可见', async () => {
    await mountCombobox(false)
    const selected = byTestId('selected')
    const plain = byTestId('plain')

    await userEvent.hover(plain)
    await nextTick()
    const neutral = getComputedStyle(plain).backgroundColor
    expect(alpha(neutral)).toBe(255)

    await userEvent.hover(selected)
    await nextTick()
    expect(selected.hasAttribute('data-highlighted')).toBe(true)
    expect(getComputedStyle(selected).backgroundColor).toBe(neutral)
    expect(getComputedStyle(selected).color).toBe(getComputedStyle(plain).color)
    expect(getComputedStyle(byTestId('selected-indicator')).visibility).toBe('visible')
  })

  it('多选中的禁用项保留对号但整行统一失效，不响应指针高亮', async () => {
    await mountCombobox(true)
    const disabled = byTestId('disabled')
    const indicator = byTestId('disabled-indicator')

    expect(disabled.getAttribute('data-state')).toBe('checked')
    expect(getComputedStyle(indicator).visibility).toBe('visible')
    expect(getComputedStyle(indicator).color).toBe(getComputedStyle(disabled).color)
    expect(getComputedStyle(disabled).cursor).toBe('not-allowed')

    await userEvent.hover(disabled)
    await nextTick()
    expect(disabled.hasAttribute('data-highlighted')).toBe(false)
    expect(alpha(getComputedStyle(disabled).backgroundColor)).toBe(0)
  })

  it.each(['ltr', 'rtl'] as const)('%s：作者内容保持 DOM 顺序，长文截断且对号固定逻辑末端', async (dir) => {
    await mountCombobox(false, dir)
    expectOrderedWithoutOverlap(['leading', 'long-text', 'trailing', 'selected-indicator'], dir)

    const text = byTestId('long-text')
    expect(getComputedStyle(text).overflow).toBe('hidden')
    expect(getComputedStyle(text).textOverflow).toBe('ellipsis')
    expect(text.scrollWidth).toBeGreaterThan(text.clientWidth)

    const logicalEnds = ['plain-indicator', 'selected-indicator', 'disabled-indicator']
      .map(id => byTestId(id).getBoundingClientRect())
      .map(rect => dir === 'ltr' ? rect.right : rect.left)
    expect(Math.max(...logicalEnds) - Math.min(...logicalEnds)).toBeLessThanOrEqual(1)
  })
})
