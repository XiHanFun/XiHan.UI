/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 表达式引擎：把解析、检查、求值与结果转换收成一个可注入的对象，四款设计器共用同一个形状。

import type { ExpressionNode } from './ast'
import type { CheckOptions } from './check'
import type { FunctionDefinition } from './functions/table'
import type { ExpressionIssue } from './issues'
import type { ParseResult } from './parser'
import type { PlainValue } from './value'
import { check } from './check'
import { ExprDate } from './date'
import { evaluate } from './evaluate'
import { createFunctionTable } from './functions/table'
import { createIssue } from './issues'
import { DEFAULT_LIMITS, readLimit } from './limits'
import { parse } from './parser'
import { collectReferences } from './references'
import { toPlain } from './value'

/** 编译选项。 */
export interface EngineCompileOptions {
  /** 可引用的顶层名字；提供时，不在其中的名字报 `XH_EXPR_UNKNOWN_IDENTIFIER`。 */
  readonly identifiers?: CheckOptions['identifiers']
}

/** 求值结果：成功时是 JSON 能表示的普通 JS 值（数字转 JS 数字，日期转规范文本）。 */
export type EngineEvaluation
  = | { readonly ok: true, readonly value: unknown }
    | { readonly ok: false, readonly issue: ExpressionIssue }

/** 编译成功的表达式。 */
export interface CompiledExpression {
  readonly ok: true
  /** 引用的顶层变量名，按源码顺序去重，不含函数名。 */
  readonly references: readonly string[]
  /** 在作用域上求值；作用域是普通对象，键是顶层变量名。从不抛异常。 */
  readonly evaluate: (scope: Readonly<Record<string, unknown>>) => EngineEvaluation
}

/** 编译结果：成功时可求值，失败时带全部问题。 */
export type EngineCompileResult
  = | CompiledExpression
    | { readonly ok: false, readonly issues: readonly ExpressionIssue[] }

/** 表达式引擎：四款设计器注入表达式能力的统一形状。 */
export interface ExpressionEngine {
  readonly compile: (source: string, options?: EngineCompileOptions) => EngineCompileResult
}

/** 创建引擎的选项。 */
export interface ExpressionEngineOptions {
  /** 启用的内置函数：`'all'`（缺省）、`'none'` 或名单。 */
  readonly builtins?: 'all' | 'none' | readonly string[]
  /** 宿主登记的函数。 */
  readonly functions?: readonly FunctionDefinition[]
  /** 当前时间：固定的日期，或每次求值时调用的函数；缺省不提供，`NOW()` / `TODAY()` 报问题。 */
  readonly now?: ExprDate | (() => ExprDate | null)
  /** 上限，缺省见 `DEFAULT_LIMITS`。 */
  readonly limits?: {
    readonly maxLength?: number
    readonly maxDepth?: number
    readonly maxSteps?: number
    readonly maxStringLength?: number
  }
}

/** 引擎缓存的语法树条数上限。 */
const PARSE_CACHE_LIMIT = 512

function topLevelNames(ast: ExpressionNode): string[] {
  return [...new Set(collectReferences(ast).map(reference => reference.path[0]!))]
}

function plainResult(ast: ExpressionNode, value: Parameters<typeof toPlain>[0]): EngineEvaluation {
  let plain: PlainValue
  try {
    plain = toPlain(value)
  }
  catch (error) {
    const code = error instanceof RangeError ? 'XH_EXPR_DEPTH_LIMIT' : 'XH_EXPR_UNSUPPORTED_VALUE'
    return { ok: false, issue: createIssue(code, ast.start, ast.end) }
  }
  return { ok: true, value: plain }
}

/**
 * 创建表达式引擎。同一个引擎按源码缓存语法树（有上限），检查与求值都不改动它；
 * 不同的引擎互不影响。选项不合法时抛 `TypeError`。
 */
export function createExpressionEngine(options: ExpressionEngineOptions = {}): ExpressionEngine {
  const functions = createFunctionTable({ builtins: options.builtins, functions: options.functions })
  const limits = {
    maxLength: readLimit(options.limits?.maxLength, DEFAULT_LIMITS.maxLength, 'maxLength'),
    maxDepth: readLimit(options.limits?.maxDepth, DEFAULT_LIMITS.maxDepth, 'maxDepth'),
    maxSteps: readLimit(options.limits?.maxSteps, DEFAULT_LIMITS.maxSteps, 'maxSteps'),
    maxStringLength: readLimit(options.limits?.maxStringLength, DEFAULT_LIMITS.maxStringLength, 'maxStringLength'),
  }
  const now = options.now
  if (now !== undefined && typeof now !== 'function' && !(now instanceof ExprDate))
    throw new TypeError('now 必须是 ExprDate 或返回 ExprDate 的函数')
  const cache = new Map<string, ParseResult>()

  const parsed = (source: string): ParseResult => {
    const hit = cache.get(source)
    if (hit !== undefined) {
      cache.delete(source)
      cache.set(source, hit)
      return hit
    }
    const result = parse(source, { maxLength: limits.maxLength, maxDepth: limits.maxDepth })
    cache.set(source, result)
    if (cache.size > PARSE_CACHE_LIMIT)
      cache.delete(cache.keys().next().value!)
    return result
  }

  const currentTime = (): ExprDate | null => {
    if (now === undefined)
      return null
    if (typeof now === 'function') {
      const value = now()
      if (value !== null && !(value instanceof ExprDate))
        throw new TypeError('now 函数必须返回 ExprDate 或 null')
      return value
    }
    return now
  }

  const compile = (source: string, compileOptions: EngineCompileOptions = {}): EngineCompileResult => {
    if (typeof source !== 'string')
      throw new TypeError('source 必须是字符串')
    const result = parsed(source)
    if (!result.ok)
      return { ok: false, issues: Object.freeze([result.issue]) }
    const ast = result.ast
    const issues = check(ast, { identifiers: compileOptions.identifiers, functions, maxDepth: limits.maxDepth })
    if (issues.length > 0)
      return { ok: false, issues }
    return Object.freeze({
      ok: true as const,
      references: Object.freeze(topLevelNames(ast)),
      evaluate: (scope: Readonly<Record<string, unknown>>): EngineEvaluation => {
        const outcome = evaluate(ast, scope, { functions, now: currentTime(), maxSteps: limits.maxSteps, maxDepth: limits.maxDepth, maxStringLength: limits.maxStringLength })
        return outcome.ok ? plainResult(ast, outcome.value) : { ok: false, issue: outcome.issue }
      },
    })
  }

  return Object.freeze({ compile })
}
