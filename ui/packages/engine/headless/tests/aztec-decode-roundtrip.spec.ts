// 独立解码器对 Aztec 编码器做回环验证。
//
// 这个文件只用编码器的公开导出 aztecEncode 拿到矩阵，其余按 ISO/IEC 24778 自己重写一遍：
// 牛眼与方向标记逐格核对、模式信息读回并用 GF(16) 校验子核、按层从外到里读数据位、
// 各字宽的 GF(2^m) 校验子（另建对数表）、去位填充、大写 / 小写 / 数字 / 二进制移位逐字还原。
// 与编码器同源的实现只会一起错，所以这里刻意不共用任何一行。
import { describe, expect, it } from 'vitest'
import { aztecEncode } from '../src/matrix-code'

type Matrix = readonly (readonly boolean[])[]

// ── GF(2^m)，另建一套表 ──

function field(bits: number, primitive: number) {
  const size = 1 << bits
  const exp = new Uint16Array(size * 2)
  const log = new Uint16Array(size)
  let v = 1
  for (let i = 0; i < size - 1; i++) {
    exp[i] = v
    log[v] = i
    v <<= 1
    if (v & size)
      v ^= primitive
  }
  for (let i = size - 1; i < size * 2; i++) exp[i] = exp[i - (size - 1)]!
  const mul = (a: number, b: number): number => (a === 0 || b === 0 ? 0 : exp[log[a]! + log[b]!]!)
  /** 多项式 c（高次在前）在 α^i 处的值。 */
  const evalAt = (c: readonly number[], i: number): number => {
    const x = exp[i]!
    let acc = 0
    for (const coef of c) acc = mul(acc, x) ^ coef
    return acc
  }
  return { evalAt }
}

const FIELDS: Record<number, ReturnType<typeof field>> = {
  4: field(4, 0x13),
  6: field(6, 0x43),
  8: field(8, 0x12D),
  10: field(10, 0x409),
  12: field(12, 0x1069),
}

function wordSizeFor(layers: number): number {
  if (layers <= 2)
    return 6
  if (layers <= 8)
    return 8
  if (layers <= 22)
    return 10
  return 12
}

/** 校验子 S₁…S_(n−k) 全为 0。 */
function checkWords(words: readonly number[], dataCount: number, bits: number): void {
  const f = FIELDS[bits]!
  for (let i = 1; i <= words.length - dataCount; i++) {
    if (f.evalAt(words, i) !== 0)
      throw new Error(`GF(2^${bits}) 校验子 S${i} 不为 0`)
  }
}

// ── 结构 ──

function checkBullsEye(m: Matrix, center: number, radius: number): void {
  for (let i = 0; i <= radius; i++) {
    const dark = i % 2 === 0
    for (let j = center - i; j <= center + i; j++) {
      for (const [x, y] of [[j, center - i], [j, center + i], [center - i, j], [center + i, j]] as const) {
        if (m[y]![x] !== dark)
          throw new Error(`牛眼第 ${i} 圈 (${x},${y}) 应当${dark ? '深' : '浅'}`)
      }
    }
  }
}

function readModeMessage(m: Matrix, compact: boolean, size: number): number[] {
  const center = Math.floor(size / 2)
  const bits: number[] = []
  if (compact) {
    const out = Array.from<number>({ length: 28 }).fill(0)
    for (let i = 0; i < 7; i++) {
      const offset = center - 3 + i
      out[i] = m[center - 5]![offset] ? 1 : 0
      out[i + 7] = m[offset]![center + 5] ? 1 : 0
      out[20 - i] = m[center + 5]![offset] ? 1 : 0
      out[27 - i] = m[offset]![center - 5] ? 1 : 0
    }
    return out
  }
  const out = Array.from<number>({ length: 40 }).fill(0)
  for (let i = 0; i < 10; i++) {
    const offset = center - 5 + i + Math.floor(i / 5)
    out[i] = m[center - 7]![offset] ? 1 : 0
    out[i + 10] = m[offset]![center + 7] ? 1 : 0
    out[29 - i] = m[center + 7]![offset] ? 1 : 0
    out[39 - i] = m[offset]![center - 7] ? 1 : 0
  }
  bits.push(...out)
  return out
}

function toWords(bits: readonly number[], size: number): number[] {
  const out: number[] = []
  for (let i = 0; i + size <= bits.length; i += size) {
    let v = 0
    for (let j = 0; j < size; j++) v = (v << 1) | bits[i + j]!
    out.push(v)
  }
  return out
}

interface Decoded { compact: boolean, layers: number, words: number, text: string, size: number }

