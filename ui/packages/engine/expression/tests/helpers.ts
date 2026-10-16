import type { EvaluateOptions, EvaluateScope, ExpressionIssue, ExpressionNode, ExprValue, ParseOptions } from '../src'
import { evaluate, ExprDate, ExprList, ExprNumber, ExprRecord, parse, toPlain } from '../src'

/** 解析成功时返回语法树，失败时抛出带问题的错误。 */
export function ast(source: string, options?: ParseOptions): ExpressionNode {
  const result = parse(source, options)
  if (!result.ok)
    throw new Error(`解析失败：${JSON.stringify(result.issue)}`)
  return result.ast
}

/** 求值成功时返回值，失败时抛出带问题的错误。 */
export function value(source: string, scope?: EvaluateScope, options?: EvaluateOptions): ExprValue {
  const result = evaluate(ast(source), scope, options)
  if (!result.ok)
    throw new Error(`求值失败：${JSON.stringify(result.issue)}`)
  return result.value
}

/** 把值转成便于断言的形态：数字与日期取规范文本，列表与记录取普通值。 */
export function show(result: ExprValue): unknown {
  if (result instanceof ExprNumber || result instanceof ExprDate)
    return result.toString()
  if (result instanceof ExprList)
    return result.toArray().map(show)
  if (result instanceof ExprRecord)
    return toPlain(result)
  return result
}

/** 求值并转成便于断言的形态。 */
export function run(source: string, scope?: EvaluateScope, options?: EvaluateOptions): unknown {
  return show(value(source, scope, options))
}

/** 解析或求值失败时返回问题；成功时抛错。 */
export function issue(source: string, scope?: EvaluateScope, options?: EvaluateOptions & ParseOptions): ExpressionIssue {
  const parsed = parse(source, options)
  if (!parsed.ok)
    return parsed.issue
  const result = evaluate(parsed.ast, scope, options)
  if (result.ok)
    throw new Error(`预期失败，实际得到 ${JSON.stringify(show(result.value))}`)
  return result.issue
}

/** 去掉语法树里的区间，只留结构。 */
export function shape(node: unknown): unknown {
  if (Array.isArray(node))
    return node.map(shape)
  if (typeof node !== 'object' || node === null)
    return node
  const out: Record<string, unknown> = {}
  for (const [key, child] of Object.entries(node)) {
    if (key !== 'start' && key !== 'end')
      out[key] = shape(child)
  }
  return out
}
