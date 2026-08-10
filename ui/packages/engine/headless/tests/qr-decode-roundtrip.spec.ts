// 独立解码器对 QR 编码器做回环验证。
//
// 这个文件只用编码器的三个公开导出（qrEncode / qrCapacityBytes / qrAlignmentPositions），
// 其余全部按 ISO/IEC 18004 自己重写一遍：规格表另录、GF(256) 换成对数表实现、
// 蛇形读取换成方向翻转的写法、格式信息与版本信息都验 BCH、纠错码字用校验子核。
// 与编码器同源的实现只会一起错，所以这里刻意不共用任何一行。
import { describe, expect, it } from 'vitest'
import { QR_MAX_VERSION, qrAlignmentPositions, qrCapacityBytes, qrEncode } from '../src/qr-code/qr-encode'

type Level = 'L' | 'M' | 'Q' | 'H'

const LEVELS: readonly Level[] = ['L', 'M', 'Q', 'H']

// ── 规格表（独立誊录，不从编码器取） ──

/** Annex E 的校正图形中心坐标表，逐版本抄写而非用通式算。 */
const ALIGNMENT: Readonly<Record<number, readonly number[]>> = {
  1: [],
  2: [6, 18],
  3: [6, 22],
  4: [6, 26],
  5: [6, 30],
  6: [6, 34],
  7: [6, 22, 38],
  8: [6, 24, 42],
  9: [6, 26, 46],
  10: [6, 28, 50],
  11: [6, 30, 54],
  12: [6, 32, 58],
  13: [6, 34, 62],
  14: [6, 26, 46, 66],
  15: [6, 26, 48, 70],
  16: [6, 26, 50, 74],
  17: [6, 30, 54, 78],
  18: [6, 30, 56, 82],
  19: [6, 30, 58, 86],
  20: [6, 34, 62, 90],
  21: [6, 28, 50, 72, 94],
  22: [6, 26, 50, 74, 98],
  23: [6, 30, 54, 78, 102],
  24: [6, 28, 54, 80, 106],
  25: [6, 32, 58, 84, 110],
  26: [6, 30, 58, 86, 114],
  27: [6, 34, 62, 90, 118],
  28: [6, 26, 50, 74, 98, 122],
  29: [6, 30, 54, 78, 102, 126],
  30: [6, 26, 52, 78, 104, 130],
  31: [6, 30, 56, 82, 108, 134],
  32: [6, 34, 60, 86, 112, 138],
  33: [6, 30, 58, 86, 114, 142],
  34: [6, 34, 62, 90, 118, 146],
  35: [6, 30, 54, 78, 102, 126, 150],
  36: [6, 24, 50, 76, 102, 128, 154],
  37: [6, 28, 54, 80, 106, 132, 158],
  38: [6, 32, 58, 84, 110, 136, 162],
  39: [6, 26, 54, 82, 110, 138, 166],
  40: [6, 30, 58, 86, 114, 142, 170],
}

/** 每块的纠错码字数，下标即版本。 */
const ECC_PER_BLOCK: Record<Level, readonly number[]> = {
  L: [0, 7, 10, 15, 20, 26, 18, 20, 24, 30, 18, 20, 24, 26, 30, 22, 24, 28, 30, 28, 28, 28, 28, 30, 30, 26, 28, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30],
  M: [0, 10, 16, 26, 18, 24, 16, 18, 22, 22, 26, 30, 22, 22, 24, 24, 28, 28, 26, 26, 26, 26, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28],
  Q: [0, 13, 22, 18, 26, 18, 24, 18, 22, 20, 24, 28, 26, 24, 20, 30, 24, 28, 28, 26, 30, 28, 30, 30, 30, 30, 28, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30],
  H: [0, 17, 28, 22, 16, 22, 28, 26, 26, 24, 28, 24, 28, 22, 24, 24, 30, 28, 28, 26, 28, 30, 24, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30],
}

/** 纠错块数，下标即版本。 */
const BLOCK_COUNT: Record<Level, readonly number[]> = {
  L: [0, 1, 1, 1, 1, 1, 2, 2, 2, 2, 4, 4, 4, 4, 4, 6, 6, 6, 6, 7, 8, 8, 9, 9, 10, 12, 12, 12, 13, 14, 15, 16, 17, 18, 19, 19, 20, 21, 22, 24, 25],
  M: [0, 1, 1, 1, 2, 2, 4, 4, 4, 5, 5, 5, 8, 9, 9, 10, 10, 11, 13, 14, 16, 17, 17, 18, 20, 21, 23, 25, 26, 28, 29, 31, 33, 35, 37, 38, 40, 43, 45, 47, 49],
  Q: [0, 1, 1, 2, 2, 4, 4, 6, 6, 8, 8, 8, 10, 12, 16, 12, 17, 16, 18, 21, 20, 23, 23, 25, 27, 29, 34, 34, 35, 38, 40, 43, 45, 48, 51, 53, 56, 59, 62, 65, 68],
  H: [0, 1, 1, 2, 4, 4, 4, 5, 6, 8, 8, 11, 11, 16, 16, 18, 16, 19, 21, 25, 25, 25, 34, 30, 32, 35, 37, 40, 42, 45, 48, 51, 54, 57, 60, 63, 66, 70, 74, 77, 81],
}

