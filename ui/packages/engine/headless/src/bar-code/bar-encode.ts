/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

/**
 * 一维码编码器：把一段文本算成条空序列。
 *
 * 纯函数：不碰 DOM、不读全局，同样的入参恒给同一份序列。
 *
 * 七种码制各自一张规格表，出来的都是同一种东西——从条开始、条空交替的宽度数组（单位是模块，
 * 即最窄条宽 X）；守卫条区间与人读文字的落位也一并算出，几何换算交给 connect。
 *
 * · code128（ISO/IEC 15417）：A / B / C 三个子集按 GS1 通用规范的规则自动切换与 shift，
 *   mod 103 校验；gs1 模式在起始符后放 FNC1，内容里的 GS（U+001D）也编成 FNC1，即 GS1-128。
 * · ean13 / ean8 / upca / upce（ISO/IEC 15420）：定长数字，校验位可省（补上）也可给（核对）；
 *   守卫条比数据条长，人读数字逐位落在各自那 7 个模块的格子下。
 * · itf14（ISO/IEC 16390）：14 位交叉二五条码，宽窄比 3:1，GS1 校验位。
 * · code39（ISO/IEC 16388）：43 个字符，宽窄比 3:1，星号起止，mod 43 校验可选。
 */

/** 码制。 */
export type BarFormat = 'code128' | 'ean13' | 'ean8' | 'upca' | 'upce' | 'itf14' | 'code39'

/** 人读文字里的一段：锚点的模块坐标（不含静区，可为负——EAN 的首位落在左静区里）。 */
export interface BarText {
  readonly x: number
  readonly anchor: 'start' | 'middle' | 'end'
  readonly text: string
}

export interface BarSymbol {
  readonly format: BarFormat
  /** 条空交替的宽度，单位是模块；首元素是条，末元素也是条。 */
  readonly runs: readonly number[]
  /** 不含静区的总宽，模块。 */
  readonly width: number
  /** 实际编进码里的内容，含补上的校验位；控制码字（FNC1）不在其中。 */
  readonly encoded: string
  /** 比数据条长的守卫条，模块区间 [start, end)。 */
  readonly guards: readonly (readonly [number, number])[]
  /** 人读文字。 */
  readonly text: readonly BarText[]
}

export interface BarEncodeOptions {
  /** 只对 code128 有意义：起始符后放 FNC1，即 GS1-128。 */
  readonly gs1?: boolean
  /** 只对 code39 有意义：附 mod 43 校验字符。 */
  readonly checksum?: boolean
}

/** GS1-128 里表示 FNC1 的字符：内容里写 GS（U+001D）就是变长 AI 之间的分隔。 */
export const BAR_FNC1_CHAR = '\u001D'

// ── 公共 ──

/** 一段内容全是 ASCII 数字。 */
function isDigits(text: string): boolean {
  return /^\d+$/.test(text)
}

/** 挑出第一个不是数字的字符，报错时点名用。 */
function firstNonDigit(text: string): string {
  return [...text].find(ch => ch < '0' || ch > '9') ?? ''
}

/**
 * GS1 校验位：从右往左按 3、1、3、1 … 加权求和，补到 10 的整数倍。
 * EAN-13 / EAN-8 / UPC-A / UPC-E（展开后）/ ITF-14 全是这一个公式。
 */
export function gs1CheckDigit(digits: string): number {
  let sum = 0
  for (let i = 0; i < digits.length; i++) {
    const weight = (digits.length - i) % 2 === 1 ? 3 : 1
    sum += (digits.charCodeAt(i) - 48) * weight
  }
  return (10 - (sum % 10)) % 10
}

/**
 * 定长数字码制的公共入口：只认数字、长度要么是 n（补校验位）要么是 n+1（核校验位）。
 * 返回带校验位的完整数字串。
 */
