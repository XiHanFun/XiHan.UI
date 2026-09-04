// QR 编码器的判据。全是纯函数，不碰 DOM，不需要 jsdom。
//
// 结构类断言（定位图形、时序图形、暗模块）单独钉每一处；
// 最后一组把矩阵整个读回来：去掩模、按规格反向取码字、还原分块、核对里德-所罗门校验子、
// 解出内容比对原文——「画得出」与「扫得出」是两回事，只有读回来才证明后者。
import { describe, expect, it } from 'vitest'
import { QR_MAX_VERSION, qrAlignmentPositions, qrCapacityBytes, qrEncode } from '../src/qr-code/qr-encode'

type Level = 'L' | 'M' | 'Q' | 'H'

const LEVELS: readonly Level[] = ['L', 'M', 'Q', 'H']

// 规格表的第二份誊抄，供解码与容量对账用；与编码器那份对不上就说明有一份抄错了
const ECC_PER_BLOCK: Record<Level, readonly number[]> = {
  L: [0, 7, 10, 15, 20, 26, 18, 20, 24, 30, 18, 20, 24, 26, 30, 22, 24, 28, 30, 28, 28, 28, 28, 30, 30, 26, 28, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30],
  M: [0, 10, 16, 26, 18, 24, 16, 18, 22, 22, 26, 30, 22, 22, 24, 24, 28, 28, 26, 26, 26, 26, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28],
  Q: [0, 13, 22, 18, 26, 18, 24, 18, 22, 20, 24, 28, 26, 24, 20, 30, 24, 28, 28, 26, 30, 28, 30, 30, 30, 30, 28, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30],
  H: [0, 17, 28, 22, 16, 22, 28, 26, 26, 24, 28, 24, 28, 22, 24, 24, 30, 28, 28, 26, 28, 30, 24, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30],
}

const BLOCK_COUNT: Record<Level, readonly number[]> = {
  L: [0, 1, 1, 1, 1, 1, 2, 2, 2, 2, 4, 4, 4, 4, 4, 6, 6, 6, 6, 7, 8, 8, 9, 9, 10, 12, 12, 12, 13, 14, 15, 16, 17, 18, 19, 19, 20, 21, 22, 24, 25],
  M: [0, 1, 1, 1, 2, 2, 4, 4, 4, 5, 5, 5, 8, 9, 9, 10, 10, 11, 13, 14, 16, 17, 17, 18, 20, 21, 23, 25, 26, 28, 29, 31, 33, 35, 37, 38, 40, 43, 45, 47, 49],
  Q: [0, 1, 1, 2, 2, 4, 4, 6, 6, 8, 8, 8, 10, 12, 16, 12, 17, 16, 18, 21, 20, 23, 23, 25, 27, 29, 34, 34, 35, 38, 40, 43, 45, 48, 51, 53, 56, 59, 62, 65, 68],
  H: [0, 1, 1, 2, 4, 4, 4, 5, 6, 8, 8, 11, 11, 16, 16, 18, 16, 19, 21, 25, 25, 25, 34, 30, 32, 35, 37, 40, 42, 45, 48, 51, 54, 57, 60, 63, 66, 70, 74, 77, 81],
}

const LEVEL_OF_BITS: Record<number, Level> = { 1: 'L', 0: 'M', 3: 'Q', 2: 'H' }

function rawDataModules(version: number): number {
  let result = (16 * version + 128) * version + 64
  if (version >= 2) {
    const alignCount = Math.floor(version / 7) + 2
    result -= (25 * alignCount - 10) * alignCount - 55
    if (version >= 7)
      result -= 36
  }
  return result
}

function totalCodewords(version: number): number {
  return Math.floor(rawDataModules(version) / 8)
}

function gfMul(x: number, y: number): number {
  let z = 0
  for (let i = 7; i >= 0; i--) {
    z = (z << 1) ^ ((z >>> 7) * 0x11D)
    z ^= ((y >>> i) & 1) * x
  }
  return z & 0xFF
}

