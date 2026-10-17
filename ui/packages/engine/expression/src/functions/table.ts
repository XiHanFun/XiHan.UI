/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 函数表：内置函数的选取与宿主函数的登记、包装和查找。
import type { ExprDate } from '../date'
import type { ExprValue } from '../value'
import type { FunctionEntry, FunctionSignature, Runtime } from './entry'
import { Fault } from '../issues'
import { fromHost } from '../value'
import { AGGREGATE_FUNCTIONS } from './aggregate'
import { DATE_FUNCTIONS } from './date'
import { paramCount } from './entry'
import { invalidArgument, typeMismatch } from './helpers'
import { LOGIC_FUNCTIONS } from './logic'
import { MATH_FUNCTIONS } from './math'
import { TEXT_FUNCTIONS } from './text'

/** 宿主函数返回的失败标记，只能由 `FunctionContext` 产生。 */
export type FunctionFailure = Fault

/** 宿主函数执行时拿到的上下文。 */
export interface FunctionContext {
  /** 宿主提供的当前时间；没有提供时为 `null`。 */
  readonly now: ExprDate | null
  /** 第 `index` 个实参取值不合法。 */
  readonly invalidArgument: (index: number) => FunctionFailure
  /** 第 `index` 个实参类型不符。 */
  readonly typeMismatch: (index: number) => FunctionFailure
}

/**
 * 宿主登记的函数。`name` 是大写 ASCII 字母、数字与下划线，以字母开头；
 * `call` 必须是纯函数：同样的实参永远返回同样的结果，不读时钟、随机数或外部状态。
 * 返回值可以是表达式值，也可以是能转换成表达式值的 JS 值；抛出的异常记为 `XH_EXPR_FUNCTION_FAILED`。
 * `params` 可省略；给出时是小写字母开头的英文键，互不重复，个数与签名里的规定一致。
 */
export interface FunctionDefinition extends Omit<FunctionSignature, 'params'> {
  readonly params?: readonly string[]
  readonly call: (args: readonly ExprValue[], context: FunctionContext) => unknown
}

/** 创建函数表的选项。 */
export interface FunctionTableOptions {
  /** 要启用的内置函数：`'all'`（缺省）、`'none'` 或名单。 */
  readonly builtins?: 'all' | 'none' | readonly string[]
  /** 宿主函数，名字不得与已启用的内置函数重复。 */
  readonly functions?: readonly FunctionDefinition[]
}

const FUNCTION_NAME = /^[A-Z][A-Z0-9_]*$/
const PARAM_NAME = /^[a-z][A-Za-z0-9]*$/

/** 全部内置函数。 */
export const BUILTIN_FUNCTIONS: readonly FunctionEntry[] = /* @__PURE__ */ LOGIC_FUNCTIONS.concat(MATH_FUNCTIONS, AGGREGATE_FUNCTIONS, TEXT_FUNCTIONS, DATE_FUNCTIONS)

function wrapDefinition(definition: FunctionDefinition): FunctionEntry {
  const { name, minArgs, maxArgs, call } = definition
  return Object.freeze({
    name,
    params: Object.freeze([...definition.params ?? []]),
    minArgs,
    maxArgs,
    invoke: (args: readonly ExprValue[], runtime: Runtime) => {
      const context: FunctionContext = Object.freeze({
        now: runtime.now,
        invalidArgument,
        typeMismatch: (index: number) => typeMismatch(index, args[index] ?? null),
      })
      let result: unknown
      try {
        result = call(args, context)
      }
      catch {
        return new Fault('XH_EXPR_FUNCTION_FAILED')
      }
      return result instanceof Fault ? result : fromHost(result)
    },
  })
}

function assertSignature(definition: FunctionDefinition): void {
  const { name, minArgs, maxArgs, call } = definition
  if (typeof name !== 'string' || !FUNCTION_NAME.test(name))
    throw new TypeError(`函数名 ${String(name)} 必须是大写字母开头的 A-Z、0-9、_`)
  if (!Number.isSafeInteger(minArgs) || minArgs < 0)
    throw new TypeError(`函数 ${name} 的 minArgs 必须是非负整数`)
  if (maxArgs !== null && (!Number.isSafeInteger(maxArgs) || maxArgs < minArgs))
    throw new TypeError(`函数 ${name} 的 maxArgs 必须是不小于 minArgs 的整数或 null`)
  const { params } = definition
  if (params !== undefined) {
    if (!Array.isArray(params) || params.some(param => typeof param !== 'string' || !PARAM_NAME.test(param)))
      throw new TypeError(`函数 ${name} 的 params 必须是小写字母开头的英文键`)
    if (new Set(params).size !== params.length)
      throw new TypeError(`函数 ${name} 的 params 有重复的键`)
    if (params.length !== paramCount(minArgs, maxArgs))
      throw new TypeError(`函数 ${name} 的 params 应有 ${paramCount(minArgs, maxArgs)} 个`)
  }
  if (typeof call !== 'function')
    throw new TypeError(`函数 ${name} 的 call 必须是函数`)
}

/** 各函数表的表项：大写名字 → 表项。 */
const TABLE_ENTRIES = /* @__PURE__ */ new WeakMap<FunctionTable, ReadonlyMap<string, FunctionEntry>>()

/** 函数表：按名字查函数，名字不区分 ASCII 大小写。 */
export class FunctionTable {
  constructor(options: FunctionTableOptions = {}) {
    const entries = new Map<string, FunctionEntry>()
    const selection = options.builtins ?? 'all'
    if (selection !== 'none') {
      const wanted = selection === 'all' ? null : new Set(selection.map(name => name.toUpperCase()))
      if (wanted !== null) {
        for (const name of wanted) {
          if (!BUILTIN_FUNCTIONS.some(entry => entry.name === name))
            throw new TypeError(`没有名为 ${name} 的内置函数`)
        }
      }
      for (const entry of BUILTIN_FUNCTIONS) {
        if (wanted === null || wanted.has(entry.name))
          entries.set(entry.name, entry)
      }
    }
    for (const definition of options.functions ?? []) {
      assertSignature(definition)
      if (entries.has(definition.name))
        throw new TypeError(`函数 ${definition.name} 重复登记`)
      entries.set(definition.name, wrapDefinition(definition))
    }
    TABLE_ENTRIES.set(this, entries)
    Object.freeze(this)
  }

  /** 全部函数名，按字母序。 */
  get names(): readonly string[] {
    return [...TABLE_ENTRIES.get(this)!.keys()].sort()
  }

  /** 按名字查签名；名字不区分 ASCII 大小写。 */
  lookup(name: string): FunctionSignature | undefined {
    const entry = resolveFunction(this, name)
    return entry === undefined ? undefined : { name: entry.name, minArgs: entry.minArgs, maxArgs: entry.maxArgs, params: entry.params }
  }
}

/** 按名字查表项，供求值器调用。 */
export function resolveFunction(table: FunctionTable, name: string): FunctionEntry | undefined {
  return TABLE_ENTRIES.get(table)!.get(asciiUpper(name))
}

function asciiUpper(text: string): string {
  return text.replace(/[a-z]/g, char => String.fromCharCode(char.charCodeAt(0) - 32))
}

/** 创建函数表。 */
export function createFunctionTable(options?: FunctionTableOptions): FunctionTable {
  return new FunctionTable(options)
}

/** 只含全部内置函数的缺省函数表。 */
export const DEFAULT_FUNCTION_TABLE: FunctionTable = /* @__PURE__ */ createFunctionTable()
