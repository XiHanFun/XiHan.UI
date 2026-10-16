import { describe, expect, it } from 'vitest'
import { isVizError, pivotWider } from '../src'

const long = [
  { month: '2026-01', region: '东区', amount: 10, qty: 1 },
  { month: '2026-01', region: '西区', amount: 20, qty: 2 },
  { month: '2026-02', region: '东区', amount: 30, qty: 3 },
  { month: '2026-03', region: '北区', amount: 40, qty: 4 },
]

function codeOf(run: () => unknown): string | undefined {
  try {
    run()
  }
  catch (error) {
    return isVizError(error) ? error.code : 'other'
  }
  return undefined
}

describe('pivotWider', () => {
  it('同一身份合成一行，by 的每个取值展开成一列，没有对应行的格子不写', () => {
    const { rows, columns } = pivotWider(long, { key: 'month', by: 'region', value: 'amount' })
    expect(columns.map(column => column.name)).toEqual(['东区', '西区', '北区'])
    expect(columns[0]).toEqual({ name: '东区', member: '东区', field: 'amount' })
    expect(rows).toEqual([
      { month: '2026-01', 东区: 10, 西区: 20 },
      { month: '2026-02', 东区: 30 },
      { month: '2026-03', 北区: 40 },
    ])
  })

  it('多个 value 字段各展开一组列，列名缺省带字段名，也可自定', () => {
    const plain = pivotWider(long.slice(0, 2), { key: 'month', by: 'region', value: ['amount', 'qty'] })
    expect(plain.columns.map(column => column.name)).toEqual(['amount:东区', 'amount:西区', 'qty:东区', 'qty:西区'])
    expect(plain.rows).toEqual([{ 'month': '2026-01', 'amount:东区': 10, 'amount:西区': 20, 'qty:东区': 1, 'qty:西区': 2 }])
    const named = pivotWider(long.slice(0, 2), { key: 'month', by: 'region', value: ['amount', 'qty'], columnName: (member, field) => `${field}/${String(member)}` })
    expect(named.columns.map(column => column.name)).toEqual(['amount/东区', 'amount/西区', 'qty/东区', 'qty/西区'])
  })

  it('身份可以由多个字段组成，取值按 valueKey 判同', () => {
    const rows = [
      { year: 2026, month: 1, region: 'A', v: 1 },
      { year: 2026, month: 1, region: 'B', v: 2 },
      { year: 2026, month: '1', region: 'A', v: 3 },
      { year: 2026, month: new Date(5), region: 'A', v: 4 },
      { year: 2026, month: new Date(5), region: 'B', v: 5 },
    ]
    const result = pivotWider(rows, { key: ['year', 'month'], by: 'region', value: 'v' })
    expect(result.rows).toHaveLength(3)
    expect(result.rows[0]).toEqual({ year: 2026, month: 1, A: 1, B: 2 })
    expect(result.rows[2]).toEqual({ year: 2026, month: new Date(5), A: 4, B: 5 })
  })

  it('缺失的 by 取值也展开成一列，缺失值共用一列', () => {
    const rows = [
      { m: 1, r: null, v: 1 },
      { m: 2, r: undefined, v: 2 },
      { m: 2, r: 'x', v: 3 },
    ]
    const result = pivotWider(rows, { key: 'm', by: 'r', value: 'v', columnName: member => (member == null ? '(空)' : String(member)) })
    expect(result.columns.map(column => column.name)).toEqual(['(空)', 'x'])
    expect(result.rows).toEqual([{ 'm': 1, '(空)': 1 }, { 'm': 2, '(空)': 2, 'x': 3 }])
  })

  it('同一身份同一取值出现两次、或列名重复时抛 XH_VIZ_DUPLICATE_KEY', () => {
    expect(codeOf(() => pivotWider([...long, { month: '2026-01', region: '东区', amount: 1, qty: 1 }], { key: 'month', by: 'region', value: 'amount' }))).toBe('XH_VIZ_DUPLICATE_KEY')
    expect(codeOf(() => pivotWider([{ k: 1, r: 1, v: 1 }, { k: 1, r: '1', v: 2 }], { key: 'k', by: 'r', value: 'v' }))).toBe('XH_VIZ_DUPLICATE_KEY')
    expect(codeOf(() => pivotWider([{ k: 1, r: 'k', v: 1 }], { key: 'k', by: 'r', value: 'v' }))).toBe('XH_VIZ_DUPLICATE_KEY')
  })

  it('空表得到空结果，不改输入', () => {
    expect(pivotWider([], { key: 'k', by: 'r', value: 'v' })).toEqual({ rows: [], columns: [] })
    const before = JSON.stringify(long)
    pivotWider(long, { key: 'month', by: 'region', value: 'amount' })
    expect(JSON.stringify(long)).toBe(before)
  })
})
