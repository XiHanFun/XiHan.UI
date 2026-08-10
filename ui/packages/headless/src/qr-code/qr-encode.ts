/**
 * QR 码编码器：把一段文本算成布尔矩阵（ISO/IEC 18004）。
 *
 * 纯函数：不碰 DOM、不读全局、不掷随机数，同样的入参恒给同一份矩阵。
 *
 * 只走字节模式——内容一律按 UTF-8 取字节、每字节编成 8 位。数字模式与字母数字模式没有实现：
 * 它们把纯数字 / 纯大写字母压得更紧，同样的内容能落在更小的版本上。这里不做压缩，
 * 纯数字串因此可能选到比理论最小值更大的版本；扫出来的内容不受影响。
 */

/** 纠错级别，可恢复的码字比例依次约为 7% / 15% / 25% / 30%。 */
export type QrLevel = 'L' | 'M' | 'Q' | 'H'

/** 最大版本，每边 177 个模块。 */
export const QR_MAX_VERSION = 40

export interface QrMatrix {
  /** 实际用到的版本，1-40。 */
  readonly version: number
  /** 每边模块数，恒等于 4 × version + 17。 */
  readonly count: number
  /** 编码用的纠错级别。 */
  readonly level: QrLevel
  /** 选中的掩模编号 0-7。 */
  readonly mask: number
  /** 模块矩阵，[行][列]，true = 深色。 */
  readonly modules: readonly (readonly boolean[])[]
}

// ── 规格表 ──
// 下标即版本号，0 位补位不用。

/** 每个纠错块的纠错码字数。 */
const ECC_PER_BLOCK: Record<QrLevel, readonly number[]> = {
  L: [0, 7, 10, 15, 20, 26, 18, 20, 24, 30, 18, 20, 24, 26, 30, 22, 24, 28, 30, 28, 28, 28, 28, 30, 30, 26, 28, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30],
  M: [0, 10, 16, 26, 18, 24, 16, 18, 22, 22, 26, 30, 22, 22, 24, 24, 28, 28, 26, 26, 26, 26, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28],
  Q: [0, 13, 22, 18, 26, 18, 24, 18, 22, 20, 24, 28, 26, 24, 20, 30, 24, 28, 28, 26, 30, 28, 30, 30, 30, 30, 28, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30],
  H: [0, 17, 28, 22, 16, 22, 28, 26, 26, 24, 28, 24, 28, 22, 24, 24, 30, 28, 28, 26, 28, 30, 24, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30],
}

/** 纠错块数。 */
const BLOCK_COUNT: Record<QrLevel, readonly number[]> = {
  L: [0, 1, 1, 1, 1, 1, 2, 2, 2, 2, 4, 4, 4, 4, 4, 6, 6, 6, 6, 7, 8, 8, 9, 9, 10, 12, 12, 12, 13, 14, 15, 16, 17, 18, 19, 19, 20, 21, 22, 24, 25],
  M: [0, 1, 1, 1, 2, 2, 4, 4, 4, 5, 5, 5, 8, 9, 9, 10, 10, 11, 13, 14, 16, 17, 17, 18, 20, 21, 23, 25, 26, 28, 29, 31, 33, 35, 37, 38, 40, 43, 45, 47, 49],
  Q: [0, 1, 1, 2, 2, 4, 4, 6, 6, 8, 8, 8, 10, 12, 16, 12, 17, 16, 18, 21, 20, 23, 23, 25, 27, 29, 34, 34, 35, 38, 40, 43, 45, 48, 51, 53, 56, 59, 62, 65, 68],
  H: [0, 1, 1, 2, 4, 4, 4, 5, 6, 8, 8, 11, 11, 16, 16, 18, 16, 19, 21, 25, 25, 25, 34, 30, 32, 35, 37, 40, 42, 45, 48, 51, 54, 57, 60, 63, 66, 70, 74, 77, 81],
}

/** 格式信息里代表纠错级别的两位。 */
const LEVEL_BITS: Record<QrLevel, number> = { L: 1, M: 0, Q: 3, H: 2 }

/** 字节模式的模式指示符。 */
const MODE_BYTE = 0b0100

