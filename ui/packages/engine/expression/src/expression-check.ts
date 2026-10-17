/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 给编辑器用的检查函数：交给表达式输入框，边输入边报问题。
import type { EngineCompileOptions, ExpressionEngine } from './engine'
import type { ExpressionIssue } from './issues'

/**
 * 用引擎的 `compile` 做检查：编译失败时返回它报出的全部问题，成功时返回空数组。
 * 返回的函数同步、无副作用，可直接作为表达式输入框的 `check`；`identifiers` 与 `compile` 的同名选项相同。
 */
export function createExpressionCheck(engine: ExpressionEngine, options: EngineCompileOptions = {}): (source: string) => readonly ExpressionIssue[] {
  return (source) => {
    const result = engine.compile(source, options)
    return result.ok ? [] : result.issues
  }
}