function resolveDigits(name: string, value: string, bodyLength: number): string {
  if (!isDigits(value))
    throw new Error(`${name} 只认数字，「${firstNonDigit(value)}」不在其中`)
  if (value.length === bodyLength)
    return value + gs1CheckDigit(value)
  if (value.length === bodyLength + 1) {
    const expected = gs1CheckDigit(value.slice(0, bodyLength))
    const given = value.charCodeAt(bodyLength) - 48
    if (given !== expected)
      throw new Error(`${name} 的校验位不对：按前 ${bodyLength} 位算应为 ${expected}，收到 ${given}`)
    return value
  }
  throw new Error(`${name} 要 ${bodyLength} 或 ${bodyLength + 1} 位数字，收到 ${value.length} 位`)
}

/** 把一串 "212222" 这样的宽度字面量拆成数字数组。 */
function widths(pattern: string): number[] {
  return [...pattern].map(ch => ch.charCodeAt(0) - 48)
}

/** 累加宽度。 */
function sum(runs: readonly number[]): number {
  let total = 0
  for (const run of runs) total += run
  return total
}

// ── Code 128 ──

/**
 * 107 个码字的条空宽度，下标即码字值：0–95 是 A / B 共用的可打印字符与 A 的控制字符，
 * 96–101 是 FNC / SHIFT / CODE 切换，102 是 FNC1，103–105 起始，106 终止（终止符多一根 2 宽的条）。
 */
const CODE128_PATTERNS: readonly string[] = [
  '212222',
  '222122',
  '222221',
  '121223',
  '121322',
  '131222',
  '122213',
  '122312',
  '132212',
  '221213',
  '221312',
  '231212',
  '112232',
  '122132',
  '122231',
  '113222',
  '123122',
  '123221',
  '223211',
  '221132',
  '221231',
  '213212',
  '223112',
  '312131',
  '311222',
  '321122',
  '321221',
  '312212',
  '322112',
  '322211',
  '212123',
  '212321',
  '232121',
  '111323',
  '131123',
  '131321',
  '112313',
  '132113',
  '132311',
  '211313',
  '231113',
  '231311',
  '112133',
  '112331',
  '132131',
  '113123',
  '113321',
  '133121',
  '313121',
  '211331',
  '231131',
  '213113',
  '213311',
  '213131',
  '311123',
  '311321',
  '331121',
  '312113',
  '312311',
  '332111',
  '314111',
  '221411',
  '431111',
  '111224',
  '111422',
  '121124',
  '121421',
  '141122',
  '141221',
  '112214',
  '112412',
  '122114',
  '122411',
  '142112',
  '142211',
  '241211',
  '221114',
  '413111',
  '241112',
  '134111',
  '111242',
  '121142',
  '121241',
  '114212',
  '124112',
  '124211',
  '411212',
  '421112',
  '421211',
  '212141',
  '214121',
  '412121',
  '111143',
  '111341',
  '131141',
  '114113',
  '114311',
  '411113',
  '411311',
  '113141',
  '114131',
  '311141',
  '411131',
  '211412',
  '211214',
  '211232',
  '2331112',
]

const C128_SHIFT = 98
const C128_CODE_C = 99
const C128_CODE_B = 100
const C128_CODE_A = 101
const C128_FNC1 = 102
const C128_START_A = 103
const C128_START_B = 104
const C128_START_C = 105
const C128_STOP = 106

type CodeSet = 'A' | 'B' | 'C'

/** 字符在 A 子集里的值；不在 A 里（小写与 96 以上）返回 -1。 */
function valueInA(code: number): number {
  if (code >= 32 && code < 96)
    return code - 32
  if (code < 32)
    return code + 64
  return -1
}

/** 字符在 B 子集里的值；不在 B 里（控制字符）返回 -1。 */
function valueInB(code: number): number {
  return code >= 32 && code < 128 ? code - 32 : -1
}

/** 从 at 起连续的数字个数。 */
function digitRun(codes: readonly number[], at: number): number {
  let n = 0
  while (at + n < codes.length && codes[at + n]! >= 48 && codes[at + n]! <= 57) n++
  return n
}

