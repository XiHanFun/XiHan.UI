/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

/**
 * Aztec 编码器：把一段文本算成布尔矩阵（ISO/IEC 24778）。
 *
 * 纯函数：不碰 DOM、不读全局，同样的入参恒给同一份矩阵。
 *
 * 高层编码只用三种字符模式——大写、小写、数字——外加二进制移位：大写字母与空格 5 位一个，
 * 小写字母 5 位一个（切过去要一个锁存），数字 4 位一个；其余字符（标点、控制字符、非 ASCII）成串走
 * 二进制移位，每字节 8 位。混合模式与标点模式没有实现：它们把标点压得更紧，同样的内容能落在更小的
 * 符号上；扫出来的内容不受影响。字节按 ISO 8859-1 取（读码器的缺省解释），Latin-1 以外整段按 UTF-8。
 *
 * 结构：从中心的牛眼向外一圈圈铺数据层，紧凑型 1–4 层（15–27 模块见方）、完整型 4–32 层
 * （23–151 模块见方，5 层起每 16 个模块插一道参考网格）；模式信息绕在牛眼外圈，记层数与数据字数。
 * 纠错是 GF(2^m) 上的里德-所罗门，m 随层数取 6 / 8 / 10 / 12，模式信息用 GF(16)。
 */

import { createReedSolomon } from './reed-solomon'

export interface AztecEncodeOptions {
  /** 纠错码字至少占总字数的百分比，缺省 33（规范推荐不低于 23% 再加 3 个字）。 */
  readonly eccPercent?: number
}

export interface AztecMatrix {
  /** 层数：紧凑型 1–4，完整型 4–32。 */
  readonly layers: number
  /** 是不是紧凑型。 */
  readonly compact: boolean
  /** 边长，模块。 */
  readonly size: number
  /** 数据字数（不含纠错）。 */
  readonly codewords: number
  /** 模块矩阵，[行][列]，true = 深色。 */
  readonly modules: readonly (readonly boolean[])[]
}

const DEFAULT_ECC_PERCENT = 33
const MAX_LAYERS = 32
const MAX_COMPACT_LAYERS = 4

/** 各层数的字宽（位），下标即层数；紧凑型与完整型同表。 */
const WORD_SIZE: readonly number[] = [
  4,
  6,
  6,
  8,
  8,
  8,
  8,
  8,
  8,
  10,
  10,
  10,
  10,
  10,
  10,
  10,
  10,
  10,
  10,
  10,
  10,
  10,
  10,
  12,
  12,
  12,
  12,
  12,
  12,
  12,
  12,
  12,
  12,
]

/** 各字宽的域：本原多项式与位宽；生成多项式都从 α¹ 起。 */
const FIELDS = {
  4: createReedSolomon(0x13, 1, 4),
  6: createReedSolomon(0x43, 1, 6),
  8: createReedSolomon(0x12D, 1, 8),
  10: createReedSolomon(0x409, 1, 10),
  12: createReedSolomon(0x1069, 1, 12),
} as const

type WordSize = keyof typeof FIELDS

/** 某层数的总位数。 */
function totalBitsInLayer(layers: number, compact: boolean): number {
  return ((compact ? 88 : 112) + 16 * layers) * layers
}

// ── 高层编码 ──

type Mode = 'upper' | 'lower' | 'digit'

/** 大写 / 小写模式里的几个控制码，5 位。 */
const UPPER_LL = 28
const LOWER_US = 28
const DL = 30
const BS = 31
/** 数字模式里的控制码，4 位。 */
const DIGIT_UL = 14
const DIGIT_US = 15
/** 二进制移位一次最多带的字节数：5 位长度 1–31，再多用 5 位 0 加 11 位 (n − 31)。 */
const BINARY_SHORT_MAX = 31
const BINARY_LONG_MAX = 31 + 2047

function isUpper(b: number): boolean {
  return b >= 65 && b <= 90
}
function isLower(b: number): boolean {
  return b >= 97 && b <= 122
}
function isDigit(b: number): boolean {
  return b >= 48 && b <= 57
}
/** 三种字符模式之外的字节，只能走二进制移位。 */
function isBinary(b: number): boolean {
  return !(isUpper(b) || isLower(b) || isDigit(b) || b === 32)
}

