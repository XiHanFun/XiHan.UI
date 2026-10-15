import type { FilterCondition, FilterGroup, FilterNode, FilterOperator } from '../src'
import { describe, expect, it } from 'vitest'
import {
  aggregate,
  AGGREGATE_KINDS,
  compareMixed,
  compileFilter,
  createAccumulator,
  FILTER_OPERATORS,
  isMissing,
  isVizError,
  mean,
  sortBy,
  sum,
  tupleKey,
  valueKey,
} from '../src'

describe('isMissing', () => {
  it('null、undefined、NaN 与无效 Date 是缺失值', () => {
    expect(isMissing(null)).toBe(true)
    expect(isMissing(undefined)).toBe(true)
    expect(isMissing(Number.NaN)).toBe(true)
    expect(isMissing(new Date('invalid'))).toBe(true)
  })

  it('空字符串、0 与 false 不是缺失值', () => {
    expect(isMissing('')).toBe(false)
    expect(isMissing(0)).toBe(false)
    expect(isMissing(false)).toBe(false)
  })
})

describe('compareMixed', () => {
  it('同类型按值比较', () => {
    expect(compareMixed(1, 2)).toBe(-1)
    expect(compareMixed('b', 'a')).toBe(1)
    expect(compareMixed(true, false)).toBe(1)
    expect(compareMixed(new Date(2), new Date(1))).toBe(1)
    expect(compareMixed(3, 3)).toBe(0)
  })

  it('缺失值大于一切非缺失值，缺失值彼此相等', () => {
    expect(compareMixed(null, 1)).toBe(1)
    expect(compareMixed('z', undefined)).toBe(-1)
    expect(compareMixed(null, Number.NaN)).toBe(0)
  })

  it('不同类型按 boolean < number < Date < string 排', () => {
    expect(compareMixed(true, 0)).toBe(-1)
    expect(compareMixed(9, new Date(0))).toBe(-1)
    expect(compareMixed(new Date(0), '0')).toBe(-1)
  })

  it('字符串缺省按码元比较，可传 collate', () => {
    expect(compareMixed('a', 'B')).toBe(1)
    expect(compareMixed('a', 'B', { collate: (x, y) => x.toLowerCase().localeCompare(y.toLowerCase()) })).toBe(-1)
  })
})

describe('valueKey 与 tupleKey', () => {
  it('-0 与 0 同键，Date 按时刻，字符串与数值不同键', () => {
    expect(valueKey(-0)).toBe(valueKey(0))
    expect(valueKey(new Date(5))).toBe(valueKey(new Date(5)))
    expect(valueKey('1')).not.toBe(valueKey(1))
    expect(valueKey(true)).not.toBe(valueKey('true'))
  })

  it('缺失值共用一个键', () => {
    expect(valueKey(null)).toBe(valueKey(undefined))
    expect(valueKey(Number.NaN)).toBe(valueKey(null))
    expect(valueKey(new Date('invalid'))).toBe(valueKey(null))
  })

  it('组合键随次序变化，元素里的分隔符不会串键', () => {
    expect(tupleKey(['a', 'b'])).not.toBe(tupleKey(['b', 'a']))
    expect(tupleKey(['a,b'])).not.toBe(tupleKey(['a', 'b']))
    expect(tupleKey([])).toBe(tupleKey([]))
  })
})

