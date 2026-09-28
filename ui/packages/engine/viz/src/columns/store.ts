/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 列式数据仓：每个字段一列 Float64Array，缺失写 NaN。已写入的行只有最后一行能改写（正在形成的那根 K 线），
// 其余行写入后不变，分块极值与合并缓存对整块永久有效。有上限时物理容量是上限加一段余量，
// 数据段追到尾就整段挪回开头：视图始终连续、零拷贝，挪动摊到每次追加是常数。

import { invalidArgument } from '../errors'

/** 一格的值：数与日期（取时间值）；null、undefined 与非有限数写成缺失（NaN）。 */
export type ColumnValue = number | Date | null | undefined

/** 按字段给出的一行；没声明过的字段不读。 */
export type ColumnRow = Readonly<Record<string, ColumnValue>>

/** 列式数据的只读面：图表只读它。 */
export interface ColumnSource {
  /** 字段，按声明次序。 */
  readonly fields: readonly string[]
  /** 行数。 */
  readonly length: number
  /** 首行的序号：滑出窗口与被 shift 掉的行数。行的序号 = start + 下标，数据滑动时同一行的序号不变。 */
  readonly start: number
  /** 内容版本：每次追加、改写末行、删头、清空都加一。 */
  readonly version: number
  /** 清空时加一：序号不回退，但此前按序号缓存的东西全部作废。 */
  readonly epoch: number
  /** 一列的零拷贝视图，长度等于 length；下一次变化后失效，要用时重新取。字段没声明过时为 undefined。 */
  readonly column: (field: string) => Float64Array | undefined
  /** 变化时同步通知；返回退订函数。 */
  readonly subscribe: (listener: () => void) => () => void
}

export interface ColumnStoreOptions {
  readonly fields: readonly string[]
  /** 最多保留的行数：追加超出时从头部挤掉最旧的行（滑动窗口）；缺省不设上限、按需扩容。 */
  readonly capacity?: number
  /** 初始数据：字段 → 等长的数组；不设上限时 Float64Array 直接接管、不复制。 */
  readonly columns?: Readonly<Record<string, ArrayLike<number>>>
}

/** 可追加的列式数据仓。 */
export interface ColumnStore extends ColumnSource {
  /** 行数上限；不设上限为 null。 */
  readonly capacity: number | null
  /** 追加一行或多行；一次调用只通知一次。 */
  readonly append: (rows: ColumnRow | readonly ColumnRow[]) => void
  /** 按列追加：各列等长，没给的字段写缺失；一次调用只通知一次。 */
  readonly appendColumns: (columns: Readonly<Record<string, ArrayLike<number>>>) => void
  /** 改写最后一行：没写的字段保持原值。没有行时报错。 */
  readonly setLast: (row: ColumnRow) => void
  /** 从头部删掉 count 行（超过行数时删光）；按时间保留时先二分出位置。 */
  readonly shift: (count: number) => void
  /** 清空；序号接着往后数，epoch 加一。 */
  readonly clear: () => void
}

/** 不设上限时的初始物理容量。 */
const INITIAL_SIZE = 1024
/** 有上限时余量的下限：挪回开头至少隔这么多次追加才发生一次。 */
const MIN_SLACK = 1024

/** 一格的值写成数：日期取时间值，缺失与非有限数写 NaN，其余类型报错。 */
function cell(value: unknown, field: string): number {
  if (value == null)
    return Number.NaN
  if (typeof value === 'number')
    return Number.isFinite(value) ? value : Number.NaN
  if (value instanceof Date) {
    const time = value.valueOf()
    return Number.isFinite(time) ? time : Number.NaN
  }
  throw invalidArgument('列式数据只收数与日期', { field, value })
}

/** 值是不是列式数据：有字段表、列视图与订阅，且不是数组。 */
export function isColumnSource(value: unknown): value is ColumnSource {
  if (typeof value !== 'object' || value === null || Array.isArray(value))
    return false
  const candidate = value as Partial<ColumnSource>
  return Array.isArray(candidate.fields) && typeof candidate.column === 'function' && typeof candidate.subscribe === 'function'
}