class BitWriter {
  readonly bits: number[] = []
  append(value: number, length: number): void {
    for (let i = length - 1; i >= 0; i--)
      this.bits.push((value >>> i) & 1)
  }
}

/** 按 UTF-8 取字节。 */
function utf8Bytes(text: string): number[] {
  const out: number[] = []
  for (const char of text) {
    let code = char.codePointAt(0) ?? 0
    if (code >= 0xD800 && code <= 0xDFFF)
      code = 0xFFFD
    if (code < 0x80)
      out.push(code)
    else if (code < 0x800)
      out.push(0xC0 | (code >>> 6), 0x80 | (code & 0x3F))
    else if (code < 0x10000)
      out.push(0xE0 | (code >>> 12), 0x80 | ((code >>> 6) & 0x3F), 0x80 | (code & 0x3F))
    else
      out.push(0xF0 | (code >>> 18), 0x80 | ((code >>> 12) & 0x3F), 0x80 | ((code >>> 6) & 0x3F), 0x80 | (code & 0x3F))
  }
  return out
}

/** 全在 Latin-1 内就逐字符取码点，否则 UTF-8。 */
function toBytes(text: string): number[] {
  for (const char of text) {
    if ((char.codePointAt(0) ?? 0) > 0xFF)
      return utf8Bytes(text)
  }
  return [...text].map(char => char.codePointAt(0)!)
}

/**
 * 高层编码：大写 / 小写 / 数字三种模式贪心切换，其余字节成串二进制移位。
 * 起始模式是大写；锁存换模式，移位只管一个字符（U/S）或一串字节（B/S）后回到原模式。
 */
function highLevelEncode(bytes: readonly number[]): number[] {
  const w = new BitWriter()
  let mode: Mode = 'upper'
  let i = 0
  while (i < bytes.length) {
    const b = bytes[i]!
    if (isBinary(b)) {
      // 数字模式里没有 B/S，先锁回大写
      if (mode === 'digit') {
        w.append(DIGIT_UL, 4)
        mode = 'upper'
      }
      let n = 0
      while (i + n < bytes.length && n < BINARY_LONG_MAX && isBinary(bytes[i + n]!)) n++
      w.append(BS, 5)
      if (n <= BINARY_SHORT_MAX) {
        w.append(n, 5)
      }
      else {
        w.append(0, 5)
        w.append(n - 31, 11)
      }
      for (let k = 0; k < n; k++) w.append(bytes[i + k]!, 8)
      i += n
      continue
    }
    if (mode === 'upper') {
      if (isUpper(b) || b === 32) {
        w.append(b === 32 ? 1 : b - 65 + 2, 5)
        i++
      }
      else if (isLower(b)) {
        w.append(UPPER_LL, 5)
        mode = 'lower'
      }
      else {
        w.append(DL, 5)
        mode = 'digit'
      }
      continue
    }
    if (mode === 'lower') {
      if (isLower(b) || b === 32) {
        w.append(b === 32 ? 1 : b - 97 + 2, 5)
        i++
      }
      else if (isUpper(b)) {
        // 小写模式没有回大写的锁存，一个大写字母用 U/S 移位带过去
        w.append(LOWER_US, 5)
        w.append(b - 65 + 2, 5)
        i++
      }
      else {
        w.append(DL, 5)
        mode = 'digit'
      }
      continue
    }
    // 数字模式
    if (isDigit(b) || b === 32) {
      w.append(b === 32 ? 1 : b - 48 + 2, 4)
      i++
    }
    else if (isUpper(b) && !(i + 1 < bytes.length && (isUpper(bytes[i + 1]!) || isLower(bytes[i + 1]!)))) {
      // 孤零零一个大写字母，移位带过去比锁存来回省
      w.append(DIGIT_US, 4)
      w.append(b - 65 + 2, 5)
      i++
    }
    else {
      w.append(DIGIT_UL, 4)
      mode = 'upper'
    }
  }
  return w.bits
}

// ── 位填充与纠错 ──

/**
 * 按字宽分组填充：一个字的前 m − 1 位全 0 就在末尾塞一个 1、全 1 就塞一个 0（原来那一位挤到下一个字），
 * 末尾不足一个字的用 1 补齐——读码器靠这条规则把全 0 / 全 1 的字与同步图形区分开。
 */
