import type { App } from 'vue'
import { userEvent } from '@vitest/browser/context'
import { afterEach, describe, expect, it } from 'vitest'
import { createApp, h, nextTick } from 'vue'
import { XhSelectRoot } from '../../src'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

let app: App | null = null
let host: HTMLElement | null = null

const OPTIONS = [
  { value: 'alpha', label: 'Alpha' },
  { value: 'beta', label: 'Beta' },
  { value: 'gamma', label: 'Gamma', disabled: true },
]

async function mountSelect(size: 'sm' | 'md' | 'lg' = 'md'): Promise<HTMLElement[]> {
  host = document.createElement('div')
  document.body.append(host)
  app = createApp({
    render: () => h(XhSelectRoot, {
      collection: OPTIONS,
      defaultOpen: true,
      defaultValue: 'beta',
      size,
    }),
  })
  app.mount(host)
  await nextTick()
  await nextTick()
  return [...document.querySelectorAll<HTMLElement>('[data-scope=\'select\'][data-part=\'item\']')]
}

function rawItem(state?: string): HTMLElement {
  const item = document.createElement('div')
  item.setAttribute('data-xh-collection-item', '')
  item.setAttribute('data-xh-collection-size', 'md')
  if (state)
    item.setAttribute(`data-xh-collection-${state}`, '')
  for (const slot of ['prefix', 'text', 'description', 'shortcut', 'suffix', 'indicator']) {
    const child = document.createElement('span')
    child.dataset.xhCollectionSlot = slot
    child.textContent = slot
    item.append(child)
  }
  host!.append(item)
  return item
}

afterEach(async () => {
  app?.unmount()
  host?.remove()
  document.getElementById('xh-portal-root')?.remove()
  app = null
  host = null
  await userEvent.hover(document.querySelector<HTMLElement>('[data-test-park-pointer]')!)
})

describe('select 使用 Collection Item', () => {
  it('三尺寸只改变块内距、行内距、gap、字号与 glyph 档', async () => {
    const measurements: Array<Record<string, string>> = []
    for (const size of ['sm', 'md', 'lg'] as const) {
      const items = await mountSelect(size)
      const style = getComputedStyle(items[0]!)
      expect(items[0]!.dataset.xhCollectionItem).toBe('')
      expect(items[0]!.dataset.xhCollectionSize).toBe(size)
      expect(style.display).toBe('grid')
      measurements.push({
        paddingBlock: style.paddingBlockStart,
        paddingInline: style.paddingInlineStart,
        gap: style.getPropertyValue('--xh-collection-gap').trim(),
        fontSize: style.fontSize,
        glyphSize: style.getPropertyValue('--xh-icon-size').trim(),
      })
      app!.unmount()
      host!.remove()
      document.getElementById('xh-portal-root')?.remove()
      app = null
      host = null
    }
    expect(new Set(measurements.map(value => value.paddingBlock)).size).toBe(3)
    expect(new Set(measurements.map(value => value.paddingInline)).size).toBe(3)
    expect(new Set(measurements.map(value => value.gap)).size).toBe(3)
    expect(new Set(measurements.map(value => value.fontSize)).size).toBe(3)
    expect(new Set(measurements.map(value => value.glyphSize)).size).toBe(3)
  })

  it('selected 与 checked 保留对号，hover 和键盘高亮分别叠加且不改变字重或宽度', async () => {
    const [plain, selected, disabled] = await mountSelect()
    const indicator = selected!.querySelector<HTMLElement>('[data-part=\'item-indicator\']')!
    expect(selected!.getAttribute('aria-selected')).toBe('true')
    expect(selected!.dataset.state).toBe('checked')
    expect(disabled!.getAttribute('aria-disabled')).toBe('true')
    expect(getComputedStyle(indicator).visibility).toBe('visible')
    expect(getComputedStyle(selected!).fontWeight).toBe(getComputedStyle(plain!).fontWeight)

    const width = selected!.getBoundingClientRect().width
    const rest = getComputedStyle(selected!).backgroundColor
    await userEvent.hover(selected!)
    expect(getComputedStyle(selected!).backgroundColor).not.toBe(rest)
    selected!.focus()
    expect(selected!.matches(':focus-visible')).toBe(true)
    expect(getComputedStyle(selected!).outlineColor).not.toBe('rgba(0, 0, 0, 0)')
    expect(selected!.getBoundingClientRect().width).toBe(width)
    expect(getComputedStyle(disabled!).cursor).toBe('not-allowed')
  })

  it('六列、open-path/loading/error 与 separator 共享命名空间且互不借用 selected', async () => {
    await mountSelect()
    const item = rawItem()
    const width = item.getBoundingClientRect().width
    const restColor = getComputedStyle(item).color
    const text = item.querySelector<HTMLElement>('[data-xh-collection-slot=\'text\']')!
    const description = item.querySelector<HTMLElement>('[data-xh-collection-slot=\'description\']')!
    const indicator = item.querySelector<HTMLElement>('[data-xh-collection-slot=\'indicator\']')!
    expect(description.getBoundingClientRect().top).toBeGreaterThanOrEqual(text.getBoundingClientRect().bottom)
    expect(indicator.getBoundingClientRect().right).toBeCloseTo(item.getBoundingClientRect().right - Number.parseFloat(getComputedStyle(item).paddingInlineEnd), 0)

    item.dataset.inPath = ''
    const openPathBg = getComputedStyle(item).backgroundColor
    expect(openPathBg).not.toBe('rgba(0, 0, 0, 0)')
    expect(getComputedStyle(item).fontWeight).toBe('400')
    expect(item.getBoundingClientRect().width).toBe(width)
    delete item.dataset.inPath
    item.setAttribute('aria-busy', 'true')
    expect(getComputedStyle(item).cursor).toBe('progress')
    item.removeAttribute('aria-busy')
    item.dataset.error = ''
    expect(getComputedStyle(item).color).not.toBe(restColor)

    const separator = document.createElement('hr')
    separator.dataset.xhCollectionSeparator = ''
    host!.append(separator)
    const separatorStyle = getComputedStyle(separator)
    expect(Number.parseFloat(separatorStyle.marginBlockStart)).toBeGreaterThanOrEqual(0)
    expect(Number.parseFloat(separatorStyle.marginInlineStart)).toBeGreaterThanOrEqual(0)
    expect(Number.parseFloat(separatorStyle.height)).toBeGreaterThan(0)
  })
})
