// 独立解码器对 Data Matrix 编码器做回环验证。
//
// 这个文件只用编码器的公开导出 dmEncode / DM_SYMBOLS 拿到矩阵与尺寸表，其余按 ISO/IEC 16022 自己重写一遍：
// 定位图形逐格核对、数据区剥离、码字放置按位置表反查、纠错用校验子核（GF(256) 另建对数表）、
// ASCII 模式与 253 态填充逐码字还原。与编码器同源的实现只会一起错，所以这里刻意不共用任何一行。
import { describe, expect, it } from 'vitest'
import { DM_SYMBOLS, dmEncode } from '../src/matrix-code'

const GS = '\u001D'

type Matrix = readonly (readonly boolean[])[]

// ── 定位图形 ──

interface Layout {
  rows: number
  cols: number
  regionH: number
  regionW: number
  across: number
  down: number
}

/** 从尺寸表按行列数反查布局；表里没有的尺寸不是合法的 Data Matrix。 */
function layoutOf(modules: Matrix): Layout {
  const rows = modules.length
  const cols = modules[0]!.length
  const hit = DM_SYMBOLS.find(s => s.rows === rows && s.columns === cols)
  if (!hit)
    throw new Error(`${rows}×${cols} 不是任何一档尺寸`)
  return {
    rows,
    cols,
    regionH: hit.regionRows + 2,
    regionW: hit.regionColumns + 2,
    across: hit.regionsAcross,
    down: hit.regionsDown,
  }
}

/** 每个数据区：左列与底行全深，顶行从深起交替，右列从浅起交替。 */
function checkFinders(modules: Matrix, layout: Layout): void {
  const { rows, cols, regionH, regionW } = layout
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const ly = y % regionH
      const lx = x % regionW
      const dark = modules[y]![x]!
      if (lx === 0 || ly === regionH - 1) {
        if (!dark)
          throw new Error(`(${y},${x}) 在 L 形定位图形上却是浅的`)
      }
      else if (ly === 0) {
        if (dark !== (x % 2 === 0))
          throw new Error(`(${y},${x}) 顶行时钟边相位不对`)
      }
      else if (lx === regionW - 1) {
        if (dark !== (y % 2 === 1))
          throw new Error(`(${y},${x}) 右列时钟边相位不对`)
      }
    }
  }
}

/** 剥掉定位图形，拼成数据映射矩阵。 */
function dataMap(modules: Matrix, layout: Layout): boolean[][] {
  const { regionH, regionW, across, down } = layout
  const out: boolean[][] = []
  for (let ry = 0; ry < down; ry++) {
    for (let ly = 1; ly < regionH - 1; ly++) {
      const line: boolean[] = []
      for (let rx = 0; rx < across; rx++) {
        for (let lx = 1; lx < regionW - 1; lx++)
          line.push(modules[ry * regionH + ly]![rx * regionW + lx]!)
      }
      out.push(line)
    }
  }
  return out
}

// ── 放置的反查：先按规范 Figure F.1 生成"第几个码字的第几位落在哪一格"的位置表 ──

type Slot = readonly [row: number, col: number]

function placementTable(rows: number, cols: number): Slot[][] {
  const table: Slot[][] = []
  const taken = new Set<string>()
  const wrap = (row: number, col: number): Slot => {
    if (row < 0) {
      row += rows
      col += 4 - ((rows + 4) % 8)
    }
    if (col < 0) {
      col += cols
      row += 4 - ((cols + 4) % 8)
    }
    // 矩形扩展：列绕回去之后行可能越到底下，再绕一次（ISO/IEC 21471 Annex E）
    if (row >= rows)
      row -= rows
    return [row, col]
  }
  const put = (slots: readonly Slot[]): void => {
    const wrapped = slots.map(([r, c]) => wrap(r, c))
    for (const [r, c] of wrapped) taken.add(`${r},${c}`)
    table.push(wrapped)
  }
  const utah = (r: number, c: number): void => put([[r - 2, c - 2], [r - 2, c - 1], [r - 1, c - 2], [r - 1, c - 1], [r - 1, c], [r, c - 2], [r, c - 1], [r, c]])
  const has = (r: number, c: number): boolean => taken.has(`${r},${c}`)

  let row = 4
  let col = 0
  do {
    if (row === rows && col === 0)
      put([[rows - 1, 0], [rows - 1, 1], [rows - 1, 2], [0, cols - 2], [0, cols - 1], [1, cols - 1], [2, cols - 1], [3, cols - 1]])
    if (row === rows - 2 && col === 0 && cols % 4 !== 0)
      put([[rows - 3, 0], [rows - 2, 0], [rows - 1, 0], [0, cols - 4], [0, cols - 3], [0, cols - 2], [0, cols - 1], [1, cols - 1]])
    if (row === rows - 2 && col === 0 && cols % 8 === 4)
      put([[rows - 3, 0], [rows - 2, 0], [rows - 1, 0], [0, cols - 2], [0, cols - 1], [1, cols - 1], [2, cols - 1], [3, cols - 1]])
    if (row === rows + 4 && col === 2 && cols % 8 === 0)
      put([[rows - 1, 0], [rows - 1, cols - 1], [0, cols - 3], [0, cols - 2], [0, cols - 1], [1, cols - 3], [1, cols - 2], [1, cols - 1]])
    do {
      if (row < rows && col >= 0 && !has(row, col))
        utah(row, col)
      row -= 2
      col += 2
    } while (row >= 0 && col < cols)
    row += 1
    col += 3
    do {
      if (row >= 0 && col < cols && !has(row, col))
        utah(row, col)
      row += 2
      col -= 2
    } while (row < rows && col >= 0)
    row += 3
    col += 1
  } while (row < rows || col < cols)
  return table
}

