/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 表达式值：列表、记录与宿主数据的按需转换、深相等和文本化。
import { ExprDate } from './date'
import { compareNumbers, ExprNumber, numberFromJs, parseNumberText } from './decimal'
import { Fault } from './issues'

/** 表达式里的值。 */
export type ExprValue = null | boolean | string | ExprNumber | ExprDate | ExprList | ExprRecord

/** 值的类型名。 */
export type ExprValueType = 'null' | 'boolean' | 'number' | 'string' | 'date' | 'list' | 'record'

/** `toPlain` 的结果：只含 JSON 能表示的值。 */
export type PlainValue = null | boolean | number | string | PlainValue[] | { [key: string]: PlainValue }

/** 求值预算：按步计费、按层计深。 */
export interface Budget {
  charge: (steps: number) => Fault | undefined
  enter: () => Fault | undefined
  leave: () => void
}

const FORBIDDEN_NAMES: ReadonlySet<string> = new Set(['__proto__', 'constructor', 'prototype'])
const PLAIN_DEPTH_LIMIT = 64

/** 是否为禁止访问的成员名。 */
export function isForbiddenName(name: string): boolean {
  return FORBIDDEN_NAMES.has(name)
}

function readOwnData(source: object, key: string): { found: boolean, value: unknown } {
  const descriptor = Object.getOwnPropertyDescriptor(source, key)
  if (descriptor === undefined || !descriptor.enumerable || !('value' in descriptor))
    return { found: false, value: undefined }
  return { found: true, value: descriptor.value }
}

let createList: (items: readonly unknown[], converted: boolean) => ExprList
let readItem: (list: ExprList, index: number) => ExprValue | Fault

/**
 * 只读列表。来自宿主的数组按需转换元素：只读自有、可枚举的数据属性，不触发 getter。
 * 越界读取得到 `null`。
 */
export class ExprList {
  readonly #items: readonly unknown[]
  readonly #converted: boolean

