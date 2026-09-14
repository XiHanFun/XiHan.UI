/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

/**
 * Data Matrix ECC 200 编码器：把一段文本算成布尔矩阵（ISO/IEC 16022，含 2024 版并入的矩形扩展 DMRE）。
 *
 * 纯函数：不碰 DOM、不读全局，同样的入参恒给同一份矩阵。
 *
 * 只走 ASCII 编码模式——两个数字压成一个码字、其余字符每个一个码字，128–255 的字符前加一个
 * 上移码字。C40 / Text / X12 / EDIFACT / Base 256 这几种压缩模式没有实现：它们只是把特定内容
 * 压得更紧，同样的内容能落在更小的尺寸上；扫出来的内容不受影响。
 *
 * 字符集：全是 ISO 8859-1 能表示的字符就按 Latin-1 取字节（读码器的缺省解释）；
 * 一旦出现 U+00FF 以上的字符，整段改按 UTF-8 取字节并在最前面放 ECI 26 声明，读码器按声明还原。
 *
 * gs1 模式在最前面放 FNC1 码字，读码器据此把内容当 GS1 元素串解释；
 * 内容里的 GS（U+001D）也编成 FNC1，即变长 AI 之间的分隔。
 */

import { createReedSolomon } from './reed-solomon'

export interface DmEncodeOptions {
  /** GS1 DataMatrix：最前面放 FNC1。 */
  readonly gs1?: boolean
  /** 从矩形尺寸里挑（含 DMRE），缺省从正方形尺寸里挑。 */
  readonly rectangular?: boolean
}

/** 一种尺寸的规格。 */
export interface DmSymbol {
  /** 符号总行数与总列数（含定位图形）。 */
  readonly rows: number
  readonly columns: number
  /** 每个数据区的行数与列数（不含定位图形）。 */
  readonly regionRows: number
  readonly regionColumns: number
  /** 纵横各有几个数据区。 */
  readonly regionsDown: number
  readonly regionsAcross: number
  /** 数据码字总数与纠错码字总数。 */
  readonly dataCodewords: number
  readonly eccCodewords: number
  /** 纠错分几块交错。 */
  readonly blocks: number
  /** 是矩形（含 DMRE）。 */
  readonly rectangular: boolean
}

export interface DmMatrix {
  readonly symbol: DmSymbol
  /** 模块矩阵，[行][列]，true = 深色。 */
  readonly modules: readonly (readonly boolean[])[]
}

// ── 规格表（ISO/IEC 16022 Table 7 + ISO/IEC 21471 的 DMRE）──
// 每行：总行数、总列数、数据区行数（含定位为 +2）、数据区列数（含定位为 +2）、数据码字、每块纠错码字。
// 按数据码字数升序排，挑尺寸时从头往后找第一个装得下的。

interface DmSpec {
  readonly rows: number
  readonly columns: number
  readonly regionRows: number
  readonly regionColumns: number
  readonly data: number
  readonly eccPerBlock: number
  readonly blocks: number
}

function spec(rows: number, columns: number, regionRows: number, regionColumns: number, data: number, eccPerBlock: number, blocks = 1): DmSpec {
  return { rows, columns, regionRows, regionColumns, data, eccPerBlock, blocks }
}

