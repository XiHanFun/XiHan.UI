// @vitest-environment jsdom
import type { FieldArrayItem } from '@xihan-ui/headless'
import type { FieldArrayItemCellSlotProps, FieldArrayItemContentSlotProps } from '../src'
import { afterEach, describe, expect, it } from 'vitest'
import { createApp, h, nextTick } from 'vue'
import { XhFieldArrayRoot } from '../src'

let cleanup: (() => void) | undefined

async function tick(): Promise<void> {
  await nextTick()
  await nextTick()
}

afterEach(() => {
  cleanup?.()
  cleanup = undefined
  document.body.innerHTML = ''
})

function mount(render: () => ReturnType<typeof h>): HTMLElement {
  const host = document.createElement('div')
  document.body.append(host)
  const app = createApp({ setup: () => render })
  app.mount(host)
  cleanup = () => app.unmount()
  return host
}

function parts(host: Element, name: string): HTMLElement[] {
  return [...host.querySelectorAll<HTMLElement>(`[data-scope="field-array"][data-part="${name}"]`)]
}

describe('fieldArray 不写默认插槽：照标准结构铺，逐行内容由插槽给', () => {
  it('列表排布：item-content 插槽拿到这一行，内容落在这一行的内容格里；换序后跟着行走', async () => {
    const seen: FieldArrayItem[] = []
    const host = mount(() => h(XhFieldArrayRoot, { defaultValue: ['甲', '乙'], movable: true }, {
      'item-content': ({ item }: FieldArrayItemContentSlotProps) => {
        seen.push(item)
        return [h('input', { 'value': String(item.value), 'data-row': item.key })]
      },
    }))
    await tick()
    const contents = parts(host, 'item-content')
    expect(contents.map(content => content.querySelector('input')?.value)).toEqual(['甲', '乙'])
    expect(seen.slice(0, 2).map(item => item.index)).toEqual([0, 1])
    const firstKey = contents[0]!.querySelector('input')!.dataset.row

    parts(host, 'move-down-trigger')[0]!.click()
    await tick()
    expect(parts(host, 'item-content').map(content => content.querySelector('input')?.value)).toEqual(['乙', '甲'])
    expect(parts(host, 'item-content')[1]!.querySelector('input')!.dataset.row).toBe(firstKey)
  })

  it('没给 item-content 时内容格空着；新增钮的文字取 translations.addTrigger', async () => {
    const host = mount(() => h(XhFieldArrayRoot, { defaultValue: ['甲'], translations: { addTrigger: '加一行' } }))
    await tick()
    expect(parts(host, 'item-content')[0]!.childElementCount).toBe(0)
    expect(parts(host, 'add-trigger')[0]!.textContent).toBe('加一行')
  })

  it('表格排布：item-cell 插槽拿到所在的行与列，每列一格', async () => {
    const host = mount(() => h(XhFieldArrayRoot, {
      layout: 'table',
      columns: [{ id: 'name', label: '名称' }, { id: 'amount', label: '金额' }],
      defaultValue: [{ name: '差旅', amount: 120 }],
    }, {
      'item-cell': ({ item, column }: FieldArrayItemCellSlotProps) => [h('span', String((item.value as Record<string, unknown>)[column.id]))],
    }))
    await tick()
    expect(parts(host, 'item-cell').map(cell => cell.textContent)).toEqual(['差旅', '120'])
    expect(parts(host, 'column-header').map(header => header.textContent)).toEqual(['名称', '金额'])
  })
})
