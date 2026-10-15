import { describe, expect, it } from 'vitest'
import { compileFormPattern } from '../src'

describe('作者正则的编译', () => {
  it('编译成功；整串匹配时包成 ^(?:源码)$', () => {
    const partial = compileFormPattern('\\d+')
    expect(partial.ok && partial.regex.test('a1b')).toBe(true)
    const full = compileFormPattern('\\d+', { fullMatch: true })
    expect(full.ok && [full.regex.test('123'), full.regex.test('a1b')]).toEqual([true, false])
  })

  it('整串匹配不被源码里的选择分支打破', () => {
    const full = compileFormPattern('a|b', { fullMatch: true })
    expect(full.ok && [full.regex.test('a'), full.regex.test('ab'), full.regex.test('xb')]).toEqual([true, false, false])
  })

  it('标志：缺省只允许 imsu，重复与不认识的都不行，可以放宽', () => {
    expect(compileFormPattern('a', { flags: 'iu' }).ok).toBe(true)
    expect(compileFormPattern('a', { flags: 'g' })).toEqual({ ok: false, code: 'invalid-flags' })
    expect(compileFormPattern('a', { flags: 'ii' })).toEqual({ ok: false, code: 'invalid-flags' })
    expect(compileFormPattern('a', { flags: 'x' })).toEqual({ ok: false, code: 'invalid-flags' })
    expect(compileFormPattern('a', { flags: 'g', allowedFlags: 'gimsu' }).ok).toBe(true)
  })

  it('长度上限与语法错误', () => {
    expect(compileFormPattern('a'.repeat(1001))).toEqual({ ok: false, code: 'too-long' })
    expect(compileFormPattern('a'.repeat(10), { maxLength: 5 })).toEqual({ ok: false, code: 'too-long' })
    expect(compileFormPattern('(')).toEqual({ ok: false, code: 'invalid-pattern' })
    expect(compileFormPattern('a)|(b', { fullMatch: true })).toEqual({ ok: false, code: 'invalid-pattern' })
    expect(compileFormPattern(1 as never)).toEqual({ ok: false, code: 'invalid-pattern' })
  })
})
