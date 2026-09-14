// 独立解码器对一维码编码器做回环验证。
//
// 这个文件只用编码器的公开导出 barEncode 拿到条空序列，其余按各码制的规范自己重写一遍：
// 规格表另录（Code 128 与 Code 39 的表按 zxing 的写法誊、EAN 的 L/G/R 按位串重算），
// 子集状态机、奇偶推首位、校验位核对全部独立实现。与编码器同源的实现只会一起错，
// 所以这里刻意不共用任何一行。
import type { BarCodeFormat } from '../src/bar-code'
import { describe, expect, it } from 'vitest'
import { BAR_FNC1_CHAR, barEncode } from '../src/bar-code'

// ── Code 128 ──

// 按 zxing Code128Reader.CODE_PATTERNS 誊录：每项六段（终止符七段）
const C128: readonly (readonly number[])[] = [
  [2, 1, 2, 2, 2, 2],
  [2, 2, 2, 1, 2, 2],
  [2, 2, 2, 2, 2, 1],
  [1, 2, 1, 2, 2, 3],
  [1, 2, 1, 3, 2, 2],
  [1, 3, 1, 2, 2, 2],
  [1, 2, 2, 2, 1, 3],
  [1, 2, 2, 3, 1, 2],
  [1, 3, 2, 2, 1, 2],
  [2, 2, 1, 2, 1, 3],
  [2, 2, 1, 3, 1, 2],
  [2, 3, 1, 2, 1, 2],
  [1, 1, 2, 2, 3, 2],
  [1, 2, 2, 1, 3, 2],
  [1, 2, 2, 2, 3, 1],
  [1, 1, 3, 2, 2, 2],
  [1, 2, 3, 1, 2, 2],
  [1, 2, 3, 2, 2, 1],
  [2, 2, 3, 2, 1, 1],
  [2, 2, 1, 1, 3, 2],
  [2, 2, 1, 2, 3, 1],
  [2, 1, 3, 2, 1, 2],
  [2, 2, 3, 1, 1, 2],
  [3, 1, 2, 1, 3, 1],
  [3, 1, 1, 2, 2, 2],
  [3, 2, 1, 1, 2, 2],
  [3, 2, 1, 2, 2, 1],
  [3, 1, 2, 2, 1, 2],
  [3, 2, 2, 1, 1, 2],
  [3, 2, 2, 2, 1, 1],
  [2, 1, 2, 1, 2, 3],
  [2, 1, 2, 3, 2, 1],
  [2, 3, 2, 1, 2, 1],
  [1, 1, 1, 3, 2, 3],
  [1, 3, 1, 1, 2, 3],
  [1, 3, 1, 3, 2, 1],
  [1, 1, 2, 3, 1, 3],
  [1, 3, 2, 1, 1, 3],
  [1, 3, 2, 3, 1, 1],
  [2, 1, 1, 3, 1, 3],
  [2, 3, 1, 1, 1, 3],
  [2, 3, 1, 3, 1, 1],
  [1, 1, 2, 1, 3, 3],
  [1, 1, 2, 3, 3, 1],
  [1, 3, 2, 1, 3, 1],
  [1, 1, 3, 1, 2, 3],
  [1, 1, 3, 3, 2, 1],
  [1, 3, 3, 1, 2, 1],
  [3, 1, 3, 1, 2, 1],
  [2, 1, 1, 3, 3, 1],
  [2, 3, 1, 1, 3, 1],
  [2, 1, 3, 1, 1, 3],
  [2, 1, 3, 3, 1, 1],
  [2, 1, 3, 1, 3, 1],
  [3, 1, 1, 1, 2, 3],
  [3, 1, 1, 3, 2, 1],
  [3, 3, 1, 1, 2, 1],
  [3, 1, 2, 1, 1, 3],
  [3, 1, 2, 3, 1, 1],
  [3, 3, 2, 1, 1, 1],
  [3, 1, 4, 1, 1, 1],
  [2, 2, 1, 4, 1, 1],
  [4, 3, 1, 1, 1, 1],
  [1, 1, 1, 2, 2, 4],
  [1, 1, 1, 4, 2, 2],
  [1, 2, 1, 1, 2, 4],
  [1, 2, 1, 4, 2, 1],
  [1, 4, 1, 1, 2, 2],
  [1, 4, 1, 2, 2, 1],
  [1, 1, 2, 2, 1, 4],
  [1, 1, 2, 4, 1, 2],
  [1, 2, 2, 1, 1, 4],
  [1, 2, 2, 4, 1, 1],
  [1, 4, 2, 1, 1, 2],
  [1, 4, 2, 2, 1, 1],
  [2, 4, 1, 2, 1, 1],
  [2, 2, 1, 1, 1, 4],
  [4, 1, 3, 1, 1, 1],
  [2, 4, 1, 1, 1, 2],
  [1, 3, 4, 1, 1, 1],
  [1, 1, 1, 2, 4, 2],
  [1, 2, 1, 1, 4, 2],
  [1, 2, 1, 2, 4, 1],
  [1, 1, 4, 2, 1, 2],
  [1, 2, 4, 1, 1, 2],
  [1, 2, 4, 2, 1, 1],
  [4, 1, 1, 2, 1, 2],
  [4, 2, 1, 1, 1, 2],
  [4, 2, 1, 2, 1, 1],
  [2, 1, 2, 1, 4, 1],
  [2, 1, 4, 1, 2, 1],
  [4, 1, 2, 1, 2, 1],
  [1, 1, 1, 1, 4, 3],
  [1, 1, 1, 3, 4, 1],
  [1, 3, 1, 1, 4, 1],
  [1, 1, 4, 1, 1, 3],
  [1, 1, 4, 3, 1, 1],
  [4, 1, 1, 1, 1, 3],
  [4, 1, 1, 3, 1, 1],
  [1, 1, 3, 1, 4, 1],
  [1, 1, 4, 1, 3, 1],
  [3, 1, 1, 1, 4, 1],
  [4, 1, 1, 1, 3, 1],
  [2, 1, 1, 4, 1, 2],
  [2, 1, 1, 2, 1, 4],
  [2, 1, 1, 2, 3, 2],
  [2, 3, 3, 1, 1, 1, 2],
]