// 罚分权重：连续同色、同色 2×2 块、疑似定位图形、深色占比失衡。
const PENALTY_RUN = 3
const PENALTY_BLOCK = 3
const PENALTY_FINDER_LIKE = 40
const PENALTY_BALANCE = 10

// ── 位与字节 ──

/** 取 value 的第 index 位（0 = 最低位）。 */
function bitAt(value: number, index: number): boolean {
  return ((value >>> index) & 1) !== 0
}

/** 往位串尾部追加 value 的低 length 位，高位在前。 */
function appendBits(bits: number[], value: number, length: number): void {
  for (let i = length - 1; i >= 0; i--)
    bits.push((value >>> i) & 1)
}

/**
 * 按 UTF-8 把字符串取成字节。
 * `for...of` 按码点走，成对的代理项合成一个码点；落单的代理项换成 U+FFFD——
 * 半个代理项不是合法码点，原样编出去得到的是一串解不开的字节。
 */
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

// ── 容量 ──

/** 除功能图形外可写的模块数，即数据位数（含末尾的余数位）。 */
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

/** 该版本的总码字数（数据码字 + 纠错码字）。 */
function totalCodewords(version: number): number {
  return Math.floor(rawDataModules(version) / 8)
}

/** 该版本该级别能放的数据位数，已扣掉全部纠错码字。 */
function dataCapacityBits(version: number, level: QrLevel): number {
  const blocks = BLOCK_COUNT[level][version]!
  const ecc = ECC_PER_BLOCK[level][version]!
  return (totalCodewords(version) - blocks * ecc) * 8
}

/** 字节模式的字符计数指示符位数。 */
function charCountBits(version: number): number {
  return version < 10 ? 8 : 16
}

/** 该版本该级别在字节模式下能装的最大字节数。 */
export function qrCapacityBytes(version: number, level: QrLevel): number {
  return Math.floor((dataCapacityBits(version, level) - 4 - charCountBits(version)) / 8)
}

/** 选能装下这么多字节的最小版本；一个都装不下就抛错。 */
function pickVersion(byteLength: number, level: QrLevel): number {
  for (let version = 1; version <= QR_MAX_VERSION; version++) {
    if (byteLength <= qrCapacityBytes(version, level))
      return version
  }
  throw new RangeError(
    `内容 ${byteLength} 字节，超出 ${QR_MAX_VERSION} 版 ${level} 级纠错的上限 `
    + `${qrCapacityBytes(QR_MAX_VERSION, level)} 字节；截断会得到一张扫得出、但内容是半截的码`,
  )
}

// ── GF(256) 与里德-所罗门纠错 ──

/** GF(256) 上的乘法，本原多项式 0x11D。 */
function gfMul(x: number, y: number): number {
  let z = 0
  for (let i = 7; i >= 0; i--) {
    z = (z << 1) ^ ((z >>> 7) * 0x11D)
    z ^= ((y >>> i) & 1) * x
  }
  return z & 0xFF
}

/** 生成多项式的系数，首项常数 1 不入表；长度 = 纠错码字数。 */
function rsDivisor(degree: number): number[] {
  const result = Array.from<number>({ length: degree }).fill(0)
  result[degree - 1] = 1
  let root = 1
  for (let i = 0; i < degree; i++) {
    for (let j = 0; j < degree; j++) {
      result[j] = gfMul(result[j]!, root)
      if (j + 1 < degree)
        result[j] = result[j]! ^ result[j + 1]!
    }
    root = gfMul(root, 2)
  }
  return result
}

/** 数据码字除以生成多项式的余式，即这一块的纠错码字。 */
function rsRemainder(data: readonly number[], divisor: readonly number[]): number[] {
  const result = Array.from<number>({ length: divisor.length }).fill(0)
  for (const byte of data) {
    const factor = byte ^ result.shift()!
    result.push(0)
    for (let i = 0; i < divisor.length; i++)
      result[i] = result[i]! ^ gfMul(divisor[i]!, factor)
  }
  return result
}

