// 码值检查：checkBarCodeValue / checkMatrixCodeValue 返回的问题码，matrixCodeLevelFit 的取值域，以及与 connect 的 error 态一致。
import type { BarCodeFormat, BarEncodeOptions } from '../src/bar-code'
import type { MatrixCodeFormat, MatrixCodeLevel, MatrixCodeValueOptions } from '../src/matrix-code'
import { normalizeProps, resetDiagnostics, setDiagnosticsConsoleOutput } from '@xihan-ui/core'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { BAR_CODE_FORMATS, BAR_FNC1_CHAR, checkBarCodeValue, connectBarCode } from '../src/bar-code'
import { checkMatrixCodeValue, connectMatrixCode, MATRIX_CODE_FORMATS, MATRIX_CODE_LEVEL_RANGES, matrixCodeLevelFit, QR_LEVELS } from '../src/matrix-code'

beforeEach(() => {
  resetDiagnostics()
  setDiagnosticsConsoleOutput(false)
})

afterEach(() => {
  resetDiagnostics()
})

describe('checkBarCodeValue', () => {
  it('能编码的内容返回 undefined', () => {
    expect(checkBarCodeValue('ean13', '400638133393')).toBeUndefined()
    expect(checkBarCodeValue('ean13', '4006381333931')).toBeUndefined()
    expect(checkBarCodeValue('code128', 'XiHan-128')).toBeUndefined()
    expect(checkBarCodeValue('code39', 'XIHAN-39', { checksum: true })).toBeUndefined()
  })

  it.each(BAR_CODE_FORMATS.map(format => [format]))('%s 的空串不算问题，与组件的 empty 态一致', (format) => {
    expect(checkBarCodeValue(format, '')).toBeUndefined()
  })

  it('不认识的码制报 unknown-format，空串也报', () => {
    expect(checkBarCodeValue('qr' as never, '1')).toEqual({ code: 'unknown-format' })
    expect(checkBarCodeValue('qr' as never, '')).toEqual({ code: 'unknown-format' })
  })

  it('字符不在字符集里报 invalid-character，带出那个字符', () => {
    expect(checkBarCodeValue('ean13', '40063A')).toEqual({ code: 'invalid-character', character: 'A' })
    expect(checkBarCodeValue('upce', '01x3456')).toEqual({ code: 'invalid-character', character: 'x' })
    expect(checkBarCodeValue('code128', 'héllo')).toEqual({ code: 'invalid-character', character: 'é' })
    expect(checkBarCodeValue('code39', 'code')).toEqual({ code: 'invalid-character', character: 'c' })
  })

  it('code128 的 GS 只在 gs1 模式下可用', () => {
    const value = `01${BAR_FNC1_CHAR}21`
    expect(checkBarCodeValue('code128', value)).toEqual({ code: 'invalid-character', character: BAR_FNC1_CHAR })
    expect(checkBarCodeValue('code128', value, { gs1: true })).toBeUndefined()
  })

  it('位数不对报 invalid-length，列出接受的位数与收到的位数', () => {
    expect(checkBarCodeValue('ean13', '40063813339')).toEqual({ code: 'invalid-length', lengths: [12, 13], length: 11 })
    expect(checkBarCodeValue('ean8', '123')).toEqual({ code: 'invalid-length', lengths: [7, 8], length: 3 })
    expect(checkBarCodeValue('itf14', '123')).toEqual({ code: 'invalid-length', lengths: [13, 14], length: 3 })
    expect(checkBarCodeValue('upce', '12345')).toEqual({ code: 'invalid-length', lengths: [6, 7, 8], length: 5 })
  })

  it('校验位对不上报 invalid-check-digit，带出应为与收到的值', () => {
    expect(checkBarCodeValue('ean13', '4006381333932')).toEqual({ code: 'invalid-check-digit', expected: 1, actual: 2 })
    expect(checkBarCodeValue('upce', '01234561')).toEqual({ code: 'invalid-check-digit', expected: 5, actual: 1 })
  })

  it('uPC-E 的数字系统位不是 0 或 1 报 invalid-number-system', () => {
    expect(checkBarCodeValue('upce', '2123456')).toEqual({ code: 'invalid-number-system', actual: '2' })
  })

  it.each<[BarCodeFormat, string, BarEncodeOptions]>([
    ['ean13', '400638133393', {}],
    ['ean13', '4006381333932', {}],
    ['ean8', '96385074', {}],
    ['upca', '0360002914', {}],
    ['upce', '0123456', {}],
    ['upce', '2123456', {}],
    ['itf14', '15400141288763', {}],
    ['code128', `01${BAR_FNC1_CHAR}21`, {}],
    ['code128', `01${BAR_FNC1_CHAR}21`, { gs1: true }],
    ['code39', 'XIHAN 39', {}],
    ['code39', 'x', {}],
    ['qr' as never, 'x', {}],
  ])('%s「%s」：有问题当且仅当组件落 error 态', (format, value, options) => {
    const issue = checkBarCodeValue(format, value, options)
    const api = connectBarCode({ format, value, ...options }, normalizeProps)
    expect(issue === undefined).toBe(api.state !== 'error')
  })
})

