/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 按源码求值与条件判定：表达式以源码字符串保存的宿主，在求值处共用的两步。

import type { EngineCompileResult, EngineEvaluation, ExpressionEngine } from './engine'

/**
 * 编译一段源码并在 `scope` 上求值。
 * 编译失败时以第一条问题作为求值失败返回；引擎编译失败却没有给出问题时抛 `TypeError`。
 * 传入 `cache` 时按源码复用编译结果，宿主在一轮批量求值里建一个即可；不传时每次都编译，引擎仍会缓存语法树。
 */
export function evaluateSource(
  engine: ExpressionEngine,
  source: string,
  scope: Readonly<Record<string, unknown>>,
  cache?: Map<string, EngineCompileResult>,
): EngineEvaluation {
  let compiled = cache?.get(source)
  if (compiled === undefined) {
    compiled = engine.compile(source)
    cache?.set(source, compiled)
  }
  if (compiled.ok)
    return compiled.evaluate(scope)
  const issue = compiled.issues[0]
  if (issue === undefined)
    throw new TypeError(`表达式引擎编译「${source}」失败却没有给出问题`)
  return { ok: false, issue }
}

/** 条件判定的结果：成立与否，或结果既不是布尔也不是 null（`'not-boolean'`），或求值失败（`'failed'`）。 */
export type ConditionResult = boolean | 'not-boolean' | 'failed'

/** 把一次求值解释成条件：`true` 成立，`false` 与 `null` 不成立，其余结果为 `'not-boolean'`，求值失败为 `'failed'`。 */
export function conditionOf(evaluation: EngineEvaluation): ConditionResult {
  if (!evaluation.ok)
    return 'failed'
  if (evaluation.value === null)
    return false
  return typeof evaluation.value === 'boolean' ? evaluation.value : 'not-boolean'
}
