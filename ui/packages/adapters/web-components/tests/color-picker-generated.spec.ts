// @vitest-environment jsdom

import type { DiagnosticRecord } from '@xihan-ui/core'
import { onDiagnostic } from '@xihan-ui/core'
import { afterEach, describe, expect, it } from 'vitest'
import { defineXhElements } from '../src/define'

defineXhElements()

interface ColorPickerHost extends HTMLElement {
  updateComplete: Promise<unknown>
  label?: string
  name?: string
  inline?: boolean
  alpha?: boolean
  swatches?: string[]
  selectionMode?: 'single' | 'multiple'
  defaultValue?: string | string[]
  defaultOpen?: boolean
}

const stops: Array<() => void> = []
afterEach(() => {
  while (stops.length) stops.pop()!()
  document.body.replaceChildren()
})

async function settle(el: ColorPickerHost): Promise<void> {
  for (let i = 0; i < 4; i++) {
    await el.updateComplete
    await new Promise(r => setTimeout(r, 0))
  }
}

function mount(props: Partial<ColorPickerHost>, inner = ''): ColorPickerHost {
  const el = document.createElement('xh-color-picker') as ColorPickerHost
  Object.assign(el, props)
  el.innerHTML = inner
  document.body.append(el)
  return el
}

function part(el: Element, name: string, scope = 'color-picker'): HTMLElement | null {
  return el.ownerDocument.querySelector<HTMLElement>(`[data-scope="${scope}"][data-part="${name}"]`)
}

function partsOf(parent: Element): string[] {
  return Array.from(parent.children).map(node => node.getAttribute('data-part') ?? '')
}

describe('xh-color-picker 生成结构', () => {
  it('什么都不写：生成标题、盒里的触发钮（色块与值串）与浮层里的取色面，内嵌滑块带自己的 scope', async () => {
    const records: DiagnosticRecord[] = []
    stops.push(onDiagnostic(record => records.push(record)))
    const el = mount({ label: '品牌色', defaultValue: '#3b82f6' })
    await settle(el)

    expect(partsOf(part(el, 'root')!)).toEqual(['label', 'control', 'positioner'])
    expect(partsOf(part(el, 'control')!)).toEqual(['trigger'])
    const trigger = part(el, 'trigger')!
    expect(partsOf(trigger)).toEqual(['swatch', 'value-text'])
    expect(part(el, 'value-text')!.textContent).toBe('#3b82f6')
    expect(trigger.getAttribute('aria-labelledby')).toContain(part(el, 'label')!.id)
    expect(partsOf(part(el, 'content')!)).toEqual(['saturation-area', 'hue-slider', 'channel-input', 'recent-swatch-picker'])
    expect(part(el, 'channel-input')!.getAttribute('channel')).toBe('hex')
    expect(part(el, 'thumb', 'color-slider')!.getAttribute('role')).toBe('slider')
    expect(records.filter(record => record.level === 'error')).toEqual([])
  })

  it('开了 alpha、给了 swatches：铺透明度滑块与预设色板，每格是色块选择器的一格，点一下换色；给了 name 才带表单影子', async () => {
    const el = mount({ alpha: true, swatches: ['#ff0000', '#00ff00'], defaultValue: '#3b82f6', name: 'theme' })
    await settle(el)
    const values: unknown[] = []
    el.addEventListener('value-change', event => values.push((event as CustomEvent<{ value: string[] }>).detail.value))

    expect(partsOf(part(el, 'root')!)).toEqual(['control', 'hidden-input', 'positioner'])
    part(el, 'trigger')!.click()
    await settle(el)
    expect(partsOf(part(el, 'content')!)).toEqual(['saturation-area', 'hue-slider', 'alpha-slider', 'channel-input', 'swatch-picker', 'recent-swatch-picker'])
    const items = Array.from(part(el, 'swatch-picker')!.querySelectorAll<HTMLElement>('[data-scope="color-swatch-picker"][data-part="item"]'))
    expect(items.map(item => [item.getAttribute('value'), partsOf(item)])).toEqual([
      ['#ff0000', ['hidden-input', 'swatch', 'indicator']],
      ['#00ff00', ['hidden-input', 'swatch', 'indicator']],
    ])
    items[0]!.click()
    await settle(el)
    expect(values).toEqual([['#ff0000']])
    expect(part(el, 'hidden-input')!.getAttribute('name')).toBe('theme')
  })

  it('常驻形态：取色面直接铺在 root 里，没有盒与浮层', async () => {
    const el = mount({ inline: true, label: '画笔颜色' })
    await settle(el)
    expect(partsOf(part(el, 'root')!)).toEqual(['label', 'content'])
    expect(part(el, 'content')!.getAttribute('role')).toBe('group')
    expect(part(el, 'trigger')).toBeNull()
  })

  it('多选：盒里铺标签行（标签带文字与删除钮），浮层末尾是「添加」，按下后标签随值增加', async () => {
    const el = mount({ selectionMode: 'multiple', defaultValue: ['#ff0000'], defaultOpen: true })
    await settle(el)
    const tagLabels = (): string[] => Array.from(el.querySelectorAll('[data-scope="tag"][data-part="root"]:not([data-count])'), tag => tag.querySelector('[data-part="label"]')!.textContent ?? '')
    expect(partsOf(part(el, 'control')!)).toEqual(['tag-list', 'trigger'])
    expect(tagLabels()).toEqual(['#ff0000'])
    const confirm = part(el, 'confirm-trigger')!
    expect(confirm.textContent).toBe('Add')
    confirm.click()
    await settle(el)
    expect(tagLabels()).toEqual(['#ff0000', '#000000'])
  })

  it('slot="label" 接管标题；作者写了部件就全归作者', async () => {
    const el = mount({}, '<b slot="label">主题色</b>')
    await settle(el)
    expect(part(el, 'label')!.querySelector('b')!.textContent).toBe('主题色')

    const authored = mount({}, `
      <div data-xh-part="root">
        <div data-xh-part="positioner">
          <div data-xh-part="content">
            <div data-xh-part="saturation-area"><div data-xh-part="area-thumb"></div></div>
          </div>
        </div>
      </div>`)
    await settle(authored)
    expect(authored.querySelectorAll('[data-xh-gen]')).toHaveLength(0)
  })
})
