// @vitest-environment jsdom

import type { DiagnosticRecord } from '@xihan-ui/core'
import { onDiagnostic } from '@xihan-ui/core'
import { afterEach, describe, expect, it } from 'vitest'
import { defineXhElements } from '../src/define'

defineXhElements()

interface RatingHost extends HTMLElement {
  updateComplete: Promise<unknown>
  label?: string
  name?: string
  count?: number
  defaultValue?: number
}

const stops: Array<() => void> = []
afterEach(() => {
  while (stops.length) stops.pop()!()
  document.body.replaceChildren()
})

async function settle(el: RatingHost): Promise<void> {
  for (let i = 0; i < 4; i++) {
    await el.updateComplete
    await new Promise(r => setTimeout(r, 0))
  }
}

function mount(props: Partial<RatingHost>, inner = ''): RatingHost {
  const el = document.createElement('xh-rating') as RatingHost
  Object.assign(el, props)
  el.innerHTML = inner
  document.body.append(el)
  return el
}

function part(el: Element, name: string): HTMLElement | null {
  return el.querySelector<HTMLElement>(`[data-scope="rating"][data-part="${name}"]`)
}

function partsOf(parent: Element): string[] {
  return Array.from(parent.children).map(node => node.getAttribute('data-part') ?? '')
}

describe('xh-rating 生成结构', () => {
  it('什么都不写：生成标题与五颗星，星星带以标题命名；点第三颗星评 3 分', async () => {
    const records: DiagnosticRecord[] = []
    stops.push(onDiagnostic(record => records.push(record)))
    const el = mount({ label: '满意度' })
    await settle(el)

    expect(partsOf(part(el, 'root')!)).toEqual(['label', 'control'])
    const control = part(el, 'control')!
    expect(control.getAttribute('role')).toBe('radiogroup')
    expect(control.getAttribute('aria-labelledby')).toBe(part(el, 'label')!.id)
    const stars = Array.from(control.children) as HTMLElement[]
    expect(stars.map(star => star.getAttribute('value'))).toEqual(['1', '2', '3', '4', '5'])

    stars[2]!.click()
    await settle(el)
    expect(stars[2]!.getAttribute('aria-checked')).toBe('true')
    expect(records.filter(record => record.code.startsWith('wc.'))).toEqual([])
  })

  it('星数随 count 增减；给了 name 才带表单影子', async () => {
    const el = mount({ count: 3, name: 'score' })
    await settle(el)
    expect(partsOf(part(el, 'root')!)).toEqual(['control', 'hidden-input'])
    expect(part(el, 'control')!.children).toHaveLength(3)

    el.count = 4
    el.name = undefined
    await settle(el)
    expect(partsOf(part(el, 'root')!)).toEqual(['control'])
    expect(part(el, 'control')!.children).toHaveLength(4)
  })

  it('标题可由宿主直接子节点 slot="label" 接管', async () => {
    const el = mount({}, '<b slot="label">本次服务</b>')
    await settle(el)
    expect(part(el, 'label')!.querySelector('b')!.textContent).toBe('本次服务')
    expect(part(el, 'control')!.getAttribute('aria-labelledby')).toBe(part(el, 'label')!.id)
  })
})
