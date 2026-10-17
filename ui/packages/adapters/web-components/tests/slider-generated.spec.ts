// @vitest-environment jsdom

import type { DiagnosticRecord } from '@xihan-ui/core'
import type { SliderMark } from '@xihan-ui/headless'
import { onDiagnostic } from '@xihan-ui/core'
import { afterEach, describe, expect, it } from 'vitest'
import { defineXhElements } from '../src/define'

defineXhElements()

interface SliderHost extends HTMLElement {
  updateComplete: Promise<unknown>
  label?: string
  name?: string
  value?: number[]
  defaultValue?: number[]
  marks?: SliderMark[]
}

const stops: Array<() => void> = []
afterEach(() => {
  while (stops.length) stops.pop()!()
  document.body.replaceChildren()
})

async function settle(el: SliderHost): Promise<void> {
  for (let i = 0; i < 4; i++) {
    await el.updateComplete
    await new Promise(r => setTimeout(r, 0))
  }
}

function mount(props: Partial<SliderHost>, inner = ''): SliderHost {
  const el = document.createElement('xh-slider') as SliderHost
  Object.assign(el, props)
  el.innerHTML = inner
  document.body.append(el)
  return el
}

function part(el: Element, name: string): HTMLElement | null {
  return el.querySelector<HTMLElement>(`[data-scope="slider"][data-part="${name}"]`)
}

function partsOf(parent: Element): string[] {
  return Array.from(parent.children).map(node => node.getAttribute('data-part') ?? '')
}

describe('xh-slider 生成结构', () => {
  it('什么都不写：生成标题、控制区里的轨道与区间、一个拇指，拇指以标题命名，方向键推动', async () => {
    const records: DiagnosticRecord[] = []
    stops.push(onDiagnostic(record => records.push(record)))
    const el = mount({ label: '音量', defaultValue: [40] })
    await settle(el)

    expect(partsOf(part(el, 'root')!)).toEqual(['label', 'control'])
    expect(partsOf(part(el, 'control')!)).toEqual(['track', 'thumb'])
    expect(partsOf(part(el, 'track')!)).toEqual(['range'])
    const thumb = part(el, 'thumb')!
    expect(thumb.getAttribute('role')).toBe('slider')
    expect(thumb.getAttribute('aria-labelledby')).toBe(part(el, 'label')!.id)
    thumb.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }))
    await settle(el)
    expect(thumb.getAttribute('aria-valuenow')).toBe('41')
    expect(records.filter(record => record.code.startsWith('wc.'))).toEqual([])
  })

  it('每个值一个拇指，写明自己是第几个；给了 name 每个拇指带表单影子；值的个数变了拇指跟着增减', async () => {
    const el = mount({ defaultValue: [20, 80], name: 'price' })
    await settle(el)
    const thumbs = () => Array.from(el.querySelectorAll<HTMLElement>('[data-scope="slider"][data-part="thumb"]'))
    expect(thumbs().map(thumb => [thumb.getAttribute('index'), thumb.getAttribute('aria-valuenow'), partsOf(thumb)])).toEqual([
      ['0', '20', ['hidden-input']],
      ['1', '80', ['hidden-input']],
    ])

    el.value = [10, 50, 90]
    await settle(el)
    expect(thumbs().map(thumb => thumb.getAttribute('aria-valuenow'))).toEqual(['10', '50', '90'])
  })

  it('给了 marks 在轨道后铺刻度组：每档一个圆点与一段文案，换刻度时按值增减', async () => {
    const el = mount({ marks: [{ value: 0, label: '0°C' }, { value: 100, label: '沸腾' }] })
    await settle(el)
    const group = part(el, 'tick-group')!
    expect(partsOf(part(el, 'control')!)).toEqual(['track', 'tick-group', 'thumb'])
    expect(Array.from(group.children, node => [node.getAttribute('data-part'), node.getAttribute('value'), node.textContent])).toEqual([
      ['tick', '0', ''],
      ['tick-label', '0', '0°C'],
      ['tick', '100', ''],
      ['tick-label', '100', '沸腾'],
    ])

    el.marks = [{ value: 50, label: '一半' }]
    await settle(el)
    expect(Array.from(group.children, node => node.getAttribute('value'))).toEqual(['50', '50'])

    el.marks = []
    await settle(el)
    expect(part(el, 'tick-group')).toBeNull()
  })

  it('标题可由宿主直接子节点 slot="label" 接管', async () => {
    const el = mount({}, '<b slot="label">亮度</b>')
    await settle(el)
    expect(part(el, 'label')!.querySelector('b')!.textContent).toBe('亮度')
    expect(part(el, 'thumb')!.getAttribute('aria-labelledby')).toBe(part(el, 'label')!.id)
  })
})