describe('aggregate 与 createAccumulator', () => {
  it('列出全部聚合方式', () => {
    expect(AGGREGATE_KINDS).toEqual(['sum', 'avg', 'count', 'min', 'max', 'distinctCount'])
  })

  it('sum / avg 与 sum、mean 结果相同，大数之间的小量不丢', () => {
    const values = [1e16, 1, -1e16, 0.1, 0.2]
    expect(aggregate('sum', values)).toBe(sum(values))
    expect(aggregate('avg', values)).toBe(mean(values))
    expect(aggregate('sum', [1e16, 1, -1e16])).toBe(1)
  })

  it('sum / avg 只收数值，跳过缺失值与字符串，Infinity 参与', () => {
    expect(aggregate('sum', [10, null, '5', undefined, 20, Number.NaN])).toBe(30)
    expect(aggregate('avg', [10, null, '5', undefined, 20, Number.NaN])).toBe(15)
    expect(aggregate('sum', [1, Number.POSITIVE_INFINITY])).toBe(Number.POSITIVE_INFINITY)
  })

  it('空集上 sum / avg / min / max 为 null，count / distinctCount 为 0', () => {
    for (const values of [[], [null, undefined, Number.NaN]]) {
      expect(aggregate('sum', values)).toBeNull()
      expect(aggregate('avg', values)).toBeNull()
      expect(aggregate('min', values)).toBeNull()
      expect(aggregate('max', values)).toBeNull()
      expect(aggregate('count', values)).toBe(0)
      expect(aggregate('distinctCount', values)).toBe(0)
    }
  })

  it('count 数非缺失值，distinctCount 按 valueKey 数不同的非缺失值', () => {
    const values = ['A', 'B', 'A', null, '', 1, '1']
    expect(aggregate('count', values)).toBe(6)
    expect(aggregate('distinctCount', values)).toBe(5)
  })

  it('min / max 可用于字符串与日期，字符串可传 collate', () => {
    expect(aggregate('min', ['2026-03-01', null, '2026-01-15'])).toBe('2026-01-15')
    expect(aggregate('max', ['b', 'a', 'C'])).toBe('b')
    expect(aggregate('max', ['b', 'a', 'C'], { collate: (x, y) => x.toLowerCase().localeCompare(y.toLowerCase()) })).toBe('C')
    const later = new Date(Date.UTC(2026, 5, 1))
    expect(aggregate('max', [new Date(Date.UTC(2026, 0, 1)), later])).toBe(later)
  })

  it('累加器随时可取结果', () => {
    const accumulator = createAccumulator('avg')
    expect(accumulator.result()).toBeNull()
    accumulator.add(2)
    expect(accumulator.result()).toBe(2)
    accumulator.add(4)
    expect(accumulator.result()).toBe(3)
  })

  it('未知的聚合方式抛 XH_VIZ_INVALID_ARGUMENT', () => {
    let error: unknown
    try {
      createAccumulator('median' as never)
    }
    catch (caught) {
      error = caught
    }
    expect(isVizError(error) && error.code).toBe('XH_VIZ_INVALID_ARGUMENT')
  })
})

describe('sortBy', () => {
  const items = [{ v: 2 as number | null }, { v: null }, { v: 1 }, { v: 2, tag: 'second' }]

  it('缺失值缺省排最后，与方向无关', () => {
    expect(sortBy(items, [{ value: i => i.v }]).map(i => i.v)).toEqual([1, 2, 2, null])
    expect(sortBy(items, [{ value: i => i.v, direction: 'desc' }]).map(i => i.v)).toEqual([2, 2, 1, null])
  })

  it('nulls: first 把缺失值排最前', () => {
    expect(sortBy(items, [{ value: i => i.v, direction: 'desc', nulls: 'first' }]).map(i => i.v)).toEqual([null, 2, 2, 1])
  })

  it('全部键相等的项保持原有次序，不改原数组', () => {
    const before = items.slice()
    const sorted = sortBy(items, [{ value: i => i.v, direction: 'desc' }])
    expect(sorted[0]).toBe(items[0])
    expect(sorted[1]).toBe(items[3])
    expect(items).toEqual(before)
  })

  it('多个键依次比较，每项的键值只取一次', () => {
    const rows = [{ a: 1, b: 2 }, { a: 0, b: 9 }, { a: 1, b: 1 }]
    let reads = 0
    const readB = (row: { b: number }): number => {
      reads++
      return row.b
    }
    const sorted = sortBy(rows, [{ value: r => r.a }, { value: readB, direction: 'desc' }])
    expect(sorted).toEqual([{ a: 0, b: 9 }, { a: 1, b: 2 }, { a: 1, b: 1 }])
    expect(reads).toBe(3)
  })

  it('字符串键可传 collate，没有键时原样复制', () => {
    const words = ['b', 'A', 'a']
    expect(sortBy(words, [{ value: w => w }])).toEqual(['A', 'a', 'b'])
    expect(sortBy(words, [{ value: w => w }], { collate: (x, y) => x.toLowerCase().localeCompare(y.toLowerCase()) })).toEqual(['A', 'a', 'b'])
    expect(sortBy(new Set(words), [])).toEqual(words)
  })
})