function maskCondition(mask: number, row: number, col: number): boolean {
  switch (mask) {
    case 0: return (row + col) % 2 === 0
    case 1: return row % 2 === 0
    case 2: return col % 3 === 0
    case 3: return (row + col) % 3 === 0
    case 4: return (Math.floor(col / 3) + Math.floor(row / 2)) % 2 === 0
    case 5: return (row * col) % 2 + (row * col) % 3 === 0
    case 6: return ((row * col) % 2 + (row * col) % 3) % 2 === 0
    default: return ((row + col) % 2 + (row * col) % 3) % 2 === 0
  }
}

/** 解码侧自己算一遍功能格占位图，不问编码器要。 */
function functionMap(version: number): boolean[][] {
  const size = 4 * version + 17
  const map = Array.from({ length: size }, () => Array.from<boolean>({ length: size }).fill(false))
  const mark = (row: number, col: number): void => {
    if (row >= 0 && row < size && col >= 0 && col < size)
      map[row]![col] = true
  }
  for (let i = 0; i < size; i++) {
    mark(6, i)
    mark(i, 6)
  }
  for (const [fr, fc] of [[3, 3], [3, size - 4], [size - 4, 3]] as const) {
    for (let dr = -4; dr <= 4; dr++) {
      for (let dc = -4; dc <= 4; dc++)
        mark(fr + dr, fc + dc)
    }
  }
  const positions = qrAlignmentPositions(version)
  const last = positions.length - 1
  for (let i = 0; i <= last; i++) {
    for (let j = 0; j <= last; j++) {
      if ((i === 0 && j === 0) || (i === 0 && j === last) || (i === last && j === 0))
        continue
      for (let dr = -2; dr <= 2; dr++) {
        for (let dc = -2; dc <= 2; dc++)
          mark(positions[i]! + dr, positions[j]! + dc)
      }
    }
  }
  for (let i = 0; i <= 5; i++)
    mark(i, 8)
  mark(7, 8)
  mark(8, 8)
  mark(8, 7)
  for (let i = 9; i < 15; i++)
    mark(8, 14 - i)
  for (let i = 0; i < 8; i++)
    mark(8, size - 1 - i)
  for (let i = 8; i < 15; i++)
    mark(size - 15 + i, 8)
  mark(size - 8, 8)
  if (version >= 7) {
    for (let i = 0; i < 18; i++) {
      const far = size - 11 + i % 3
      const near = Math.floor(i / 3)
      mark(near, far)
      mark(far, near)
    }
  }
  return map
}

/** 读第一份格式信息，返回级别与掩模编号。 */
function readFormat(matrix: readonly (readonly boolean[])[]): { level: Level, mask: number } {
  const slots: Array<[number, number]> = []
  for (let i = 0; i <= 5; i++)
    slots.push([i, 8])
  slots.push([7, 8], [8, 8], [8, 7])
  for (let i = 9; i < 15; i++)
    slots.push([8, 14 - i])

  let raw = 0
  slots.forEach(([row, col], i) => {
    if (matrix[row]![col])
      raw |= 1 << i
  })
  const bits = raw ^ 0x5412
  return { level: LEVEL_OF_BITS[(bits >>> 13) & 3]!, mask: (bits >>> 10) & 7 }
}

interface Decoded {
  version: number
  level: Level
  mask: number
  bytes: number[]
}