function decode(m: Matrix): Decoded {
  const size = m.length
  if (m.some(line => line.length !== size))
    throw new Error('矩阵不是正方的')
  const center = Math.floor(size / 2)
  // 紧凑型的方向标记落在离中心 5 格的四角上，完整型那一圈整圈是浅的（标记在 7 格上）；以左上角那格分辨
  const compact = m[center - 5]![center - 5]!
  checkBullsEye(m, center, compact ? 4 : 6)
  // 方向标记：外圈左上角三格、右上角两格、右下角一格
  const r = compact ? 5 : 7
  for (const [x, y] of [[center - r, center - r], [center - r + 1, center - r], [center - r, center - r + 1], [center + r, center - r], [center + r, center - r + 1], [center + r, center + r - 1]] as const) {
    if (!m[y]![x])
      throw new Error(`方向标记 (${x},${y}) 应当深`)
  }
  // 底边两角没有标记，恒浅
  if (m[center + r]![center - r] || m[center + r]![center + r])
    throw new Error('左下与右下两角应当浅')

  const modeBits = readModeMessage(m, compact, size)
  const modeWords = toWords(modeBits, 4)
  checkWords(modeWords, compact ? 2 : 4, 4)
  let layers: number
  let words: number
  if (compact) {
    layers = ((modeWords[0]! << 4) | modeWords[1]!) >>> 6
    layers += 1
    words = (((modeWords[0]! << 4) | modeWords[1]!) & 0x3F) + 1
  }
  else {
    const v = (modeWords[0]! << 12) | (modeWords[1]! << 8) | (modeWords[2]! << 4) | modeWords[3]!
    layers = (v >>> 11) + 1
    words = (v & 0x7FF) + 1
  }

  // 参考网格映射：完整型的坐标要跳过网格行列
  const baseSize = (compact ? 11 : 14) + layers * 4
  const map: number[] = []
  if (compact) {
    for (let i = 0; i < baseSize; i++) map[i] = i
  }
  else {
    const origCenter = Math.floor(baseSize / 2)
    for (let i = 0; i < origCenter; i++) {
      const offset = i + Math.floor(i / 15)
      map[origCenter - i - 1] = center - offset - 1
      map[origCenter + i] = center + offset + 1
    }
  }
  const totalBits = ((compact ? 88 : 112) + 16 * layers) * layers
  const bits: number[] = Array.from<number>({ length: totalBits }).fill(0)
  const get = (x: number, y: number): number => (m[y]![x] ? 1 : 0)
  for (let i = 0, rowOffset = 0; i < layers; i++) {
    const rowSize = (layers - i) * 4 + (compact ? 9 : 12)
    for (let j = 0; j < rowSize; j++) {
      const c = j * 2
      for (let k = 0; k < 2; k++) {
        bits[rowOffset + c + k] = get(map[i * 2 + k]!, map[i * 2 + j]!)
        bits[rowOffset + rowSize * 2 + c + k] = get(map[i * 2 + j]!, map[baseSize - 1 - i * 2 - k]!)
        bits[rowOffset + rowSize * 4 + c + k] = get(map[baseSize - 1 - i * 2 - k]!, map[baseSize - 1 - i * 2 - j]!)
        bits[rowOffset + rowSize * 6 + c + k] = get(map[baseSize - 1 - i * 2 - j]!, map[i * 2 + k]!)
      }
    }
    rowOffset += rowSize * 8
  }
  const wordSize = wordSizeFor(layers)
  const startPad = totalBits % wordSize
  const allWords = toWords(bits.slice(startPad), wordSize)
  checkWords(allWords, words, wordSize)

  // 去位填充：每个字的前 m−1 位全 0 / 全 1 时末尾那一位是塞进去的
  const raw: number[] = []
  const mask = (1 << wordSize) - 2
  for (const w of allWords.slice(0, words)) {
    const head = w & mask
    const keep = head === 0 || head === mask ? wordSize - 1 : wordSize
    for (let j = wordSize - 1; j >= wordSize - keep; j--) raw.push((w >>> j) & 1)
  }
  return { compact, layers, words, size, text: decodeText(raw) }
}

