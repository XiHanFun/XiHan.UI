/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 一组「名字 = 表达式」的依赖排序、批量校验与按序求值：计算字段、联动赋值等互相引用的表达式共用。

import type { CompiledExpression, EngineCompileOptions, ExpressionEngine } from './engine'
import type { ExpressionIssue, ExpressionIssueCode, ExpressionIssueData } from './issues'

/** 一个待求值的表达式：结果以 `name` 为名，供其余表达式引用。 */
export interface ExpressionEntry {
  readonly name: string
  readonly expression: string
}

/** 排序与校验的选项。 */
export interface PlanOptions {
  /**
   * 表达式之外可引用的顶层名字。给出时，除这些名字与各条目自己的名字外，引用其它名字都报 `XH_EXPR_UNKNOWN_IDENTIFIER`；
   * 不给时不检查未知名字。
   */
  readonly identifiers?: EngineCompileOptions['identifiers']
}

/**
 * 一组表达式的问题：
 * - 某个条目编译不通过：带上条目名与引擎给出的问题码、源码区间。
 * - `XH_EXPR_DUPLICATE_NAME`：两个条目同名。
 * - `XH_EXPR_CYCLE`：条目之间循环引用，`names` 按引用顺序列出环上的名字。
 */
export type ExpressionPlanIssue
  = | { readonly code: ExpressionIssueCode, readonly name: string, readonly start: number, readonly end: number, readonly data?: ExpressionIssueData }
    | { readonly code: 'XH_EXPR_DUPLICATE_NAME', readonly name: string }
    | { readonly code: 'XH_EXPR_CYCLE', readonly names: readonly string[] }

/** 排好序的一步。 */
export interface ExpressionPlanStep {
  readonly name: string
  readonly compiled: CompiledExpression
}

/** 排序结果：全部通过时给出按依赖排好的步骤（被引用的在前），否则给出全部问题。 */
export type ExpressionPlan
  = | { readonly ok: true, readonly steps: readonly ExpressionPlanStep[] }
    | { readonly ok: false, readonly issues: readonly ExpressionPlanIssue[] }

/** 按序求值的结果：成功时是各条目的结果，失败时是第一个求值失败的条目与它的问题。 */
export type PlanEvaluation
  = | { readonly ok: true, readonly values: Readonly<Record<string, unknown>> }
    | { readonly ok: false, readonly name: string, readonly issue: ExpressionIssue }

function compileOptions(names: ReadonlySet<string>, options: PlanOptions): EngineCompileOptions {
  const extra = options.identifiers
  if (extra === undefined)
    return {}
  if (typeof extra === 'function')
    return { identifiers: name => names.has(name) || extra(name) }
  const known = new Set(extra)
  return { identifiers: name => names.has(name) || known.has(name) }
}

/**
 * 编译一组表达式并按相互引用排序：被引用的条目排在前面，与输入顺序无关的部分保持输入顺序。
 * 同名条目、编译问题（含未知名字）与循环引用一次全部报出；有任何问题时不给步骤。
 */
export function planExpressions(engine: ExpressionEngine, entries: readonly ExpressionEntry[], options: PlanOptions = {}): ExpressionPlan {
  const issues: ExpressionPlanIssue[] = []
  const names = new Set<string>()
  for (const entry of entries) {
    if (names.has(entry.name))
      issues.push(Object.freeze({ code: 'XH_EXPR_DUPLICATE_NAME', name: entry.name }))
    names.add(entry.name)
  }
  const compileWith = compileOptions(names, options)
  const compiled = new Map<string, CompiledExpression>()
  for (const entry of entries) {
    if (compiled.has(entry.name))
      continue
    const result = engine.compile(entry.expression, compileWith)
    if (result.ok)
      compiled.set(entry.name, result)
    else
      issues.push(...result.issues.map(issue => Object.freeze({ ...issue, name: entry.name })))
  }

  const steps: ExpressionPlanStep[] = []
  const state = new Map<string, 'visiting' | 'done'>()
  const stack: string[] = []
  const cycles = new Set<string>()
  const visit = (name: string): void => {
    const current = compiled.get(name)!
    state.set(name, 'visiting')
    stack.push(name)
    for (const reference of current.references) {
      if (!compiled.has(reference))
        continue
      const mark = state.get(reference)
      if (mark === 'visiting') {
        const ring = stack.slice(stack.indexOf(reference))
        const key = [...ring].sort().join('\u0000')
        if (!cycles.has(key)) {
          cycles.add(key)
          issues.push(Object.freeze({ code: 'XH_EXPR_CYCLE', names: Object.freeze(ring) }))
        }
      }
      else if (mark === undefined) {
        visit(reference)
      }
    }
    stack.pop()
    state.set(name, 'done')
    steps.push(Object.freeze({ name, compiled: current }))
  }
  for (const name of compiled.keys()) {
    if (!state.has(name))
      visit(name)
  }
  if (issues.length > 0)
    return Object.freeze({ ok: false, issues: Object.freeze(issues) })
  return Object.freeze({ ok: true, steps: Object.freeze(steps) })
}

/** 只校验一组表达式，返回 `planExpressions` 会报出的全部问题；没有问题时为空数组。 */
export function checkExpressions(engine: ExpressionEngine, entries: readonly ExpressionEntry[], options: PlanOptions = {}): readonly ExpressionPlanIssue[] {
  const plan = planExpressions(engine, entries, options)
  return plan.ok ? Object.freeze([]) : plan.issues
}

/**
 * 按排好的步骤依次求值：每一步可以引用 `scope` 里的变量与此前各步的结果，同名时以步骤结果为准。
 * 遇到求值失败即停，返回失败的条目与问题；不修改 `scope`。
 */
export function evaluatePlan(steps: readonly ExpressionPlanStep[], scope: Readonly<Record<string, unknown>>): PlanEvaluation {
  const current: Record<string, unknown> = { ...scope }
  const values: Record<string, unknown> = {}
  for (const step of steps) {
    const outcome = step.compiled.evaluate(current)
    if (!outcome.ok)
      return { ok: false, name: step.name, issue: outcome.issue }
    current[step.name] = outcome.value
    values[step.name] = outcome.value
  }
  return { ok: true, values }
}
