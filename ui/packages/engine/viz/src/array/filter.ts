/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 条件树筛选：把 and / or 条件树编译成行谓词，缺失值与空操作数按固定语义处理。

import type { CollateOptions } from './mixed'
import { invalidArgument, VizError } from '../errors'
import { compareMixed, isMissing, valueKey } from './mixed'

/**
 * 筛选运算符。
 * - eq / neq：相等、不等；
 * - gt / gte / lt / lte：大小比较；
 * - between：闭区间，操作数为 [下界, 上界]；
 * - in / notIn：属于、不属于一组值；
 * - contains / notContains / startsWith / endsWith：字符串匹配；
 * - isEmpty / isNotEmpty：值缺失、不缺失，不需要操作数。
 */
export type FilterOperator
  = | 'eq'
    | 'neq'
    | 'gt'
    | 'gte'
    | 'lt'
    | 'lte'
    | 'between'
    | 'in'
    | 'notIn'
    | 'contains'
    | 'notContains'
    | 'startsWith'
    | 'endsWith'
    | 'isEmpty'
    | 'isNotEmpty'

/** 全部筛选运算符。 */
export const FILTER_OPERATORS: readonly FilterOperator[] = Object.freeze([
  'eq',
  'neq',
  'gt',
  'gte',
  'lt',
  'lte',
  'between',
  'in',
  'notIn',
  'contains',
  'notContains',
  'startsWith',
  'endsWith',
  'isEmpty',
  'isNotEmpty',
])

/** 可筛选字段与参数的值类型。 */
export type FilterValueType = 'string' | 'number' | 'boolean' | 'date' | 'datetime'

/** 可筛选的字段：编辑条件树时的字段清单，条件的 field 写它的 name。 */
export interface FilterField {
  /** 写进条件的 field。 */
  readonly name: string
  readonly label?: string
  readonly type: FilterValueType
  /** 固定候选值：eq / neq / in / notIn 改用下拉选择。 */
  readonly options?: readonly { readonly value: string | number | boolean, readonly label?: string }[]
  /** 这个字段可用的运算符，缺省按类型取。 */
  readonly operators?: readonly FilterOperator[]
}

/** 可引用的参数：条件的操作数可以写成 { parameter: name }。 */
export interface FilterParameter {
  readonly name: string
  readonly label?: string
  readonly type: FilterValueType
  /** 多值参数只能整个用作 in / notIn 的操作数。 */
  readonly multiple?: boolean
}

/** 一个筛选条件。 */
export interface FilterCondition {
  /** 字段名。 */
  readonly field: string
  readonly operator: FilterOperator
  /** 操作数；isEmpty / isNotEmpty 不写。 */
  readonly value?: unknown
  /** 字符串运算符忽略大小写。 */
  readonly ignoreCase?: boolean
}

/** 条件组：and 全部满足，or 任一满足。 */
export interface FilterGroup<C extends FilterCondition = FilterCondition> {
  readonly logic: 'and' | 'or'
  readonly conditions: readonly FilterNode<C>[]
}

/** 条件树上的一个节点：条件或条件组。 */
export type FilterNode<C extends FilterCondition = FilterCondition> = C | FilterGroup<C>

/** 比较前对字段值与操作数的换算；不写的一侧原样参与比较。 */
export interface FilterNormalizer {
  readonly value?: (value: unknown) => unknown
  readonly operand?: (operand: unknown) => unknown
}

/** 编译筛选的选项。 */
export interface CompileFilterOptions<R, C extends FilterCondition = FilterCondition> extends CollateOptions {
  /** 取行上字段的值；缺省读行对象的自有属性。 */
  readonly read?: (row: R, field: string) => unknown
  /** 条件的操作数；缺省取 condition.value。 */
  readonly operand?: (condition: C) => unknown
  /** 按条件给出比较前的换算，例如把日期换成同一时区的墙上时间；缺省不换算。 */
  readonly normalize?: (condition: C) => FilterNormalizer | undefined
}

type Predicate<R> = (row: R) => boolean

const NEGATIVE_OPERATORS: ReadonlySet<FilterOperator> = new Set(['neq', 'notIn', 'notContains'])

function readOwn(row: unknown, field: string): unknown {
  if (row === null || typeof row !== 'object' || !Object.hasOwn(row, field))
    return undefined
  return (row as Readonly<Record<string, unknown>>)[field]
}

function identity(value: unknown): unknown {
  return value
}

function isEmptyOperand(value: unknown): boolean {
  if (Array.isArray(value))
    return value.every(item => isMissing(item))
  return isMissing(value)
}

function sameKind(a: unknown, b: unknown): boolean {
  if (a instanceof Date || b instanceof Date)
    return a instanceof Date && b instanceof Date
  return typeof a === typeof b && (typeof a === 'number' || typeof a === 'string' || typeof a === 'boolean')
}

function operandError(condition: FilterCondition): VizError {
  return new VizError('XH_VIZ_FILTER_OPERAND', '筛选条件的操作数与运算符不匹配', { condition })
}

