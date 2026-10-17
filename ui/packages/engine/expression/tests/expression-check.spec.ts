import { describe, expect, it } from 'vitest'
import { createExpressionCheck, createExpressionEngine } from '../src'

describe('createExpressionCheck', () => {
  const engine = createExpressionEngine()

  it('编译通过时为空数组，失败时是 compile 报出的全部问题', () => {
    const check = createExpressionCheck(engine)
    expect(check('price * qty')).toEqual([])
    const result = engine.compile('price *')
    expect(result.ok).toBe(false)
    expect(check('price *')).toEqual(result.ok ? [] : result.issues)
    expect(check('price *').length).toBeGreaterThan(0)
  })

  it('identifiers 与 compile 的同名选项相同：不在其中的名字报未知名字', () => {
    const check = createExpressionCheck(engine, { identifiers: ['price', 'qty'] })
    expect(check('price * qty')).toEqual([])
    expect(check('price * amont')).toEqual([{ code: 'XH_EXPR_UNKNOWN_IDENTIFIER', start: 8, end: 13, data: { name: 'amont' } }])
    const byFunction = createExpressionCheck(engine, { identifiers: name => name.startsWith('$') })
    expect(byFunction('$user + 1')).toEqual([])
    expect(byFunction('user + 1').map(issue => issue.code)).toEqual(['XH_EXPR_UNKNOWN_IDENTIFIER'])
  })

  it('用的是传入引擎的函数表', () => {
    const bare = createExpressionEngine({ builtins: 'none' })
    expect(createExpressionCheck(bare)('SUM(1)').map(issue => issue.code)).toEqual(['XH_EXPR_UNKNOWN_FUNCTION'])
    expect(createExpressionCheck(engine)('SUM(1)')).toEqual([])
  })
})