/** 把矩阵读回内容字节；分块还原不上或校验子非零就直接抛。 */
function decode(matrix: readonly (readonly boolean[])[]): Decoded {
  const size = matrix.length
  const version = (size - 17) / 4
  const { level, mask } = readFormat(matrix)
  const reserved = functionMap(version)

  const plain = matrix.map((line, row) => line.map((cell, col) =>
    !reserved[row]![col] && maskCondition(mask, row, col) ? !cell : cell))

  const bits: number[] = []
  for (let right = size - 1; right >= 1; right -= 2) {
    if (right === 6)
      right = 5
    for (let vert = 0; vert < size; vert++) {
      for (let j = 0; j < 2; j++) {
        const col = right - j
        const upward = ((right + 1) & 2) === 0
        const row = upward ? size - 1 - vert : vert
        if (!reserved[row]![col])
          bits.push(plain[row]![col] ? 1 : 0)
      }
    }
  }

  const eccLen = ECC_PER_BLOCK[level][version]!
  const blockCount = BLOCK_COUNT[level][version]!
  const rawCount = Math.floor(bits.length / 8)
  const raw: number[] = []
  for (let i = 0; i < rawCount; i++) {
    let byte = 0
    for (let j = 0; j < 8; j++)
      byte = (byte << 1) | bits[i * 8 + j]!
    raw.push(byte)
  }

  const shortBlockCount = blockCount - rawCount % blockCount
  const shortBlockLen = Math.floor(rawCount / blockCount)
  const dataLenOf = (j: number): number => shortBlockLen - eccLen + (j < shortBlockCount ? 0 : 1)
  const blocks = Array.from(
    { length: blockCount },
    (_, j) => Array.from<number>({ length: shortBlockLen + (j < shortBlockCount ? 0 : 1) }).fill(0),
  )

  let taken = 0
  for (let i = 0; i < shortBlockLen - eccLen + 1; i++) {
    for (let j = 0; j < blockCount; j++) {
      if (i < dataLenOf(j))
        blocks[j]![i] = raw[taken++]!
    }
  }
  for (let i = 0; i < eccLen; i++) {
    for (let j = 0; j < blockCount; j++)
      blocks[j]![dataLenOf(j) + i] = raw[taken++]!
  }
  if (taken !== rawCount)
    throw new Error(`交错还原对不上：用了 ${taken} 个码字，实际有 ${rawCount} 个`)

  // 生成多项式取根 α^0..α^(eccLen-1)，正确的码字在这些点上求值恒为 0
  for (let j = 0; j < blockCount; j++) {
    let alphaPow = 1
    for (let i = 0; i < eccLen; i++) {
      let syndrome = 0
      for (const byte of blocks[j]!)
        syndrome = gfMul(syndrome, alphaPow) ^ byte
      if (syndrome !== 0)
        throw new Error(`第 ${j} 块的校验子 S${i} = ${syndrome}，纠错码字算错了`)
      alphaPow = gfMul(alphaPow, 2)
    }
  }

  const dataBits: number[] = []
  for (let j = 0; j < blockCount; j++) {
    for (const byte of blocks[j]!.slice(0, dataLenOf(j))) {
      for (let i = 7; i >= 0; i--)
        dataBits.push((byte >>> i) & 1)
    }
  }

  let cursor = 0
  const take = (length: number): number => {
    let value = 0
    for (let i = 0; i < length; i++)
      value = (value << 1) | dataBits[cursor++]!
    return value
  }
  const mode = take(4)
  if (mode !== 0b0100)
    throw new Error(`模式指示符是 ${mode.toString(2)}，字节模式应为 0100`)
  const count = take(version < 10 ? 8 : 16)
  const bytes: number[] = []
  for (let i = 0; i < count; i++)
    bytes.push(take(8))
  return { version, level, mask, bytes }
}

describe('模块数', () => {
  it('每边恒等于 4 × 版本 + 17，且矩阵是正方的', () => {
    for (const [text, level] of [['x', 'H'], ['x'.repeat(60), 'M'], ['x'.repeat(400), 'Q'], ['x'.repeat(2000), 'L']] as const) {
      const qr = qrEncode(text, level)
      expect(qr.count).toBe(4 * qr.version + 17)
      expect(qr.modules).toHaveLength(qr.count)
      for (const line of qr.modules)
        expect(line).toHaveLength(qr.count)
    }
  })
})