const DM_SPECS: readonly DmSpec[] = [
  spec(10, 10, 8, 8, 3, 5),
  spec(12, 12, 10, 10, 5, 7),
  spec(8, 18, 6, 16, 5, 7),
  spec(14, 14, 12, 12, 8, 10),
  spec(8, 32, 6, 14, 10, 11),
  spec(16, 16, 14, 14, 12, 12),
  spec(12, 26, 10, 24, 16, 14),
  spec(18, 18, 16, 16, 18, 14),
  spec(8, 48, 6, 22, 18, 15),
  spec(20, 20, 18, 18, 22, 18),
  spec(12, 36, 10, 16, 22, 18),
  spec(8, 64, 6, 14, 24, 18),
  spec(22, 22, 20, 20, 30, 20),
  spec(16, 36, 14, 16, 32, 24),
  spec(8, 80, 6, 18, 32, 22),
  spec(24, 24, 22, 22, 36, 24),
  spec(8, 96, 6, 22, 38, 28),
  spec(12, 64, 10, 14, 43, 27),
  spec(26, 26, 24, 24, 44, 28),
  spec(20, 36, 18, 16, 44, 28),
  spec(16, 48, 14, 22, 49, 28),
  spec(8, 120, 6, 18, 49, 32),
  spec(20, 44, 18, 20, 56, 34),
  spec(32, 32, 14, 14, 62, 36),
  spec(16, 64, 14, 14, 62, 36),
  spec(8, 144, 6, 22, 63, 36),
  spec(12, 88, 10, 20, 64, 36),
  spec(26, 40, 24, 18, 70, 38),
  spec(22, 48, 20, 22, 72, 38),
  spec(24, 48, 22, 22, 80, 41),
  spec(20, 64, 18, 14, 84, 42),
  spec(36, 36, 16, 16, 86, 42),
  spec(26, 48, 24, 22, 90, 42),
  spec(24, 64, 22, 14, 108, 46),
  spec(40, 40, 18, 18, 114, 48),
  spec(26, 64, 24, 14, 118, 50),
  spec(44, 44, 20, 20, 144, 56),
  spec(48, 48, 22, 22, 174, 68),
  spec(52, 52, 24, 24, 204, 42, 2),
  spec(64, 64, 14, 14, 280, 56, 2),
  spec(72, 72, 16, 16, 368, 36, 4),
  spec(80, 80, 18, 18, 456, 48, 4),
  spec(88, 88, 20, 20, 576, 56, 4),
  spec(96, 96, 22, 22, 696, 68, 4),
  spec(104, 104, 24, 24, 816, 56, 6),
  spec(120, 120, 18, 18, 1050, 68, 6),
  spec(132, 132, 20, 20, 1304, 62, 8),
  spec(144, 144, 22, 22, 1558, 62, 10),
]

function toSymbol(s: DmSpec): DmSymbol {
  return {
    rows: s.rows,
    columns: s.columns,
    regionRows: s.regionRows,
    regionColumns: s.regionColumns,
    regionsDown: s.rows / (s.regionRows + 2),
    regionsAcross: s.columns / (s.regionColumns + 2),
    dataCodewords: s.data,
    eccCodewords: s.eccPerBlock * s.blocks,
    blocks: s.blocks,
    rectangular: s.rows !== s.columns,
  }
}

/** 全部尺寸，按数据码字数升序。 */
export const DM_SYMBOLS: readonly DmSymbol[] = DM_SPECS.map(toSymbol)

/** 该形状下能装的最大数据码字数。 */
export function dmCapacity(rectangular: boolean): number {
  let max = 0
  for (const s of DM_SYMBOLS) {
    if (s.rectangular === rectangular && s.dataCodewords > max)
      max = s.dataCodewords
  }
  return max
}

/** 选能装下这么多码字的最小尺寸；一个都装不下就抛错。 */
function pickSymbol(count: number, rectangular: boolean): DmSymbol {
  for (const s of DM_SYMBOLS) {
    if (s.rectangular === rectangular && count <= s.dataCodewords)
      return s
  }
  throw new RangeError(
    `内容要 ${count} 个码字，超出${rectangular ? '矩形' : '正方形'} Data Matrix 的上限 ${dmCapacity(rectangular)} 个；`
    + '截断会得到一张扫得出、但内容是半截的码',
  )
}

// ── 码字 ──

/** 填充码字。 */
const PAD = 129
/** FNC1。 */
const FNC1 = 232
/** 上移：后面那个码字加 128。 */
const UPPER_SHIFT = 235
/** ECI 声明。 */
const ECI = 241
/** UTF-8 的 ECI 编号 26，按单字节编成 27。 */
const ECI_UTF8 = 27

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

/**
 * 内容取成字节：全在 Latin-1 内就逐字符取码点，否则 UTF-8 并声明 ECI。
 * gs1 模式下 GS 不当字节，单独记成 -1，编码时换成 FNC1。
 */
function toBytes(text: string, gs1: boolean): { bytes: number[], eci: boolean } {
  let latin1 = true
  for (const char of text) {
    if ((char.codePointAt(0) ?? 0) > 0xFF) {
      latin1 = false
      break
    }
  }
  const bytes: number[] = []
  if (latin1) {
    for (const char of text) {
      const code = char.codePointAt(0)!
      bytes.push(gs1 && code === 0x1D ? -1 : code)
    }
  }
  else {
    for (const byte of utf8Bytes(text))
      bytes.push(gs1 && byte === 0x1D ? -1 : byte)
  }
  return { bytes, eci: !latin1 }
}

/** ASCII 模式：数字两两压缩、其余加一、高位字符上移、GS 换 FNC1。 */
function asciiCodewords(bytes: readonly number[]): number[] {
  const out: number[] = []
  let i = 0
  while (i < bytes.length) {
    const b = bytes[i]!
    const next = bytes[i + 1]
    if (b >= 48 && b <= 57 && next !== undefined && next >= 48 && next <= 57) {
      out.push(130 + (b - 48) * 10 + (next - 48))
      i += 2
      continue
    }
    if (b === -1)
      out.push(FNC1)
    else if (b < 128)
      out.push(b + 1)
    else
      out.push(UPPER_SHIFT, b - 128 + 1)
    i++
  }
  return out
}

