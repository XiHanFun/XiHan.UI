// 独立解码器对 PDF417 编码器做回环验证。
//
// 这个文件只用编码器的公开导出 pdf417Encode 拿到矩阵、pdf417Pattern 查码字图案（929 × 3 张表没法另录一份，
// 它已经由第三方读码器逐一核过），其余按 ISO/IEC 15438 自己重写一遍：起止图形、簇的奇偶关系、
// 行指示符里的行数 / 列数 / 纠错级别、长度描述符、GF(929) 校验子、字节解压缩与 ECI。
// 与编码器同源的实现只会一起错，所以除查表外刻意不共用任何一行。
import { describe, expect, it } from 'vitest'
import { pdf417Encode, pdf417Pattern } from '../src/matrix-code'

type Matrix = readonly (readonly boolean[])[]

/** 一行模块转成 17 位一组的图案值；起始 17、终止 18，中间每 17 一个码字。 */
function rowPatterns(line: readonly boolean[]): { start: number, words: number[], stop: number } {
  const read = (at: number, len: number): number => {
    let v = 0
    for (let i = 0; i < len; i++) v = (v << 1) | (line[at + i] ? 1 : 0)
    return v
  }
  if ((line.length - 17 - 18) % 17 !== 0)
    throw new Error(`行宽 ${line.length} 不是 17n + 35`)
  const count = (line.length - 35) / 17
  const words: number[] = []
  for (let i = 0; i < count; i++) words.push(read(17 + i * 17, 17))
  return { start: read(0, 17), words, stop: read(17 + count * 17, 18) }
}

/** 一个 17 位图案属于哪一簇：按四条宽度的交错差 (b1 − b2 + b3 − b4) mod 9，只可能是 0 / 3 / 6。 */
function clusterOf(pattern: number): number {
  const bits = pattern.toString(2).padStart(17, '0')
  const runs = bits.match(/1+|0+/g)!
  if (runs.length !== 8 || bits[0] !== '1')
    throw new Error(`图案 ${bits} 不是四条四空起于条`)
  const bars = [runs[0]!.length, runs[2]!.length, runs[4]!.length, runs[6]!.length]
  const k = ((bars[0]! - bars[1]! + bars[2]! - bars[3]!) % 9 + 9) % 9
  return k / 3
}

/** 反查：某簇里哪个码字的图案是它。 */
function codewordOf(cluster: number, pattern: number): number {
  for (let c = 0; c < 929; c++) {
    if (pdf417Pattern(cluster, c) === pattern)
      return c
  }
  throw new Error(`簇 ${cluster} 里没有图案 ${pattern.toString(2)}`)
}

interface Decoded {
  rows: number
  columns: number
  level: number
  codewords: number[]
  text: string
  eci: number | undefined
}

/** 素域 GF(929) 上多项式 c（高次在前）在 3^i 处的值。 */
function evalAt(c: readonly number[], i: number): number {
  let x = 1
  for (let k = 0; k < i; k++) x = (x * 3) % 929
  let acc = 0
  for (const coef of c) acc = (acc * x + coef) % 929
  return acc
}