describe('compileFilter', () => {
  type Row = Readonly<Record<string, unknown>>
  const rows: readonly Row[] = [
    { name: 'Ann', age: 30, joined: '2026-01-10', active: true },
    { name: 'bob', age: 25, joined: '2026-03-05', active: false },
    { name: 'Cid', age: null, joined: null, active: null },
    { name: '', age: 40, joined: '2025-12-31', active: true },
    { name: 'Dee', age: '35', joined: '2026-03-20', active: false },
  ]
  const all = rows.map(row => row.name)

  function names(node: FilterNode | undefined): unknown[] {
    const predicate = compileFilter(node)
    return rows.filter(row => predicate(row)).map(row => row.name)
  }

  function where(field: string, operator: FilterOperator, value?: unknown, more: Partial<FilterCondition> = {}): FilterCondition {
    return { field, operator, value, ...more }
  }

  it('列出全部运算符', () => {
    expect(FILTER_OPERATORS).toHaveLength(15)
    expect(new Set(FILTER_OPERATORS).size).toBe(15)
  })

  it('isEmpty 只匹配缺失值，isNotEmpty 相反；空字符串不算缺失', () => {
    expect(names(where('age', 'isEmpty'))).toEqual(['Cid'])
    expect(names(where('name', 'isEmpty'))).toEqual([])
    expect(names(where('age', 'isNotEmpty'))).toEqual(['Ann', 'bob', '', 'Dee'])
  })

  it('正向运算符不匹配缺失值，否定运算符是它的补集', () => {
    expect(names(where('age', 'gte', 0))).toEqual(['Ann', 'bob', ''])
    expect(names(where('age', 'in', [30, 25]))).toEqual(['Ann', 'bob'])
    expect(names(where('active', 'neq', true))).toEqual(['bob', 'Cid', 'Dee'])
    expect(names(where('age', 'notIn', [30]))).toEqual(['bob', 'Cid', '', 'Dee'])
    expect(names(where('name', 'notContains', 'n'))).toEqual(['bob', 'Cid', '', 'Dee'])
  })

  it('操作数为空的条件不参与筛选，between 的一端为空即不设该端', () => {
    expect(names(where('age', 'eq', null))).toEqual(all)
    expect(names(where('age', 'in', []))).toEqual(all)
    expect(names(where('age', 'in', [null]))).toEqual(all)
    expect(names(where('age', 'between', [null, null]))).toEqual(all)
    expect(names(where('age', 'between', [26, null]))).toEqual(['Ann', ''])
    expect(names(where('age', 'between', [25, 30]))).toEqual(['Ann', 'bob'])
  })

  it('没有条件树或全部条件都不参与时全部行通过', () => {
    expect(names(undefined)).toEqual(all)
    expect(names({ logic: 'or', conditions: [where('age', 'eq', undefined), { logic: 'and', conditions: [where('name', 'in', [])] }] })).toEqual(all)
  })

  it('类型不同的值不相等也不比大小', () => {
    expect(names(where('age', 'eq', 35))).toEqual([])
    expect(names(where('age', 'eq', '35'))).toEqual(['Dee'])
    expect(names(where('age', 'gt', 26))).toEqual(['Ann', ''])
    expect(names(where('name', 'in', 'Ann'))).toEqual(['Ann'])
  })

  it('字符串运算符区分大小写，ignoreCase 时忽略', () => {
    expect(names(where('name', 'startsWith', 'b'))).toEqual(['bob'])
    expect(names(where('name', 'startsWith', 'B'))).toEqual([])
    expect(names(where('name', 'startsWith', 'B', { ignoreCase: true }))).toEqual(['bob'])
    expect(names(where('name', 'endsWith', 'E', { ignoreCase: true }))).toEqual(['Dee'])
    expect(names(where('name', 'contains', 'i'))).toEqual(['Cid'])
  })

  it('条件组按 and / or 组合', () => {
    const tree: FilterGroup = {
      logic: 'or',
      conditions: [
        where('age', 'lt', 28),
        { logic: 'and', conditions: [where('active', 'eq', true), where('age', 'gt', 35)] },
      ],
    }
    expect(names(tree)).toEqual(['bob', ''])
  })

  it('read、operand 与 normalize 可以替换取值、操作数与比较前的换算', () => {
    interface Condition extends FilterCondition { readonly month?: boolean, readonly ref?: string }
    const parameters: Readonly<Record<string, unknown>> = { from: '2026-03' }
    const month = (value: unknown): unknown => (typeof value === 'string' ? value.slice(0, 7) : value)
    const predicate = compileFilter<readonly unknown[], Condition>(
      { field: 'joined', operator: 'gte', ref: 'from', month: true },
      {
        read: (row, field) => row[field === 'joined' ? 1 : 0],
        operand: condition => (condition.ref ? parameters[condition.ref] : condition.value),
        normalize: condition => (condition.month ? { value: month } : undefined),
      },
    )
    expect([[0, '2026-02-28'], [1, '2026-03-01'], [2, null]].map(row => predicate(row))).toEqual([false, true, false])
  })

  it('缺省只读行对象的自有属性', () => {
    const predicate = compileFilter(where('toString', 'isNotEmpty'))
    expect(predicate({})).toBe(false)
  })

  it('操作数形状不对时抛 XH_VIZ_FILTER_OPERAND，detail 带出条件', () => {
    for (const condition of [where('age', 'eq', [1, 2]), where('age', 'between', [1]), where('name', 'contains', 1)]) {
      let error: unknown
      try {
        compileFilter(condition)
      }
      catch (caught) {
        error = caught
      }
      expect(isVizError(error) && error.code).toBe('XH_VIZ_FILTER_OPERAND')
      expect(isVizError(error) && error.detail.condition).toBe(condition)
    }
  })
})