/** 253 态随机化的填充：第一个填充码字固定 129，之后的按位置伪随机，让整片填充不出现规则图形。 */
function padTo(codewords: number[], capacity: number): void {
  if (codewords.length >= capacity)
    return
  codewords.push(PAD)
  while (codewords.length < capacity) {
    const position = codewords.length + 1
    const pseudo = ((149 * position) % 253) + 1
    const value = PAD + pseudo
    codewords.push(value <= 254 ? value : value - 254)
  }
}

/** Data Matrix 的域：本原多项式 0x12D，生成多项式从 α¹ 起。 */
const RS = createReedSolomon(0x12D, 1)

/**
 * 逐块算纠错码字并交错：第 b 块取下标 ≡ b (mod blocks) 的数据码字；
 * 纠错码字也按同样的步长交错排在数据码字之后。
 * 144×144 那一档 10 块里前 8 块各 156 个数据码字、后 2 块各 155 个，按步长取自然就是这个分法。
 */
function addEcc(data: readonly number[], symbol: DmSymbol): number[] {
  const { blocks, eccCodewords } = symbol
  const eccPerBlock = eccCodewords / blocks
  const out = data.slice()
  out.length = data.length + eccCodewords
  for (let b = 0; b < blocks; b++) {
    const chunk: number[] = []
    for (let d = b; d < data.length; d += blocks) chunk.push(data[d]!)
    const ecc = RS.remainder(chunk, eccPerBlock)
    for (let e = 0; e < eccPerBlock; e++)
      out[data.length + b + e * blocks] = ecc[e]!
  }
  return out
}

// ── 放置（ISO/IEC 16022 §5.8.1 与 Figure F.1）──

/** 数据映射矩阵：不含定位图形的 rows × cols，每格记 0 / 1，-1 为未放。 */
class Placement {
  readonly bits: Int8Array
  constructor(readonly codewords: readonly number[], readonly cols: number, readonly rows: number) {
    this.bits = new Int8Array(cols * rows).fill(-1)
  }

  private free(col: number, row: number): boolean {
    return this.bits[row * this.cols + col]! < 0
  }

  private module(row: number, col: number, pos: number, bit: number): void {
    if (row < 0) {
      row += this.rows
      col += 4 - ((this.rows + 4) % 8)
    }
    if (col < 0) {
      col += this.cols
      row += 4 - ((this.cols + 4) % 8)
    }
    // 矩形扩展（ISO/IEC 21471 Annex E）：列绕回去之后行可能越到底下，再绕一次
    if (row >= this.rows)
      row -= this.rows
    this.bits[row * this.cols + col] = (this.codewords[pos]! >>> (8 - bit)) & 1
  }

  /** 一个码字的八个位铺成一个"犹他"形。 */
  private utah(row: number, col: number, pos: number): void {
    this.module(row - 2, col - 2, pos, 1)
    this.module(row - 2, col - 1, pos, 2)
    this.module(row - 1, col - 2, pos, 3)
    this.module(row - 1, col - 1, pos, 4)
    this.module(row - 1, col, pos, 5)
    this.module(row, col - 2, pos, 6)
    this.module(row, col - 1, pos, 7)
    this.module(row, col, pos, 8)
  }

  private corner1(pos: number): void {
    const { rows, cols } = this
    this.module(rows - 1, 0, pos, 1)
    this.module(rows - 1, 1, pos, 2)
    this.module(rows - 1, 2, pos, 3)
    this.module(0, cols - 2, pos, 4)
    this.module(0, cols - 1, pos, 5)
    this.module(1, cols - 1, pos, 6)
    this.module(2, cols - 1, pos, 7)
    this.module(3, cols - 1, pos, 8)
  }

  private corner2(pos: number): void {
    const { rows, cols } = this
    this.module(rows - 3, 0, pos, 1)
    this.module(rows - 2, 0, pos, 2)
    this.module(rows - 1, 0, pos, 3)
    this.module(0, cols - 4, pos, 4)
    this.module(0, cols - 3, pos, 5)
    this.module(0, cols - 2, pos, 6)
    this.module(0, cols - 1, pos, 7)
    this.module(1, cols - 1, pos, 8)
  }