/**
 * 从 at 起往后看，下一个"只能在 A 或只能在 B"的字符落在哪个子集：
 * 控制字符（< 32）只在 A，小写与 96 以上只在 B；都不遇到就回 undefined。
 */
function nextExclusiveSet(codes: readonly number[], at: number): CodeSet | undefined {
  for (let i = at; i < codes.length; i++) {
    const code = codes[i]!
    if (code === 0x1D)
      continue
    if (code < 32)
      return 'A'
    if (code >= 96)
      return 'B'
  }
  return undefined
}

/**
 * Code 128 码字序列（不含校验与终止），按 GS1 通用规范 5.4.7.7 的规则选起始符与切换：
 * · 起始：全是数字且恰 2 位、或开头 ≥ 4 位数字 → C；否则看第一个"专属"字符落在 A 还是 B，都没有 → B。
 * · 在 C 里：两位两位编数字；剩下不足两位数字就切到 A / B（按下一个专属字符定，没有 → B）。
 * · 在 A / B 里：往后 ≥ 4 位数字、或余下恰 2 位数字 → 切 C；当前字符不在本子集：
 *   紧接着那个字符也不在本子集就 CODE 切过去，否则 SHIFT 一个。
 * FNC1 在 gs1 模式下放在起始符后；内容里的 GS 编成 FNC1，不占子集。
 */
function code128Codewords(codes: readonly number[], gs1: boolean): number[] {
  const out: number[] = []
  let set: CodeSet
  const leading = digitRun(codes, 0)
  if ((leading === codes.length && leading === 2) || leading >= 4) {
    set = 'C'
    out.push(C128_START_C)
  }
  else {
    set = nextExclusiveSet(codes, 0) ?? 'B'
    out.push(set === 'A' ? C128_START_A : C128_START_B)
  }
  if (gs1)
    out.push(C128_FNC1)

  let i = 0
  while (i < codes.length) {
    const code = codes[i]!
    if (code === 0x1D) {
      out.push(C128_FNC1)
      i++
      continue
    }
    if (set === 'C') {
      if (digitRun(codes, i) >= 2) {
        out.push((codes[i]! - 48) * 10 + (codes[i + 1]! - 48))
        i += 2
        continue
      }
      set = nextExclusiveSet(codes, i) ?? 'B'
      out.push(set === 'A' ? C128_CODE_A : C128_CODE_B)
      continue
    }
    const digits = digitRun(codes, i)
    if (digits >= 4 || (digits === 2 && i + 2 === codes.length)) {
      set = 'C'
      out.push(C128_CODE_C)
      continue
    }
    const inSet = set === 'A' ? valueInA(code) : valueInB(code)
    if (inSet >= 0) {
      out.push(inSet)
      i++
      continue
    }
    // 当前字符只在另一个子集里
    const other: CodeSet = set === 'A' ? 'B' : 'A'
    const otherValue = other === 'A' ? valueInA(code) : valueInB(code)
    const next = codes[i + 1]
    const nextAlsoOther = next !== undefined && next !== 0x1D
      && (set === 'A' ? valueInA(next) : valueInB(next)) < 0
    if (nextAlsoOther) {
      set = other
      out.push(other === 'A' ? C128_CODE_A : C128_CODE_B)
      continue
    }
    out.push(C128_SHIFT, otherValue)
    i++
  }
  return out
}

function encodeCode128(value: string, gs1: boolean): BarSymbol {
  const codes: number[] = []
  for (const ch of value) {
    const code = ch.codePointAt(0)!
    if (code > 127)
      throw new Error(`Code 128 只认 ASCII 0–127，「${ch}」不在其中`)
    if (code === 0x1D && !gs1)
      throw new Error('内容里的 GS（U+001D）只在 gs1 模式下当 FNC1 分隔用，普通 Code 128 不收它')
    codes.push(code)
  }
  const words = code128Codewords(codes, gs1)
  let check = words[0]!
  for (let i = 1; i < words.length; i++) check += words[i]! * i
  words.push(check % 103, C128_STOP)

  const runs: number[] = []
  for (const word of words) runs.push(...widths(CODE128_PATTERNS[word]!))
  const width = sum(runs)
  const encoded = value.replaceAll(BAR_FNC1_CHAR, '')
  return {
    format: 'code128',
    runs,
    width,
    encoded,
    guards: [],
    text: [{ x: width / 2, anchor: 'middle', text: encoded }],
  }
}

