/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 数据驱动模式：给了 data 时，当前页的记录、行定义与筛过的总条数都由这里算出。
// 筛选、排序与切页都是 (data, 列定义, 排序链, 筛选值, 页码) 的纯函数；机器与 connect 都经 tableRowDefs 取行，
// 结果按这几样输入的身份缓存一份：两次求值之间都没换时直接拿上一份，一万条不必每次重排。

import type { ContextFacade, PropFn } from '@xihan-ui/core'
import type { TableColumnDef, TableFilterValue, TableRecord, TableRowDef, TableSchema, TableSortDescriptor } from './table.types'
import { tableLeafColumns } from './table.columns'
import { flattenTableRows } from './table.rows'

/** 数据驱动模式开了分页时缺省的每页条数，与分页组件同一个数。 */
export const TABLE_DEFAULT_PAGE_SIZE = 10

const EMPTY_COLUMNS: readonly TableColumnDef[] = []
const EMPTY_ROWS: readonly TableRowDef[] = []

/** 数据驱动模式算出来的一页。 */
export interface TableDataView {
  /** 当前页的记录：筛过、排过序，开了分页时只有这一页。 */
  readonly records: readonly TableRecord[]
  /** 与 records 一一对应的行定义。 */
  readonly rows: readonly TableRowDef[]
  /** 筛过之后的总条数。 */
  readonly count: number
  /** 夹到有效范围的页码；不分页时恒为 1。 */
  readonly page: number
  /** 总页数，至少 1；不分页时恒为 1。 */
  readonly pageCount: number
  /** 生效的每页条数，至少 1；不分页时为 0。 */
  readonly pageSize: number
  /** 行 id → 记录，整份 data 的（不止当前页）。 */
  readonly byId: ReadonlyMap<string, TableRecord>
}

/** 取一列在记录里的值：列 id 即字段名。 */
export function tableFieldValue(record: TableRecord, columnId: string): unknown {
  return record[columnId]
}

/** 格子里显示的文字：列的 format 优先，没有就把字段值转成字符串，空值显示为空。 */
export function tableCellText(record: TableRecord, column: TableColumnDef): string {
  const value = tableFieldValue(record, column.id)
  if (column.format)
    return column.format(value, record)
  return value == null ? '' : String(value)
}

/** 记录的行 id：rowKey 是函数就问它，是字段名就取那个字段；取不到时退回它在 data 里的下标。 */
function rowIdOf(record: TableRecord, index: number, rowKey: TableSchema['props']['rowKey']): string {
  if (typeof rowKey === 'function')
    return rowKey(record)
  const raw = record[rowKey ?? 'id']
  return raw == null ? String(index) : String(raw)
}

const isEmpty = (value: unknown): boolean => value == null || value === ''

let collator: Intl.Collator | null = null

/**
 * 两个字段值比大小（升序）：数字与日期按大小，布尔按 false 在前，其余按字符串比，数字串按数值序。
 * 空值不在这里比：调用方把它们恒排在最后。
 */
export function tableCompareValues(a: unknown, b: unknown): number {
  if (typeof a === 'number' && typeof b === 'number')
    return a - b
  if (a instanceof Date && b instanceof Date)
    return a.getTime() - b.getTime()
  if (typeof a === 'boolean' && typeof b === 'boolean')
    return Number(a) - Number(b)
  collator ??= new Intl.Collator(undefined, { numeric: true })
  return collator.compare(String(a), String(b))
}

/** 这一列有没有命中勾选的筛选值。 */
function matchesFilter(record: TableRecord, column: TableColumnDef, values: readonly string[]): boolean {
  if (column.filter)
    return column.filter(record, values)
  const value = tableFieldValue(record, column.id)
  if (Array.isArray(value))
    return value.some(item => values.includes(String(item)))
  return values.includes(value == null ? '' : String(value))
}

/** 按排序链比两条记录：链上逐环比，前一环分出高下就不看后面；没声明 sortable 的列不参与。 */
function compareRecords(a: TableRecord, b: TableRecord, chain: readonly { column: TableColumnDef, desc: boolean }[]): number {
  for (const { column, desc } of chain) {
    let diff: number
    if (column.compare) {
      diff = column.compare(a, b)
    }
    else {
      const left = tableFieldValue(a, column.id)
      const right = tableFieldValue(b, column.id)
      // 空值无论升降都排最后：倒过来排时不能把它们翻到最前面
      if (isEmpty(left) || isEmpty(right)) {
        if (isEmpty(left) !== isEmpty(right))
          return isEmpty(left) ? 1 : -1
        continue
      }
      diff = tableCompareValues(left, right)
    }
    if (diff !== 0)
      return desc ? -diff : diff
  }
  return 0
}