/** 高层解码：只认编码器用到的三种模式与二进制移位，其余码值按错处理。 */
function decodeText(bits: readonly number[]): string {
  const UPPER = ['P/S', ' ', ...'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'L/L', 'M/L', 'D/L', 'B/S']
  const LOWER = ['P/S', ' ', ...'abcdefghijklmnopqrstuvwxyz', 'U/S', 'M/L', 'D/L', 'B/S']
  const DIGIT = ['P/S', ' ', ...'0123456789', ',', '.', 'U/L', 'U/S']
  const bytes: number[] = []
  let at = 0
  const take = (n: number): number => {
    let v = 0
    for (let i = 0; i < n; i++) v = (v << 1) | bits[at++]!
    return v
  }
  let mode: 'upper' | 'lower' | 'digit' = 'upper'
  let shift: 'upper' | undefined
  while (at < bits.length) {
    const cur = shift ?? mode
    shift = undefined
    const width = cur === 'digit' ? 4 : 5
    if (at + width > bits.length)
      break
    const code = take(width)
    const table = cur === 'upper' ? UPPER : cur === 'lower' ? LOWER : DIGIT
    const sym = table[code]!
    if (sym.length === 1) {
      bytes.push(sym.charCodeAt(0))
      continue
    }
    if (sym === 'B/S') {
      // 末尾的填充位全是 1，读起来像一个 B/S：长度段与字节段不够位就是填充，到此为止
      if (at + 5 > bits.length)
        break
      let n = take(5)
      if (n === 0) {
        if (at + 11 > bits.length)
          break
        n = take(11) + 31
      }
      let cut = false
      for (let i = 0; i < n; i++) {
        if (at + 8 > bits.length) {
          cut = true
          break
        }
        bytes.push(take(8))
      }
      if (cut)
        break
      continue
    }
    if (sym === 'L/L') {
      mode = 'lower'
      continue
    }
    if (sym === 'D/L') {
      mode = 'digit'
      continue
    }
    if (sym === 'U/L') {
      mode = 'upper'
      continue
    }
    if (sym === 'U/S') {
      shift = 'upper'
      continue
    }
    throw new Error(`编码器不该发出 ${sym}`)
  }
  // 末尾全 1 的填充在取位时已经当 1 吃掉，剩下不足一个符号的尾巴丢弃
  const utf8 = new TextDecoder('utf-8', { fatal: true })
  try {
    return utf8.decode(Uint8Array.from(bytes))
  }
  catch {
    return bytes.map(b => String.fromCharCode(b)).join('')
  }
}

function roundtrip(text: string, options: { eccPercent?: number } = {}): Decoded {
  const m = aztecEncode(text, options)
  const got = decode(m.modules)
  expect(got.compact).toBe(m.compact)
  expect(got.layers).toBe(m.layers)
  expect(got.words).toBe(m.codewords)
  expect(got.size).toBe(m.size)
  return got
}

describe('aztec 回环', () => {
  it.each([
    'A',
    'HELLO WORLD',
    'Hello, World! 2026',
    '1234567890',
    'lower case only',
    'Mixed CASE with 123 digits and .,',
    'a1B2c3D4',
    'Ünïcödé ÿ',
    '中文 → UTF-8',
    'The quick brown fox jumps over the lazy dog',
  ])('%j', (text) => {
    const got = roundtrip(text)
    // 尾部填充可能多出一个空格之类的符号：末尾全 1 的位在大写模式里是 B/S 或字母。
    // 编码器不填这种尾巴——去填充后剩下不足一个符号的位被丢弃，所以这里要求逐字相同
    expect(got.text).toBe(text)
  })

  it('紧凑型 1–4 层与完整型 4 层起的边长都按规范', () => {
    for (let n = 1; n <= 200; n += 7) {
      const text = 'Q'.repeat(n)
      const got = roundtrip(text)
      expect(got.text).toBe(text)
      const base = (got.compact ? 11 : 14) + got.layers * 4
      const size = got.compact ? base : base + 1 + 2 * Math.floor((Math.floor(base / 2) - 1) / 15)
      expect(got.size).toBe(size)
      if (got.compact)
        expect(got.layers).toBeLessThanOrEqual(4)
    }
  })

  it('大符号：5 层起插参考网格，10 层与 23 层起字宽换成 10 / 12 位', () => {
    for (const n of [400, 900, 1800]) {
      const text = 'Z'.repeat(n)
      const got = roundtrip(text)
      expect(got.text).toBe(text)
      expect(got.compact).toBe(false)
    }
  })

  it('二进制移位：短串 5 位长度，超过 31 字节走 11 位长度', () => {
    const short = '#'.repeat(7)
    const long = `${'#'.repeat(45)}A${'!'.repeat(2)}`
    expect(roundtrip(short).text).toBe(short)
    expect(roundtrip(long).text).toBe(long)
  })

  it('纠错比例越高层数越多', () => {
    const text = 'Percent test 12345 with lower'
    const low = aztecEncode(text, { eccPercent: 5 })
    const high = aztecEncode(text, { eccPercent: 80 })
    expect(high.size).toBeGreaterThan(low.size)
    expect(roundtrip(text, { eccPercent: 80 }).text).toBe(text)
  })

  it('内容装不下就抛 RangeError', () => {
    expect(() => aztecEncode('x'.repeat(4000))).toThrow(RangeError)
  })

  it('翻掉任意一个数据模块，校验子必然非零', () => {
    const m = aztecEncode('tamper me please')
    const bad = m.modules.map(line => line.slice())
    // 左上角那格属于最外层数据
    bad[0]![0] = !bad[0]![0]
    expect(() => decode(bad)).toThrow(/校验子/)
  })
})
