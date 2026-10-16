import type { CompiledExpression, EngineCompileResult } from '../src'
import { describe, expect, it } from 'vitest'
import { createExpressionEngine, ExprDate, ExprNumber } from '../src'

function compiled(result: EngineCompileResult): CompiledExpression {
  if (!result.ok)
    throw new Error(`编译失败：${JSON.stringify(result.issues)}`)
  return result
}

describe('表达式引擎：编译', () => {
  it('编译成功时给出顶层变量名：按源码顺序去重，不含函数名', () => {
    const engine = createExpressionEngine()
    const result = compiled(engine.compile('SUM(items.amount) + price * qty - price + $row.discount + ROUND(x[k], 2)'))
    expect(result.references).toEqual(['items', 'price', 'qty', '$row', 'x', 'k'])
    expect(Object.isFrozen(result.references)).toBe(true)
  })

  it('解析失败与检查失败都给出全部问题', () => {
    const engine = createExpressionEngine()
    expect(engine.compile('1 +')).toEqual({ ok: false, issues: [{ code: 'XH_EXPR_UNEXPECTED_END', start: 3, end: 3 }] })
    const result = engine.compile('FOO(a) + b', { identifiers: ['a'] })
    expect(result.ok).toBe(false)
    expect(!result.ok && result.issues.map(issue => issue.code)).toEqual(['XH_EXPR_UNKNOWN_FUNCTION', 'XH_EXPR_UNKNOWN_IDENTIFIER'])
  })

  it('名单可以是谓词', () => {
    const engine = createExpressionEngine()
    expect(engine.compile('$user + a', { identifiers: name => name.startsWith('$') }).ok).toBe(false)
    expect(engine.compile('$user', { identifiers: name => name.startsWith('$') }).ok).toBe(true)
  })

  it('同一个源码多次编译结果一致，缓存满了也照常工作', () => {
    const engine = createExpressionEngine()
    for (let index = 0; index < 600; index += 1)
      expect(compiled(engine.compile(`a + ${index}`)).references).toEqual(['a'])
    expect(compiled(engine.compile('a + 0')).evaluate({ a: 1 })).toEqual({ ok: true, value: 1 })
  })

  it('source 不是字符串时抛 TypeError', () => {
    expect(() => createExpressionEngine().compile(1 as never)).toThrow(TypeError)
  })
})

describe('表达式引擎：求值', () => {
  it('结果是普通 JS 值：数字转 JS 数字，日期转规范文本，列表与记录深拷贝', () => {
    const engine = createExpressionEngine()
    expect(compiled(engine.compile('0.1 + 0.2')).evaluate({})).toEqual({ ok: true, value: 0.3 })
    expect(compiled(engine.compile('DATE(2026, 10, 16)')).evaluate({})).toEqual({ ok: true, value: '2026-10-16' })
    expect(compiled(engine.compile('[a, r]')).evaluate({ a: 1, r: { x: [true] } })).toEqual({ ok: true, value: [1, { x: [true] }] })
  })

  it('求值失败时给出问题，从不抛异常', () => {
    const run = compiled(createExpressionEngine().compile('1 / x'))
    expect(run.evaluate({ x: 0 })).toEqual({ ok: false, issue: { code: 'XH_EXPR_DIVISION_BY_ZERO', start: 0, end: 5 } })
    expect(run.evaluate({ x: () => 1 })).toMatchObject({ ok: false, issue: { code: 'XH_EXPR_UNSUPPORTED_VALUE' } })
  })

  it('结果里有不可表示的值或环时给出问题', () => {
    const engine = createExpressionEngine()
    expect(compiled(engine.compile('items')).evaluate({ items: [() => 1] })).toMatchObject({ ok: false, issue: { code: 'XH_EXPR_UNSUPPORTED_VALUE', start: 0, end: 5 } })
    const cyclic: Record<string, unknown> = {}
    cyclic.self = cyclic
    expect(compiled(engine.compile('a')).evaluate({ a: cyclic })).toMatchObject({ ok: false, issue: { code: 'XH_EXPR_DEPTH_LIMIT' } })
  })

  it('当前时间：固定日期或每次求值时调用的函数', () => {
    const fixed = createExpressionEngine({ now: ExprDate.fromParts(2026, 10, 16, 9)! })
    expect(compiled(fixed.compile('NOW()')).evaluate({})).toEqual({ ok: true, value: '2026-10-16T09:00:00' })
    let hour = 1
    const ticking = createExpressionEngine({ now: () => ExprDate.fromParts(2026, 1, 1, hour++) })
    const run = compiled(ticking.compile('HOUR(NOW())'))
    expect([run.evaluate({}), run.evaluate({})]).toEqual([{ ok: true, value: 1 }, { ok: true, value: 2 }])
    expect(compiled(createExpressionEngine().compile('TODAY()')).evaluate({})).toMatchObject({ ok: false, issue: { code: 'XH_EXPR_NOW_UNAVAILABLE' } })
    expect(compiled(createExpressionEngine({ now: () => null }).compile('NOW()')).evaluate({})).toMatchObject({ ok: false, issue: { code: 'XH_EXPR_NOW_UNAVAILABLE' } })
  })

  it('内置函数与宿主函数', () => {
    const none = createExpressionEngine({ builtins: 'none' })
    expect(none.compile('SUM(1)').ok).toBe(false)
    const custom = createExpressionEngine({
      builtins: ['ROUND'],
      functions: [{ name: 'TAX', minArgs: 1, maxArgs: 1, call: ([amount]) => (amount instanceof ExprNumber ? amount.toJs() * 0.1 : null) }],
    })
    expect(compiled(custom.compile('ROUND(TAX(a), 2)')).evaluate({ a: 123.45 })).toEqual({ ok: true, value: 12.35 })
    expect(custom.compile('SUM(1)').ok).toBe(false)
  })

  it('上限：源码长度、深度、步数、字符串长度', () => {
    const engine = createExpressionEngine({ limits: { maxLength: 20, maxSteps: 50, maxStringLength: 5, maxDepth: 10 } })
    expect(engine.compile('a'.repeat(21))).toMatchObject({ ok: false, issues: [{ code: 'XH_EXPR_TOO_LONG' }] })
    expect(engine.compile(`a${' + a'.repeat(3)}`).ok).toBe(true)
    expect(compiled(engine.compile('SUM(items)')).evaluate({ items: Array.from({ length: 100 }).fill(1) })).toMatchObject({ ok: false, issue: { code: 'XH_EXPR_STEP_LIMIT' } })
    expect(compiled(engine.compile('CONCAT(a, a)')).evaluate({ a: 'abc' })).toMatchObject({ ok: false, issue: { code: 'XH_EXPR_STRING_TOO_LONG' } })
  })

  it('选项不合法时抛 TypeError', () => {
    expect(() => createExpressionEngine({ limits: { maxSteps: 0 } })).toThrow(TypeError)
    expect(() => createExpressionEngine({ now: new Date() as never })).toThrow(TypeError)
    expect(() => createExpressionEngine({ builtins: ['NOPE'] })).toThrow(TypeError)
  })

  it('多个引擎互不影响', () => {
    const a = createExpressionEngine({ builtins: 'none' })
    const b = createExpressionEngine()
    expect(a.compile('SUM(1)').ok).toBe(false)
    expect(b.compile('SUM(1)').ok).toBe(true)
  })
})
