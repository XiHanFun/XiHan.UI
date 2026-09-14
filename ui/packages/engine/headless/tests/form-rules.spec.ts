import { describe, expect, it, vi } from 'vitest'
import { runFieldRules } from '../src/form/form.rules'

describe('表单正则规则的幂等性', () => {
  it.each(['', 'g', 'y'])('同一个 %s 正则连续校验相同输入时结果一致', (flags) => {
    const rule = { pattern: new RegExp('^a$', flags), message: '格式不正确' }
    const outcomes = Array.from({ length: 3 }, () => runFieldRules(rule, 'a', { name: 'a' }, 'name', undefined))
    expect(outcomes).toEqual([undefined, undefined, undefined])
    expect(rule.pattern.lastIndex).toBe(0)
  })

  it.each(['g', 'y'])('不读取也不修改调用者 %s 正则的已有 lastIndex', (flags) => {
    const pattern = new RegExp('^a$', flags)
    pattern.lastIndex = 1
    const rule = { pattern, message: '格式不正确' }

    expect(runFieldRules(rule, 'a', { name: 'a' }, 'name', undefined)).toBeUndefined()
    expect(pattern.lastIndex).toBe(1)
    expect(runFieldRules(rule, 'b', { name: 'b' }, 'name', undefined)).toBe('格式不正确')
    expect(pattern.lastIndex).toBe(1)
    expect(runFieldRules(rule, 'a', { name: 'a' }, 'name', undefined)).toBeUndefined()
    expect(pattern.lastIndex).toBe(1)
  })

  it('匹配失败时保留首败即停，不运行后续异步校验', () => {
    const validator = vi.fn(async () => undefined)
    const rules = [{ pattern: /^a$/g, message: '格式不正确' }, { validator }]

    expect(runFieldRules(rules, 'b', { name: 'b' }, 'name', undefined)).toBe('格式不正确')
    expect(validator).not.toHaveBeenCalled()
  })

  it('跨异步规则重复校验时，前后的正则都按相同顺序得到相同结果', async () => {
    const order: string[] = []
    const rules = [
      { pattern: /^a$/g },
      { validator: async () => {
        order.push('异步校验')
        return undefined
      } },
      { pattern: /^a$/y, validator: () => {
        order.push('末项校验')
        return undefined
      } },
    ]

    await expect(runFieldRules(rules, 'a', { name: 'a' }, 'name', undefined)).resolves.toBeUndefined()
    await expect(runFieldRules(rules, 'a', { name: 'a' }, 'name', undefined)).resolves.toBeUndefined()
    expect(order).toEqual(['异步校验', '末项校验', '异步校验', '末项校验'])
  })
})