  static {
    createList = (items, converted) => new ExprList(items, converted)
    readItem = (list, index) => {
      if (index < 0 || index >= list.#items.length)
        return null
      if (list.#converted)
        return list.#items[index] as ExprValue
      const { found, value } = readOwnData(list.#items, String(index))
      return found ? fromHost(value) : null
    }
  }

  private constructor(items: readonly unknown[], converted: boolean) {
    this.#items = items
    this.#converted = converted
    Object.freeze(this)
  }

  /** 由表达式值构造；元素不是表达式值时抛 `TypeError`。 */
  static of(items: readonly ExprValue[]): ExprList {
    for (const item of items) {
      if (!isExprValue(item))
        throw new TypeError('ExprList.of 的元素必须是表达式值')
    }
    return createList(Object.freeze([...items]), true)
  }

  get length(): number {
    return this.#items.length
  }

  /** 读第 `index` 个元素；越界得到 `null`，元素不可表示时抛 `TypeError`。 */
  at(index: number): ExprValue {
    const item = readItem(this, index)
    if (item instanceof Fault)
      throw new TypeError(`列表第 ${index} 个元素不是可表示的值`)
    return item
  }

  /** 转成表达式值数组。 */
  toArray(): ExprValue[] {
    return Array.from({ length: this.length }, (_, index) => this.at(index))
  }

  * [Symbol.iterator](): IterableIterator<ExprValue> {
    for (let index = 0; index < this.length; index += 1)
      yield this.at(index)
  }
}

let readField: (record: ExprRecord, key: string) => ExprValue | Fault | undefined
let fieldKeys: (record: ExprRecord) => string[]

/**
 * 只读记录，包着宿主的普通对象。只读自有、可枚举的数据属性：原型链、getter 与
 * `__proto__` / `constructor` / `prototype` 都读不到。
 */
export class ExprRecord {
  readonly #source: object

  static {
    readField = (record, key) => {
      if (isForbiddenName(key))
        return undefined
      const { found, value } = readOwnData(record.#source, key)
      return found ? fromHost(value) : undefined
    }
    fieldKeys = record => Object.keys(record.#source).filter(key => !isForbiddenName(key) && readOwnData(record.#source, key).found)
  }

  private constructor(source: object) {
    this.#source = source
    Object.freeze(this)
  }

  /** 包装一个普通对象（原型是 `Object.prototype` 或 `null`）；其它对象抛 `TypeError`。 */
  static from(source: object): ExprRecord {
    if (!isPlainObject(source))
      throw new TypeError('ExprRecord.from 只接受普通对象')
    return new ExprRecord(source)
  }

  /** 是否有这个字段。 */
  has(key: string): boolean {
    return readField(this, key) !== undefined
  }

  /** 读字段；没有时得到 `null`，字段值不可表示时抛 `TypeError`。 */
  get(key: string): ExprValue {
    const value = readField(this, key)
    if (value instanceof Fault)
      throw new TypeError(`字段 ${key} 不是可表示的值`)
    return value ?? null
  }

  /** 字段名，顺序与宿主对象的自有键顺序一致。 */
  keys(): string[] {
    return fieldKeys(this)
  }
}

/** 原型是 `Object.prototype` 或 `null` 的对象；数组与类实例都不是。 */
export function isPlainObject(value: object): boolean {
  const prototype: unknown = Object.getPrototypeOf(value)
  return prototype === Object.prototype || prototype === null
}

/** 读列表元素，不可表示时返回故障。 */
export function listItem(list: ExprList, index: number): ExprValue | Fault {
  return readItem(list, index)
}

/** 读记录字段，没有时返回 `undefined`，不可表示时返回故障。 */
export function recordField(record: ExprRecord, key: string): ExprValue | Fault | undefined {
  return readField(record, key)
}

/** 由表达式值数组构造列表，不做校验。 */
export function listOf(items: ExprValue[]): ExprList {
  return createList(Object.freeze(items), true)
}

/** 把宿主值转换成表达式值；不可表示时返回故障。 */
export function fromHost(raw: unknown): ExprValue | Fault {
  if (raw === null || raw === undefined)
    return null
  switch (typeof raw) {
    case 'boolean':
    case 'string':
      return raw
    case 'number':
      return numberFromJs(raw)
    case 'bigint':
      return parseNumberText(raw.toString()) ?? new Fault('XH_EXPR_UNSUPPORTED_VALUE')
    case 'object':
      if (raw instanceof ExprNumber || raw instanceof ExprDate || raw instanceof ExprList || raw instanceof ExprRecord)
        return raw
      if (Array.isArray(raw))
        return createList(raw, false)
      return isPlainObject(raw) ? ExprRecord.from(raw) : new Fault('XH_EXPR_UNSUPPORTED_VALUE')
    default:
      return new Fault('XH_EXPR_UNSUPPORTED_VALUE')
  }
}

/**
 * 把宿主值转换成表达式值：`undefined` 与 `null` 是 `null`，有限数字转成十进制数，
 * 数组与普通对象按需转换。`NaN`、`Infinity`、`Date`、函数、类实例等抛 `TypeError`。
 */
export function toExpressionValue(raw: unknown): ExprValue {
  const value = fromHost(raw)
  if (value instanceof Fault)
    throw new TypeError(value.code)
  return value
}

/** 判断一个值是不是表达式值。 */
export function isExprValue(value: unknown): value is ExprValue {
  return value === null
    || typeof value === 'boolean'
    || typeof value === 'string'
    || value instanceof ExprNumber
    || value instanceof ExprDate
    || value instanceof ExprList
    || value instanceof ExprRecord
}

/** 值的类型名。 */
export function typeOf(value: ExprValue): ExprValueType {
  if (value === null)
    return 'null'
  if (typeof value === 'boolean')
    return 'boolean'
  if (typeof value === 'string')
    return 'string'
  if (value instanceof ExprNumber)
    return 'number'
  if (value instanceof ExprDate)
    return 'date'
  return value instanceof ExprList ? 'list' : 'record'
}

function plainOf(value: ExprValue, depth: number): PlainValue {
  if (depth > PLAIN_DEPTH_LIMIT)
    throw new RangeError('toPlain 嵌套超过 64 层')
  if (value === null || typeof value === 'boolean' || typeof value === 'string')
    return value
  if (value instanceof ExprNumber)
    return value.toJs()
  if (value instanceof ExprDate)
    return value.toString()
  if (value instanceof ExprList)
    return value.toArray().map(item => plainOf(item, depth + 1))
  const out: { [key: string]: PlainValue } = {}
  for (const key of value.keys())
    out[key] = plainOf(value.get(key), depth + 1)
  return out
}

/**
 * 转成 JSON 能表示的值：数字转成最接近的 JS 数字，日期转成规范文本，列表与记录深拷贝。
 * 嵌套超过 64 层（含环）抛 `RangeError`。
 */
export function toPlain(value: ExprValue): PlainValue {
  return plainOf(value, 0)
}

/** 标量的规范文本：`null` 是空串，布尔是 `true` / `false`；列表与记录返回类型不符故障。 */
export function toText(value: ExprValue): string | Fault {
  if (value === null)
    return ''
  if (typeof value === 'string')
    return value
  if (typeof value === 'boolean')
    return value ? 'true' : 'false'
  if (value instanceof ExprNumber || value instanceof ExprDate)
    return value.toString()
  return new Fault('XH_EXPR_TYPE_MISMATCH', { actual: typeOf(value) })
}

/** 深相等：类型相同且值相同；列表逐项、记录按字段集合比较。按元素计步、按层计深。 */
export function valuesEqual(a: ExprValue, b: ExprValue, budget: Budget): boolean | Fault {
  if (a === b)
    return true
  if (a === null || b === null || typeof a !== 'object' || typeof b !== 'object')
    return false
  if (a instanceof ExprNumber)
    return b instanceof ExprNumber && compareNumbers(a, b) === 0
  if (a instanceof ExprDate)
    return b instanceof ExprDate && a.epochMilliseconds === b.epochMilliseconds
  if (a instanceof ExprList) {
    if (!(b instanceof ExprList) || a.length !== b.length)
      return false
    return compareChildren(budget, a.length, index => [listItem(a, index), listItem(b, index)])
  }
  if (!(b instanceof ExprRecord))
    return false
  const keys = fieldKeys(a)
  const otherKeys = new Set(fieldKeys(b))
  if (keys.length !== otherKeys.size || keys.some(key => !otherKeys.has(key)))
    return false
  return compareChildren(budget, keys.length, index => [readField(a, keys[index]!) ?? null, readField(b, keys[index]!) ?? null])
}

function compareChildren(budget: Budget, count: number, pick: (index: number) => [ExprValue | Fault, ExprValue | Fault]): boolean | Fault {
  const entered = budget.enter()
  if (entered)
    return entered
  try {
    for (let index = 0; index < count; index += 1) {
      const charged = budget.charge(1)
      if (charged)
        return charged
      const [left, right] = pick(index)
      if (left instanceof Fault)
        return left
      if (right instanceof Fault)
        return right
      const equal = valuesEqual(left, right, budget)
      if (equal !== true)
        return equal
    }
    return true
  }
  finally {
    budget.leave()
  }
}
