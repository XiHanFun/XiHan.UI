// @vitest-environment jsdom

import type { DiagnosticRecord } from '@xihan-ui/core'
import { onDiagnostic } from '@xihan-ui/core'
import { afterEach, describe, expect, it } from 'vitest'
import { defineXhElements } from '../src/define'

defineXhElements()

interface DateFieldHost extends HTMLElement {
  updateComplete: Promise<unknown>
  label?: string
  locale?: string
  granularity?: string
  defaultValue?: string
}

const stops: Array<() => void> = []
afterEach(() => {
  while (stops.length) stops.pop()!()
  document.body.replaceChildren()
})

async function settle(el: DateFieldHost): Promise<void> {
  for (let i = 0; i < 4; i++) {
    await el.updateComplete
    await new Promise(r => setTimeout(r, 0))
  }
}

function mount(props: Partial<DateFieldHost>, inner = ''): DateFieldHost {
  const el = document.createElement('xh-date-field') as DateFieldHost
  Object.assign(el, props)
  el.innerHTML = inner
  document.body.append(el)
  return el
}

function part(el: Element, name: string): HTMLElement | null {
  return el.querySelector<HTMLElement>(`[data-scope="date-field"][data-part="${name}"]`)
}

/** 段组的子节点：段写它的段名，分隔符写它的文字。 */
function group(el: Element): string[] {
  return Array.from(part(el, 'segment-group')!.children).map(node => node.getAttribute('data-segment') ?? `「${node.textContent}」`)
}

describe('xh-date-field 生成结构', () => {
  it('什么都不写：生成标题、段组与清空钮、表单影子，段间是 locale 的分隔符', async () => {
    const records: DiagnosticRecord[] = []
    stops.push(onDiagnostic(record => records.push(record)))
    const el = mount({ label: '截止日期', locale: 'zh-CN', defaultValue: '2026-07-28' })
    await settle(el)

    const root = part(el, 'root')!
    expect(Array.from(root.children).map(node => node.getAttribute('data-xh-part'))).toEqual(['label', 'control', 'hidden-input'])
    expect(group(el)).toEqual(['year', '「/」', 'month', '「/」', 'day'])
    expect(part(el, 'segment-group')!.textContent).toBe('2026/07/28')
    expect(part(el, 'control')!.getAttribute('aria-labelledby')).toBe(part(el, 'label')!.id)
    // 分隔符是装饰文字：带生成标记、不带部件名
    const literal = part(el, 'segment-group')!.children[1]!
    expect(literal.getAttribute('data-xh-gen')).toBe('structure')
    expect(literal.hasAttribute('data-xh-part')).toBe(false)
    expect(records.filter(record => record.code.startsWith('wc.'))).toEqual([])
  })

  it('换 locale 与精度：段序与分隔符跟着换，同一段按段名复用', async () => {
    const el = mount({ locale: 'zh-CN' })
    await settle(el)
    const year = el.querySelector('[data-segment="year"]')

    el.locale = 'en-US'
    el.granularity = 'minute'
    await settle(el)
    expect(group(el)).toEqual(['month', '「/」', 'day', '「/」', 'year', '「, 」', 'hour', '「:」', 'minute'])
    expect(el.querySelector('[data-segment="year"]')).toBe(year)
  })

  it('slot="label" 接管标题', async () => {
    const el = mount({ locale: 'zh-CN' }, '<b slot="label">截止日期</b>')
    await settle(el)

    expect(part(el, 'label')!.innerHTML).toBe('<b slot="label">截止日期</b>')
  })
})