/** 数据码字分块、逐块算纠错码字，再按规格交错成最终码字序列。 */
function addEccAndInterleave(data: readonly number[], version: number, level: QrLevel): number[] {
  const blockCount = BLOCK_COUNT[level][version]!
  const eccLen = ECC_PER_BLOCK[level][version]!
  const rawCodewords = totalCodewords(version)
  // 前 shortBlockCount 块少一个数据码字
  const shortBlockCount = blockCount - rawCodewords % blockCount
  const shortBlockLen = Math.floor(rawCodewords / blockCount)

  const divisor = rsDivisor(eccLen)
  const blocks: number[][] = []
  for (let i = 0, taken = 0; i < blockCount; i++) {
    const dataLen = shortBlockLen - eccLen + (i < shortBlockCount ? 0 : 1)
    const chunk = data.slice(taken, taken + dataLen)
    taken += dataLen
    const ecc = rsRemainder(chunk, divisor)
    // 短块尾部补一个占位字节让各块等长，交错时按下标跳过它
    if (i < shortBlockCount)
      chunk.push(0)
    blocks.push(chunk.concat(ecc))
  }

  const out: number[] = []
  for (let i = 0; i < blocks[0]!.length; i++) {
    for (let j = 0; j < blockCount; j++) {
      if (i !== shortBlockLen - eccLen || j >= shortBlockCount)
        out.push(blocks[j]![i]!)
    }
  }
  return out
}

// ── 矩阵 ──

interface Grid {
  readonly size: number
  readonly modules: boolean[][]
  /** 功能图形与格式 / 版本信息占用的格子，数据不许铺进去、掩模也不翻它们。 */
  readonly reserved: boolean[][]
}

/** 写一个功能格并占位；越界坐标直接丢弃，定位图形的分隔带靠这一条自然裁掉。 */
function setFunction(grid: Grid, row: number, col: number, dark: boolean): void {
  if (row < 0 || row >= grid.size || col < 0 || col >= grid.size)
    return
  grid.modules[row]![col] = dark
  grid.reserved[row]![col] = true
}

/** 校正图形的中心坐标表，行列共用。 */
export function qrAlignmentPositions(version: number): number[] {
  if (version === 1)
    return []
  const count = Math.floor(version / 7) + 2
  const size = 4 * version + 17
  const step = version === 32 ? 26 : Math.ceil((version * 4 + 4) / (count * 2 - 2)) * 2
  const result = [6]
  for (let pos = size - 7; result.length < count; pos -= step)
    result.splice(1, 0, pos)
  return result
}

/** 7×7 定位图形连同外围一圈分隔带。 */
function drawFinder(grid: Grid, row: number, col: number): void {
  for (let dr = -4; dr <= 4; dr++) {
    for (let dc = -4; dc <= 4; dc++) {
      const dist = Math.max(Math.abs(dr), Math.abs(dc))
      setFunction(grid, row + dr, col + dc, dist !== 2 && dist !== 4)
    }
  }
}

/** 5×5 校正图形。 */
function drawAlignment(grid: Grid, row: number, col: number): void {
  for (let dr = -2; dr <= 2; dr++) {
    for (let dc = -2; dc <= 2; dc++)
      setFunction(grid, row + dr, col + dc, Math.max(Math.abs(dr), Math.abs(dc)) !== 1)
  }
}

/** 时序图形、三个定位图形、全部校正图形。 */
function drawFunctionPatterns(grid: Grid, version: number): void {
  const { size } = grid
  // 时序图形先画：与定位图形重叠的那几格随后被分隔带覆盖
  for (let i = 0; i < size; i++) {
    setFunction(grid, 6, i, i % 2 === 0)
    setFunction(grid, i, 6, i % 2 === 0)
  }
  drawFinder(grid, 3, 3)
  drawFinder(grid, 3, size - 4)
  drawFinder(grid, size - 4, 3)

  const positions = qrAlignmentPositions(version)
  const last = positions.length - 1
  for (let i = 0; i <= last; i++) {
    for (let j = 0; j <= last; j++) {
      // 三个角上的校正图形会压在定位图形上，跳过
      if ((i === 0 && j === 0) || (i === 0 && j === last) || (i === last && j === 0))
        continue
      drawAlignment(grid, positions[i]!, positions[j]!)
    }
  }
}