/**
 * 数据码字总数（Table 7），与上面两张表各自独立誊录。
 * 三张表满足「总码字 = 数据码字 + 块数 × 每块纠错码字」才算誊抄没错，见「规格表双录对账」。
 */
const DATA_CODEWORDS: Record<Level, readonly number[]> = {
  L: [0, 19, 34, 55, 80, 108, 136, 156, 194, 232, 274, 324, 370, 428, 461, 523, 589, 647, 721, 795, 861, 932, 1006, 1094, 1174, 1276, 1370, 1468, 1531, 1631, 1735, 1843, 1955, 2071, 2191, 2306, 2434, 2566, 2702, 2812, 2956],
  M: [0, 16, 28, 44, 64, 86, 108, 124, 154, 182, 216, 254, 290, 334, 365, 415, 453, 507, 563, 627, 669, 714, 782, 860, 914, 1000, 1062, 1128, 1193, 1267, 1373, 1455, 1541, 1631, 1725, 1812, 1914, 1992, 2102, 2216, 2334],
  Q: [0, 13, 22, 34, 48, 62, 76, 88, 110, 132, 154, 180, 206, 244, 261, 295, 325, 367, 397, 445, 485, 512, 568, 614, 664, 718, 754, 808, 871, 911, 985, 1033, 1115, 1171, 1231, 1286, 1354, 1426, 1502, 1582, 1666],
  H: [0, 9, 16, 26, 36, 46, 60, 66, 86, 100, 122, 140, 158, 180, 197, 223, 253, 283, 313, 341, 385, 406, 442, 464, 514, 538, 596, 628, 661, 701, 745, 793, 845, 901, 961, 986, 1054, 1096, 1142, 1222, 1276],
}

const LEVEL_OF_BITS: Readonly<Record<number, Level>> = { 1: 'L', 0: 'M', 3: 'Q', 2: 'H' }

// ── GF(256)：对数 / 反对数表，与编码器的移位乘法是两套写法 ──

const GF_EXP = new Uint8Array(512)
const GF_LOG = new Uint8Array(256)
{
  let x = 1
  for (let i = 0; i < 255; i++) {
    GF_EXP[i] = x
    GF_LOG[x] = i
    x <<= 1
    if (x & 0x100)
      x ^= 0x11D
  }
  for (let i = 255; i < 512; i++)
    GF_EXP[i] = GF_EXP[i - 255]!
}

function gfMul(a: number, b: number): number {
  if (a === 0 || b === 0)
    return 0
  return GF_EXP[GF_LOG[a]! + GF_LOG[b]!]!
}

/** α^power。 */
function gfPow(power: number): number {
  return GF_EXP[power % 255]!
}

/** 生成多项式 ∏(x − α^i)，i = 0..degree−1，系数高次在前，首项恒为 1。 */
function rsGenerator(degree: number): number[] {
  let poly = [1]
  for (let i = 0; i < degree; i++) {
    const next = Array.from({ length: poly.length + 1 }).fill(0)
    for (let j = 0; j < poly.length; j++) {
      next[j] ^= poly[j]!
      next[j + 1] ^= gfMul(poly[j]!, gfPow(i))
    }
    poly = next
  }
  return poly
}

/** 数据码字的纠错码字：多项式长除的余式。 */
function rsEncode(data: readonly number[], degree: number): number[] {
  const gen = rsGenerator(degree)
  const rem = Array.from({ length: degree }).fill(0)
  for (const byte of data) {
    const factor = byte ^ rem.shift()!
    rem.push(0)
    for (let i = 0; i < degree; i++)
      rem[i] ^= gfMul(gen[i + 1]!, factor)
  }
  return rem
}

// ── BCH ──

/** 二元多项式取余：value 除以 generator（次数 degree）的余式。 */
function bchRemainder(value: number, generator: number, degree: number, width: number): number {
  let rem = value
  for (let i = width - 1; i >= degree; i--) {
    if ((rem >>> i) & 1)
      rem ^= generator << (i - degree)
  }
  return rem
}

