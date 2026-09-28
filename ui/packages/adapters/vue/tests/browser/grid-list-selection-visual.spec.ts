import type { App } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import { userEvent } from 'vitest/browser'
import { createApp, h, nextTick } from 'vue'
import {
  XhGridListRoot,
  XhGridListRow,
  XhGridListRowContent,
  XhGridListRowSelectionIndicator,
  XhGridListRowText,
} from '../../src'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

let app: App | null = null
let host: HTMLElement | null = null

const collection = [
  { value: 'docs', label: '文档站' },
  { value: 'console', label: '管理后台' },
]

function resolveColor(element: Element, value: string): string {
  const probe = document.createElement('span')
  probe.style.color = value
  element.append(probe)
  const color = getComputedStyle(probe).color
  probe.remove()
  return color
}

function row(value: string): HTMLElement {
  const element = host?.querySelector<HTMLElement>(`[data-part='row'][data-value='${value}']`)
  if (!element)
    throw new Error(`找不到 grid-list/${value}`)
  return element
}

function indicator(value: string): HTMLElement {
  const element = row(value).querySelector<HTMLElement>(`[data-part='row-selection-indicator']`)
  if (!element)
    throw new Error(`找不到 grid-list/${value}/row-selection-indicator`)
  return element
}

async function mount(): Promise<void> {
  host = document.createElement('div')
  host.style.inlineSize = '320px'
  document.body.append(host)
  app = createApp({
    render: () => h(XhGridListRoot, {
      collection,
      selectionMode: 'multiple',
      defaultValue: ['docs'],
    }, () => collection.map(item => h(XhGridListRow, { value: item.value }, () => [
      h(XhGridListRowSelectionIndicator),
      h(XhGridListRowContent, null, () => h(XhGridListRowText, null, () => item.label)),
    ]))),
  })
  app.mount(host)
  await nextTick()
}

afterEach(() => {
  app?.unmount()
  host?.remove()
  app = null
  host = null
})

describe('grid-list 多选视觉', () => {
  it('选中与 Table、Transfer 同一种标记：品牌淡底行面 + 淡底前景，外加与 Checkbox 同尺度的方框；不画焦点环', async () => {
    await mount()
    const selected = row('docs')
    const idle = row('console')
    const selectedStyle = getComputedStyle(selected)
    const idleStyle = getComputedStyle(idle)

    expect(selected.getAttribute('aria-selected')).toBe('true')
    expect(selected.matches(':focus-visible')).toBe(false)
    expect(selectedStyle.backgroundColor).toBe(resolveColor(selected, 'var(--xh-bg-brand-subtle)'))
    expect(selectedStyle.color).toBe(resolveColor(selected, 'var(--xh-fg-on-brand-subtle)'))
    expect(idleStyle.backgroundColor).toBe('rgba(0, 0, 0, 0)')
    expect(selectedStyle.outlineColor).toBe('rgba(0, 0, 0, 0)')

    const selectedIndicator = indicator('docs')
    const uncheckedIndicator = indicator('console')
    const selectedBox = selectedIndicator.getBoundingClientRect()
    const uncheckedStyle = getComputedStyle(uncheckedIndicator)
    const checkedStyle = getComputedStyle(selectedIndicator)
    const glyphStyle = getComputedStyle(selectedIndicator, '::before')

    expect(selectedBox.width).toBe(16)
    expect(selectedBox.height).toBe(16)
    expect(glyphStyle.width).toBe('12px')
    expect(glyphStyle.height).toBe('12px')
    expect(uncheckedStyle.backgroundColor).toBe('rgba(0, 0, 0, 0)')
    expect(uncheckedStyle.borderColor).toBe(resolveColor(uncheckedIndicator, 'var(--xh-border-control)'))
    expect(checkedStyle.backgroundColor).toBe(resolveColor(selectedIndicator, 'var(--xh-bg-brand)'))
    expect(checkedStyle.borderColor).toBe(checkedStyle.backgroundColor)
  })

  it('选中行悬停升到 20% 淡底；指针点过之后留下的高亮行不画键盘高亮面，移开即回选中静息面', async () => {
    await mount()
    const selected = row('docs')
    await userEvent.hover(selected)
    await expect.poll(() => getComputedStyle(selected).backgroundColor).toBe(resolveColor(selected, 'var(--xh-bg-brand-subtle-hover)'))

    await userEvent.click(row('console'))
    const clicked = row('console')
    expect(clicked.hasAttribute('data-highlighted')).toBe(true)
    expect(clicked.getAttribute('aria-selected')).toBe('true')
    await userEvent.hover(document.body, { position: { x: 0, y: 0 } })
    await expect.poll(() => getComputedStyle(clicked).backgroundColor).toBe(resolveColor(clicked, 'var(--xh-bg-brand-subtle)'))
    expect(getComputedStyle(clicked).outlineColor).toBe('rgba(0, 0, 0, 0)')
  })

  it('方框接勾选标记配方：连接层投影 data-xh-check-mark，勾由配方画', async () => {
    await mount()
    expect(indicator('docs').getAttribute('data-xh-check-mark')).toBe('checked')
    expect(indicator('docs').getAttribute('data-xh-check-mark-profile')).toBe('box')
    expect(indicator('console').getAttribute('data-xh-check-mark')).toBe('unchecked')
    await expect.poll(() => getComputedStyle(indicator('docs'), '::before').opacity).toBe('1')
    expect(getComputedStyle(indicator('console'), '::before').opacity).toBe('0')
  })

  it('键盘真正移入选中行时仍保留 focus-visible 回执', async () => {
    await mount()
    await userEvent.tab()
    const selected = row('docs')
    expect(document.activeElement).toBe(selected)
    expect(selected.matches(':focus-visible')).toBe(true)
    expect(getComputedStyle(selected).outlineColor).not.toBe('rgba(0, 0, 0, 0)')
  })
})
