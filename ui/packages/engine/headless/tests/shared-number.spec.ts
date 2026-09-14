import { describe, expect, it } from 'vitest'
import {
  clamp,
  decodeNumber,
  encodeNumber,
  isValidValue,
  normalizeValue,
  parseValue,
  snapDecimals,
  stepValue,
} from '../src/shared/number'

describe('parseValue', () => {
  it('空串与纯空白算"没有值"，不是 0', () => {
    // 判成 0 的话，一个空框会被读屏念成"0"，提交上去也是 0
    expect(parseValue('')).toBeNaN()
    expect(parseValue('   ')).toBeNaN()
  })

  it('半截数字算非法，不截断', () => {
    // parseFloat 会把 '12abc' 截成 12，那是在替用户猜他想输什么
    expect(parseValue('12abc')).toBeNaN()
    expect(parseValue('abc')).toBeNaN()
  })

  it('负号、小数、科学计数法都认', () => {
    expect(parseValue('-3.5')).toBe(-3.5)
    expect(parseValue(' 42 ')).toBe(42)
    expect(parseValue('1e3')).toBe(1000)
  })

  it('infinity 不算有效值', () => {
    expect(isValidValue('Infinity')).toBe(false)
    expect(isValidValue('7')).toBe(true)
  })
})

describe('clamp', () => {
  it('只给一侧边界时另一侧不受限', () => {
    expect(clamp(999, 0)).toBe(999)
    expect(clamp(-999, 0)).toBe(0)
    expect(clamp(-999, undefined, 10)).toBe(-999)
  })

  it('min 为 0 时不被当成"没给"', () => {
    // 0 是假值，用 `min &&` 判断会让 min=0 整个失效
    expect(clamp(-5, 0, 10)).toBe(0)
  })
})

describe('snapDecimals', () => {
  it('消掉浮点步进的尾巴', () => {
    expect(0.1 + 0.2).not.toBe(0.3)
    expect(snapDecimals(0.1 + 0.2, 0.1, 0.2)).toBe(0.3)
  })

  it('整数步进原样不动', () => {
    expect(snapDecimals(3, 1, 2)).toBe(3)
  })

  it('按参考值里最长的小数位数回舍，不按最短的', () => {
    // 基准 1.005 步长 0.1：舍到 1 位会把基准本身的精度抹掉
    expect(snapDecimals(1.105, 0.1, 1.005)).toBe(1.105)
  })
})

describe('stepValue', () => {
  const o = { step: 1 }

  it('从空串起步落在 min 上，而不是 min + step', () => {
    // 空框按一下 ArrowUp，用户预期看到区间的下界，不是下界再加一格
    expect(stepValue('', 1, { ...o, min: 5 })).toBe(5)
    expect(stepValue('', -1, { ...o, min: 5 })).toBe(5)
  })

  it('没有 min 时空串从 0 起步', () => {
    expect(stepValue('', 1, o)).toBe(0)
    expect(stepValue('abc', 1, o)).toBe(0)
  })

  it('正常步进并夹在区间内', () => {
    expect(stepValue('3', 1, { step: 1, max: 5 })).toBe(4)
    expect(stepValue('5', 1, { step: 1, max: 5 })).toBe(5)
    expect(stepValue('0', -1, { step: 1, min: 0 })).toBe(0)
  })

  it('小数步长不留浮点尾巴', () => {
    expect(stepValue('0.1', 1, { step: 0.2 })).toBe(0.3)
    expect(stepValue('0.3', -1, { step: 0.1 })).toBe(0.2)
  })

  it('大步长越界时停在端点而不是越过去', () => {
    expect(stepValue('95', 1, { step: 10, max: 100 })).toBe(100)
    expect(stepValue('5', -1, { step: 10, min: 0 })).toBe(0)
  })
})

describe('normalizeValue', () => {
  it('收掉多余的零与前导零', () => {
    expect(normalizeValue('12.50', {})).toBe('12.5')
    expect(normalizeValue('007', {})).toBe('7')
  })

  it('越界值夹回区间', () => {
    expect(normalizeValue('99', { max: 10 })).toBe('10')
    expect(normalizeValue('-99', { min: 0 })).toBe('0')
  })

  it('空串与非法串原样留着，不替作者猜', () => {
    // 抹成 '0' 会让"我还没填"和"我填了 0"变成同一件事
    expect(normalizeValue('', { min: 0 })).toBe('')
    expect(normalizeValue('abc', { min: 0 })).toBe('abc')
  })
})

describe('自定义换算（parse / format）', () => {
  // 千位分隔符：一对互逆的换算
  const parse = (text: string): number => Number(text.replace(/,/g, ''))
  const format = (value: number): string => value.toLocaleString('en-US')

  it('decodeNumber 缺省走 Number()，给了 parse 就换成它', () => {
    expect(decodeNumber('1,234')).toBeNaN()
    expect(decodeNumber('1,234', { parse })).toBe(1234)
  })

  it('encodeNumber 缺省走 String()，给了 format 就换成它', () => {
    expect(encodeNumber(1234)).toBe('1234')
    expect(encodeNumber(1234, { format })).toBe('1,234')
  })

  it('作者的 parse 返回非数时按 NaN 处理，不让它污染后续计算', () => {
    expect(decodeNumber('x', { parse: () => undefined as unknown as number })).toBeNaN()
  })

  it('作者的 format 返回非串时退回 String(value)', () => {
    expect(encodeNumber(7, { format: () => undefined as unknown as string })).toBe('7')
  })

  it('stepValue 从带格式的串上也走得动，结果仍是数', () => {
    expect(stepValue('1,234', 1, { step: 1, parse, format })).toBe(1235)
    expect(stepValue('1,234', -1, { step: 100, parse, format })).toBe(1134)
    // 界仍按数比，不按串比
    expect(stepValue('1,234', 1, { step: 1000, max: 2000, parse, format })).toBe(2000)
  })

  it('normalizeValue 同时是"补格式"的时机：手打的 1234 在失焦时变回 1,234', () => {
    expect(normalizeValue('1234', { parse, format })).toBe('1,234')
    // 越界仍先夹回区间再补格式
    expect(normalizeValue('99999', { max: 2000, parse, format })).toBe('2,000')
    // 读不出数的串原样留着，不替作者猜
    expect(normalizeValue('一千', { parse, format })).toBe('一千')
  })

  it('单位后缀：parse 认得出后缀，format 写得回去', () => {
    const kg = {
      parse: (text: string) => Number(text.replace(/\s*kg$/i, '')),
      format: (value: number) => `${value} kg`,
    }
    expect(decodeNumber('12 kg', kg)).toBe(12)
    expect(stepValue('12 kg', 1, { step: 1, ...kg })).toBe(13)
    expect(normalizeValue('12 kg', kg)).toBe('12 kg')
    expect(normalizeValue('12', kg)).toBe('12 kg')
  })
})