function lookupC128(seg: readonly number[]): number {
  const at = C128.findIndex(p => p.length === seg.length && p.every((w, i) => w === seg[i]))
  if (at < 0)
    throw new Error(`Code 128 里没有 ${seg.join('')} 这个图案`)
  return at
}

interface Code128Decoded { text: string, fnc1First: boolean }

/** 走 A / B / C 三个子集的状态机，核 mod 103，FNC1 还原成 GS。 */
function decodeCode128(runs: readonly number[]): Code128Decoded {
  const words: number[] = []
  let i = 0
  while (i < runs.length) {
    const len = i + 7 === runs.length ? 7 : 6
    words.push(lookupC128(runs.slice(i, i + len)))
    i += len
  }
  const stop = words.pop()
  if (stop !== 106)
    throw new Error('没有以终止符结尾')
  const check = words.pop()!
  let sum = words[0]!
  for (let k = 1; k < words.length; k++) sum += words[k]! * k
  if (sum % 103 !== check)
    throw new Error(`校验对不上：算得 ${sum % 103}，码里是 ${check}`)

  let set: 'A' | 'B' | 'C' | undefined
  const STARTS: Record<number, 'A' | 'B' | 'C'> = { 103: 'A', 104: 'B', 105: 'C' }
  set = STARTS[words[0]!]!
  if (set === undefined)
    throw new Error(`起始符不对：${words[0]}`)
  let text = ''
  let fnc1First = false
  let shift: 'A' | 'B' | undefined
  for (let k = 1; k < words.length; k++) {
    const w = words[k]!
    const cur = shift ?? set
    shift = undefined
    if (w === 102) {
      if (k === 1)
        fnc1First = true
      else text += BAR_FNC1_CHAR
      continue
    }
    if (cur === 'C') {
      if (w < 100) {
        text += String(w).padStart(2, '0')
        continue
      }
      if (w === 100 || w === 101) {
        set = w === 100 ? 'B' : 'A'
        continue
      }
      throw new Error(`C 子集里不该出现 ${w}`)
    }
    if (w < 96) {
      if (cur === 'A')
        text += String.fromCharCode(w < 64 ? w + 32 : w - 64)
      else
        text += String.fromCharCode(w + 32)
      continue
    }
    if (w === 98) {
      shift = cur === 'A' ? 'B' : 'A'
      continue
    }
    const SWITCHES: Record<number, 'A' | 'B' | 'C'> = { 99: 'C', 100: 'B', 101: 'A' }
    const next = SWITCHES[w]
    if (next === undefined)
      throw new Error(`${cur} 子集里不该出现 ${w}`)
    set = next
  }
  return { text, fnc1First }
}

