// @vitest-environment jsdom
// 数据驱动模式的列筛选形态：single 是单选型菜单，选完即收起、再选已选的那一项撤掉；custom 的列头上筛选那一格
// 放 filter 插槽的内容，插槽参数里有这一列的筛选值与写回方法；远程模式下写回只发事件，表体照 data 原样铺。
import type { TableFilterSlotData } from '@xihan-ui/headless'
import { describe, expect, it } from 'vitest'
import { createApp, h, nextTick } from 'vue'
import { XhTableRoot } from '../src'

const DATA = [
  { id: 'u1', name: '赵一' },
  { id: 'u2', name: '钱二' },
  { id: 'u3', name: '孙三' },
]

function mount(props: Record<string, unknown>) {
  const host = document.createElement('div')
  document.body.append(host)
  const seen: TableFilterSlotData[] = []
  const events: Array<[string, unknown]> = []
  const app = createApp({
    render: () => h(XhTableRoot, {
      'data': DATA,
      ...props,
      'onFilterValueChange': (details: unknown) => events.push(['filter-value-change', details]),
      'onUpdate:pageSize': (value: unknown) => events.push(['update:pageSize', value]),
    }, {
      filter: (data: TableFilterSlotData) => {
        seen.push(data)
        return [h('input', { 'data-testid': `filter-${data.column.id}`, 'aria-label': data.label, 'value': data.value[0] ?? '' })]
      },
    }),
  })
  app.mount(host)
  return {
    host,
    last: () => seen.at(-1)!,
    events,
    rowValues: () => [...host.querySelectorAll('[data-part="body"] [data-part="row"]')].map(row => row.getAttribute('data-value')),
    done: () => {
      app.unmount()
      host.remove()
    },
  }
}

describe('自定义筛选面板（filter 插槽）', () => {
  it('作者内容放在那一列的列头里、排在列名之后；写回后按列的 filter 筛', async () => {
    const m = mount({ columns: [{ id: 'name', label: '姓名', filterMode: 'custom', filter: (record: { name: string }, values: readonly string[]) => record.name.includes(values[0] ?? '') }] })
    const input = m.host.querySelector<HTMLInputElement>('[data-testid="filter-name"]')!
    expect(input.closest('[data-part="column-header"]')?.getAttribute('data-value')).toBe('name')
    expect(input.previousElementSibling?.getAttribute('data-part')).toBe('column-label')
    expect(input.getAttribute('aria-label')).toBe('Filter 姓名')

    m.last().setValue(['钱'])
    await nextTick()
    expect(m.events).toContainEqual(['filter-value-change', { value: { name: ['钱'] } }])
    expect(m.rowValues()).toEqual(['u2'])
    expect(m.last().value).toEqual(['钱'])
    expect(m.host.querySelector('[data-part="column-header"]')?.hasAttribute('data-filtered')).toBe(true)
    m.done()
  })

  it('远程模式：写回只改筛选值、发事件，表体照 data 原样铺', async () => {
    const m = mount({ remote: true, columns: [{ id: 'name', label: '姓名', filterMode: 'custom' }] })
    m.last().setValue(['钱'])
    await nextTick()
    expect(m.events).toContainEqual(['filter-value-change', { value: { name: ['钱'] } }])
    expect(m.rowValues()).toEqual(['u1', 'u2', 'u3'])
    m.done()
  })

  it('没开 custom 的列不放插槽内容', () => {
    const m = mount({ columns: [{ id: 'name', label: '姓名' }] })
    expect(m.host.querySelector('[data-testid="filter-name"]')).toBeNull()
    m.done()
  })
})

describe('单选筛选（filterMode 为 single）', () => {
  async function settle(): Promise<void> {
    for (let i = 0; i < 6; i++) {
      await nextTick()
      await new Promise(r => setTimeout(r, 0))
    }
  }

  const option = (value: string): HTMLElement => document.querySelector<HTMLElement>(`[data-scope="menu"][data-part="item"][data-value="${value}"]`)!

  it('列头的菜单是单选项：选一项即收起并筛，换一项替换，再选已选的那一项撤掉', async () => {
    const m = mount({ columns: [{ id: 'name', label: '姓名', filterMode: 'single', filterOptions: [{ value: '赵一' }, { value: '钱二' }] }] })
    await settle()
    const trigger = (): HTMLElement => m.host.querySelector<HTMLElement>('[data-part="column-header"] [data-scope="menu"][data-part="trigger"]')!
    trigger().click()
    await settle()
    expect(option('赵一').getAttribute('role')).toBe('menuitemradio')
    expect(option('赵一').getAttribute('aria-checked')).toBe('false')

    option('赵一').click()
    await settle()
    expect(m.events).toContainEqual(['filter-value-change', { value: { name: ['赵一'] } }])
    expect(m.rowValues()).toEqual(['u1'])
    expect(trigger().getAttribute('aria-expanded')).toBe('false')

    trigger().click()
    await settle()
    expect(option('赵一').getAttribute('aria-checked')).toBe('true')
    option('钱二').click()
    await settle()
    expect(m.rowValues()).toEqual(['u2'])

    trigger().click()
    await settle()
    option('钱二').click()
    await settle()
    expect(m.events.at(-1)).toEqual(['filter-value-change', { value: {} }])
    expect(m.rowValues()).toEqual(['u1', 'u2', 'u3'])
    m.done()
  })
})