// ── 功能模块占位图（按规格自己铺一遍） ──

function functionModules(version: number): boolean[][] {
  const size = 4 * version + 17
  const map = Array.from({ length: size }, () => Array.from<boolean>({ length: size }).fill(false))
  const mark = (row: number, col: number): void => {
    if (row >= 0 && row < size && col >= 0 && col < size)
      map[row]![col] = true
  }

  // 定位图形 7×7 加一圈分隔带 = 8×8 / 8×9 的方块
  for (const [top, left] of [[0, 0], [0, size - 8], [size - 8, 0]] as const) {
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++)
        mark(top + r, left + c)
    }
  }
  // 时序图形整行整列
  for (let i = 0; i < size; i++) {
    mark(6, i)
    mark(i, 6)
  }
  // 格式信息两份 + 恒深模块
  for (let i = 0; i < 9; i++) {
    mark(8, i)
    mark(i, 8)
  }
  for (let i = 0; i < 8; i++) {
    mark(8, size - 1 - i)
    mark(size - 1 - i, 8)
  }
  // 校正图形 5×5
  const centers = ALIGNMENT[version]!
  for (const row of centers) {
    for (const col of centers) {
      if (collidesWithFinder(row, col, size))
        continue
      for (let dr = -2; dr <= 2; dr++) {
        for (let dc = -2; dc <= 2; dc++)
          mark(row + dr, col + dc)
      }
    }
  }
  // 版本信息两份，7 版起才有
  if (version >= 7) {
    for (let i = 0; i < 6; i++) {
      for (let j = 0; j < 3; j++) {
        mark(i, size - 11 + j)
        mark(size - 11 + j, i)
      }
    }
  }
  return map
}

/** 中心落在定位图形那三个角上的校正图形不画。 */
function collidesWithFinder(row: number, col: number, size: number): boolean {
  const nearStart = (v: number): boolean => v <= 8
  const nearEnd = (v: number): boolean => v >= size - 9
  return (nearStart(row) && nearStart(col)) || (nearStart(row) && nearEnd(col)) || (nearEnd(row) && nearStart(col))
}

// ── 掩模 ──

function maskCondition(mask: number, row: number, col: number): boolean {
  switch (mask) {
    case 0: return (row + col) % 2 === 0
    case 1: return row % 2 === 0
    case 2: return col % 3 === 0
    case 3: return (row + col) % 3 === 0
    case 4: return (Math.floor(row / 2) + Math.floor(col / 3)) % 2 === 0
    case 5: return ((row * col) % 2) + ((row * col) % 3) === 0
    case 6: return (((row * col) % 2) + ((row * col) % 3)) % 2 === 0
    case 7: return (((row + col) % 2) + ((row * col) % 3)) % 2 === 0
    default: throw new Error(`掩模编号 ${mask} 越界`)
  }
}

// ── 格式信息与版本信息 ──

/** 格式信息第一份的 15 个格子，下标即位号（0 = 最低位）。 */
function formatSlotsA(): Array<[number, number]> {
  const slots: Array<[number, number]> = []
  for (let i = 0; i <= 5; i++)
    slots.push([i, 8])
  slots.push([7, 8], [8, 8], [8, 7])
  for (let i = 9; i < 15; i++)
    slots.push([8, 14 - i])
  return slots
}

/** 格式信息第二份的 15 个格子。 */
function formatSlotsB(size: number): Array<[number, number]> {
  const slots: Array<[number, number]> = []
  for (let i = 0; i < 8; i++)
    slots.push([8, size - 1 - i])
  for (let i = 8; i < 15; i++)
    slots.push([size - 15 + i, 8])
  return slots
}

function readBits(matrix: readonly (readonly boolean[])[], slots: ReadonlyArray<readonly [number, number]>): number {
  let raw = 0
  slots.forEach(([row, col], i) => {
    if (matrix[row]![col])
      raw |= 1 << i
  })
  return raw
}

interface FormatInfo {
  level: Level
  mask: number
}

/** 两份格式信息都读、都验 BCH、还要互相对上，任何一条不成立就抛。 */
function readFormat(matrix: readonly (readonly boolean[])[]): FormatInfo {
  const size = matrix.length
  const rawA = readBits(matrix, formatSlotsA())
  const rawB = readBits(matrix, formatSlotsB(size))
  if (rawA !== rawB)
    throw new Error(`两份格式信息不一致：0b${rawA.toString(2).padStart(15, '0')} vs 0b${rawB.toString(2).padStart(15, '0')}`)

  const bits = rawA ^ 0x5412
  const rem = bchRemainder(bits, 0x537, 10, 15)
  if (rem !== 0)
    throw new Error(`格式信息 BCH 校验失败：余式 ${rem}，应为 0`)

  const level = LEVEL_OF_BITS[(bits >>> 13) & 3]
  if (level === undefined)
    throw new Error(`格式信息里的纠错级别位 ${(bits >>> 13) & 3} 不认识`)
  return { level, mask: (bits >>> 10) & 7 }
}