// ── EAN / UPC ──

/** 数字 0–9 的 L 图案按 7 位位串记（1 = 条）；G 是 L 逐位取反再倒序，R 是 L 逐位取反。 */
const EAN_L_BITS = ['0001101', '0011001', '0010011', '0111101', '0100011', '0110001', '0101111', '0111011', '0110111', '0001011']

function reverseBits(bits: string): string {
  return [...bits].reverse().join('')
}
function invertBits(bits: string): string {
  return [...bits].map(b => (b === '1' ? '0' : '1')).join('')
}

/** 把条空序列展开成逐模块的 0/1 串。 */
function toBits(runs: readonly number[]): string {
  let out = ''
  for (let i = 0; i < runs.length; i++) out += (i % 2 === 0 ? '1' : '0').repeat(runs[i]!)
  return out
}

/** 识别 7 位一格是哪个数字、用的哪种图案。 */
function readEanDigit(bits: string): { digit: number, kind: 'L' | 'G' | 'R' } {
  for (let d = 0; d < 10; d++) {
    const l = EAN_L_BITS[d]!
    if (bits === l)
      return { digit: d, kind: 'L' }
    if (bits === reverseBits(invertBits(l)))
      return { digit: d, kind: 'G' }
    if (bits === invertBits(l))
      return { digit: d, kind: 'R' }
  }
  throw new Error(`${bits} 不是任何数字`)
}

/** EAN-13 首位与左半六位奇偶的对应表，按规范 Table 3 另录。 */
const EAN13_FIRST: Readonly<Record<string, number>> = {
  LLLLLL: 0,
  LLGLGG: 1,
  LLGGLG: 2,
  LLGGGL: 3,
  LGLLGG: 4,
  LGGLLG: 5,
  LGGGLL: 6,
  LGLGLG: 7,
  LGLGGL: 8,
  LGGLGL: 9,
}

/** GS1 mod 10 校验，从右数第一位权 3。 */
function mod10(body: string): number {
  let sum = 0
  for (let i = 0; i < body.length; i++)
    sum += (body.charCodeAt(body.length - 1 - i) - 48) * (i % 2 === 0 ? 3 : 1)
  return (10 - (sum % 10)) % 10
}

function decodeEan13(runs: readonly number[]): string {
  const bits = toBits(runs)
  if (bits.length !== 95 || !bits.startsWith('101') || bits.slice(45, 50) !== '01010' || !bits.endsWith('101'))
    throw new Error('守卫条不对')
  let parity = ''
  let digits = ''
  for (let d = 0; d < 6; d++) {
    const { digit, kind } = readEanDigit(bits.slice(3 + d * 7, 10 + d * 7))
    if (kind === 'R')
      throw new Error('左半不该出现 R')
    parity += kind
    digits += digit
  }
  for (let d = 0; d < 6; d++) {
    const { digit, kind } = readEanDigit(bits.slice(50 + d * 7, 57 + d * 7))
    if (kind !== 'R')
      throw new Error('右半只能是 R')
    digits += digit
  }
  const first = EAN13_FIRST[parity]
  if (first === undefined)
    throw new Error(`奇偶 ${parity} 不对应任何首位`)
  const full = `${first}${digits}`
  if (mod10(full.slice(0, 12)) !== full.charCodeAt(12) - 48)
    throw new Error('校验位不对')
  return full
}

function decodeEan8(runs: readonly number[]): string {
  const bits = toBits(runs)
  if (bits.length !== 67 || !bits.startsWith('101') || bits.slice(31, 36) !== '01010' || !bits.endsWith('101'))
    throw new Error('守卫条不对')
  let digits = ''
  for (let d = 0; d < 4; d++) {
    const { digit, kind } = readEanDigit(bits.slice(3 + d * 7, 10 + d * 7))
    if (kind !== 'L')
      throw new Error('EAN-8 左半只能是 L')
    digits += digit
  }
  for (let d = 0; d < 4; d++) {
    const { digit, kind } = readEanDigit(bits.slice(36 + d * 7, 43 + d * 7))
    if (kind !== 'R')
      throw new Error('右半只能是 R')
    digits += digit
  }
  if (mod10(digits.slice(0, 7)) !== digits.charCodeAt(7) - 48)
    throw new Error('校验位不对')
  return digits
}

