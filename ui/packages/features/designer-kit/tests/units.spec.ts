import type { LengthUnit } from '../src'
import { describe, expect, it } from 'vitest'
import { convertLength, CSS_PX_PER_INCH, isPaperPresetName, LENGTH_UNITS, MM_PER_INCH, PAPER_PRESET_NAMES, PAPER_PRESETS, PT_PER_INCH } from '../src'

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