/** 版本信息两份都读、都验 BCH，并与矩阵边长推出的版本对上。 */
function readVersionInfo(matrix: readonly (readonly boolean[])[]): number {
  const size = matrix.length
  const slotsA: Array<[number, number]> = []
  const slotsB: Array<[number, number]> = []
  for (let i = 0; i < 18; i++) {
    slotsA.push([Math.floor(i / 3), size - 11 + (i % 3)])
    slotsB.push([size - 11 + (i % 3), Math.floor(i / 3)])
  }
  const rawA = readBits(matrix, slotsA)
  const rawB = readBits(matrix, slotsB)
  if (rawA !== rawB)
    throw new Error(`两份版本信息不一致：${rawA} vs ${rawB}`)
  const rem = bchRemainder(rawA, 0x1F25, 12, 18)
  if (rem !== 0)
    throw new Error(`版本信息 BCH 校验失败：余式 ${rem}，应为 0`)
  return rawA >>> 12
}

// ── 蛇形读取 ──

/** 自右向左两列一组，方向逐组翻转；跳过第 6 列与全部功能格。 */
function readRawBits(plain: readonly (readonly boolean[])[], reserved: readonly (readonly boolean[])[]): number[] {
  const size = plain.length
  const bits: number[] = []
  let upward = true
  for (let col = size - 1; col >= 1; col -= 2) {
    if (col === 6)
      col = 5
    for (let i = 0; i < size; i++) {
      const row = upward ? size - 1 - i : i
      for (const c of [col, col - 1]) {
        if (!reserved[row]![c])
          bits.push(plain[row]![c] ? 1 : 0)
      }
    }
    upward = !upward
  }
  return bits
}

// ── 解码 ──

interface Decoded {
  version: number
  level: Level
  mask: number
  bytes: number[]
  text: string
  /** 各块的数据码字，按块顺序拼平。 */
  dataCodewords: number[]
  /** 数据段之后剩下的位，应当全是 0（结束符与补位对齐位）。 */
  trailingBitsAfterData: number
}