// ── EAN / UPC ──

/** 数字 0–9 的 L 图案（空条空条）；G 是 L 倒过来，R 是 L 按条空互换——宽度不变，只是起于条。 */
const EAN_L: readonly string[] = ['3211', '2221', '2122', '1411', '1132', '1231', '1114', '1312', '1213', '3112']

/** EAN-13 首位 0–9 决定左半六位各用 L 还是 G：位串高位在前，1 = G。 */
const EAN13_PARITY: readonly number[] = [0x00, 0x0B, 0x0D, 0x0E, 0x13, 0x19, 0x1C, 0x15, 0x16, 0x1A]

/** UPC-E 数字系统 0 / 1 下，校验位 0–9 对应六位的奇偶：1 = 偶（G 图案）。系统 1 是系统 0 逐位取反。 */
const UPCE_PARITY: readonly (readonly number[])[] = [
  [0x38, 0x34, 0x32, 0x31, 0x2C, 0x26, 0x23, 0x2A, 0x29, 0x25],
  [0x07, 0x0B, 0x0D, 0x0E, 0x13, 0x19, 0x1C, 0x15, 0x16, 0x1A],
]

/** 一位数字的四段宽度：L 原样、G 倒序；R 与 L 同宽度，起于条这件事由调用方的奇偶位置保证。 */
function eanDigitRuns(digit: number, g: boolean): number[] {
  const w = widths(EAN_L[digit]!)
  return g ? w.reverse() : w
}

/** 每位数字一个居中的文字，格子宽 7 个模块。 */
function digitTexts(digits: string, startAt: number): BarText[] {
  return [...digits].map((ch, i) => ({ x: startAt + i * 7 + 3.5, anchor: 'middle' as const, text: ch }))
}

/**
 * EAN-13 与 UPC-A 同一副骨架：左守卫 101、六位（L/G 按首位定）、中央 01010、六位 R、右守卫 101，共 95 模块。
 * UPC-A 就是首位为 0 的 EAN-13，区别只在人读文字与守卫的延长范围。
 */
function encodeEan13Family(format: 'ean13' | 'upca', value: string): BarSymbol {
  const name = format === 'ean13' ? 'EAN-13' : 'UPC-A'
  const body = resolveDigits(name, value, format === 'ean13' ? 12 : 11)
  const full = format === 'ean13' ? body : `0${body}`
  const first = full.charCodeAt(0) - 48
  const parity = EAN13_PARITY[first]!

  const runs: number[] = [1, 1, 1]
  for (let i = 0; i < 6; i++)
    runs.push(...eanDigitRuns(full.charCodeAt(1 + i) - 48, ((parity >>> (5 - i)) & 1) === 1))
  runs.push(1, 1, 1, 1, 1)
  for (let i = 0; i < 6; i++)
    runs.push(...eanDigitRuns(full.charCodeAt(7 + i) - 48, false))
  runs.push(1, 1, 1)

  if (format === 'ean13') {
    return {
      format,
      runs,
      width: 95,
      encoded: full,
      guards: [[0, 3], [45, 50], [92, 95]],
      text: [
        { x: -1, anchor: 'end', text: full[0]! },
        ...digitTexts(full.slice(1, 7), 3),
        ...digitTexts(full.slice(7, 13), 50),
      ],
    }
  }
  // UPC-A：数字系统位与校验位各自的那 7 个模块也随守卫一起延长，文字挪到静区里
  return {
    format,
    runs,
    width: 95,
    encoded: body,
    guards: [[0, 10], [45, 50], [85, 95]],
    text: [
      { x: -1, anchor: 'end', text: body[0]! },
      ...digitTexts(body.slice(1, 6), 10),
      ...digitTexts(body.slice(6, 11), 50),
      { x: 96, anchor: 'start', text: body[11]! },
    ],
  }
}

