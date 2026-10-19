import type { LengthUnit } from '../src'
import { describe, expect, it } from 'vitest'
import { convertLength, CSS_PX_PER_INCH, formatLength, isPaperPresetName, LENGTH_UNIT_SYMBOLS, LENGTH_UNITS, MM_PER_INCH, PAPER_PRESET_NAMES, PAPER_PRESETS, PT_PER_INCH, stepLength } from '../src'

describe('convertLength', () => {
  it('一英寸在各单位下的长度', () => {
    expect(convertLength(1, 'in', 'mm')).toBe(MM_PER_INCH)
    expect(convertLength(1, 'in', 'cm')).toBe(2.54)
    expect(convertLength(1, 'in', 'pt')).toBe(PT_PER_INCH)
    expect(convertLength(1, 'in', 'px')).toBe(CSS_PX_PER_INCH)
  })

  it('毫米与厘米、磅之间的换算没有浮点零头', () => {
    expect(convertLength(10, 'mm', 'cm')).toBe(1)
    expect(convertLength(2.5, 'cm', 'mm')).toBe(25)
    expect(convertLength(25.4, 'mm', 'pt')).toBe(72)
    expect(convertLength(72, 'pt', 'mm')).toBe(25.4)
  })

  it('像素按 dpi 折算，缺省 96', () => {
    expect(convertLength(25.4, 'mm', 'px')).toBe(96)
    expect(convertLength(210, 'mm', 'px')).toBeCloseTo(793.7, 1)
    expect(convertLength(25.4, 'mm', 'px', { dpi: 203 })).toBeCloseTo(203, 10)
    expect(convertLength(300, 'px', 'in', { dpi: 300 })).toBeCloseTo(1, 12)
    expect(convertLength(12, 'pt', 'px')).toBe(16)
  })

  it.each(LENGTH_UNITS.flatMap(from => LENGTH_UNITS.map(to => [from, to] as [LengthUnit, LengthUnit])))('%s → %s → 原单位回到原值', (from, to) => {
    const there = convertLength(37.5, from, to, { dpi: 203 })
    expect(convertLength(there, to, from, { dpi: 203 })).toBeCloseTo(37.5, 10)
  })

  it('同一单位原样返回', () => {
    expect(convertLength(12.3, 'mm', 'mm')).toBe(12.3)
    expect(convertLength(Number.NaN, 'px', 'px')).toBeNaN()
  })

  it('dpi 不是正的有限数时抛 RangeError，同一单位也抛', () => {
    expect(() => convertLength(1, 'mm', 'px', { dpi: 0 })).toThrow(RangeError)
    expect(() => convertLength(1, 'px', 'mm', { dpi: -96 })).toThrow(RangeError)
    expect(() => convertLength(1, 'px', 'mm', { dpi: Number.NaN })).toThrow(RangeError)
    expect(() => convertLength(1, 'mm', 'mm', { dpi: Number.POSITIVE_INFINITY })).toThrow(RangeError)
  })

  it('单位不认识时抛 RangeError', () => {
    expect(() => convertLength(1, 'mm', 'em' as LengthUnit)).toThrow(RangeError)
    expect(() => convertLength(1, 'em' as LengthUnit, 'em' as LengthUnit)).toThrow(RangeError)
  })
})

describe('纸张预设', () => {
  it('预设名列表与预设表一一对应、不重复', () => {
    expect(PAPER_PRESET_NAMES).toEqual(Object.keys(PAPER_PRESETS))
    expect(new Set(PAPER_PRESET_NAMES).size).toBe(PAPER_PRESET_NAMES.length)
  })

  it('尺寸是纵向的毫米数', () => {
    expect(PAPER_PRESETS.A4).toEqual({ width: 210, height: 297 })
    expect(PAPER_PRESETS.Letter).toEqual({ width: 215.9, height: 279.4 })
    for (const name of PAPER_PRESET_NAMES)
      expect(PAPER_PRESETS[name].width).toBeLessThan(PAPER_PRESETS[name].height)
  })

  it('isPaperPresetName 区分大小写，不认原型上的键', () => {
    expect(isPaperPresetName('A4')).toBe(true)
    expect(isPaperPresetName('Legal')).toBe(true)
    expect(isPaperPresetName('a4')).toBe(false)
    expect(isPaperPresetName('constructor')).toBe(false)
    expect(isPaperPresetName(4)).toBe(false)
    expect(isPaperPresetName(undefined)).toBe(false)
  })
})

describe('长度的显示与步进', () => {
  it('lENGTH_UNIT_SYMBOLS 与 LENGTH_UNITS 一一对应', () => {
    expect(Object.keys(LENGTH_UNIT_SYMBOLS)).toEqual([...LENGTH_UNITS])
    expect(LENGTH_UNIT_SYMBOLS.mm).toBe('mm')
  })

  it('formatLength：按 locale 写小数点，最多 fractionDigits 位小数（缺省 1），不分组，负零写成 0', () => {
    expect(formatLength(12.345)).toBe('12.3')
    expect(formatLength(12.36, { fractionDigits: 1, locale: 'de-DE' })).toBe('12,4')
    expect(formatLength(12, { fractionDigits: 2 })).toBe('12')
    expect(formatLength(1234.5, { locale: 'en-US' })).toBe('1234.5')
    expect(formatLength(-0.04)).toBe('0')
    expect(formatLength(7.6, { fractionDigits: 0 })).toBe('8')
    expect(() => formatLength(Number.NaN)).toThrow(RangeError)
    expect(() => formatLength(1, { fractionDigits: 1.5 })).toThrow(RangeError)
  })

  it('stepLength：加上步长后按小数位取整，再夹在上下限里', () => {
    expect(stepLength(0.1, 0.2)).toBe(0.3)
    expect(stepLength(10.25, 1)).toBe(11.3)
    expect(stepLength(10.25, 1, { fractionDigits: 2 })).toBe(11.25)
    expect(stepLength(3, -5, { min: 1 })).toBe(1)
    expect(stepLength(9, 5, { max: 10 })).toBe(10)
    expect(stepLength(1.04, -1, { min: 0.05, fractionDigits: 1 })).toBe(0.05)
    expect(() => stepLength(1, Number.POSITIVE_INFINITY)).toThrow(RangeError)
    expect(() => stepLength(1, 1, { min: 5, max: 2 })).toThrow(RangeError)
  })
})