function decode(matrix: readonly (readonly boolean[])[]): Decoded {
  const size = matrix.length
  if (size % 4 !== 1 || size < 21 || size > 177)
    throw new Error(`边长 ${size} 不是任何一版的边长`)
  const version = (size - 17) / 4
  for (const line of matrix) {
    if (line.length !== size)
      throw new Error('矩阵不是正方的')
  }

  const { level, mask } = readFormat(matrix)
  if (version >= 7) {
    const stated = readVersionInfo(matrix)
    if (stated !== version)
      throw new Error(`版本信息写的是 ${stated}，边长推出来是 ${version}`)
  }

  const reserved = functionModules(version)
  const plain = matrix.map((line, row) => line.map((cell, col) =>
    !reserved[row]![col] && maskCondition(mask, row, col) ? !cell : cell))

  const bits = readRawBits(plain, reserved)
  const totalCodewords = Math.floor(bits.length / 8)
  // 末尾的余数位（不足一个码字）必须是浅色，编码器不该往里塞东西
  for (let i = totalCodewords * 8; i < bits.length; i++) {
    if (bits[i] !== 0)
      throw new Error(`第 ${i} 位是余数位，本应留浅色`)
  }

  const raw: number[] = []
  for (let i = 0; i < totalCodewords; i++) {
    let byte = 0
    for (let j = 0; j < 8; j++)
      byte = (byte << 1) | bits[i * 8 + j]!
    raw.push(byte)
  }

  const blockCount = BLOCK_COUNT[level][version]!
  const eccLen = ECC_PER_BLOCK[level][version]!
  const dataTotal = DATA_CODEWORDS[level][version]!
  if (dataTotal + blockCount * eccLen !== totalCodewords) {
    throw new Error(
      `规格表对不上：${version} 版 ${level} 级 数据 ${dataTotal} + 纠错 ${blockCount}×${eccLen} `
      + `= ${dataTotal + blockCount * eccLen}，矩阵能放 ${totalCodewords} 个码字`,
    )
  }

  // 前 shortCount 块每块少一个数据码字
  const longCount = dataTotal % blockCount
  const shortCount = blockCount - longCount
  const shortLen = Math.floor(dataTotal / blockCount)
  const dataLenOf = (b: number): number => (b < shortCount ? shortLen : shortLen + 1)

  const blockData: number[][] = Array.from({ length: blockCount }, (_, b) => Array.from<number>({ length: dataLenOf(b) }).fill(0))
  const blockEcc: number[][] = Array.from({ length: blockCount }, () => Array.from<number>({ length: eccLen }).fill(0))

  let cursor = 0
  for (let i = 0; i < shortLen + 1; i++) {
    for (let b = 0; b < blockCount; b++) {
      if (i < dataLenOf(b))
        blockData[b]![i] = raw[cursor++]!
    }
  }
  for (let i = 0; i < eccLen; i++) {
    for (let b = 0; b < blockCount; b++)
      blockEcc[b]![i] = raw[cursor++]!
  }
  if (cursor !== totalCodewords)
    throw new Error(`交错还原用掉 ${cursor} 个码字，矩阵里有 ${totalCodewords} 个`)

  // 生成多项式的根是 α^0..α^(eccLen-1)，码字多项式在这些点上求值应恒为 0
  for (let b = 0; b < blockCount; b++) {
    const codeword = [...blockData[b]!, ...blockEcc[b]!]
    for (let i = 0; i < eccLen; i++) {
      const root = gfPow(i)
      let syndrome = 0
      for (const byte of codeword)
        syndrome = gfMul(syndrome, root) ^ byte
      if (syndrome !== 0)
        throw new Error(`第 ${b} 块校验子 S${i} = ${syndrome}（应为 0），纠错码字与数据对不上`)
    }
    // 再用显式生成多项式长除算一遍，与校验子是两条互不相干的路
    const expected = rsEncode(blockData[b]!, eccLen)
    if (expected.some((byte, i) => byte !== blockEcc[b]![i])) {
      throw new Error(
        `第 ${b} 块纠错码字对不上：矩阵里是 [${blockEcc[b]!.join(',')}]，`
        + `长除算出来是 [${expected.join(',')}]`,
      )
    }
  }

  const dataBits: number[] = []
  for (let b = 0; b < blockCount; b++) {
    for (const byte of blockData[b]!) {
      for (let i = 7; i >= 0; i--)
        dataBits.push((byte >>> i) & 1)
    }
  }

  let at = 0
  const take = (length: number): number => {
    if (at + length > dataBits.length)
      throw new Error(`要取 ${length} 位，但只剩 ${dataBits.length - at} 位`)
    let value = 0
    for (let i = 0; i < length; i++)
      value = (value << 1) | dataBits[at++]!
    return value
  }

  const mode = take(4)
  if (mode !== 0b0100)
    throw new Error(`模式指示符 0b${mode.toString(2).padStart(4, '0')}，字节模式应为 0b0100`)
  const countBits = version < 10 ? 8 : 16
  const count = take(countBits)
  const bytes: number[] = []
  for (let i = 0; i < count; i++)
    bytes.push(take(8))

  const text = new TextDecoder('utf-8', { fatal: true }).decode(Uint8Array.from(bytes))
  return {
    version,
    level,
    mask,
    bytes,
    text,
    dataCodewords: blockData.flat(),
    trailingBitsAfterData: dataBits.length - at,
  }
}

// ── 判据 ──

const encoder = new TextEncoder()

function roundtrip(text: string, level: Level): void {
  const qr = qrEncode(text, level)
  const got = decode(qr.modules)
  expect(got.version).toBe(qr.version)
  expect(got.level).toBe(level)
  expect(got.mask).toBe(qr.mask)
  expect(got.bytes).toEqual([...encoder.encode(text)])
  expect(got.text).toBe(text)
}

describe('手算比对向量', () => {
  it('1 版 M 级编 "1"，16 个数据码字与手算的位串逐字节相同', () => {
    // 0100（字节模式）+ 00000001（1 字节）+ 00110001（'1'）+ 0000（结束符）
    // → 0x40 0x13 0x10，其后 0xEC / 0x11 轮流补满 16 个数据码字
    const expected = [0x40, 0x13, 0x10, 0xEC, 0x11, 0xEC, 0x11, 0xEC, 0x11, 0xEC, 0x11, 0xEC, 0x11, 0xEC, 0x11, 0xEC]
    const qr = qrEncode('1', 'M')
    expect(qr.version).toBe(1)
    expect(decode(qr.modules).dataCodewords).toEqual(expected)
  })

  it('1 版 M 级 10 个纠错码字与显式生成多项式长除的结果相同', () => {
    const data = [0x40, 0x13, 0x10, 0xEC, 0x11, 0xEC, 0x11, 0xEC, 0x11, 0xEC, 0x11, 0xEC, 0x11, 0xEC, 0x11, 0xEC]
    // g(x) = ∏(x − α^i)，i = 0..9；系数高次在前
    expect(rsGenerator(10)).toHaveLength(11)
    expect(rsGenerator(10)[0]).toBe(1)
    // 这一步只要不抛就说明矩阵里的纠错码字与这条长除路径一致，decode 内部已逐块比过
    expect(() => decode(qrEncode('1', 'M').modules)).not.toThrow()
    expect(rsEncode(data, 10)).toHaveLength(10)
  })
})

