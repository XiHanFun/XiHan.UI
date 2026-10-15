import type { EngineCompileResult, ExpressionEngine } from '../src'
import { describe, expect, it } from 'vitest'
import { conditionOf, createExpressionEngine, evaluateSource } from '../src'

function countingEngine(): ExpressionEngine & { readonly compiled: string[] } {
  const inner = createExpressionEngine()
  const compiled: string[] = []
  return {
    compiled,
    compile: (source, options) => {
      compiled.push(source)
      return inner.compile(source, options)
    },
  }
}

describe('按源码求值', () => {
  it('编译并求值，结果是普通 JS 值', () => {
    const engine = createExpressionEngine()
    expect(evaluateSource(engine, 'price * qty', { price: 1.5, qty: 2 })).toEqual({ ok: true, value: 3 })
  })

  it('编译失败时以第一条问题作为求值失败', () => {
    const engine = createExpressionEngine()
    expect(evaluateSource(engine, 'FOO(1) + (', {})).toEqual({ ok: false, issue: { code: 'XH_EXPR_UNEXPECTED_END', start: 10, end: 10 } })
  })

  it('求值失败照原样返回', () => {
    const engine = createExpressionEngine()
    const outcome = evaluateSource(engine, 'a / 0', { a: 1 })
    expect(outcome.ok).toBe(false)
    expect(!outcome.ok && outcome.issue.code).toBe('XH_EXPR_DIVISION_BY_ZERO')
  })

  it('传入缓存时同一源码只编译一次，编译失败的结果同样复用', () => {
    const engine = countingEngine()
    const cache = new Map<string, EngineCompileResult>()
    for (const a of [1, 2, 3])
      expect(evaluateSource(engine, 'a + 1', { a }, cache)).toEqual({ ok: true, value: a + 1 })
    evaluateSource(engine, '1 +', {}, cache)
    evaluateSource(engine, '1 +', {}, cache)
    expect(engine.compiled).toEqual(['a + 1', '1 +'])
  })

  it('不传缓存时每次都编译', () => {
    const engine = countingEngine()
    evaluateSource(engine, 'a', { a: 1 })
    evaluateSource(engine, 'a', { a: 2 })
    expect(engine.compiled).toEqual(['a', 'a'])
  })

  it('引擎编译失败却没有给出问题时抛 TypeError', () => {
    const engine: ExpressionEngine = { compile: () => ({ ok: false, issues: [] }) }
    expect(() => evaluateSource(engine, 'x', {})).toThrow(TypeError)
  })
})

describe('条件判定', () => {
  const engine = createExpressionEngine()
  const condition = (source: string, scope: Record<string, unknown> = {}): ReturnType<typeof conditionOf> =>
    conditionOf(evaluateSource(engine, source, scope))

  it('true 成立，false 与 null 不成立', () => {
    expect(condition('1 < 2')).toBe(true)
    expect(condition('1 > 2')).toBe(false)
    expect(condition('null')).toBe(false)
    expect(condition('a > 1', { a: null })).toBe(false)
  })

  it('结果不是布尔也不是 null 时为 not-boolean', () => {
    expect(condition('1')).toBe('not-boolean')
    expect(condition('"true"')).toBe('not-boolean')
    expect(condition('[true]')).toBe('not-boolean')
  })

  it('求值失败时为 failed', () => {
    expect(condition('1 / 0 > 0')).toBe('failed')
    expect(condition('1 +')).toBe('failed')
  })
})
