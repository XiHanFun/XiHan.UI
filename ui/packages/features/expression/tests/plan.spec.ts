import type { ExpressionEntry, ExpressionPlanStep } from '../src'
import { describe, expect, it } from 'vitest'
import { checkExpressions, createExpressionEngine, evaluatePlan, planExpressions } from '../src'

const engine = createExpressionEngine()

function stepsOf(entries: readonly ExpressionEntry[], identifiers?: Iterable<string>): readonly ExpressionPlanStep[] {
  const plan = planExpressions(engine, entries, identifiers === undefined ? {} : { identifiers })
  if (!plan.ok)
    throw new Error(`排序失败：${JSON.stringify(plan.issues)}`)
  return plan.steps
}

describe('依赖排序', () => {
  it('被引用的条目排在前面，互不相关的保持输入顺序', () => {
    const steps = stepsOf([
      { name: 'total', expression: 'subtotal + tax' },
      { name: 'note', expression: '"x"' },
      { name: 'tax', expression: 'subtotal * 0.1' },
      { name: 'subtotal', expression: 'price * qty' },
    ])
    expect(steps.map(step => step.name)).toEqual(['subtotal', 'tax', 'total', 'note'])
  })

  it('引用外部变量不影响顺序，步骤带着编译结果', () => {
    const steps = stepsOf([{ name: 'a', expression: 'x + 1' }])
    expect(steps[0]!.compiled.references).toEqual(['x'])
  })

  it('循环引用报 XH_EXPR_CYCLE，按引用顺序列出环上的名字，同一个环只报一次', () => {
    const plan = planExpressions(engine, [
      { name: 'a', expression: 'b + 1' },
      { name: 'b', expression: 'c + 1' },
      { name: 'c', expression: 'a + b' },
      { name: 'd', expression: 'd' },
    ])
    expect(plan.ok).toBe(false)
    expect(!plan.ok && plan.issues).toEqual([
      { code: 'XH_EXPR_CYCLE', names: ['a', 'b', 'c'] },
      { code: 'XH_EXPR_CYCLE', names: ['b', 'c'] },
      { code: 'XH_EXPR_CYCLE', names: ['d'] },
    ])
  })

  it('编译问题带上条目名与源码区间，同名条目报 XH_EXPR_DUPLICATE_NAME，问题一次全部报出', () => {
    const plan = planExpressions(engine, [
      { name: 'a', expression: '1 +' },
      { name: 'b', expression: 'a' },
      { name: 'b', expression: '2' },
    ])
    expect(!plan.ok && plan.issues).toEqual([
      { code: 'XH_EXPR_DUPLICATE_NAME', name: 'b' },
      { code: 'XH_EXPR_UNEXPECTED_END', name: 'a', start: 3, end: 3 },
    ])
  })

  it('给出 identifiers 时检查未知名字，条目自己的名字总是已知', () => {
    const entries = [{ name: 'tax', expression: 'subtotal * rate' }, { name: 'subtotal', expression: 'price * qty' }]
    expect(checkExpressions(engine, entries, { identifiers: ['price', 'qty'] })).toEqual([
      { code: 'XH_EXPR_UNKNOWN_IDENTIFIER', name: 'tax', start: 11, end: 15, data: { name: 'rate' } },
    ])
    expect(checkExpressions(engine, entries, { identifiers: name => ['price', 'qty', 'rate'].includes(name) })).toEqual([])
    expect(checkExpressions(engine, entries)).toEqual([])
  })
})

describe('按序求值', () => {
  it('每一步可以引用外部变量与此前各步的结果，同名时以步骤结果为准，不修改 scope', () => {
    const steps = stepsOf([
      { name: 'total', expression: 'subtotal + tax' },
      { name: 'tax', expression: 'subtotal * 0.1' },
      { name: 'subtotal', expression: 'price * qty' },
    ])
    const scope = { price: 10, qty: 3, tax: 999 }
    expect(evaluatePlan(steps, scope)).toEqual({ ok: true, values: { subtotal: 30, tax: 3, total: 33 } })
    expect(scope).toEqual({ price: 10, qty: 3, tax: 999 })
  })

  it('遇到求值失败即停，返回失败的条目与问题', () => {
    const steps = stepsOf([{ name: 'ratio', expression: 'a / b' }, { name: 'next', expression: 'ratio + 1' }])
    const outcome = evaluatePlan(steps, { a: 1, b: 0 })
    expect(outcome.ok).toBe(false)
    expect(!outcome.ok && [outcome.name, outcome.issue.code]).toEqual(['ratio', 'XH_EXPR_DIVISION_BY_ZERO'])
  })
})
