// @vitest-environment jsdom

import type { DiagnosticRecord } from '@xihan-ui/core'
import type { ColorSwatchPickerNode, ColorSwatchPickerValueChangeDetails } from '@xihan-ui/headless'
import { onDiagnostic } from '@xihan-ui/core'
import { afterEach, describe, expect, it } from 'vitest'
import { defineXhElements } from '../src/define'

defineXhElements()

interface SwatchPickerHost extends HTMLElement {
  updateComplete: Promise<unknown>
  swatches?: ColorSwatchPickerNode[]
  label?: string
  name?: string
}

const SWATCHES: ColorSwatchPickerNode[] = [
  { value: '#ff0000', label: '红' },
  { value: '#00ff00', disabled: true },
  { value: '#0000ff' },
]

const stops: Array<() => void> = []
afterEach(() => {
  while (stops.length) stops.pop()!()
  document.body.replaceChildren()
})

async function settle(el: SwatchPickerHost): Promise<void> {
  for (let i = 0; i < 4; i++) {
    await el.updateComplete
    await new Promise(r => setTimeout(r, 0))
  }
}

function mount(props: Partial<SwatchPickerHost>, inner = ''): SwatchPickerHost {
  const el = document.createElement('xh-color-swatch-picker') as SwatchPickerHost
  Object.assign(el, props)
  el.innerHTML = inner
  document.body.append(el)
  return el
}

function part(el: Element, name: string): HTMLElement | null {
  return el.querySelector<HTMLElement>(`[data-scope="color-swatch-picker"][data-part="${name}"]`)
}

function parts(el: Element, name: string): HTMLElement[] {
  return [...el.querySelectorAll<HTMLElement>(`[data-scope="color-swatch-picker"][data-part="${name}"]`)]
}

function partsOf(parent: Element): string[] {
  return Array.from(parent.children).map(node => node.getAttribute('data-part') ?? '')
}

describe('xh-color-swatch-picker 生成结构', () => {
  it('什么都不写：生成标题与每一格，格里依次是表单影子、色块面与选中标记，标题给整组命名，不报缺少部件', async () => {
    const records: DiagnosticRecord[] = []
    stops.push(onDiagnostic(record => records.push(record)))
    const el = mount({ swatches: SWATCHES, label: '主题色' })
    await settle(el)

    const root = part(el, 'root')!
    expect(root.getAttribute('data-xh-gen')).toBe('structure')
    expect(partsOf(root)).toEqual(['label', 'item', 'item', 'item'])
    expect(root.getAttribute('aria-labelledby')).toBe(part(el, 'label')!.id)
    const items = parts(el, 'item')
    expect(items.map(item => item.getAttribute('data-value'))).toEqual(['#ff0000', '#00ff00', '#0000ff'])
    expect(partsOf(items[0]!)).toEqual(['hidden-input', 'swatch', 'indicator'])
    expect(part(items[0]!, 'hidden-input')!.localName).toBe('input')
    expect(items.map(item => item.getAttribute('aria-label'))).toEqual(['红', 'Color #00ff00', 'Color #0000ff'])
    expect(items[1]!.getAttribute('aria-disabled')).toBe('true')
    expect(records.filter(record => record.code.startsWith('wc.'))).toEqual([])
  })

  it('点生成的格子即选中并派发 value-change；给了 name 表单影子才带名字', async () => {
    const el = mount({ swatches: SWATCHES, name: 'theme' })
    await settle(el)
    const changes: Array<string | null> = []
    el.addEventListener('value-change', event => changes.push((event as CustomEvent<ColorSwatchPickerValueChangeDetails>).detail.value))

    parts(el, 'item')[2]!.click()
    await settle(el)
    expect(changes).toEqual(['#0000ff'])
    expect(parts(el, 'item').map(item => item.getAttribute('aria-checked'))).toEqual(['false', 'false', 'true'])
    expect(parts(el, 'hidden-input').map(input => (input as HTMLInputElement).name)).toEqual(['theme', 'theme', 'theme'])
  })

  it('数据增删时格子随之增删，留下的格子节点原样复用；没给 swatches 时只有标题', async () => {
    const el = mount({ swatches: SWATCHES })
    await settle(el)
    const red = parts(el, 'item')[0]

    el.swatches = [SWATCHES[0]!, { value: '#ffff00' }]
    await settle(el)
    const items = parts(el, 'item')
    expect(items.map(item => item.getAttribute('data-value'))).toEqual(['#ff0000', '#ffff00'])
    expect(items[0]).toBe(red)

    const empty = mount({ label: '主题色' })
    await settle(empty)
    expect(partsOf(part(empty, 'root')!)).toEqual(['label'])
  })

  it('slot="label" 接管标题', async () => {
    const el = mount({ swatches: SWATCHES }, '<b slot="label">主题色</b>')
    await settle(el)
    const label = part(el, 'label')!
    expect(label.innerHTML).toBe('<b slot="label">主题色</b>')
    expect(part(el, 'root')!.getAttribute('aria-labelledby')).toBe(label.id)
  })

  it('作者写了部件：全归作者，不生成任何节点', async () => {
    const el = mount({}, `
      <div data-xh-part="root">
        <div data-xh-part="item" value="#ff0000"><span data-xh-part="swatch"></span></div>
      </div>`)
    await settle(el)
    expect(partsOf(parts(el, 'item')[0]!)).toEqual(['swatch'])
    expect(el.querySelectorAll('[data-xh-gen]')).toHaveLength(0)
  })
})
