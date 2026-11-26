// @vitest-environment jsdom
// xh-statistic 不写部件时按标准结构生成；value 按语言格式化，作者写的 value 部件空着才由元素写字。

import type { DiagnosticRecord } from '@xihan-ui/core'
import { onDiagnostic } from '@xihan-ui/core'
import { afterEach, describe, expect, it } from 'vitest'
import { defineXhElements } from '../src/define'

defineXhElements()

interface StatisticHost extends HTMLElement {
  updateComplete: Promise<unknown>
  value?: number
  formatOptions?: Intl.NumberFormatOptions
}

const stops: Array<() => void> = []
afterEach(() => {
  while (stops.length) stops.pop()!()
  document.body.replaceChildren()
})

async function settle(el: StatisticHost): Promise<void> {
  for (let i = 0; i < 4; i++) {
    await el.updateComplete
    await new Promise(r => setTimeout(r, 0))
  }
}

function mount(attrs: Record<string, string>, inner = '', parent: HTMLElement = document.body): StatisticHost {
  const el = document.createElement('xh-statistic') as StatisticHost
  for (const [name, value] of Object.entries(attrs))
    el.setAttribute(name, value)
  el.innerHTML = inner
  parent.append(el)
  return el
}

function part(el: Element, name: string): HTMLElement | null {
  return el.querySelector<HTMLElement>(`[data-scope="statistic"][data-part="${name}"]`)
}

function partsOf(parent: Element): string[] {
  return Array.from(parent.children).map(node => node.getAttribute('data-part') ?? '')
}

describe('xh-statistic 生成结构', () => {
  it('label、value、trend、trend-text 与 slot 节点生成标签、数值、后缀与涨跌，数值按 locale 分组', async () => {
    const records: DiagnosticRecord[] = []
    stops.push(onDiagnostic(record => records.push(record)))
    const el = mount({ 'label': '本月新增用户', 'value': '12480', 'locale': 'en-US', 'trend': 'up', 'trend-text': '同比 12%' }, '<span slot="suffix">人</span>')
    await settle(el)

    expect(partsOf(part(el, 'root')!)).toEqual(['label', 'value', 'suffix', 'trend'])
    expect(part(el, 'label')!.textContent).toBe('本月新增用户')
    expect(part(el, 'value')!.textContent).toBe('12,480')
    expect(part(el, 'suffix')!.textContent).toBe('人')
    expect(part(el, 'trend')!.textContent).toBe('同比 12%')
    expect(part(el, 'trend')!.getAttribute('data-trend')).toBe('up')
    expect(records.filter(record => record.code.startsWith('wc.'))).toEqual([])
  })

  it('formatOptions 走 property；value 改了生成的数值当场跟着换', async () => {
    const el = mount({ value: '1280.5', locale: 'zh-CN' })
    el.formatOptions = { style: 'currency', currency: 'CNY' }
    await settle(el)
    expect(part(el, 'value')!.textContent).toBe('¥1,280.50')
    el.value = 99
    await settle(el)
    expect(part(el, 'value')!.textContent).toBe('¥99.00')
  })

  it('不写 locale 时取最近的 xh-config', async () => {
    const scope = document.createElement('xh-config')
    scope.setAttribute('locale', 'de-DE')
    document.body.append(scope)
    const el = mount({ value: '1234.5' }, '', scope)
    await settle(el)
    expect(part(el, 'value')!.textContent).toBe('1.234,5')
  })

  it('手写结构：value 部件空着时元素写格式化好的数值并随值更新，作者写了内容就不动', async () => {
    const empty = mount({ value: '0.256', locale: 'en-US' }, '<div data-xh-part="root"><span data-xh-part="value"></span></div>')
    empty.formatOptions = { style: 'percent' }
    await settle(empty)
    expect(part(empty, 'value')!.textContent).toBe('26%')
    empty.value = 0.5
    await settle(empty)
    expect(part(empty, 'value')!.textContent).toBe('50%')

    const authored = mount({ value: '0.256', locale: 'en-US' }, '<div data-xh-part="root"><span data-xh-part="value">约四分之一</span></div>')
    await settle(authored)
    expect(part(authored, 'value')!.textContent).toBe('约四分之一')

    const withNode = mount({ value: '1', locale: 'en-US' }, '<div data-xh-part="root"><span data-xh-part="value"><b>壹</b></span></div>')
    await settle(withNode)
    expect(part(withNode, 'value')!.innerHTML).toBe('<b>壹</b>')
  })
})