  private corner3(pos: number): void {
    const { rows, cols } = this
    this.module(rows - 3, 0, pos, 1)
    this.module(rows - 2, 0, pos, 2)
    this.module(rows - 1, 0, pos, 3)
    this.module(0, cols - 2, pos, 4)
    this.module(0, cols - 1, pos, 5)
    this.module(1, cols - 1, pos, 6)
    this.module(2, cols - 1, pos, 7)
    this.module(3, cols - 1, pos, 8)
  }

  private corner4(pos: number): void {
    const { rows, cols } = this
    this.module(rows - 1, 0, pos, 1)
    this.module(rows - 1, cols - 1, pos, 2)
    this.module(0, cols - 3, pos, 3)
    this.module(0, cols - 2, pos, 4)
    this.module(0, cols - 1, pos, 5)
    this.module(1, cols - 3, pos, 6)
    this.module(1, cols - 2, pos, 7)
    this.module(1, cols - 1, pos, 8)
  }

  /** 沿对角线来回铺，四个角落的特例各放一次；右下角剩的那 2×2 格填固定图形。 */
  place(): void {
    const { rows, cols } = this
    let pos = 0
    let row = 4
    let col = 0
    do {
      if (row === rows && col === 0)
        this.corner1(pos++)
      if (row === rows - 2 && col === 0 && cols % 4 !== 0)
        this.corner2(pos++)
      if (row === rows - 2 && col === 0 && cols % 8 === 4)
        this.corner3(pos++)
      if (row === rows + 4 && col === 2 && cols % 8 === 0)
        this.corner4(pos++)
      do {
        if (row < rows && col >= 0 && this.free(col, row))
          this.utah(row, col, pos++)
        row -= 2
        col += 2
      } while (row >= 0 && col < cols)
      row += 1
      col += 3
      do {
        if (row >= 0 && col < cols && this.free(col, row))
          this.utah(row, col, pos++)
        row += 2
        col -= 2
      } while (row < rows && col >= 0)
      row += 3
      col += 1
    } while (row < rows || col < cols)
    if (this.free(cols - 1, rows - 1)) {
      this.bits[(rows - 1) * cols + cols - 1] = 1
      this.bits[(rows - 2) * cols + cols - 2] = 1
    }
  }

  get(col: number, row: number): boolean {
    return this.bits[row * this.cols + col] === 1
  }
}

/**
 * 把数据映射矩阵铺进带定位图形的符号：每个数据区左边一列、下边一行全深（L 形），
 * 上边一行与右边一列深浅交替（时钟边）；交替的相位按整个符号的坐标算，各区之间对得上。
 */
function drawSymbol(placement: Placement, symbol: DmSymbol): boolean[][] {
  const { rows, columns, regionRows, regionColumns } = symbol
  const modules = Array.from({ length: rows }, () => Array.from<boolean>({ length: columns }).fill(false))
  const regionH = regionRows + 2
  const regionW = regionColumns + 2
  for (let y = 0; y < rows; y++) {
    const ly = y % regionH
    const dataRow = Math.floor(y / regionH) * regionRows + (ly - 1)
    for (let x = 0; x < columns; x++) {
      const lx = x % regionW
      let dark: boolean
      if (lx === 0 || ly === regionH - 1)
        dark = true
      else if (ly === 0)
        dark = x % 2 === 0
      // 右边一列从顶上那个浅格起交替，右上角恒浅、右下角落在全深的底行上
      else if (lx === regionW - 1)
        dark = y % 2 === 1
      else
        dark = placement.get(Math.floor(x / regionW) * regionColumns + (lx - 1), dataRow)
      modules[y]![x] = dark
    }
  }
  return modules
}

/**
 * 编码入口。内容超出所选形状的最大尺寸时抛 RangeError。
 * @example
 * dmEncode('Hello') // 10×10：5 个码字装进 3 个码字容量不够，落到 12×12（5 个）
 */
export function dmEncode(text: string, options: DmEncodeOptions = {}): DmMatrix {
  const gs1 = options.gs1 === true
  const rectangular = options.rectangular === true
  const { bytes, eci } = toBytes(text, gs1)
  const codewords: number[] = []
  if (gs1)
    codewords.push(FNC1)
  if (eci)
    codewords.push(ECI, ECI_UTF8)
  codewords.push(...asciiCodewords(bytes))

  const symbol = pickSymbol(codewords.length, rectangular)
  padTo(codewords, symbol.dataCodewords)
  const all = addEcc(codewords, symbol)

  const placement = new Placement(all, symbol.regionColumns * symbol.regionsAcross, symbol.regionRows * symbol.regionsDown)
  placement.place()
  return { symbol, modules: drawSymbol(placement, symbol) }
}