function stuffBits(bits: readonly number[], wordSize: number): number[] {
  const out: number[] = []
  const mask = (1 << wordSize) - 2
  for (let i = 0; i < bits.length; i += wordSize) {
    let word = 0
    for (let j = 0; j < wordSize; j++) {
      if (i + j >= bits.length || bits[i + j] === 1)
        word |= 1 << (wordSize - 1 - j)
    }
    if ((word & mask) === mask) {
      appendWord(out, word & mask, wordSize)
      i--
    }
    else if ((word & mask) === 0) {
      appendWord(out, word | 1, wordSize)
      i--
    }
    else {
      appendWord(out, word, wordSize)
    }
  }
  return out
}

function appendWord(bits: number[], value: number, length: number): void {
  for (let i = length - 1; i >= 0; i--) bits.push((value >>> i) & 1)
}

/** 位串按字宽切成字，不足一字的尾巴丢弃（调用前已保证整字）。 */
function toWords(bits: readonly number[], wordSize: number): number[] {
  const words: number[] = []
  for (let i = 0; i + wordSize <= bits.length; i += wordSize) {
    let v = 0
    for (let j = 0; j < wordSize; j++) v = (v << 1) | bits[i + j]!
    words.push(v)
  }
  return words
}

/** 数据字后面补纠错字直到填满 totalBits；开头不足一字的余位用 0 占住。 */
function withCheckWords(dataBits: readonly number[], totalBits: number, wordSize: WordSize): number[] {
  const totalWords = Math.floor(totalBits / wordSize)
  const data = toWords(dataBits, wordSize)
  const ecc = FIELDS[wordSize].remainder(data, totalWords - data.length)
  const out: number[] = Array.from<number>({ length: totalBits % wordSize }).fill(0)
  for (const word of data) appendWord(out, word, wordSize)
  for (const word of ecc) appendWord(out, word, wordSize)
  return out
}

/** 模式信息：紧凑型 2 位层数 + 6 位字数，完整型 5 位 + 11 位；各自补 GF(16) 纠错到 28 / 40 位。 */
function modeMessage(compact: boolean, layers: number, words: number): number[] {
  const w = new BitWriter()
  if (compact) {
    w.append(layers - 1, 2)
    w.append(words - 1, 6)
    return withCheckWords(w.bits, 28, 4)
  }
  w.append(layers - 1, 5)
  w.append(words - 1, 11)
  return withCheckWords(w.bits, 40, 4)
}

// ── 布局 ──

type Grid = boolean[][]

function drawBullsEye(grid: Grid, center: number, size: number): void {
  const set = (x: number, y: number): void => {
    grid[y]![x] = true
  }
  for (let i = 0; i < size; i += 2) {
    for (let j = center - i; j <= center + i; j++) {
      set(j, center - i)
      set(j, center + i)
      set(center - i, j)
      set(center + i, j)
    }
  }
  // 牛眼外圈四角的方向标记
  set(center - size, center - size)
  set(center - size + 1, center - size)
  set(center - size, center - size + 1)
  set(center + size, center - size)
  set(center + size, center - size + 1)
  set(center + size, center + size - 1)
}

function drawModeMessage(grid: Grid, compact: boolean, size: number, bits: readonly number[]): void {
  const center = Math.floor(size / 2)
  const set = (x: number, y: number): void => {
    grid[y]![x] = true
  }
  if (compact) {
    for (let i = 0; i < 7; i++) {
      const offset = center - 3 + i
      if (bits[i])
        set(offset, center - 5)
      if (bits[i + 7])
        set(center + 5, offset)
      if (bits[20 - i])
        set(offset, center + 5)
      if (bits[27 - i])
        set(center - 5, offset)
    }
    return
  }
  for (let i = 0; i < 10; i++) {
    const offset = center - 5 + i + Math.floor(i / 5)
    if (bits[i])
      set(offset, center - 7)
    if (bits[i + 10])
      set(center + 7, offset)
    if (bits[29 - i])
      set(offset, center + 7)
    if (bits[39 - i])
      set(center - 7, offset)
  }
}

/**
 * 编码入口。内容超出 32 层容量时抛 RangeError。
 * @example
 * aztecEncode('Hello') // 紧凑型 1 层，15×15
 */