/** 按位置表把数据映射矩阵读回码字序列；右下角那 2×2 固定图形若存在须是深-浅-浅-深。 */
function readCodewords(map: readonly (readonly boolean[])[]): number[] {
  const rows = map.length
  const cols = map[0]!.length
  const table = placementTable(rows, cols)
  const used = new Set<string>()
  const words = table.map((slots) => {
    let v = 0
    for (const [r, c] of slots) {
      used.add(`${r},${c}`)
      v = (v << 1) | (map[r]![c] ? 1 : 0)
    }
    return v
  })
  if (!used.has(`${rows - 1},${cols - 1}`)) {
    if (!map[rows - 1]![cols - 1] || !map[rows - 2]![cols - 2] || map[rows - 1]![cols - 2] || map[rows - 2]![cols - 1])
      throw new Error('右下角的 2×2 固定图形不对')
    used.add(`${rows - 1},${cols - 1}`).add(`${rows - 2},${cols - 2}`).add(`${rows - 1},${cols - 2}`).add(`${rows - 2},${cols - 1}`)
  }
  if (used.size !== rows * cols)
    throw new Error(`位置表只覆盖了 ${used.size} / ${rows * cols} 格`)
  return words
}

// ── GF(256)，本原多项式 0x12D，另建一套表 ──

const EXP = new Uint8Array(255)
const LOG = new Uint8Array(256)
{
  let v = 1
  for (let i = 0; i < 255; i++) {
    EXP[i] = v
    LOG[v] = i
    v <<= 1
    if (v & 0x100)
      v ^= 0x12D
  }
}
function mul(a: number, b: number): number {
  return a === 0 || b === 0 ? 0 : EXP[(LOG[a]! + LOG[b]!) % 255]!
}
/** 多项式 c（高次在前）在 α^i 处的值。 */
function evalAt(c: readonly number[], power: number): number {
  const x = EXP[power % 255]!
  let acc = 0
  for (const coef of c) acc = mul(acc, x) ^ coef
  return acc
}

/**
 * 每块的校验子 S₁…S_n 全为 0 才是合法码字。
 * 数据码字按下标 ≡ b (mod blocks) 归块；纠错码字紧跟在全部数据之后、同样按步长交错
 * （144×144 的数据数 1558 不是 10 的倍数，纠错段的下标相位与数据段不同，所以两段分开取）。
 */
function checkEcc(words: readonly number[], dataCount: number, eccPerBlock: number, blocks: number): void {
  for (let b = 0; b < blocks; b++) {
    const block: number[] = []
    for (let i = b; i < dataCount; i += blocks) block.push(words[i]!)
    for (let e = 0; e < eccPerBlock; e++) block.push(words[dataCount + b + e * blocks]!)
    const expectLen = Math.ceil((dataCount - b) / blocks) + eccPerBlock
    if (block.length !== expectLen)
      throw new Error(`第 ${b} 块长 ${block.length}，应为 ${expectLen}`)
    for (let i = 1; i <= eccPerBlock; i++) {
      if (evalAt(block, i) !== 0)
        throw new Error(`第 ${b} 块校验子 S${i} 不为 0`)
    }
  }
}

// ── ASCII 模式还原 ──

interface Decoded { text: string, gs1: boolean, eci: number | undefined }

function decodeAscii(data: readonly number[]): Decoded {
  let bytes: number[] = []
  let gs1 = false
  let eci: number | undefined
  let upper = false
  let i = 0
  while (i < data.length) {
    const w = data[i]!
    i++
    if (w === 129) {
      // 填充：之后全是 253 态随机化的值
      for (let k = i; k < data.length; k++) {
        const pseudo = ((149 * (k + 1)) % 253) + 1
        let v = 129 + pseudo
        if (v > 254)
          v -= 254
        if (data[k] !== v)
          throw new Error(`第 ${k} 个填充码字应为 ${v}，实际 ${data[k]}`)
      }
      break
    }
    if (w === 232) {
      if (bytes.length === 0 && !gs1 && eci === undefined)
        gs1 = true
      else bytes.push(0x1D)
      continue
    }
    if (w === 235) {
      upper = true
      continue
    }
    if (w === 241) {
      const v = data[i]!
      i++
      if (v > 127)
        throw new Error('只认单字节 ECI')
      eci = v - 1
      continue
    }
    if (w >= 130 && w <= 229) {
      const n = w - 130
      bytes.push(48 + Math.floor(n / 10), 48 + (n % 10))
      continue
    }
    if (w >= 1 && w <= 128) {
      bytes.push(w - 1 + (upper ? 128 : 0))
      upper = false
      continue
    }
    throw new Error(`不认识的码字 ${w}`)
  }
  const text = eci === 26
    ? new TextDecoder('utf-8').decode(Uint8Array.from(bytes))
    : bytes.map(b => String.fromCharCode(b)).join('')
  bytes = []
  return { text, gs1, eci }
}