/** UPC-E：奇偶 → 数字系统与校验位，按规范 Table 4 另录（E = G 图案，O = L 图案）。 */
const UPCE_PARITY_TABLE: Readonly<Record<string, readonly [number, number]>> = {
  EEEOOO: [0, 0],
  EEOEOO: [0, 1],
  EEOOEO: [0, 2],
  EEOOOE: [0, 3],
  EOEEOO: [0, 4],
  EOOEEO: [0, 5],
  EOOOEE: [0, 6],
  EOEOEO: [0, 7],
  EOEOOE: [0, 8],
  EOOEOE: [0, 9],
  OOOEEE: [1, 0],
  OOEOEE: [1, 1],
  OOEEOE: [1, 2],
  OOEEEO: [1, 3],
  OEOOEE: [1, 4],
  OEEOOE: [1, 5],
  OEEEOO: [1, 6],
  OEOEOE: [1, 7],
  OEOEEO: [1, 8],
  OEEOEO: [1, 9],
}

/** UPC-E 展开成 UPC-A 主体，按规范另写一遍。 */
function expandUpce(ns: number, six: string): string {
  const [a, b, c, d, e, f] = [...six] as [string, string, string, string, string, string]
  switch (f) {
    case '0': case '1': case '2': return `${ns}${a}${b}${f}0000${c}${d}${e}`
    case '3': return `${ns}${a}${b}${c}00000${d}${e}`
    case '4': return `${ns}${a}${b}${c}${d}00000${e}`
    default: return `${ns}${a}${b}${c}${d}${e}0000${f}`
  }
}

function decodeUpce(runs: readonly number[]): string {
  const bits = toBits(runs)
  if (bits.length !== 51 || !bits.startsWith('101') || !bits.endsWith('010101'))
    throw new Error('守卫条不对')
  let parity = ''
  let six = ''
  for (let d = 0; d < 6; d++) {
    const { digit, kind } = readEanDigit(bits.slice(3 + d * 7, 10 + d * 7))
    if (kind === 'R')
      throw new Error('UPC-E 不该出现 R')
    parity += kind === 'G' ? 'E' : 'O'
    six += digit
  }
  const hit = UPCE_PARITY_TABLE[parity]
  if (!hit)
    throw new Error(`奇偶 ${parity} 不对应任何数字系统与校验位`)
  const [ns, check] = hit
  if (mod10(expandUpce(ns, six)) !== check)
    throw new Error('校验位不对')
  return `${ns}${six}${check}`
}

// ── ITF ──

const ITF_DIGITS = ['NNWWN', 'WNNNW', 'NWNNW', 'WWNNN', 'NNWNW', 'WNWNN', 'NWWNN', 'NNNWW', 'WNNWN', 'NWNWN']

function decodeItf(runs: readonly number[]): string {
  const narrow = Math.min(...runs)
  const wide = Math.max(...runs)
  const kind = (w: number): 'N' | 'W' => {
    if (w === narrow)
      return 'N'
    if (w === wide)
      return 'W'
    throw new Error(`宽度 ${w} 既不是窄也不是宽`)
  }
  if (runs.slice(0, 4).map(kind).join('') !== 'NNNN')
    throw new Error('起始符不对')
  if (runs.slice(-3).map(kind).join('') !== 'WNN')
    throw new Error('终止符不对')
  const body = runs.slice(4, -3)
  if (body.length % 10 !== 0)
    throw new Error('数据段不是整数对')
  let digits = ''
  for (let p = 0; p < body.length; p += 10) {
    const bars = [0, 2, 4, 6, 8].map(k => kind(body[p + k]!)).join('')
    const spaces = [1, 3, 5, 7, 9].map(k => kind(body[p + k]!)).join('')
    const a = ITF_DIGITS.indexOf(bars)
    const b = ITF_DIGITS.indexOf(spaces)
    if (a < 0 || b < 0)
      throw new Error(`${bars} / ${spaces} 不是数字`)
    digits += `${a}${b}`
  }
  if (mod10(digits.slice(0, -1)) !== digits.charCodeAt(digits.length - 1) - 48)
    throw new Error('校验位不对')
  return digits
}