describe('定位图形', () => {
  // 7×7：中心 3×3 深、外面一圈浅、最外一圈深
  const EXPECTED = [
    [1, 1, 1, 1, 1, 1, 1],
    [1, 0, 0, 0, 0, 0, 1],
    [1, 0, 1, 1, 1, 0, 1],
    [1, 0, 1, 1, 1, 0, 1],
    [1, 0, 1, 1, 1, 0, 1],
    [1, 0, 0, 0, 0, 0, 1],
    [1, 1, 1, 1, 1, 1, 1],
  ].map(line => line.map(Boolean))

  function blockAt(qr: ReturnType<typeof qrEncode>, top: number, left: number): boolean[][] {
    return Array.from({ length: 7 }, (_, r) => Array.from({ length: 7 }, (_, c) => qr.modules[top + r]![left + c]!))
  }

  it('左上、右上、左下三处形状逐格相同，右下角没有', () => {
    const qr = qrEncode('曦寒 UI', 'M')
    const far = qr.count - 7
    expect(blockAt(qr, 0, 0)).toEqual(EXPECTED)
    expect(blockAt(qr, 0, far)).toEqual(EXPECTED)
    expect(blockAt(qr, far, 0)).toEqual(EXPECTED)
    // 右下角是数据区，恰好长成定位图形的概率可以忽略；长成了就说明画错了地方
    expect(blockAt(qr, far, far)).not.toEqual(EXPECTED)
  })

  it('三处外围各有一圈全浅的分隔带', () => {
    const qr = qrEncode('曦寒 UI', 'M')
    const last = qr.count - 1
    for (let i = 0; i <= 7; i++) {
      // 左上：第 7 行与第 7 列
      expect(qr.modules[7]![i]).toBe(false)
      expect(qr.modules[i]![7]).toBe(false)
      // 右上：第 7 行与右起第 8 列
      expect(qr.modules[7]![last - i]).toBe(false)
      expect(qr.modules[i]![last - 7]).toBe(false)
      // 左下：下起第 8 行与第 7 列
      expect(qr.modules[last - 7]![i]).toBe(false)
      expect(qr.modules[last - i]![7]).toBe(false)
    }
  })
})

describe('时序图形', () => {
  it('第 6 行与第 6 列在两个定位图形之间深浅交替', () => {
    for (const version of [1, 2, 7, 15] as const) {
      // 挑一个刚好落在该版本的内容长度
      const qr = qrEncode('x'.repeat(qrCapacityBytes(version, 'L')), 'L')
      expect(qr.version).toBe(version)
      for (let i = 8; i <= qr.count - 9; i++) {
        expect(qr.modules[6]![i]).toBe(i % 2 === 0)
        expect(qr.modules[i]![6]).toBe(i % 2 === 0)
      }
    }
  })
})

describe('固定的暗模块', () => {
  it('恒在 (4 × 版本 + 9, 8) 且恒为深色', () => {
    for (const level of LEVELS) {
      for (const version of [1, 3, 8, 20] as const) {
        const qr = qrEncode('x'.repeat(qrCapacityBytes(version, level)), level)
        expect(qr.version).toBe(version)
        expect(qr.modules[4 * version + 9]![8]).toBe(true)
        expect(4 * version + 9).toBe(qr.count - 8)
      }
    }
  })
})

describe('校正图形的中心坐标', () => {
  it('与规格表逐版本一致', () => {
    expect(qrAlignmentPositions(1)).toEqual([])
    expect(qrAlignmentPositions(2)).toEqual([6, 18])
    expect(qrAlignmentPositions(7)).toEqual([6, 22, 38])
    expect(qrAlignmentPositions(10)).toEqual([6, 28, 50])
    // 32 版是唯一一个不按通式取步长的版本
    expect(qrAlignmentPositions(32)).toEqual([6, 34, 60, 86, 112, 138])
    expect(qrAlignmentPositions(40)).toEqual([6, 30, 58, 86, 114, 142, 170])
  })
})

describe('容量表', () => {
  it('与公布的字节模式容量一致', () => {
    const known: Record<number, Record<Level, number>> = {
      1: { L: 17, M: 14, Q: 11, H: 7 },
      2: { L: 32, M: 26, Q: 20, H: 14 },
      3: { L: 53, M: 42, Q: 32, H: 24 },
      4: { L: 78, M: 62, Q: 46, H: 34 },
      10: { L: 271, M: 213, Q: 151, H: 119 },
      40: { L: 2953, M: 2331, Q: 1663, H: 1273 },
    }
    for (const [version, row] of Object.entries(known)) {
      for (const level of LEVELS)
        expect(qrCapacityBytes(Number(version), level)).toBe(row[level])
    }
  })

  it('与规格表另算一遍的结果逐格相同', () => {
    // 分块表抄错一格不会让编码器报错，只会让容量悄悄少一截；这条做双录对账
    for (let version = 1; version <= QR_MAX_VERSION; version++) {
      for (const level of LEVELS) {
        const dataCodewords = totalCodewords(version) - BLOCK_COUNT[level][version]! * ECC_PER_BLOCK[level][version]!
        const expected = Math.floor((dataCodewords * 8 - 4 - (version < 10 ? 8 : 16)) / 8)
        expect(qrCapacityBytes(version, level)).toBe(expected)
      }
    }
  })

  it('容量随版本单调不减', () => {
    for (const level of LEVELS) {
      for (let version = 2; version <= QR_MAX_VERSION; version++)
        expect(qrCapacityBytes(version, level)).toBeGreaterThanOrEqual(qrCapacityBytes(version - 1, level))
    }
  })
})