function decode(modules: Matrix, rowHeight: number): Decoded {
  if (modules.length % rowHeight !== 0)
    throw new Error('模块行数不是行高的整数倍')
  const rows = modules.length / rowHeight
  const all: number[] = []
  let columns = -1
  let level = -1
  let rowsFloor = -1
  let rowsMod = -1
  for (let y = 0; y < rows; y++) {
    // 同一码字行的每一模块行都一样
    for (let h = 1; h < rowHeight; h++) {
      if (modules[y * rowHeight + h]!.some((v, x) => v !== modules[y * rowHeight]![x]))
        throw new Error(`第 ${y} 行的 ${h} 号模块行与首模块行不同`)
    }
    const { start, words, stop } = rowPatterns(modules[y * rowHeight]!)
    if (start !== 0x1FEA8)
      throw new Error('起始图形不对')
    if (stop !== 0x3FA29)
      throw new Error('终止图形不对')
    const cluster = y % 3
    for (const w of words) {
      if (clusterOf(w) !== cluster)
        throw new Error(`第 ${y} 行有码字落在别的簇`)
    }
    const left = codewordOf(cluster, words[0]!)
    const right = codewordOf(cluster, words[words.length - 1]!)
    // 行指示符：30 × floor(行号 / 3) + 各簇各自的一项
    const base = 30 * Math.floor(y / 3)
    if (left - base < 0 || left - base > 29 || right - base < 0 || right - base > 29)
      throw new Error(`第 ${y} 行的行指示符不含正确的行号段`)
    const l = left - base
    const r = right - base
    const take = (kind: 'rows' | 'columns' | 'level', v: number): void => {
      if (kind === 'columns') {
        if (columns >= 0 && columns !== v + 1)
          throw new Error('列数在各行不一致')
        columns = v + 1
      }
      else if (kind === 'level') {
        // 这一段是 级别 × 3 + (行数 − 1) mod 3
        const lv = Math.floor(v / 3)
        if (level >= 0 && level !== lv)
          throw new Error('纠错级别在各行不一致')
        if (rowsMod >= 0 && rowsMod !== v % 3)
          throw new Error('行数余数在各行不一致')
        level = lv
        rowsMod = v % 3
      }
      else {
        // 这一段是 floor((行数 − 1) / 3)
        if (rowsFloor >= 0 && rowsFloor !== v)
          throw new Error('行数段在各行不一致')
        rowsFloor = v
      }
    }
    if (cluster === 0) {
      take('rows', l)
      take('columns', r)
    }
    else if (cluster === 1) {
      take('level', l)
      take('rows', r)
    }
    else {
      take('columns', l)
      take('level', r)
    }
    for (const w of words.slice(1, -1)) all.push(codewordOf(cluster, w))
  }
  // 行数拆在两段里：floor((rows−1)/3) 与 (rows−1) mod 3
  if (rowsFloor * 3 + rowsMod + 1 !== rows)
    throw new Error(`行指示符说的行数 ${rowsFloor * 3 + rowsMod + 1} 与实际 ${rows} 行不符`)
  if (all.length !== rows * columns)
    throw new Error('码字数与行列不符')

  const k = 1 << (level + 1)
  for (let i = 1; i <= k; i++) {
    if (evalAt(all, i) !== 0)
      throw new Error(`校验子 S${i} 不为 0`)
  }
  const data = all.slice(0, all.length - k)
  const length = data[0]!
  if (length !== data.length)
    throw new Error(`长度描述符 ${length} 与数据区 ${data.length} 不符`)
  // 填充码字只能出现在尾部
  let end = data.length
  while (end > 1 && data[end - 1] === 900) end--
  const body = data.slice(1, end)

  let eci: number | undefined
  let at = 0
  if (body[at] === 927) {
    eci = body[at + 1]!
    at += 2
  }
  const latch = body[at]!
  at++
  if (latch !== 901 && latch !== 924)
    throw new Error(`不是字节压缩锁存：${latch}`)
  const bytes: number[] = []
  const rest = body.slice(at)
  // 924：全部 5 字一组；901：字节数 mod 6 是 1–5 个零头逐字一个码字——零头恰 5 个时码字数也是 5 的倍数，
  // 所以 901 下末尾 (码字数 mod 5，为 0 时取 5) 个码字一律当零头
  if (latch === 924 && rest.length % 5 !== 0)
    throw new Error('924 锁存后的码字数不是 5 的倍数')
  const singles = latch === 924 ? 0 : (rest.length % 5 || 5)
  const full = rest.length - singles
  const groups = full / 5
  for (let g = 0; g < groups; g++) {
    let value = 0n
    for (let i = 0; i < 5; i++) value = value * 900n + BigInt(rest[g * 5 + i]!)
    const six: number[] = []
    for (let i = 0; i < 6; i++) {
      six.unshift(Number(value % 256n))
      value /= 256n
    }
    bytes.push(...six)
  }
  for (let i = full; i < rest.length; i++) bytes.push(rest[i]!)
  const text = eci === 26
    ? new TextDecoder('utf-8', { fatal: true }).decode(Uint8Array.from(bytes))
    : bytes.map(b => String.fromCharCode(b)).join('')
  return { rows, columns, level, codewords: all, text, eci }
}

function roundtrip(text: string, options: { level?: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8, columns?: number } = {}): Decoded {
  const m = pdf417Encode(text, options)
  const got = decode(m.modules, m.rowHeight)
  expect(got.rows).toBe(m.rows)
  expect(got.columns).toBe(m.columns)
  expect(got.level).toBe(m.level)
  expect(m.width).toBe(17 * (m.columns + 3) + 18)
  expect(m.modules[0]!.length).toBe(m.width)
  return got
}

describe('pDF417 回环', () => {
  it.each([
    'A',
    'Hello',
    'Hello, World! 2026',
    '123456',
    '1234567',
    'exactly six!',
    'The quick brown fox jumps over the lazy dog',
    'x'.repeat(300),
  ])('%j', (text) => {
    const got = roundtrip(text)
    expect(got.text).toBe(text)
    expect(got.eci).toBeUndefined()
  })

  it('aSCII 以外的字符按 UTF-8 并声明 ECI 26', () => {
    const got = roundtrip('Ünïcödé 中文')
    expect(got.eci).toBe(26)
    expect(got.text).toBe('Ünïcödé 中文')
  })

  it('九档纠错级别各自的纠错码字数是 2^(level+1)，校验子都为 0', () => {
    for (let level = 0; level <= 8; level++) {
      const got = roundtrip('level', { level: level as 0 })
      expect(got.level).toBe(level)
      expect(got.codewords.length).toBeGreaterThanOrEqual(1 << (level + 1))
      expect(got.text).toBe('level')
    }
  })

  it('缺省级别按数据量分档：短内容 2 级，长内容 3 级', () => {
    expect(pdf417Encode('short').level).toBe(2)
    expect(pdf417Encode('x'.repeat(100)).level).toBe(3)
    expect(pdf417Encode('x'.repeat(300)).level).toBe(4)
  })

  it('指定列数：1 列与 30 列都铺得出，行数随之变', () => {
    const one = roundtrip('columns', { columns: 1 })
    expect(one.columns).toBe(1)
    expect(one.rows).toBeGreaterThanOrEqual(3)
    const wide = roundtrip('x'.repeat(200), { columns: 30 })
    expect(wide.columns).toBe(30)
    expect(wide.text).toBe('x'.repeat(200))
  })

  it('列数不在 1–30、内容超出 929 个码字都抛 RangeError', () => {
    expect(() => pdf417Encode('x', { columns: 0 })).toThrow(RangeError)
    expect(() => pdf417Encode('x', { columns: 31 })).toThrow(RangeError)
    expect(() => pdf417Encode('x'.repeat(1200), { level: 0 })).toThrow('929')
  })

  it('翻掉任意一个数据模块，校验子必然非零', () => {
    const m = pdf417Encode('tamper me')
    const bad = m.modules.map(line => line.slice())
    // 第一行数据区正中的一格
    const x = 17 + 17 + 8
    for (let h = 0; h < m.rowHeight; h++) bad[h]![x] = !bad[h]![x]
    expect(() => decode(bad, m.rowHeight)).toThrow()
  })
})
