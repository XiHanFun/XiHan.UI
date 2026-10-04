import { describe, expect, it, vi } from 'vitest'
import { formValidateMessages, runFieldRules } from '../src/form/form.rules'
import { zhCN } from '../src/locale'

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

describe('校验报错的文案来源', () => {
  const required = { required: true }

  it('什么都没给时取英文语言包', () => {
    expect(runFieldRules(required, '', {}, 'email', undefined)).toBe('email is required')
    expect(runFieldRules({ min: 3 }, 'ab', {}, 'code', undefined)).toBe('code must be at least 3 characters')
  })

  it('translations（全局语言包经它到达）换掉英文；validateMessages 逐条压在它上面，type 按类并', () => {
    const translations = zhCN.translations.form!
    expect(runFieldRules(required, '', {}, 'email', formValidateMessages(undefined, translations))).toBe('email 为必填项')
    const messages = formValidateMessages({ required: '请填写{name}', type: { email: '{name} 格式不对' } }, translations)
    expect(runFieldRules(required, '', {}, '邮箱', messages)).toBe('请填写邮箱')
    expect(runFieldRules({ type: 'email' }, 'x', {}, '邮箱', messages)).toBe('邮箱 格式不对')
    expect(runFieldRules({ type: 'url' }, 'x', {}, '主页', messages)).toBe('主页 不是有效的网址')
    expect(runFieldRules({ max: 2 }, 'abc', {}, '代号', messages)).toBe('代号 不能超过 2 个字符')
  })

  it('规则自己的 message 最优先', () => {
    const messages = formValidateMessages({ required: '请填写{name}' }, zhCN.translations.form)
    expect(runFieldRules({ required: true, message: '必须填' }, '', {}, 'a', messages)).toBe('必须填')
  })
})