/** EAN-8：左守卫、四位 L、中央、四位 R、右守卫，共 67 模块。 */
function encodeEan8(value: string): BarSymbol {
  const full = resolveDigits('EAN-8', value, 7)
  const runs: number[] = [1, 1, 1]
  for (let i = 0; i < 4; i++)
    runs.push(...eanDigitRuns(full.charCodeAt(i) - 48, false))
  runs.push(1, 1, 1, 1, 1)
  for (let i = 0; i < 4; i++)
    runs.push(...eanDigitRuns(full.charCodeAt(4 + i) - 48, false))
  runs.push(1, 1, 1)
  return {
    format: 'ean8',
    runs,
    width: 67,
    encoded: full,
    guards: [[0, 3], [31, 36], [64, 67]],
    text: [...digitTexts(full.slice(0, 4), 3), ...digitTexts(full.slice(4, 8), 36)],
  }
}

/** UPC-E 六位按末位规则展开成 UPC-A 的 11 位主体（不含校验）。 */
export function upceExpand(numberSystem: string, six: string): string {
  const last = six.charCodeAt(5) - 48
  if (last <= 2)
    return `${numberSystem}${six.slice(0, 2)}${six[5]}0000${six.slice(2, 5)}`
  if (last === 3)
    return `${numberSystem}${six.slice(0, 3)}00000${six.slice(3, 5)}`
  if (last === 4)
    return `${numberSystem}${six.slice(0, 4)}00000${six[4]}`
  return `${numberSystem}${six.slice(0, 5)}0000${six[5]}`
}

/**
 * UPC-E：6 位（数字系统按 0）、7 位（数字系统 + 6 位）或 8 位（再带校验位）。
 * 校验位按展开后的 UPC-A 算；六位的奇偶由数字系统与校验位共同决定。
 * 结构：左守卫 101、六位、终止 010101，共 51 模块。
 */
function encodeUpce(value: string): BarSymbol {
  if (!isDigits(value))
    throw new Error(`UPC-E 只认数字，「${firstNonDigit(value)}」不在其中`)
  let numberSystem = '0'
  let six: string
  let givenCheck: number | undefined
  if (value.length === 6) {
    six = value
  }
  else if (value.length === 7 || value.length === 8) {
    numberSystem = value[0]!
    six = value.slice(1, 7)
    if (value.length === 8)
      givenCheck = value.charCodeAt(7) - 48
  }
  else {
    throw new Error(`UPC-E 要 6、7 或 8 位数字，收到 ${value.length} 位`)
  }
  if (numberSystem !== '0' && numberSystem !== '1')
    throw new Error(`UPC-E 的数字系统位只能是 0 或 1，收到 ${numberSystem}`)
  const check = gs1CheckDigit(upceExpand(numberSystem, six))
  if (givenCheck !== undefined && givenCheck !== check)
    throw new Error(`UPC-E 的校验位不对：按展开后的 UPC-A 算应为 ${check}，收到 ${givenCheck}`)

  const parity = UPCE_PARITY[numberSystem === '0' ? 0 : 1]![check]!
  const runs: number[] = [1, 1, 1]
  for (let i = 0; i < 6; i++)
    runs.push(...eanDigitRuns(six.charCodeAt(i) - 48, ((parity >>> (5 - i)) & 1) === 1))
  runs.push(1, 1, 1, 1, 1, 1)
  const full = `${numberSystem}${six}${check}`
  return {
    format: 'upce',
    runs,
    width: 51,
    encoded: full,
    guards: [[0, 3], [45, 51]],
    text: [
      { x: -1, anchor: 'end', text: numberSystem },
      ...digitTexts(six, 3),
      { x: 52, anchor: 'start', text: String(check) },
    ],
  }
}

// ── ITF-14 ──

