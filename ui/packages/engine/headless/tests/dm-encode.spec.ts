// Data Matrix 编码器：尺寸表的自洽、容量、矩阵形状。逐码字的回环见 dm-decode-roundtrip.spec.ts。
import { describe, expect, it } from 'vitest'
import { DM_SYMBOLS, dmCapacity, dmEncode } from '../src/matrix-code'

describe('尺寸表', () => {
  it('48 档：24 档正方形 + 6 档标准矩形 + 18 档矩形扩展，按数据码字数升序', () => {
    expect(DM_SYMBOLS).toHaveLength(48)
    expect(DM_SYMBOLS.filter(s => !s.rectangular)).toHaveLength(24)
    expect(DM_SYMBOLS.filter(s => s.rectangular)).toHaveLength(24)
    for (let i = 1; i < DM_SYMBOLS.length; i++)
      expect(DM_SYMBOLS[i]!.dataCodewords).toBeGreaterThanOrEqual(DM_SYMBOLS[i - 1]!.dataCodewords)
  })

  it('每档的数据区乘上区数、再加定位图形，正好是符号尺寸；数据区边长都是偶数', () => {
    for (const s of DM_SYMBOLS) {
      expect((s.regionRows + 2) * s.regionsDown).toBe(s.rows)
      expect((s.regionColumns + 2) * s.regionsAcross).toBe(s.columns)
      expect(s.regionRows % 2).toBe(0)
      expect(s.regionColumns % 2).toBe(0)
      // 数据映射矩阵的格数 = 8 × 总码字数，或再多右下角那 2×2 的固定图形
      const spare = s.regionRows * s.regionsDown * s.regionColumns * s.regionsAcross - (s.dataCodewords + s.eccCodewords) * 8
      expect([0, 4]).toContain(spare)
      expect(s.eccCodewords % s.blocks).toBe(0)
    }
  })

  it('容量：正方形到 1558 个码字，矩形到 118 个', () => {
    expect(dmCapacity(false)).toBe(1558)
    expect(dmCapacity(true)).toBe(118)
  })
})

describe('矩阵', () => {
  it('模块矩阵的行列数就是所选尺寸；空串也画得出一张 10×10', () => {
    const empty = dmEncode('')
    expect(empty.symbol.rows).toBe(10)
    expect(empty.modules).toHaveLength(10)
    expect(empty.modules[0]).toHaveLength(10)
    const long = dmEncode('x'.repeat(1400))
    expect(long.symbol.rows).toBe(144)
    expect(long.modules).toHaveLength(144)
    expect(long.modules.every(line => line.length === 144)).toBe(true)
  })

  it('同样的入参恒给同一份矩阵', () => {
    const a = dmEncode('deterministic', { gs1: true })
    const b = dmEncode('deterministic', { gs1: true })
    expect(a.modules).toEqual(b.modules)
  })

  it('gs1 与非 gs1 的同一内容不是同一张码：多了一个 FNC1 码字', () => {
    const plain = dmEncode('0112345678901231')
    const gs1 = dmEncode('0112345678901231', { gs1: true })
    expect(gs1.modules).not.toEqual(plain.modules)
  })

  it('左下角恒深、右上角恒浅：定位图形的两个角', () => {
    for (const text of ['A', 'Hello, World!', 'x'.repeat(100)]) {
      for (const rectangular of [false, true]) {
        const { modules, symbol } = dmEncode(text, { rectangular })
        expect(modules[symbol.rows - 1]![0]).toBe(true)
        expect(modules[0]![symbol.columns - 1]).toBe(false)
        expect(modules[symbol.rows - 1]![symbol.columns - 1]).toBe(true)
      }
    }
  })
})