/** 格式信息：5 位数据 + 10 位 BCH 校验，掩去 0x5412 后写两份。 */
function drawFormat(grid: Grid, level: QrLevel, mask: number): void {
  const { size } = grid
  const data = (LEVEL_BITS[level] << 3) | mask
  let rem = data
  for (let i = 0; i < 10; i++)
    rem = (rem << 1) ^ ((rem >>> 9) * 0x537)
  const bits = ((data << 10) | rem) ^ 0x5412

  // 第一份：左上定位图形的右侧与下方
  for (let i = 0; i <= 5; i++)
    setFunction(grid, i, 8, bitAt(bits, i))
  setFunction(grid, 7, 8, bitAt(bits, 6))
  setFunction(grid, 8, 8, bitAt(bits, 7))
  setFunction(grid, 8, 7, bitAt(bits, 8))
  for (let i = 9; i < 15; i++)
    setFunction(grid, 8, 14 - i, bitAt(bits, i))

  // 第二份：右上与左下
  for (let i = 0; i < 8; i++)
    setFunction(grid, 8, size - 1 - i, bitAt(bits, i))
  for (let i = 8; i < 15; i++)
    setFunction(grid, size - 15 + i, 8, bitAt(bits, i))
  // 恒为深色的那一格
  setFunction(grid, size - 8, 8, true)
}

/** 版本信息：6 位版本号 + 12 位 BCH 校验，7 版起才有，写两份。 */
function drawVersion(grid: Grid, version: number): void {
  const { size } = grid
  let rem = version
  for (let i = 0; i < 12; i++)
    rem = (rem << 1) ^ ((rem >>> 11) * 0x1F25)
  const bits = (version << 12) | rem

  for (let i = 0; i < 18; i++) {
    const bit = bitAt(bits, i)
    const far = size - 11 + i % 3
    const near = Math.floor(i / 3)
    setFunction(grid, near, far, bit)
    setFunction(grid, far, near, bit)
  }
}

/** 码字按两列一组、自右向左蛇形铺进非功能格；铺不满的余数位留浅色。 */
function placeCodewords(grid: Grid, codewords: readonly number[]): void {
  const { size } = grid
  let i = 0
  for (let right = size - 1; right >= 1; right -= 2) {
    // 第 6 列是时序图形，整列跳过
    if (right === 6)
      right = 5
    for (let vert = 0; vert < size; vert++) {
      for (let j = 0; j < 2; j++) {
        const col = right - j
        const upward = ((right + 1) & 2) === 0
        const row = upward ? size - 1 - vert : vert
        if (!grid.reserved[row]![col] && i < codewords.length * 8) {
          grid.modules[row]![col] = bitAt(codewords[i >>> 3]!, 7 - (i & 7))
          i++
        }
      }
    }
  }
}

/** 掩模条件：成立的格子翻色。 */
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

/** 按掩模翻非功能格；异或运算自逆，同一个掩模跑两遍即还原。 */
function applyMask(grid: Grid, mask: number): void {
  for (let row = 0; row < grid.size; row++) {
    for (let col = 0; col < grid.size; col++) {
      if (!grid.reserved[row]![col] && maskCondition(mask, row, col))
        grid.modules[row]![col] = !grid.modules[row]![col]
    }
  }
}

/** 把一段游程接进长度历史；首段前面按浅色边界补一整边。 */
function pushRun(size: number, runLength: number, history: number[]): void {
  const value = history[0] === 0 ? runLength + size : runLength
  history.pop()
  history.unshift(value)
}

/** 历史里的 1:1:3:1:1 深浅比例出现了几次。 */
function countFinderLike(history: readonly number[]): number {
  const unit = history[1]!
  const core = unit > 0
    && history[2] === unit && history[3] === unit * 3 && history[4] === unit && history[5] === unit
  return (core && history[0]! >= unit * 4 && history[6]! >= unit ? 1 : 0)
    + (core && history[6]! >= unit * 4 && history[0]! >= unit ? 1 : 0)
}

/** 收尾一条扫描线：末段后面按浅色边界补一整边再数一次。 */
function finishLine(size: number, runColor: boolean, runLength: number, history: number[]): number {
  let tail = runLength
  if (runColor) {
    pushRun(size, tail, history)
    tail = 0
  }
  tail += size
  pushRun(size, tail, history)
  return countFinderLike(history)
}