/** 交叉二五：每位五个元素，两宽三窄；w = 宽（3 模块），n = 窄（1 模块）。 */
const ITF_PATTERNS: readonly string[] = ['nnwwn', 'wnnnw', 'nwnnw', 'wwnnn', 'nnwnw', 'wnwnn', 'nwwnn', 'nnnww', 'wnnwn', 'nwnwn']

const WIDE = 3
const NARROW = 1

/** 起始 4 窄（条空条空），两位一对：条取奇数位的图案、空取偶数位的图案交叉排；终止宽条窄空窄条。 */
function encodeItf14(value: string): BarSymbol {
  const full = resolveDigits('ITF-14', value, 13)
  const runs: number[] = [NARROW, NARROW, NARROW, NARROW]
  for (let i = 0; i < 14; i += 2) {
    const bars = ITF_PATTERNS[full.charCodeAt(i) - 48]!
    const spaces = ITF_PATTERNS[full.charCodeAt(i + 1) - 48]!
    for (let k = 0; k < 5; k++)
      runs.push(bars[k] === 'w' ? WIDE : NARROW, spaces[k] === 'w' ? WIDE : NARROW)
  }
  runs.push(WIDE, NARROW, NARROW)
  const width = sum(runs)
  return {
    format: 'itf14',
    runs,
    width,
    encoded: full,
    guards: [],
    text: [{ x: width / 2, anchor: 'middle', text: full }],
  }
}

// ── Code 39 ──

const CODE39_ALPHABET = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ-. $/+%'

/**
 * 43 个字符的九元素图案，按位记宽窄：高位是第一个元素，1 = 宽。
 * 五条四空，恒三宽（两宽条一宽空，或 '$' '/' '+' '%' 那四个是三宽空）。
 */
const CODE39_PATTERNS: readonly number[] = [
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

/** 起止符 '*'。 */
const CODE39_START_STOP = 0x094

function code39Runs(pattern: number, runs: number[]): void {
  for (let bit = 8; bit >= 0; bit--)
    runs.push(((pattern >>> bit) & 1) === 1 ? WIDE : NARROW)
}

/** 每个字符九元素，字符之间隔一个窄空；可选 mod 43 校验字符附在末尾。 */
function encodeCode39(value: string, checksum: boolean): BarSymbol {
  let total = 0
  const values: number[] = []
  for (const ch of value) {
    const at = CODE39_ALPHABET.indexOf(ch)
    if (at < 0)
      throw new Error(`Code 39 只认大写字母、数字与 - . 空格 $ / + %，「${ch}」不在其中`)
    values.push(at)
    total += at
  }
  if (checksum)
    values.push(total % 43)
  const runs: number[] = []
  code39Runs(CODE39_START_STOP, runs)
  for (const v of values) {
    runs.push(NARROW)
    code39Runs(CODE39_PATTERNS[v]!, runs)
  }
  runs.push(NARROW)
  code39Runs(CODE39_START_STOP, runs)
  const width = sum(runs)
  const encoded = values.map(v => CODE39_ALPHABET[v]!).join('')
  return {
    format: 'code39',
    runs,
    width,
    encoded,
    guards: [],
    text: [{ x: width / 2, anchor: 'middle', text: encoded }],
  }
}

// ── 入口 ──

/**
 * 把 value 按 format 编成条空序列。
 * 内容不合该码制的规则（字符不在字符集、位数不对、给的校验位对不上）抛 Error，信息说清是哪一条。
 */
export function barEncode(format: BarFormat, value: string, options: BarEncodeOptions = {}): BarSymbol {
  switch (format) {
    case 'code128':
      return encodeCode128(value, options.gs1 === true)
    case 'ean13':
    case 'upca':
      return encodeEan13Family(format, value)
    case 'ean8':
      return encodeEan8(value)
    case 'upce':
      return encodeUpce(value)
    case 'itf14':
      return encodeItf14(value)
    case 'code39':
      return encodeCode39(value, options.checksum === true)
  }
}
