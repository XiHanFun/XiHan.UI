// field-array 表格排布里一行的格子落在同一条中线上：格子与行头、把手一样至少占一条控件高并在里面居中，
// 控件高按这一行字段的尺寸档取；复选框、开关这类比控件矮的放进去，也和文本框的控件同一条中线。
import type { App } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import { createApp, h, nextTick } from 'vue'
import {
  XhCheckbox,
  XhFieldArrayColumnHeader,
  XhFieldArrayHeader,
  XhFieldArrayItem,
  XhFieldArrayItemAction,
  XhFieldArrayItemCell,
  XhFieldArrayItemDeleteTrigger,
  XhFieldArrayItemLabel,
  XhFieldArrayRoot,
  XhFieldArrayTable,
  XhSwitch,
  XhTextFieldRoot,
} from '../../src'
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

const COLUMNS = [
  { id: 'name', label: '变量名', minWidth: 120 },
  { id: 'required', label: '必填', width: 64 },
  { id: 'enabled', label: '启用', width: 72 },
]

async function settle(): Promise<void> {
  for (let i = 0; i < 3; i++) {
    await nextTick()
    await new Promise<void>(resolve => requestAnimationFrame(() => resolve()))
  }
}

async function mount(size: 'sm' | 'md' | 'lg'): Promise<HTMLElement> {
  host = document.createElement('div')
  host.style.inlineSize = '480px'
  document.body.append(host)
  app = createApp({
    render: () => h(XhFieldArrayRoot, { 'layout': 'table', 'columns': COLUMNS, 'defaultValue': [{}], 'aria-label': '启动变量' }, {
      default: ({ items }: { items: Array<{ key: string, index: number }> }) => [
        h(XhFieldArrayTable, null, () => [
          h(XhFieldArrayHeader, null, () => COLUMNS.map(column => h(XhFieldArrayColumnHeader, { key: column.id, value: column.id }))),
          ...items.map(item => h(XhFieldArrayItem, { key: item.key, index: item.index }, () => [
            h(XhFieldArrayItemLabel, () => String(item.index + 1)),
            h(XhFieldArrayItemCell, { value: 'name' }, () => h(XhTextFieldRoot, { size, ariaLabel: '变量名' })),
            h(XhFieldArrayItemCell, { value: 'required' }, () => h(XhCheckbox, { size, ariaLabel: '必填' })),
            h(XhFieldArrayItemCell, { value: 'enabled' }, () => h(XhSwitch, { size, ariaLabel: '启用' })),
            h(XhFieldArrayItemAction, () => h(XhFieldArrayItemDeleteTrigger)),
          ])),
        ]),
      ],
    }),
  })
  app.mount(host)
  await settle()
  return host.querySelector<HTMLElement>('[data-scope="field-array"][data-part="item"]')!
}

function middle(el: Element): number {
  const rect = el.getBoundingClientRect()
  return rect.top + rect.height / 2
}

function part(row: HTMLElement, scope: string, name: string): HTMLElement {
  return row.querySelector<HTMLElement>(`[data-scope="${scope}"][data-part="${name}"]`)!
}

describe('field-array 表格格子的中线', () => {
  for (const size of ['sm', 'md', 'lg'] as const) {
    it(`${size} 档：文本框、复选框、开关、行头与把手落在同一条中线上，相差不超过 1px`, async () => {
      const row = await mount(size)
      const line = middle(part(row, 'text-field', 'control'))
      const others = {
        checkbox: middle(part(row, 'checkbox', 'root')),
        switch: middle(part(row, 'switch', 'root')),
        label: middle(part(row, 'field-array', 'item-label')),
        action: middle(part(row, 'field-array', 'item-delete-trigger')),
      }
      for (const [name, value] of Object.entries(others))
        expect(Math.abs(value - line), name).toBeLessThanOrEqual(1)
    })
  }
})
