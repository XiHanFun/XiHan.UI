// 列表删掉一行时，原处淡出的替身显示删除前的值：替身里克隆出来的库内元素不接线、不重建标准结构，
// 经属性写入的值（标准结构的文本框）不会被新实例写回空。列表排布与表格排布一样。
import { GHOST_ATTR } from '@xihan-ui/core'
import { afterEach, describe, expect, it } from 'vitest'
import { defineXhElements } from '../../src/define'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

defineXhElements()

afterEach(() => {
  document.body.innerHTML = ''
})

async function settle(): Promise<void> {
  for (let i = 0; i < 3; i++) {
    await Promise.resolve()
    await new Promise<void>(resolve => requestAnimationFrame(() => resolve()))
  }
}

const VALUES = ['高铁', '餐饮']

/** 行里放一个只写宿主的文本框（标准结构），放进字段里，与表单渲染器的写法一致。 */
function control(index: number): string {
  return `<xh-field><div data-xh-part="root"><xh-text-field aria-label="费用 ${index + 1}"></xh-text-field><p data-xh-part="error-text"></p></div></xh-field>`
}

const LIST_ROW = (i: number): string => `<div data-xh-part="item"><div data-xh-part="item-content">${control(i)}</div><div data-xh-part="item-action"><button data-xh-part="item-delete-trigger"></button></div></div>`
const TABLE_ROW = (i: number): string => `<div data-xh-part="item"><span data-xh-part="item-label">${i + 1}</span><div data-xh-part="item-cell" value="note">${control(i)}</div><div data-xh-part="item-action"><button data-xh-part="item-delete-trigger"></button></div></div>`

const LAYOUTS = {
  list: `<xh-field-array><div data-xh-part="root">${LIST_ROW(0)}${LIST_ROW(1)}<button data-xh-part="add-trigger">添加</button></div></xh-field-array>`,
  table: `<xh-field-array layout="table"><div data-xh-part="root"><div data-xh-part="table"><div data-xh-part="header"><div data-xh-part="column-header" value="note"></div></div>${TABLE_ROW(0)}${TABLE_ROW(1)}</div><button data-xh-part="add-trigger">添加</button></div></xh-field-array>`,
}

describe('删掉受控写值的一行：淡出的替身显示删除前的值', () => {
  for (const [layout, markup] of Object.entries(LAYOUTS)) {
    it(`${layout} 排布`, async () => {
      document.body.innerHTML = `<div style="inline-size: 480px">${markup}</div>`
      const host = document.querySelector<HTMLElement & { columns?: unknown, value: unknown[] }>('xh-field-array')!
      if (layout === 'table')
        host.columns = [{ id: 'note', label: '备注' }]
      host.value = VALUES.map(note => ({ note }))
      await settle()
      const fields = [...document.querySelectorAll<HTMLElement & { value: string }>('xh-text-field')]
      fields.forEach((field, i) => {
        field.value = VALUES[i]!
      })
      await settle()
      const input = (row: Element): HTMLInputElement => row.querySelector<HTMLInputElement>('[data-scope="text-field"][data-part="input"], input')!
      const rows = [...document.querySelectorAll('[data-scope="field-array"][data-part="item"]')]
      expect(rows.map(row => input(row).value)).toEqual(VALUES)

      rows[0]!.remove()
      await new Promise<void>(resolve => requestAnimationFrame(() => resolve()))
      const ghost = document.querySelector<HTMLElement>(`[${GHOST_ATTR}]`)!
      expect(ghost).not.toBeNull()
      expect(ghost.getAttribute('data-state')).toBe('closed')
      // 替身里只有克隆时带过来的那一个输入框：新实例没有另铺一套标准结构
      expect(ghost.querySelectorAll('input')).toHaveLength(1)
      expect(input(ghost).value).toBe('高铁')
    })
  }
})
