// matrix-code 的码制分派：缺省 qr、不认识的值落 error 态、不静默退回。
import { normalizeProps } from '@xihan-ui/core'
import { describe, expect, it } from 'vitest'
import { connectMatrixCode } from '../src/matrix-code'

const URL_23 = 'https://ui.xihanfun.com'

describe('码制', () => {
  it('缺省 qr：api 与根上的 data-format 都是 qr', () => {
    const api = connectMatrixCode({ value: URL_23 }, normalizeProps)
    expect(api.format).toBe('qr')
    expect(api.state).toBe('ready')
    expect(api.getRootProps()['data-format']).toBe('qr')
  })

  it('显式写 qr 与不写等价：矩阵与两条 d 逐字相同', () => {
    const implicit = connectMatrixCode({ value: URL_23 }, normalizeProps)
    const explicit = connectMatrixCode({ format: 'qr', value: URL_23 }, normalizeProps)
    expect(explicit.modules).toEqual(implicit.modules)
    expect({ path: explicit.path, eyePath: explicit.eyePath }).toEqual({ path: implicit.path, eyePath: implicit.eyePath })
  })

  it('不认识的码制：落 error 态、说明只认哪些、一个模块都不铺，也不留 logo 位', () => {
    // format 从 DOM 特性来时是任意字符串，类型拦不住
    const api = connectMatrixCode({ format: 'ean13' as never, value: URL_23, logo: true }, normalizeProps)
    expect(api.state).toBe('error')
    expect(api.error).toContain('ean13')
    expect(api.error).toContain('qr')
    expect(api.modules).toEqual([])
    expect(api.version).toBe(0)
    expect({ path: api.path, eyePath: api.eyePath }).toEqual({ path: '', eyePath: '' })
    expect(api.logoArea).toBeUndefined()
    expect(api.logoDamage).toBeUndefined()
  })

  it('不认识的码制原样写到 data-format 上，好让作者看见传错了什么', () => {
    const api = connectMatrixCode({ format: 'ean13' as never, value: URL_23 }, normalizeProps)
    const root = api.getRootProps()
    expect(root['data-format']).toBe('ean13')
    expect(root['data-state']).toBe('error')
    expect(root['data-version']).toBeUndefined()
    expect(root['data-modules']).toBeUndefined()
  })

  it('码制不认识时先于内容判定：空内容也落 error 而不是 empty', () => {
    const api = connectMatrixCode({ format: 'pdf417' as never, value: '' }, normalizeProps)
    expect(api.state).toBe('error')
  })
})