export interface TableDataInput {
  readonly data: readonly TableRecord[]
  /** 作者给的列定义（可带分组），筛选与排序只认叶子列。 */
  readonly columns: readonly TableColumnDef[]
  readonly rowKey?: TableSchema['props']['rowKey']
  readonly sort: readonly TableSortDescriptor[]
  readonly filterValue: TableFilterValue
  readonly paginate: boolean
  readonly page: number
  readonly pageSize: number
}

/** 筛、排、切一页。纯函数，不缓存；机器与 connect 经 tableDataViewOf 取带缓存的那一份。 */
export function computeTableDataView(input: TableDataInput): TableDataView {
  const leaves = tableLeafColumns(input.columns)
  const byColumn = new Map(leaves.map(column => [column.id, column]))
  const keyed = input.data.map((record, index) => ({ record, id: rowIdOf(record, index, input.rowKey) }))
  const byId = new Map(keyed.map(entry => [entry.id, entry.record]))

  const filters = Object.entries(input.filterValue).flatMap(([id, values]) => {
    const column = byColumn.get(id)
    return column && values.length > 0 ? [{ column, values }] : []
  })
  const filtered = filters.length === 0
    ? keyed
    : keyed.filter(entry => filters.every(({ column, values }) => matchesFilter(entry.record, column, values)))

  const chain = input.sort.flatMap((descriptor) => {
    const column = byColumn.get(descriptor.id)
    return column?.sortable ? [{ column, desc: descriptor.direction === 'desc' }] : []
  })
  // 排序是稳定的：比不出高下的保持 data 里的先后
  const sorted = chain.length === 0 ? filtered : [...filtered].sort((a, b) => compareRecords(a.record, b.record, chain))

  const count = sorted.length
  let page = 1
  let pageCount = 1
  let pageSize = 0
  let paged = sorted
  if (input.paginate) {
    pageSize = Math.max(1, Math.trunc(input.pageSize) || TABLE_DEFAULT_PAGE_SIZE)
    pageCount = Math.max(1, Math.ceil(count / pageSize))
    page = Math.min(Math.max(1, Math.trunc(input.page) || 1), pageCount)
    paged = sorted.slice((page - 1) * pageSize, page * pageSize)
  }
  return {
    records: paged.map(entry => entry.record),
    rows: paged.map(entry => ({ id: entry.id })),
    count,
    page,
    pageCount,
    pageSize,
    byId,
  }
}

interface CacheEntry {
  readonly input: Omit<TableDataInput, 'data'>
  readonly view: TableDataView
}

/** 按 data 的身份各记最后一份：同一份 data 喂给几张表时互不挤掉。 */
const cache = new WeakMap<readonly TableRecord[], CacheEntry>()

function sameInput(a: Omit<TableDataInput, 'data'>, b: Omit<TableDataInput, 'data'>): boolean {
  return a.columns === b.columns && a.rowKey === b.rowKey && a.sort === b.sort && a.filterValue === b.filterValue
    && a.paginate === b.paginate && a.page === b.page && a.pageSize === b.pageSize
}

type DataSource = Readonly<{ prop: PropFn<TableSchema>, context: Pick<ContextFacade<TableSchema>, 'get'> }>

/** 数据驱动模式这一刻的那一页；没给 data 时为 null。 */
export function tableDataViewOf({ prop, context }: DataSource): TableDataView | null {
  const data = prop('data')
  if (!data)
    return null
  const input: Omit<TableDataInput, 'data'> = {
    columns: prop('columns') ?? EMPTY_COLUMNS,
    rowKey: prop('rowKey'),
    sort: context.get('sort'),
    filterValue: context.get('filterValue'),
    paginate: !!prop('pagination'),
    page: context.get('page'),
    pageSize: prop('pageSize') ?? TABLE_DEFAULT_PAGE_SIZE,
  }
  const hit = cache.get(data)
  if (hit && sameInput(hit.input, input))
    return hit.view
  const view = computeTableDataView({ ...input, data })
  cache.set(data, { input, view })
  return view
}

/** 行定义的唯一取法：数据驱动模式由 data 推出当前页的行，否则就是 rows。 */
export function tableRowDefs(source: DataSource): readonly TableRowDef[] {
  return tableDataViewOf(source)?.rows ?? source.prop('rows') ?? EMPTY_ROWS
}

/**
 * 可见数据行的条数，标准结构开了虚拟化时 Virtualizer 的 count 取它。
 * 不经 connect 求值：connect 要读 virtualizer 这条桥，桥又要读 Virtualizer 的条数，两边互相取值会成环。
 */
export function tableVisibleDataRowCount(source: DataSource): number {
  return flattenTableRows(tableRowDefs(source), source.context.get('expandedValue')).filter(row => row.kind === 'data').length
}