function roundtrip(text: string, options: { gs1?: boolean, rectangular?: boolean } = {}): Decoded & { rows: number, cols: number } {
  const { modules, symbol } = dmEncode(text, options)
  const layout = layoutOf(modules)
  checkFinders(modules, layout)
  const words = readCodewords(dataMap(modules, layout))
  expect(words.length).toBe(symbol.dataCodewords + symbol.eccCodewords)
  checkEcc(words, symbol.dataCodewords, symbol.eccCodewords / symbol.blocks, symbol.blocks)
  const decoded = decodeAscii(words.slice(0, symbol.dataCodewords))
  return { ...decoded, rows: layout.rows, cols: layout.cols }
}

describe('data Matrix 回环', () => {
  it.each([
    'A',
    'Hello',
    'Hello, World! 2026',
    '1234567890',
    '12345',
    'Ünïcödé ÿ',
    ' ',
    '~',
    'The quick brown fox jumps over the lazy dog',
  ])('%j', (text) => {
    const out = roundtrip(text)
    expect(out.text).toBe(text)
    expect(out.gs1).toBe(false)
    expect(out.eci).toBeUndefined()
  })

  it('latin-1 以外的字符整段按 UTF-8 并声明 ECI 26', () => {
    const out = roundtrip('中文 → UTF-8')
    expect(out.eci).toBe(26)
    expect(out.text).toBe('中文 → UTF-8')
  })

  it('gs1：最前面是 FNC1，内容里的 GS 也编成 FNC1，还原回 GS', () => {
    const value = `0109501101530003${GS}10ABC123${GS}21SN001`
    const out = roundtrip(value, { gs1: true })
    expect(out.gs1).toBe(true)
    expect(out.text).toBe(value)
  })

  it('不开 gs1 时 GS 只是个普通字节', () => {
    const value = `01${GS}10`
    const out = roundtrip(value)
    expect(out.gs1).toBe(false)
    expect(out.text).toBe(value)
  })

  it('矩形：从矩形尺寸（含 DMRE）里挑最小的', () => {
    // 9 个码字：8×18 装 5 个不够，8×32 装 10 个
    expect(roundtrip('rectangle', { rectangular: true })).toMatchObject({ text: 'rectangle', rows: 8, cols: 32 })
    const long = 'z'.repeat(117)
    expect(roundtrip(long, { rectangular: true })).toMatchObject({ text: long, rows: 26, cols: 64 })
  })

  it('全部 48 档尺寸各编一张刚好填满的码都回得来，含多块交错的 52×52 以上与 144×144 的 8+2 分块', () => {
    for (const s of DM_SYMBOLS) {
      const text = 'x'.repeat(s.dataCodewords - 1)
      const out = roundtrip(text, { rectangular: s.rectangular })
      expect(out.text).toBe(text)
      // 挑的是按码字容量最小的一档：容量不大于这一档（容量相同的两档之间不分先后）
      const picked = DM_SYMBOLS.find(c => c.rows === out.rows && c.columns === out.cols)!
      expect(picked.dataCodewords).toBeLessThanOrEqual(s.dataCodewords)
      expect(picked.dataCodewords).toBeGreaterThanOrEqual(text.length)
    }
  })

  it('数字两两压缩：10 位数字只占 5 个码字，落在 12×12（5 个码字）而不是更大', () => {
    expect(roundtrip('1234567890')).toMatchObject({ rows: 12, cols: 12 })
    // 11 位就压不整：5 对 + 1 个单字符 = 6 个码字，落到 14×14
    expect(roundtrip('12345678901')).toMatchObject({ rows: 14, cols: 14 })
  })

  it('内容装不下就抛 RangeError，信息说清上限', () => {
    expect(() => dmEncode('q'.repeat(1560))).toThrow(RangeError)
    expect(() => dmEncode('q'.repeat(1560))).toThrow('1558')
    expect(() => dmEncode('q'.repeat(120), { rectangular: true })).toThrow('118')
  })

  it('改动任何一个数据格都过不了校验子', () => {
    const { modules, symbol } = dmEncode('tamper', {})
    const layout = layoutOf(modules)
    const map = dataMap(modules, layout)
    let caught = 0
    let tries = 0
    for (let r = 0; r < map.length; r += 3) {
      for (let c = 0; c < map[0]!.length; c += 3) {
        const bad = map.map(line => line.slice())
        bad[r]![c] = !bad[r]![c]
        tries++
        try {
          checkEcc(readCodewords(bad), symbol.dataCodewords, symbol.eccCodewords / symbol.blocks, symbol.blocks)
        }
        catch {
          caught++
        }
      }
    }
    expect(tries).toBeGreaterThan(5)
    expect(caught).toBe(tries)
  })
})