function compileCondition<R, C extends FilterCondition>(condition: C, options: CompileFilterOptions<R, C>): Predicate<R> | null {
  const { field, operator } = condition
  const read = options.read ?? readOwn
  if (operator === 'isEmpty')
    return row => isMissing(read(row, field))
  if (operator === 'isNotEmpty')
    return row => !isMissing(read(row, field))

  const raw = options.operand ? options.operand(condition) : condition.value
  if (isEmptyOperand(raw))
    return null

  const normalizer = options.normalize?.(condition)
  const normalizeValue = normalizer?.value ?? identity
  const normalizeOperand = normalizer?.operand ?? identity
  const negative = NEGATIVE_OPERATORS.has(operator)

  function predicate(test: (value: unknown) => boolean): Predicate<R> {
    return (row) => {
      const value = normalizeValue(read(row, field))
      if (isMissing(value))
        return negative
      return test(value)
    }
  }

  function scalar(): unknown {
    if (Array.isArray(raw))
      throw operandError(condition)
    return normalizeOperand(raw)
  }

  function text(): string {
    if (Array.isArray(raw) || typeof raw !== 'string')
      throw operandError(condition)
    return condition.ignoreCase ? raw.toLowerCase() : raw
  }

  function ordered(target: unknown, accept: (order: number) => boolean): (value: unknown) => boolean {
    return value => sameKind(value, target) && accept(compareMixed(value, target, options))
  }

  switch (operator) {
    case 'eq':
    case 'neq': {
      const key = valueKey(scalar())
      return predicate(value => (valueKey(value) === key) !== negative)
    }
    case 'gt':
      return predicate(ordered(scalar(), order => order > 0))
    case 'gte':
      return predicate(ordered(scalar(), order => order >= 0))
    case 'lt':
      return predicate(ordered(scalar(), order => order < 0))
    case 'lte':
      return predicate(ordered(scalar(), order => order <= 0))
    case 'between': {
      if (!Array.isArray(raw) || raw.length !== 2)
        throw operandError(condition)
      const lower = isMissing(raw[0]) ? null : ordered(normalizeOperand(raw[0]), order => order >= 0)
      const upper = isMissing(raw[1]) ? null : ordered(normalizeOperand(raw[1]), order => order <= 0)
      return predicate(value => (lower === null || lower(value)) && (upper === null || upper(value)))
    }
    case 'in':
    case 'notIn': {
      const items = (Array.isArray(raw) ? raw : [raw]).filter(item => !isMissing(item))
      const keys = new Set(items.map(item => valueKey(normalizeOperand(item))))
      return predicate(value => keys.has(valueKey(value)) !== negative)
    }
    case 'contains':
    case 'notContains':
    case 'startsWith':
    case 'endsWith': {
      const target = text()
      const match = operator === 'startsWith'
        ? (value: string) => value.startsWith(target)
        : operator === 'endsWith'
          ? (value: string) => value.endsWith(target)
          : (value: string) => value.includes(target)
      return predicate((value) => {
        if (typeof value !== 'string')
          return negative
        return match(condition.ignoreCase ? value.toLowerCase() : value) !== negative
      })
    }
    default:
      throw invalidArgument('未知的筛选运算符', { condition })
  }
}

function compileNode<R, C extends FilterCondition>(node: FilterNode<C>, options: CompileFilterOptions<R, C>): Predicate<R> | null {
  if (!('conditions' in node))
    return compileCondition(node, options)
  const parts = node.conditions
    .map(child => compileNode(child, options))
    .filter((part): part is Predicate<R> => part !== null)
  if (parts.length === 0)
    return null
  if (parts.length === 1)
    return parts[0]!
  return node.logic === 'and'
    ? row => parts.every(part => part(row))
    : row => parts.some(part => part(row))
}

/**
 * 把条件树编译成行谓词；没有条件树时全部行通过。
 *
 * 缺失值语义（缺失见 `isMissing`）：
 * - isEmpty 匹配缺失值，isNotEmpty 匹配非缺失值；
 * - 正向运算符（eq、gt、between、in、contains……）不匹配缺失值；
 * - 否定运算符（neq、notIn、notContains）是对应正向运算符的补集，因而匹配缺失值；
 * - 操作数为空（缺失值，或去掉缺失元素后为空的数组）的条件不参与筛选；
 *   between 的一端为空即不设该端，两端都空不参与筛选；
 * - 组里的条件全都不参与时，组也不参与；整棵树都不参与时全部行通过。
 *
 * 比较语义：相等与 in 按 `valueKey` 判同；大小比较只在同类型（数值、字符串、布尔、Date）之间成立，
 * 用 `compareMixed`；字符串运算符只匹配字符串值。换算由 normalize 给出，先换算再比较。
 *
 * 操作数形状不对（大小比较给了数组、between 不是两项、字符串运算符给了非字符串）时抛
 * `XH_VIZ_FILTER_OPERAND`，`detail.condition` 是出问题的条件。
 */
export function compileFilter<R = Readonly<Record<string, unknown>>, C extends FilterCondition = FilterCondition>(
  node: FilterNode<C> | undefined,
  options: CompileFilterOptions<R, C> = {},
): (row: R) => boolean {
  return (node ? compileNode(node, options) : null) ?? (() => true)
}