describe('判据自身有牙', () => {
  // 解码器全绿也可能是判据太松。这一组反过来证明：矩阵被改一格，判据就会响。

  it('翻掉任意一个数据模块，里德-所罗门校验子必然非零', () => {
    for (const [text, level] of [['曦寒 UI', 'M'], ['x'.repeat(300), 'H']] as const) {
      const qr = qrEncode(text, level)
      const reserved = functionModules(qr.version)
      let flipped = 0
      for (let row = 0; row < qr.count && flipped < 6; row++) {
        for (let col = 0; col < qr.count && flipped < 6; col++) {
          if (reserved[row]![col])
            continue
          const broken = qr.modules.map(line => [...line])
          broken[row]![col] = !broken[row]![col]
          expect(() => decode(broken)).toThrow()
          flipped++
        }
      }
      expect(flipped).toBe(6)
    }
  })

  it('把格式信息改成另一个掩模号，解码必然失败', () => {
    const qr = qrEncode('https://ui.xihanfun.com', 'Q')
    const broken = qr.modules.map(line => [...line])
    // 掩模号占 bits 的第 10-12 位，对应第一份第 10 个格子；两份都翻才能骗过一致性检查
    broken[8]![4] = !broken[8]![4]
    broken[qr.count - 5]![8] = !broken[qr.count - 5]![8]
    expect(() => decode(broken)).toThrow()
  })
})

describe('规格表双录对账', () => {
  it('非功能模块总数与规格闭式逐版本一致', () => {
    for (let version = 1; version <= QR_MAX_VERSION; version++) {
      const size = 4 * version + 17
      // ISO/IEC 18004 的可用模块闭式
      let expected = (16 * version + 128) * version + 64
      if (version >= 2) {
        const n = Math.floor(version / 7) + 2
        expected -= (25 * n - 10) * n - 55
        if (version >= 7)
          expected -= 36
      }
      // 几何铺出来的占位图另算一遍
      let free = 0
      const reserved = functionModules(version)
      for (let row = 0; row < size; row++) {
        for (let col = 0; col < size; col++) {
          if (!reserved[row]![col])
            free++
        }
      }
      expect({ version, free }).toEqual({ version, free: expected })
    }
  })

  it('数据码字表与「块数 × 每块纠错码字」在 40 × 4 格上处处相容', () => {
    for (let version = 1; version <= QR_MAX_VERSION; version++) {
      for (const level of LEVELS) {
        const dataTotal = DATA_CODEWORDS[level][version]!
        const countBits = version < 10 ? 8 : 16
        // 容量 = 数据位 扣掉模式指示符与字符计数，再向下取整到字节
        expect(qrCapacityBytes(version, level)).toBe(Math.floor((dataTotal * 8 - 4 - countBits) / 8))
      }
    }
  })
})