/** 建一个列式数据仓。字段须是不重复的非空字符串，上限须是正整数，初始各列须等长。 */
export function createColumnStore(options: ColumnStoreOptions): ColumnStore {
  const fields = Object.freeze([...options.fields])
  if (fields.length === 0)
    throw invalidArgument('列式数据至少要有一个字段', { fields })
  const slots = new Map<string, number>()
  fields.forEach((field, i) => {
    if (typeof field !== 'string' || field === '')
      throw invalidArgument('字段名必须是非空字符串', { field })
    if (slots.has(field))
      throw invalidArgument('字段名重复', { field })
    slots.set(field, i)
  })
  const capacity = options.capacity ?? null
  if (capacity !== null && !(Number.isInteger(capacity) && capacity > 0))
    throw invalidArgument('capacity 必须是正整数', { capacity })
  const ceiling = capacity === null ? Number.POSITIVE_INFINITY : capacity + Math.max(MIN_SLACK, Math.ceil(capacity / 4))

  let buffers: Float64Array[]
  let head = 0
  let length = 0
  let start = 0
  let version = 0
  let epoch = 0
  const listeners = new Set<() => void>()
  /** 视图按版本缓存：同一版本里反复取同一列不新建视图。 */
  let viewsAt = -1
  const views = new Map<string, Float64Array>()

  // —— 初始数据 ——
  const initial = options.columns ?? {}
  const given = Object.keys(initial)
  for (const field of given) {
    if (!slots.has(field))
      throw invalidArgument('初始数据里的字段没有声明', { field })
  }
  const lengths = new Set(given.map(field => (initial[field] as ArrayLike<number>).length))
  if (lengths.size > 1)
    throw invalidArgument('初始数据的各列必须等长', { lengths: [...lengths] })
  const count = lengths.size === 0 ? 0 : [...lengths][0] as number
  if (capacity === null) {
    // 不设上限：Float64Array 直接接管（写满后追加时再复制扩容），其余按数值拷进来
    buffers = fields.map((field) => {
      const source = initial[field]
      if (source instanceof Float64Array && count > 0)
        return source
      const out = new Float64Array(Math.max(INITIAL_SIZE, count))
      for (let i = 0; i < count; i++)
        out[i] = source ? cell(source[i], field) : Number.NaN
      return out
    })
    length = count
  }
  else {
    // 设了上限：只留最后 capacity 行，前面的行算作已滑出窗口
    const kept = Math.min(count, capacity)
    const skipped = count - kept
    const size = Math.min(ceiling, Math.max(INITIAL_SIZE, kept))
    buffers = fields.map((field) => {
      const source = initial[field]
      const out = new Float64Array(size)
      for (let i = 0; i < kept; i++)
        out[i] = source ? cell(source[skipped + i], field) : Number.NaN
      return out
    })
    length = kept
    start = skipped
  }

  /** 物理容量。 */
  const physical = (): number => (buffers[0] as Float64Array).length

  /** 数据段整段挪到新的物理容量里（扩容）或挪回开头（有上限时的滑动）。 */
  const relocate = (size: number): void => {
    buffers = buffers.map((buffer) => {
      if (size === buffer.length) {
        buffer.copyWithin(0, head, head + length)
        return buffer
      }
      const next = new Float64Array(size)
      next.set(buffer.subarray(head, head + length))
      return next
    })
    head = 0
  }

  /** 保证尾部还能再写一行。 */
  const room = (): void => {
    if (head + length < physical())
      return
    if (capacity === null) {
      relocate(Math.max(INITIAL_SIZE, physical() * 2))
      return
    }
    // 有上限：物理容量没到顶先扩；到顶了整段挪回开头（此时 length ≤ capacity，余量里一定放得下）
    const size = physical() < ceiling ? Math.min(ceiling, Math.max(INITIAL_SIZE, physical() * 2)) : physical()
    relocate(size)
  }

  /** 行数超出上限时从头部挤掉最旧的行。 */
  const evict = (): void => {
    if (capacity !== null && length > capacity) {
      const over = length - capacity
      head += over
      start += over
      length = capacity
    }
  }

  const notify = (): void => {
    version += 1
    for (const listener of [...listeners])
      listener()
  }

  const writeRow = (row: ColumnRow): void => {
    if (typeof row !== 'object' || row === null)
      throw invalidArgument('一行必须是对象', { row })
    room()
    const at = head + length
    for (let f = 0; f < fields.length; f++) {
      const field = fields[f] as string
      const buffer = buffers[f] as Float64Array
      buffer[at] = cell(row[field], field)
    }
    length += 1
    evict()
  }

  const store: ColumnStore = {
    fields,
    capacity,
    get length() {
      return length
    },
    get start() {
      return start
    },
    get version() {
      return version
    },
    get epoch() {
      return epoch
    },
    column(field) {
      const slot = slots.get(field)
      if (slot === undefined)
        return undefined
      if (viewsAt !== version) {
        views.clear()
        viewsAt = version
      }
      let view = views.get(field)
      if (!view) {
        view = (buffers[slot] as Float64Array).subarray(head, head + length)
        views.set(field, view)
      }
      return view
    },
    subscribe(listener) {
      if (typeof listener !== 'function')
        throw invalidArgument('订阅的回调必须是函数', { listener })
      listeners.add(listener)
      return () => {
        listeners.delete(listener)
      }
    },
    append(rows) {
      const list = Array.isArray(rows) ? rows as readonly ColumnRow[] : [rows as ColumnRow]
      if (list.length === 0)
        return
      for (const row of list)
        writeRow(row)
      notify()
    },
    appendColumns(columns) {
      const names = Object.keys(columns)
      for (const field of names) {
        if (!slots.has(field))
          throw invalidArgument('追加的字段没有声明', { field })
      }
      const sizes = new Set(names.map(field => (columns[field] as ArrayLike<number>).length))
      if (sizes.size > 1)
        throw invalidArgument('按列追加时各列必须等长', { lengths: [...sizes] })
      const n = sizes.size === 0 ? 0 : [...sizes][0] as number
      if (n === 0)
        return
      const sources = fields.map(field => columns[field])
      for (let i = 0; i < n; i++) {
        room()
        const at = head + length
        for (let f = 0; f < fields.length; f++) {
          const source = sources[f]
          const buffer = buffers[f] as Float64Array
          buffer[at] = source ? cell(source[i], fields[f] as string) : Number.NaN
        }
        length += 1
        evict()
      }
      notify()
    },
    setLast(row) {
      if (length === 0)
        throw invalidArgument('没有行可改写', {})
      if (typeof row !== 'object' || row === null)
        throw invalidArgument('一行必须是对象', { row })
      const at = head + length - 1
      for (let f = 0; f < fields.length; f++) {
        const field = fields[f] as string
        const buffer = buffers[f] as Float64Array
        if (Object.hasOwn(row, field))
          buffer[at] = cell(row[field], field)
      }
      notify()
    },
    shift(count) {
      if (!(Number.isInteger(count) && count >= 0))
        throw invalidArgument('shift 的行数必须是非负整数', { count })
      const n = Math.min(count, length)
      if (n === 0)
        return
      head += n
      start += n
      length -= n
      if (length === 0)
        head = 0
      notify()
    },
    clear() {
      start += length
      length = 0
      head = 0
      epoch += 1
      notify()
    },
  }
  return Object.freeze(store)
}