/** 一条扫描线的连续同色罚分与疑似定位图形罚分。 */
function scanLine(size: number, cellAt: (i: number) => boolean): number {
  let result = 0
  let runColor = false
  let runLength = 0
  const history = [0, 0, 0, 0, 0, 0, 0]
  for (let i = 0; i < size; i++) {
    if (cellAt(i) === runColor) {
      runLength++
      if (runLength === 5)
        result += PENALTY_RUN
      else if (runLength > 5)
        result++
    }
    else {
      pushRun(size, runLength, history)
      if (!runColor)
        result += countFinderLike(history) * PENALTY_FINDER_LIKE
      runColor = cellAt(i)
      runLength = 1
    }
  }
  return result + finishLine(size, runColor, runLength, history) * PENALTY_FINDER_LIKE
}

/** 整张矩阵的罚分，越低越好。 */
function penaltyScore(grid: Grid): number {
  const { size, modules } = grid
  let result = 0

  for (let row = 0; row < size; row++)
    result += scanLine(size, col => modules[row]![col]!)
  for (let col = 0; col < size; col++)
    result += scanLine(size, row => modules[row]![col]!)

  for (let row = 0; row < size - 1; row++) {
    for (let col = 0; col < size - 1; col++) {
      const color = modules[row]![col]
      if (color === modules[row]![col + 1] && color === modules[row + 1]![col] && color === modules[row + 1]![col + 1])
        result += PENALTY_BLOCK
    }
  }

  let dark = 0
  for (const line of modules) {
    for (const cell of line) {
      if (cell)
        dark++
    }
  }
  const total = size * size
  result += (Math.ceil(Math.abs(dark * 20 - total * 10) / total) - 1) * PENALTY_BALANCE
  return result
}

/**
 * 把文本编码成 QR 矩阵。
 *
 * 版本按内容长度自动选最小的那个。内容超出 40 版容量时抛 `RangeError`：
 * 截断能画出一张扫得开的码，但扫出来的是半截内容，比画不出来更难发现。
 */
export function qrEncode(text: string, level: QrLevel = 'M'): QrMatrix {
  const bytes = utf8Bytes(text)
  const version = pickVersion(bytes.length, level)
  const size = 4 * version + 17

  // 模式指示符 + 字符计数 + 内容字节
  const bits: number[] = []
  appendBits(bits, MODE_BYTE, 4)
  appendBits(bits, bytes.length, charCountBits(version))
  for (const byte of bytes)
    appendBits(bits, byte, 8)

  // 结束符最多 4 位，补到整字节后用 0xEC / 0x11 轮流填满数据码字
  const capacity = dataCapacityBits(version, level)
  appendBits(bits, 0, Math.min(4, capacity - bits.length))
  appendBits(bits, 0, (8 - bits.length % 8) % 8)
  let pad = 0xEC
  while (bits.length < capacity) {
    appendBits(bits, pad, 8)
    pad = pad === 0xEC ? 0x11 : 0xEC
  }

  const dataCodewords: number[] = []
  for (let i = 0; i < bits.length; i += 8) {
    let byte = 0
    for (let j = 0; j < 8; j++)
      byte = (byte << 1) | bits[i + j]!
    dataCodewords.push(byte)
  }

  const grid: Grid = {
    size,
    modules: Array.from({ length: size }, () => Array.from<boolean>({ length: size }).fill(false)),
    reserved: Array.from({ length: size }, () => Array.from<boolean>({ length: size }).fill(false)),
  }
  drawFunctionPatterns(grid, version)
  // 先按 0 号掩模写一遍格式信息，把这 31 格占住；真正的编号选定后再覆写
  drawFormat(grid, level, 0)
  if (version >= 7)
    drawVersion(grid, version)
  placeCodewords(grid, addEccAndInterleave(dataCodewords, version, level))

  let bestMask = 0
  let bestPenalty = Number.POSITIVE_INFINITY
  for (let mask = 0; mask < 8; mask++) {
    applyMask(grid, mask)
    drawFormat(grid, level, mask)
    const score = penaltyScore(grid)
    if (score < bestPenalty) {
      bestPenalty = score
      bestMask = mask
    }
    applyMask(grid, mask)
  }
  applyMask(grid, bestMask)
  drawFormat(grid, level, bestMask)

  return { version, count: size, level, mask: bestMask, modules: grid.modules }
}
