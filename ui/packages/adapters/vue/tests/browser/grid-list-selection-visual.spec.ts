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

describe('GridList 多选视觉', () => {
  it('选中只由与 Checkbox 同尺度的方框表达，静息行不换面也不画焦点环', async () => {
    await mount()
    const selected = row('docs')
    const idle = row('console')
    const selectedStyle = getComputedStyle(selected)
    const idleStyle = getComputedStyle(idle)

    expect(selected.getAttribute('aria-selected')).toBe('true')
    expect(selected.matches(':focus-visible')).toBe(false)
    expect(selectedStyle.backgroundColor).toBe('rgba(0, 0, 0, 0)')
    expect(selectedStyle.color).toBe(idleStyle.color)
    expect(selectedStyle.outlineColor).toBe('rgba(0, 0, 0, 0)')

    const selectedIndicator = indicator('docs')
    const uncheckedIndicator = indicator('console')
    const selectedBox = selectedIndicator.getBoundingClientRect()
    const uncheckedStyle = getComputedStyle(uncheckedIndicator)
    const checkedStyle = getComputedStyle(selectedIndicator)
    const glyphStyle = getComputedStyle(selectedIndicator, '::after')

    expect(selectedBox.width).toBe(16)
    expect(selectedBox.height).toBe(16)
    expect(glyphStyle.width).toBe('12px')
    expect(glyphStyle.height).toBe('12px')
    expect(uncheckedStyle.backgroundColor).toBe('rgba(0, 0, 0, 0)')
    expect(uncheckedStyle.borderColor).toBe(resolveColor(uncheckedIndicator, 'var(--xh-border-control)'))
    expect(checkedStyle.backgroundColor).toBe(resolveColor(selectedIndicator, 'var(--xh-bg-brand)'))
    expect(checkedStyle.borderColor).toBe(checkedStyle.backgroundColor)
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