describe('回环解码', () => {
  it('四个纠错级别各解得回来', () => {
    roundtrip('https://ui.xihanfun.com', 'L')
    roundtrip('https://ui.xihanfun.com', 'M')
    roundtrip('https://ui.xihanfun.com', 'Q')
    roundtrip('https://ui.xihanfun.com', 'H')
  })

  it('短串（1 版）解得回来', () => {
    for (const level of LEVELS) {
      const qr = qrEncode('Hi', level)
      expect(qr.version).toBe(1)
      roundtrip('Hi', level)
    }
    roundtrip('', 'M')
    roundtrip('a', 'H')
  })

  it('中串解得回来', () => {
    roundtrip('曦寒界面组件库 XiHan.UI —— headless + styled + wc', 'M')
    roundtrip('0123456789'.repeat(12), 'Q')
    roundtrip(JSON.stringify({ id: 42, name: 'qr', tags: ['a', 'b', 'c'] }), 'L')
  })

  it('长到要多版本的串解得回来', () => {
    const long = 'x'.repeat(1200)
    const qr = qrEncode(long, 'L')
    expect(qr.version).toBeGreaterThan(20)
    roundtrip(long, 'L')
    roundtrip('Lorem ipsum dolor sit amet, consectetur adipiscing elit. '.repeat(20), 'M')
  })

  it('含中文的 UTF-8 串按字节数编码、按字节数还原', () => {
    const samples = [
      '曦',
      '曦寒',
      '曦寒 UI · 快速、轻量、高效、用心',
      '二维码里塞一段中文，长度域按字节算不是按字符算。'.repeat(3),
      '混合 emoji 😀 与中文，四字节码点也要过',
    ]
    for (const text of samples) {
      for (const level of LEVELS) {
        const qr = qrEncode(text, level)
        const got = decode(qr.modules)
        // 长度域写的是 UTF-8 字节数
        expect(got.bytes.length).toBe(encoder.encode(text).length)
        expect(got.text).toBe(text)
        expect(got.level).toBe(level)
        expect(got.version).toBe(qr.version)
      }
    }
  })

  it('字符计数指示符 8 位 / 16 位的临界两版都对', () => {
    // 9 版是 8 位，10 版是 16 位
    const nine = 'x'.repeat(qrCapacityBytes(9, 'L'))
    const ten = `${nine}x`
    expect(qrEncode(nine, 'L').version).toBe(9)
    expect(qrEncode(ten, 'L').version).toBe(10)
    roundtrip(nine, 'L')
    roundtrip(ten, 'L')
  })

  it('各档版本装满时解得回来（含 7 版起的版本信息与 40 版）', () => {
    for (const version of [1, 2, 6, 7, 10, 26, 27, 32, QR_MAX_VERSION] as const) {
      for (const level of LEVELS) {
        const text = 'x'.repeat(qrCapacityBytes(version, level))
        const qr = qrEncode(text, level)
        expect(qr.version).toBe(version)
        const got = decode(qr.modules)
        expect(got.level).toBe(level)
        expect(got.text).toBe(text)
      }
    }
  })

  it('装满时数据区一位不剩，没装满时余下的位是结束符与补位', () => {
    const full = 'x'.repeat(qrCapacityBytes(3, 'M'))
    // 容量按字节向下取整，装满后剩不足 8 位
    expect(decode(qrEncode(full, 'M').modules).trailingBitsAfterData).toBeLessThan(8)
    expect(decode(qrEncode('x', 'M').modules).trailingBitsAfterData).toBeGreaterThan(0)
  })
})

describe('格式信息', () => {
  it('两份一致、BCH 余式为 0、级别与掩模与编码器自报的一致', () => {
    for (const level of LEVELS) {
      for (const version of [1, 5, 7, 20, 40] as const) {
        const qr = qrEncode('x'.repeat(qrCapacityBytes(version, level)), level)
        const got = readFormat(qr.modules)
        expect(got.level).toBe(qr.level)
        expect(got.mask).toBe(qr.mask)
        expect(qr.mask).toBeGreaterThanOrEqual(0)
        expect(qr.mask).toBeLessThanOrEqual(7)
      }
    }
  })

  it('翻掉格式信息里任意一格，BCH 就该报错——说明这条判据不是摆设', () => {
    const qr = qrEncode('曦寒 UI', 'M')
    const broken = qr.modules.map(line => [...line])
    broken[0]![8] = !broken[0]![8]
    expect(() => readFormat(broken)).toThrow()
  })
})

describe('版本信息', () => {
  it('7 版起两份都在、BCH 余式为 0、写的版本号与边长一致', () => {
    for (const version of [7, 8, 15, 32, 40] as const) {
      const qr = qrEncode('x'.repeat(qrCapacityBytes(version, 'L')), 'L')
      expect(qr.version).toBe(version)
      expect(readVersionInfo(qr.modules)).toBe(version)
    }
  })

  it('6 版及以下不写版本信息，那块位置归数据区', () => {
    // 6 版边长 41，size-11 = 30；这三列在 6 版是普通数据区，不做 BCH 断言
    const qr = qrEncode('x'.repeat(qrCapacityBytes(6, 'L')), 'L')
    expect(qr.version).toBe(6)
    // 功能格占位图里这块不该被标住，标住了数据位就少一截、解码必然错位
    const reserved = functionModules(6)
    expect(reserved[0]![qr.count - 11]).toBe(false)
    expect(reserved[qr.count - 11]![0]).toBe(false)
  })
})