// ── Code 39 ──

const C39_ALPHABET = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ-. $/+%'
// 按 zxing Code39Reader.CHARACTER_ENCODINGS 誊录，九位位串高位在前，1 = 宽
const C39_ENCODINGS = [
  0x034,
  0x121,
  0x061,
  0x160,
  0x031,
  0x130,
  0x070,
  0x025,
  0x124,
  0x064,
  0x109,
  0x049,
  0x148,
  0x019,
  0x118,
  0x058,
  0x00D,
  0x10C,
  0x04C,
  0x01C,
  0x103,
  0x043,
  0x142,
  0x013,
  0x112,
  0x052,
  0x007,
  0x106,
  0x046,
  0x016,
  0x181,
  0x0C1,
  0x1C0,
  0x091,
  0x190,
  0x0D0,
  0x085,
  0x184,
  0x0C4,
  0x0A8,
  0x0A2,
  0x08A,
  0x02A,
]
const C39_ASTERISK = 0x094

function decodeCode39(runs: readonly number[], checksum: boolean): string {
  const narrow = Math.min(...runs)
  const wide = Math.max(...runs)
  if ((runs.length + 1) % 10 !== 0)
    throw new Error('段数不是 9n + (n - 1)')
  const chars: number[] = []
  for (let at = 0; at < runs.length; at += 10) {
    if (at > 0 && runs[at - 1] !== narrow)
      throw new Error('字符间隔不是窄空')
    let pattern = 0
    for (let k = 0; k < 9; k++) {
      const w = runs[at + k]!
      if (w !== narrow && w !== wide)
        throw new Error(`宽度 ${w} 既不是窄也不是宽`)
      pattern = (pattern << 1) | (w === wide ? 1 : 0)
    }
    chars.push(pattern)
  }
  if (chars.shift() !== C39_ASTERISK || chars.pop() !== C39_ASTERISK)
    throw new Error('起止符不是星号')
  const values = chars.map((p) => {
    const at = C39_ENCODINGS.indexOf(p)
    if (at < 0)
      throw new Error(`图案 ${p.toString(2)} 不是任何字符`)
    return at
  })
  if (checksum) {
    const check = values.pop()!
    const sum = values.reduce((a, b) => a + b, 0)
    if (sum % 43 !== check)
      throw new Error('mod 43 校验不对')
  }
  return values.map(v => C39_ALPHABET[v]!).join('')
}

// ── 回环 ──

describe('code 128 回环', () => {
  it.each([
    'Hello, World!',
    'ABC-abc-1234',
    '1234567890',
    '12345',
    '42',
    '4',
    'a\tb',
    'a\t\tb',
    '\u0001\u0002ABC\u001Fxyz',
    'Mixed 00012 digits 3 and 456789 tail 12',
    ' ',
    '~',
    'The quick brown fox jumps over the lazy dog 0123456789',
    'AB1234x',
  ])('%j', (value) => {
    const { runs, encoded } = barEncode('code128', value)
    const decoded = decodeCode128(runs)
    expect(decoded.text).toBe(value)
    expect(decoded.fnc1First).toBe(false)
    expect(encoded).toBe(value)
  })

  it('gs1：起始 FNC1 与内容里的 GS 都还原', () => {
    const value = `0112345678901231${BAR_FNC1_CHAR}10ABC${BAR_FNC1_CHAR}21xyz`
    const { runs } = barEncode('code128', value, { gs1: true })
    const decoded = decodeCode128(runs)
    expect(decoded.fnc1First).toBe(true)
    expect(decoded.text).toBe(value)
  })

  it('全部 128 个 ASCII 字符各自单独编、成串编都回得来', () => {
    let all = ''
    for (let c = 0; c < 128; c++) {
      if (c === 0x1D)
        continue
      const ch = String.fromCharCode(c)
      all += ch
      expect(decodeCode128(barEncode('code128', ch).runs).text).toBe(ch)
    }
    expect(decodeCode128(barEncode('code128', all).runs).text).toBe(all)
  })

  it('同一码字内挪动一个模块，要么查不到图案要么过不了校验', () => {
    const { runs } = barEncode('code128', 'tamper-me-123')
    let attempts = 0
    let caught = 0
    for (let i = 6; i < runs.length - 8; i++) {
      // 只在同一码字内挪：把一个模块从 i + 1 段挪到 i 段，总宽不变
      if (runs[i + 1]! <= 1 || Math.floor(i / 6) !== Math.floor((i + 1) / 6))
        continue
      const bad = [...runs]
      bad[i]!++
      bad[i + 1]!--
      attempts++
      try {
        if (decodeCode128(bad).text !== 'tamper-me-123')
          caught++
      }
      catch {
        caught++
      }
    }
    expect(attempts).toBeGreaterThan(10)
    expect(caught).toBe(attempts)
  })
})

