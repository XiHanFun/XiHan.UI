// 条件编辑器的排布与焦点：条件行一行排下、操作数占满余下的宽度、区间两端等分；窄时折行而不越出根；
// 子组缩进并画出起始缘细线；真实指针加条件后焦点落到新行，删一行后焦点落到同组的下一行。
import type { App } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import { userEvent } from 'vitest/browser'
import { createApp, h, nextTick } from 'vue'
import { XhFilterBuilderRoot } from '../../src'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

let app: App | null = null
let host: HTMLElement | null = null

afterEach(() => {
  app?.unmount()
  host?.remove()
  app = null
  host = null
})

const FIELDS = [
  { name: 'region', type: 'string', label: 'Region' },
  { name: 'amount', type: 'number', label: 'Amount' },
] as const

const VALUE = {
  logic: 'and',
  conditions: [
    { field: 'region', operator: 'eq', value: 'East' },
    { field: 'amount', operator: 'between', value: [1, 9] },
    { logic: 'or', conditions: [{ field: 'amount', operator: 'gt', value: 5 }] },
  ],
} as const

async function frames(): Promise<void> {
  for (let i = 0; i < 3; i++) {
    await nextTick()
    await new Promise<void>(resolve => requestAnimationFrame(() => resolve()))
  }
}

async function mount(width: number): Promise<void> {
  host = document.createElement('div')
  host.style.inlineSize = `${width}px`
  document.body.append(host)
  app = createApp({ render: () => h(XhFilterBuilderRoot, { 'fields': FIELDS, 'defaultValue': VALUE, 'aria-label': 'Orders' }) })
  app.mount(host)
  await frames()
}

function parts(name: string): HTMLElement[] {
  return [...document.querySelectorAll<HTMLElement>(`[data-scope="filter-builder"][data-part="${name}"]`)]
}

function box(el: Element): DOMRect {
  return el.getBoundingClientRect()
}

describe('条件编辑器的排布', () => {
  it('条件行一行排下：字段、运算符、操作数与删除钮同在一行，操作数占满余下的宽度，区间两端等分', async () => {
    await mount(720)
    const [first, range] = parts('condition')
    const field = box(first!.querySelector('[data-part="condition-field"]')!)
    const operand = box(first!.querySelector('[data-part="condition-operand"]')!)
    const remove = box(first!.querySelector('[data-part="condition-delete-trigger"]')!)
    expect(Math.abs((field.top + field.bottom) / 2 - (operand.top + operand.bottom) / 2)).toBeLessThan(1)
    expect(Math.abs((remove.top + remove.bottom) / 2 - (operand.top + operand.bottom) / 2)).toBeLessThan(1)
    expect(operand.width).toBeGreaterThan(field.width)
    expect(remove.left).toBeGreaterThan(operand.right)
    const ends = [...range!.querySelectorAll('[data-part="condition-operand"] [data-scope="number-field"][data-part="root"]')].map(box)
    expect(ends).toHaveLength(2)
    expect(ends[0]!.width).toBeCloseTo(ends[1]!.width, 0)
    expect(Math.abs(ends[0]!.top - ends[1]!.top)).toBeLessThan(0.5)
  })

  it('窄宽度下条件行折行，里面的控件不越出根', async () => {
    await mount(280)
    const limit = box(parts('root')[0]!).right + 0.5
    for (const el of document.querySelectorAll('[data-scope="filter-builder"][data-part="condition"] [data-part="root"], [data-scope="filter-builder"][data-part="condition-delete-trigger"]'))
      expect(box(el).right).toBeLessThanOrEqual(limit)
    const [first] = parts('condition')
    expect(box(first!).height).toBeGreaterThan(box(first!.querySelector('[data-part="condition-field"]')!).height * 1.5)
  })

  it('子组里的条件缩进一段，子组起始缘画一条细线', async () => {
    await mount(720)
    const [top, sub] = parts('group')
    const outer = top!.querySelector(':scope > [data-part="group-items"] > [data-part="condition"]')!
    const inner = sub!.querySelector(':scope > [data-part="group-items"] > [data-part="condition"]')!
    expect(box(inner).left).toBeGreaterThan(box(outer).left)
    const style = getComputedStyle(sub!)
    expect(style.borderInlineStartWidth).toBe('1px')
    expect(style.borderInlineStartStyle).toBe('solid')
    expect(Number.parseFloat(style.paddingInlineStart)).toBeGreaterThan(0)
    expect(getComputedStyle(top!).borderInlineStartWidth).toBe('0px')
  })
})

describe('条件编辑器的焦点', () => {
  it('点「加条件」后焦点落到新行的字段下拉', async () => {
    await mount(720)
    await userEvent.click(parts('group')[0]!.querySelector(':scope > [data-part="group-footer"] > [data-part="add-condition-trigger"]')!)
    await frames()
    const rows = parts('group')[0]!.querySelector(':scope > [data-part="group-items"]')!.querySelectorAll(':scope > [data-part="condition"]')
    const added = rows[rows.length - 1]!
    expect(added.contains(document.activeElement)).toBe(true)
    expect((document.activeElement as HTMLElement).closest('[data-part="condition-field"]')).not.toBeNull()
  })

  it('删一行后焦点落到同组的下一行', async () => {
    await mount(720)
    await userEvent.click(parts('condition-delete-trigger')[0]!)
    await frames()
    const [next] = parts('condition')
    expect(next!.getAttribute('aria-label')).toBe('Condition 1')
    expect(next!.contains(document.activeElement)).toBe(true)
  })
})