describe('结构合规', () => {
  const FINDER = [
    [1, 1, 1, 1, 1, 1, 1],
    [1, 0, 0, 0, 0, 0, 1],
    [1, 0, 1, 1, 1, 0, 1],
    [1, 0, 1, 1, 1, 0, 1],
    [1, 0, 1, 1, 1, 0, 1],
    [1, 0, 0, 0, 0, 0, 1],
    [1, 1, 1, 1, 1, 1, 1],
  ].map(line => line.map(Boolean))

  const ALIGN = [
    [1, 1, 1, 1, 1],
    [1, 0, 0, 0, 1],
    [1, 0, 1, 0, 1],
    [1, 0, 0, 0, 1],
    [1, 1, 1, 1, 1],
  ].map(line => line.map(Boolean))

  function patch(qr: ReturnType<typeof qrEncode>, top: number, left: number, n: number): boolean[][] {
    return Array.from({ length: n }, (_, r) => Array.from({ length: n }, (_, c) => qr.modules[top + r]![left + c]!))
  }

  it('三处定位图形逐格正确，右下角没有', () => {
    for (const version of [1, 7, 40] as const) {
      const qr = qrEncode('x'.repeat(qrCapacityBytes(version, 'M')), 'M')
      const far = qr.count - 7
      expect(patch(qr, 0, 0, 7)).toEqual(FINDER)
      expect(patch(qr, 0, far, 7)).toEqual(FINDER)
      expect(patch(qr, far, 0, 7)).toEqual(FINDER)
      expect(patch(qr, far, far, 7)).not.toEqual(FINDER)
    }
  })

  it('三处分隔带整条全浅', () => {
    const qr = qrEncode('曦寒 UI', 'M')
    const last = qr.count - 1
    for (let i = 0; i <= 7; i++) {
      expect(qr.modules[7]![i]).toBe(false)
      expect(qr.modules[i]![7]).toBe(false)
      expect(qr.modules[7]![last - i]).toBe(false)
      expect(qr.modules[i]![last - 7]).toBe(false)
      expect(qr.modules[last - 7]![i]).toBe(false)
      expect(qr.modules[last - i]![7]).toBe(false)
    }
  })

  it('时序图形在两个定位图形之间深浅交替', () => {
    for (const version of [1, 2, 7, 21, 40] as const) {
      const qr = qrEncode('x'.repeat(qrCapacityBytes(version, 'L')), 'L')
      for (let i = 8; i <= qr.count - 9; i++) {
        expect(qr.modules[6]![i]).toBe(i % 2 === 0)
        expect(qr.modules[i]![6]).toBe(i % 2 === 0)
      }
    }
  })

  it('恒深模块在 (4 × 版本 + 9, 8)', () => {
    for (const level of LEVELS) {
      for (const version of [1, 6, 7, 33, 40] as const) {
        const qr = qrEncode('x'.repeat(qrCapacityBytes(version, level)), level)
        expect(qr.count - 8).toBe(4 * version + 9)
        expect(qr.modules[4 * version + 9]![8]).toBe(true)
      }
    }
  })

  it('校正图形中心坐标与 Annex E 的表逐版本相同', () => {
    for (let version = 1; version <= QR_MAX_VERSION; version++)
      expect(qrAlignmentPositions(version)).toEqual([...ALIGNMENT[version]!])
    // 1 版没有校正图形，2 版起才有
    expect(qrAlignmentPositions(1)).toEqual([])
    expect(qrAlignmentPositions(2)).toHaveLength(2)
  })

  it('每个该画的中心上确实是 5×5 的校正图形，该跳过的三个角上没有', () => {
    for (const version of [2, 6, 7, 14, 21, 28, 32, 35, 40] as const) {
      const qr = qrEncode('x'.repeat(qrCapacityBytes(version, 'L')), 'L')
      const centers = ALIGNMENT[version]!
      let drawn = 0
      for (const row of centers) {
        for (const col of centers) {
          if (collidesWithFinder(row, col, qr.count))
            continue
          expect({ version, row, col, patch: patch(qr, row - 2, col - 2, 5) })
            .toEqual({ version, row, col, patch: ALIGN })
          drawn++
        }
      }
      // 三个角各被定位图形占掉一个
      expect(drawn).toBe(centers.length * centers.length - 3)
    }
  })

  it('校正图形中心全落在时序图形上或与之同奇偶，且不越界', () => {
    for (let version = 2; version <= QR_MAX_VERSION; version++) {
      const size = 4 * version + 17
      const centers = ALIGNMENT[version]!
      expect(centers[0]).toBe(6)
      expect(centers[centers.length - 1]).toBe(size - 7)
      for (const c of centers) {
        expect(c).toBeGreaterThanOrEqual(6)
        expect(c).toBeLessThanOrEqual(size - 7)
        expect(c % 2).toBe(0)
      }
    }
  })
})