describe('qR_LEVELS 与 matrixCodeLevelFit', () => {
  it('qR_LEVELS 由低到高列出四档', () => {
    expect(QR_LEVELS).toEqual(['L', 'M', 'Q', 'H'])
  })

  it('mATRIX_CODE_LEVEL_RANGES 给出 pdf417 与 aztec 的上下限，两端都适用、出界即不适用', () => {
    expect(MATRIX_CODE_LEVEL_RANGES).toEqual({ pdf417: { min: 0, max: 8, step: 1 }, aztec: { min: 5, max: 95, step: 1 } })
    for (const format of ['pdf417', 'aztec'] as const) {
      const { min, max } = MATRIX_CODE_LEVEL_RANGES[format]
      expect([min, max].map(level => matrixCodeLevelFit(format, level))).toEqual(['valid', 'valid'])
      expect([min - 1, max + 1].map(level => matrixCodeLevelFit(format, level))).toEqual(['invalid', 'invalid'])
    }
  })

  it.each(MATRIX_CODE_FORMATS.map(format => [format]))('%s 不给级别即 valid', (format) => {
    expect(matrixCodeLevelFit(format, undefined)).toBe('valid')
  })

  it.each<[MatrixCodeFormat, MatrixCodeLevel, string]>([
    ['qr', 'L', 'valid'],
    ['qr', 'H', 'valid'],
    ['qr', 'X' as never, 'invalid'],
    ['qr', 3, 'invalid'],
    ['pdf417', 0, 'valid'],
    ['pdf417', 8, 'valid'],
    ['pdf417', '3' as never, 'valid'],
    ['pdf417', 9, 'invalid'],
    ['pdf417', -1, 'invalid'],
    ['pdf417', 1.5, 'invalid'],
    ['pdf417', 'L', 'invalid'],
    ['aztec', 5, 'valid'],
    ['aztec', 95, 'valid'],
    ['aztec', 33.7, 'valid'],
    ['aztec', 4, 'invalid'],
    ['aztec', 96, 'invalid'],
    ['aztec', 'H', 'invalid'],
    ['data-matrix', 'H', 'ignored'],
    ['data-matrix', 3, 'ignored'],
    ['ean13' as never, 'M', 'invalid'],
  ])('%s 的级别 %s → %s', (format, level, fit) => {
    expect(matrixCodeLevelFit(format, level)).toBe(fit)
  })
})

describe('checkMatrixCodeValue', () => {
  it.each(MATRIX_CODE_FORMATS.map(format => [format]))('%s 能编码的内容与空串都返回 undefined', (format) => {
    expect(checkMatrixCodeValue(format, 'https://ui.xihanfun.com')).toBeUndefined()
    expect(checkMatrixCodeValue(format, '')).toBeUndefined()
  })

  it('不认识的码制报 unknown-format', () => {
    expect(checkMatrixCodeValue('ean13' as never, 'x')).toEqual({ code: 'unknown-format' })
  })

  it('级别不适用报 invalid-level，内容为空也报', () => {
    expect(checkMatrixCodeValue('qr', 'x', { level: 'X' as never })).toEqual({ code: 'invalid-level' })
    expect(checkMatrixCodeValue('pdf417', '', { level: 9 })).toEqual({ code: 'invalid-level' })
    expect(checkMatrixCodeValue('aztec', '', { level: 2 })).toEqual({ code: 'invalid-level' })
  })

  it('data-matrix 给了级别不算问题', () => {
    expect(checkMatrixCodeValue('data-matrix', 'x', { level: 'H' })).toBeUndefined()
  })

  it('内容超出容量报 capacity-exceeded', () => {
    expect(checkMatrixCodeValue('qr', 'x'.repeat(1274), { level: 'H' })).toEqual({ code: 'capacity-exceeded' })
    expect(checkMatrixCodeValue('qr', 'x'.repeat(1274), { level: 'L' })).toBeUndefined()
    expect(checkMatrixCodeValue('data-matrix', 'x'.repeat(2000))).toEqual({ code: 'capacity-exceeded' })
    expect(checkMatrixCodeValue('pdf417', 'x'.repeat(1200))).toEqual({ code: 'capacity-exceeded' })
    expect(checkMatrixCodeValue('pdf417', 'x'.repeat(200), { columns: 1 })).toEqual({ code: 'capacity-exceeded' })
    expect(checkMatrixCodeValue('aztec', 'x'.repeat(5000))).toEqual({ code: 'capacity-exceeded' })
  })

  it('pdf417 的列数越界报 invalid-columns', () => {
    expect(checkMatrixCodeValue('pdf417', 'x', { columns: 31 })).toEqual({ code: 'invalid-columns' })
    expect(checkMatrixCodeValue('pdf417', 'x', { columns: 2.5 })).toEqual({ code: 'invalid-columns' })
  })

  it.each<[MatrixCodeFormat, string, MatrixCodeValueOptions]>([
    ['qr', 'x', { level: 'Q' }],
    ['qr', 'x', { level: 'X' as never }],
    ['qr', '', { level: 'X' as never }],
    ['qr', 'x'.repeat(1274), { level: 'H' }],
    ['data-matrix', 'x', { rectangular: true }],
    ['data-matrix', 'x'.repeat(2000), {}],
    ['pdf417', 'x', { level: 2, columns: 4 }],
    ['pdf417', 'x', { columns: 31 }],
    ['pdf417', '', { level: 9 }],
    ['pdf417', 'x'.repeat(200), { columns: 1 }],
    ['aztec', 'x', { level: 50 }],
    ['aztec', 'x'.repeat(5000), {}],
    ['ean13' as never, 'x', {}],
  ])('%s：有问题当且仅当组件落 error 态', (format, value, options) => {
    const issue = checkMatrixCodeValue(format, value, options)
    const api = connectMatrixCode({ format, value, ...options }, normalizeProps)
    expect(issue === undefined).toBe(api.state !== 'error')
  })
})