describe('版本自动选择', () => {
  it('取装得下的最小版本，每档的临界长度都踩一遍', () => {
    for (const level of LEVELS) {
      for (const version of [1, 2, 3, 9, 10, 25, QR_MAX_VERSION] as const) {
        const cap = qrCapacityBytes(version, level)
        expect(qrEncode('x'.repeat(cap), level).version).toBe(version)
        if (version > 1)
          expect(qrEncode('x'.repeat(qrCapacityBytes(version - 1, level) + 1), level).version).toBe(version)
      }
    }
  })

  it('9 版到 10 版之间字符计数指示符从 8 位变 16 位，临界点照样是最小版本', () => {
    expect(qrEncode('x'.repeat(230), 'L').version).toBe(9)
    expect(qrEncode('x'.repeat(231), 'L').version).toBe(10)
  })

  it('按 UTF-8 字节数算，不是按字符数', () => {
    // 每个汉字 3 字节：6 字 = 18 字节，超过 1 版 L 的 17 字节
    expect(qrEncode('曦寒界面组件', 'L').version).toBe(2)
    expect(qrEncode('x'.repeat(18), 'L').version).toBe(2)
    // 5 字 = 15 字节，还在 1 版里
    expect(qrEncode('曦寒界面库', 'L').version).toBe(1)
  })

  it('空串也是一张合法的 1 版码', () => {
    expect(qrEncode('', 'M').version).toBe(1)
    expect(qrEncode('', 'M').count).toBe(21)
  })
})

describe('容量越界', () => {
  it('超出 40 版容量时抛 RangeError，不截断', () => {
    for (const level of LEVELS) {
      const cap = qrCapacityBytes(QR_MAX_VERSION, level)
      expect(() => qrEncode('x'.repeat(cap), level)).not.toThrow()
      expect(() => qrEncode('x'.repeat(cap + 1), level)).toThrow(RangeError)
    }
  })

  it('多字节内容按字节数判越界', () => {
    // 汉字每个 3 字节，字符数远没到上限也会越界
    expect(() => qrEncode('曦'.repeat(500), 'H')).toThrow(RangeError)
  })
})

describe('读得回来', () => {
  it('去掩模、还原分块、核对校验子后解出的内容与原文逐字节相同', () => {
    const samples: Array<[string, Level]> = [
      ['', 'M'],
      ['a', 'H'],
      ['https://ui.xihanfun.com', 'M'],
      ['曦寒 UI · 组件库', 'Q'],
      ['x'.repeat(230), 'L'],
      ['x'.repeat(231), 'L'],
      ['0123456789'.repeat(60), 'M'],
    ]
    for (const [text, level] of samples) {
      const qr = qrEncode(text, level)
      const got = decode(qr.modules)
      expect(got.version).toBe(qr.version)
      expect(got.level).toBe(level)
      expect(got.mask).toBe(qr.mask)
      expect(got.bytes).toEqual([...new TextEncoder().encode(text)])
    }
  })

  it('各档版本装满时也读得回来（含带版本信息的 7 版起与 40 版）', () => {
    for (const version of [1, 2, 7, 10, 32, QR_MAX_VERSION] as const) {
      for (const level of LEVELS) {
        const text = 'x'.repeat(qrCapacityBytes(version, level))
        const qr = qrEncode(text, level)
        expect(qr.version).toBe(version)
        const got = decode(qr.modules)
        expect(got.level).toBe(level)
        expect(got.bytes).toEqual([...new TextEncoder().encode(text)])
      }
    }
  })

  it('掩模编号落在 0-7', () => {
    for (const level of LEVELS) {
      const qr = qrEncode('曦寒 UI', level)
      expect(qr.mask).toBeGreaterThanOrEqual(0)
      expect(qr.mask).toBeLessThanOrEqual(7)
    }
  })
})