export function aztecEncode(text: string, options: AztecEncodeOptions = {}): AztecMatrix {
  const eccPercent = options.eccPercent ?? DEFAULT_ECC_PERCENT
  const bits = highLevelEncode(toBytes(text))
  const eccBits = Math.floor((bits.length * eccPercent) / 100) + 11
  const totalSizeBits = bits.length + eccBits

  let compact = true
  let layers = 0
  let totalBits = 0
  let wordSize: WordSize = 6
  let stuffed: number[] | undefined
  for (let i = 0; ; i++) {
    if (i > MAX_LAYERS)
      throw new RangeError(`内容 ${text.length} 个字符编成 ${bits.length} 位，超出 Aztec 32 层的容量；截断会得到一张扫得出、但内容是半截的码`)
    compact = i <= MAX_COMPACT_LAYERS - 1
    layers = compact ? i + 1 : i
    totalBits = totalBitsInLayer(layers, compact)
    if (totalSizeBits > totalBits)
      continue
    const size = WORD_SIZE[layers]! as WordSize
    if (stuffed === undefined || wordSize !== size) {
      wordSize = size
      stuffed = stuffBits(bits, wordSize)
    }
    const usable = totalBits - (totalBits % wordSize)
    if (compact && stuffed.length > wordSize * 64)
      continue
    if (stuffed.length + eccBits <= usable)
      break
  }
  const message = withCheckWords(stuffed!, totalBits, wordSize)
  const words = stuffed!.length / wordSize
  const mode = modeMessage(compact, layers, words)

  // 完整型 5 层起每 16 个模块插一道参考网格，数据坐标要跳过网格所在的行列
  const baseSize = (compact ? 11 : 14) + layers * 4
  const map: number[] = Array.from<number>({ length: baseSize })
  let size: number
  if (compact) {
    size = baseSize
    for (let i = 0; i < baseSize; i++) map[i] = i
  }
  else {
    size = baseSize + 1 + 2 * Math.floor((Math.floor(baseSize / 2) - 1) / 15)
    const origCenter = Math.floor(baseSize / 2)
    const center = Math.floor(size / 2)
    for (let i = 0; i < origCenter; i++) {
      const offset = i + Math.floor(i / 15)
      map[origCenter - i - 1] = center - offset - 1
      map[origCenter + i] = center + offset + 1
    }
  }

  const grid: Grid = Array.from({ length: size }, () => Array.from<boolean>({ length: size }).fill(false))
  const set = (x: number, y: number): void => {
    grid[y]![x] = true
  }
  // 数据一层层从里往外铺，每层四边各铺两行（列）
  for (let i = 0, rowOffset = 0; i < layers; i++) {
    const rowSize = (layers - i) * 4 + (compact ? 9 : 12)
    for (let j = 0; j < rowSize; j++) {
      const columnOffset = j * 2
      for (let k = 0; k < 2; k++) {
        if (message[rowOffset + columnOffset + k])
          set(map[i * 2 + k]!, map[i * 2 + j]!)
        if (message[rowOffset + rowSize * 2 + columnOffset + k])
          set(map[i * 2 + j]!, map[baseSize - 1 - i * 2 - k]!)
        if (message[rowOffset + rowSize * 4 + columnOffset + k])
          set(map[baseSize - 1 - i * 2 - k]!, map[baseSize - 1 - i * 2 - j]!)
        if (message[rowOffset + rowSize * 6 + columnOffset + k])
          set(map[baseSize - 1 - i * 2 - j]!, map[i * 2 + k]!)
      }
    }
    rowOffset += rowSize * 8
  }

  drawModeMessage(grid, compact, size, mode)
  const center = Math.floor(size / 2)
  if (compact) {
    drawBullsEye(grid, center, 5)
  }
  else {
    drawBullsEye(grid, center, 7)
    for (let i = 0, j = 0; i < Math.floor(baseSize / 2); i += 15, j += 16) {
      for (let k = center & 1; k < size; k += 2) {
        set(center - j, k)
        set(center + j, k)
        set(k, center - j)
        set(k, center + j)
      }
    }
  }

  return { layers, compact, size, codewords: words, modules: grid }
}