describe('eAN / UPC 回环', () => {
  it.each(['4006381333931', '5901234123457', '0123456789012', '9780306406157', '4012345678901'])('eAN-13 %s', (full) => {
    expect(decodeEan13(barEncode('ean13', full).runs)).toBe(full)
    expect(decodeEan13(barEncode('ean13', full.slice(0, 12)).runs)).toBe(full)
  })

  it('eAN-13 十个首位各自的奇偶都推得回来', () => {
    for (let first = 0; first < 10; first++) {
      const body = `${first}23456789012`
      const { encoded, runs } = barEncode('ean13', body)
      expect(decodeEan13(runs)).toBe(encoded)
    }
  })

  it.each(['036000291452', '012345678905', '999999999993'])('uPC-A %s 与首位为 0 的 EAN-13 互通', (full) => {
    const { runs, encoded } = barEncode('upca', full)
    expect(encoded).toBe(full)
    expect(decodeEan13(runs)).toBe(`0${full}`)
  })

  it.each(['96385074', '12345670', '55123457'])('eAN-8 %s', (full) => {
    expect(decodeEan8(barEncode('ean8', full).runs)).toBe(full)
    expect(decodeEan8(barEncode('ean8', full.slice(0, 7)).runs)).toBe(full)
  })

  it('uPC-E：两个数字系统 × 十个校验位的奇偶全部回得来', () => {
    // 遍历末位 0–9 与两个数字系统，展开规则五档全覆盖
    for (const ns of ['0', '1']) {
      for (let last = 0; last < 10; last++) {
        const six = `12345${last}`
        const { runs, encoded } = barEncode('upce', `${ns}${six}`)
        expect(decodeUpce(runs)).toBe(encoded)
        expect(encoded.startsWith(`${ns}${six}`)).toBe(true)
      }
    }
    // 维基百科的示例：04252614 ↔ 042100005264
    expect(decodeUpce(barEncode('upce', '04252614').runs)).toBe('04252614')
    expect(expandUpce(0, '425261')).toBe('04210000526')
  })
})

describe('iTF-14 回环', () => {
  it.each(['15400141288763', '00012345678905', '99999999999997'])('%s', (full) => {
    expect(decodeItf(barEncode('itf14', full).runs)).toBe(full)
    expect(decodeItf(barEncode('itf14', full.slice(0, 13)).runs)).toBe(full)
  })
})

describe('code 39 回环', () => {
  it.each(['CODE39', 'HELLO WORLD', '-. $/+%', '0123456789', 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'A'])('%j', (value) => {
    expect(decodeCode39(barEncode('code39', value).runs, false)).toBe(value)
    expect(decodeCode39(barEncode('code39', value, { checksum: true }).runs, true)).toBe(value)
  })
})

describe('各码制的序列都从条起、于条止，且宽度之和等于 width', () => {
  it.each<[BarCodeFormat, string]>([
    ['code128', 'width-check'],
    ['ean13', '4006381333931'],
    ['ean8', '96385074'],
    ['upca', '036000291452'],
    ['upce', '04252614'],
    ['itf14', '15400141288763'],
    ['code39', 'WIDTH'],
  ])('%s', (format, value) => {
    const { runs, width } = barEncode(format, value)
    expect(runs.length % 2).toBe(1)
    expect(runs.reduce((a, b) => a + b, 0)).toBe(width)
  })
})
