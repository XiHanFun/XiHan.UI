// 可绑定数据的字段树：按路径找字段、列出可直接读到的字段（进入对象、不进入数组）、按种类筛选、以数组为起点列元素字段，以及非法字段树的报错。
import type { DataField } from '../src'
import { describe, expect, it } from 'vitest'
import { findDataField, listDataFields } from '../src'

const fields: readonly DataField[] = [
  { name: 'order', label: '订单', kind: 'object', children: [
    { name: 'no', label: '单号', kind: 'value' },
    { name: 'customer', kind: 'object', children: [{ name: 'name', kind: 'value' }, { name: 'contact person', kind: 'value' }] },
    { name: 'items', label: '明细', kind: 'list', children: [
      { name: 'name', kind: 'value' },
      { name: 'qty', kind: 'value' },
      { name: 'lots', kind: 'list', children: [{ name: 'code', kind: 'value' }] },
    ] },
  ] },
  { name: 'printedBy', kind: 'value' },
]

describe('listDataFields', () => {
  it('深度优先列出可直接读到的字段，进入对象，不进入数组；不是标识符的键写成引号形式', () => {
    expect(listDataFields(fields).map(entry => entry.text)).toEqual([
      'order',
      'order.no',
      'order.customer',
      'order.customer.name',
      'order.customer["contact person"]',
      'order.items',
      'printedBy',
    ])
  })

  it('按种类筛选：只列标量，或只列数组', () => {
    expect(listDataFields(fields, { kinds: ['value'] }).map(entry => entry.text)).toEqual(['order.no', 'order.customer.name', 'order.customer["contact person"]', 'printedBy'])
    const lists = listDataFields(fields, { kinds: ['list'] })
    expect(lists).toEqual([{ path: ['order', 'items'], text: 'order.items', field: fields[0]!.children![2] }])
  })

  it('以数组为起点列出元素字段，路径相对数组的一个元素', () => {
    expect(listDataFields(fields, { base: ['order', 'items'], kinds: ['value'] }).map(entry => entry.path)).toEqual([['name'], ['qty']])
    expect(listDataFields(fields, { base: ['order', 'customer'] }).map(entry => entry.text)).toEqual(['name', '["contact person"]'])
  })

  it('起点找不到或是标量时为空', () => {
    expect(listDataFields(fields, { base: ['order', 'missing'] })).toEqual([])
    expect(listDataFields(fields, { base: ['printedBy'] })).toEqual([])
  })
})

describe('findDataField', () => {
  it('按键路径找字段，经过数组时进入元素字段', () => {
    expect(findDataField(fields, ['order', 'no'])?.label).toBe('单号')
    expect(findDataField(fields, ['order', 'items', 'lots', 'code'])?.kind).toBe('value')
    expect(findDataField(fields, ['order', 'nope'])).toBeUndefined()
    expect(findDataField(fields, ['order', 0])).toBeUndefined()
    expect(findDataField(fields, [])).toBeUndefined()
  })
})

describe('非法字段树', () => {
  it('同级重名、名字为空、种类未知时抛 RangeError', () => {
    expect(() => listDataFields([{ name: 'a', kind: 'value' }, { name: 'a', kind: 'value' }])).toThrow(RangeError)
    expect(() => listDataFields([{ name: '', kind: 'value' }])).toThrow(RangeError)
    expect(() => findDataField([{ name: 'a', kind: 'map' as never }], ['a'])).toThrow(RangeError)
  })
})
