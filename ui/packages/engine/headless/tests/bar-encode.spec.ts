// 一维码编码器：已知向量、结构性质与非法输入。回环解码见 bar-decode-roundtrip.spec.ts。
import type { BarCodeFormat } from '../src/bar-code'
import { describe, expect, it } from 'vitest'
import { BAR_FNC1_CHAR, barEncode, gs1CheckDigit, upceExpand } from '../src/bar-code'

/** 序列从条起、于条止（奇数个元素），每一段都是正整数模块。 */
function expectWellFormed(runs: readonly number[]): void {
  expect(runs.length % 2).toBe(1)
  for (const run of runs) {
    expect(Number.isInteger(run)).toBe(true)
    expect(run).toBeGreaterThanOrEqual(1)
  }
}

describe('gs1 校验位', () => {
  // GS1 通用规范与维基百科上的示例商品码
  it.each([
    ['400638133393', 1],
    ['590123412345', 7],
    ['03600029145', 2],
    ['9638507', 4],
    ['1540014128876', 3],
    ['04210000526', 4],
  ])('%s → %i', (digits, check) => {
    expect(gs1CheckDigit(digits)).toBe(check)
  })
})

describe('eAN / UPC', () => {
  it('eAN-13 12 位补校验位，13 位核对校验位，两者序列逐字相同', () => {
    const short = barEncode('ean13', '400638133393')
    const full = barEncode('ean13', '4006381333931')
    expect(short.encoded).toBe('4006381333931')
    expect(full.runs).toEqual(short.runs)
    expect(short.width).toBe(95)
    expectWellFormed(short.runs)
    // 左守卫 101、中央 01010、右守卫 101 各自的位置
    expect(short.guards).toEqual([[0, 3], [45, 50], [92, 95]])
    expect(short.runs.slice(0, 3)).toEqual([1, 1, 1])
    expect(short.runs.slice(-3)).toEqual([1, 1, 1])
  })

  it('eAN-13 每位数字占 7 个模块、四段宽度之和恒为 7', () => {
    const { runs } = barEncode('ean13', '5901234123457')
    // 左守卫 3 段之后是 6 × 4 段，中央 5 段，再 6 × 4 段，右守卫 3 段
    expect(runs.length).toBe(3 + 24 + 5 + 24 + 3)
    for (let d = 0; d < 12; d++) {
      const at = d < 6 ? 3 + d * 4 : 3 + 24 + 5 + (d - 6) * 4
      expect(runs[at]! + runs[at + 1]! + runs[at + 2]! + runs[at + 3]!).toBe(7)
    }
  })

  it('eAN-13 首位决定左半的奇偶：首位 0 六位全 L，右半恒 R（起于空还是起于条由位置定）', () => {
    // 首位 0：左半六位全用 L 图案，L 图案的第一段是空——但序列里它紧接着守卫条，所以从空开始
    const zero = barEncode('ean13', '0123456789012')
    // 数字 1 的 L 是 2221；守卫 101 之后第 4 段起就是它
    expect(zero.runs.slice(3, 7)).toEqual([2, 2, 2, 1])
    // 首位 4（LGLLGG）：第二位用 G，即 L 倒序；数字 0 的 L 是 3211，G 是 1123
    const four = barEncode('ean13', '4006381333931')
    expect(four.runs.slice(3, 7)).toEqual([3, 2, 1, 1])
    expect(four.runs.slice(7, 11)).toEqual([1, 1, 2, 3])
  })

  it('eAN-13 人读文字：首位落在左静区，其余十二位各在自己那格的正中', () => {
    const { text } = barEncode('ean13', '4006381333931')
    expect(text).toHaveLength(13)
    expect(text[0]).toEqual({ x: -1, anchor: 'end', text: '4' })
    expect(text[1]).toEqual({ x: 3 + 3.5, anchor: 'middle', text: '0' })
    expect(text[6]).toEqual({ x: 3 + 5 * 7 + 3.5, anchor: 'middle', text: '1' })
    expect(text[7]).toEqual({ x: 50 + 3.5, anchor: 'middle', text: '3' })
    expect(text[12]).toEqual({ x: 50 + 5 * 7 + 3.5, anchor: 'middle', text: '1' })
  })

  it('uPC-A 就是首位为 0 的 EAN-13，序列相同；守卫延长到首末两位，文字挪进静区', () => {
    const upc = barEncode('upca', '03600029145')
    const ean = barEncode('ean13', '003600029145')
    expect(upc.runs).toEqual(ean.runs)
    expect(upc.encoded).toBe('036000291452')
    expect(upc.guards).toEqual([[0, 10], [45, 50], [85, 95]])
    expect(upc.text[0]).toEqual({ x: -1, anchor: 'end', text: '0' })
    expect(upc.text.at(-1)).toEqual({ x: 96, anchor: 'start', text: '2' })
    expect(upc.text).toHaveLength(12)
  })

  it('eAN-8 67 个模块，7 位补校验位', () => {
    const symbol = barEncode('ean8', '9638507')
    expect(symbol.encoded).toBe('96385074')
    expect(symbol.width).toBe(67)
    expect(symbol.guards).toEqual([[0, 3], [31, 36], [64, 67]])
    expect(symbol.text).toHaveLength(8)
    expectWellFormed(symbol.runs)
  })

  it('uPC-E 六位按末位规则展开', () => {
    expect(upceExpand('0', '425261')).toBe('04210000526')
    expect(upceExpand('0', '123450')).toBe('01200000345')
    expect(upceExpand('0', '123453')).toBe('01230000045')
    expect(upceExpand('0', '123454')).toBe('01234000005')
    expect(upceExpand('1', '123457')).toBe('11234500007')
  })

  it('uPC-E 6 / 7 / 8 位三种写法得到同一张码，校验位按展开后的 UPC-A 算', () => {
    const six = barEncode('upce', '425261')
    const seven = barEncode('upce', '0425261')
    const eight = barEncode('upce', '04252614')
    expect(six.encoded).toBe('04252614')
    expect(seven.runs).toEqual(six.runs)
    expect(eight.runs).toEqual(six.runs)
    expect(six.width).toBe(51)
    expect(six.guards).toEqual([[0, 3], [45, 51]])
    // 终止符 010101：六段各 1，且起于空
    expect(six.runs.slice(-6)).toEqual([1, 1, 1, 1, 1, 1])
    expect(six.runs.length % 2).toBe(1)
  })

  it('uPC-E 的奇偶由数字系统与校验位共同决定', () => {
    // 展开：0 12345 0000 7 → 校验 2，奇偶表 0x32 = 110010，首位用 G；1 12345 0000 7 → 校验 9，0x1A = 011010，首位用 L
    const zero = barEncode('upce', '0123457')
    const one = barEncode('upce', '1123457')
    expect(zero.encoded).toBe('01234572')
    expect(one.encoded).toBe('11234579')
    // 数字 1 的 L 是 2221，G 是 1222
    expect(zero.runs.slice(3, 7)).toEqual([1, 2, 2, 2])
    expect(one.runs.slice(3, 7)).toEqual([2, 2, 2, 1])
  })

  it.each<[BarCodeFormat, string, string]>([
    ['ean13', '40063813339', '要 12 或 13 位数字，收到 11 位'],
    ['ean13', '4006381333930', '校验位不对'],
    ['ean13', '40063813339x', '「x」不在其中'],
    ['ean8', '963850', '要 7 或 8 位'],
    ['upca', '0360002914', '要 11 或 12 位'],
    ['upce', '2123457', '数字系统位只能是 0 或 1'],
    ['upce', '04252619', '校验位不对'],
    ['upce', '12345', '要 6、7 或 8 位'],
  ])('%s 拒收 %s', (format, value, reason) => {
    expect(() => barEncode(format, value)).toThrow(reason)
  })
})

describe('code 128', () => {
  it('每个码字 11 个模块，条的总宽是偶数（Code 128 的奇偶规则），终止符 13 个模块', () => {
    const { runs, width } = barEncode('code128', 'Hello, World 123')
    expectWellFormed(runs)
    // 起始 + 数据 + 校验各 6 段，终止 7 段
    expect((runs.length - 7) % 6).toBe(0)
    const words = (runs.length - 7) / 6
    expect(width).toBe(words * 11 + 13)
    for (let w = 0; w < words; w++) {
      const seg = runs.slice(w * 6, w * 6 + 6)
      expect(seg.reduce((a, b) => a + b, 0)).toBe(11)
      expect((seg[0]! + seg[2]! + seg[4]!) % 2).toBe(0)
    }
    expect(runs.slice(-7)).toEqual([2, 3, 3, 1, 1, 1, 2])
  })

  it('纯数字 ≥ 4 位起始用 C，两位一个码字', () => {
    // 起始 C(211232) + 3 对 + 校验 + 终止
    const { runs } = barEncode('code128', '123456')
    expect(runs.slice(0, 6)).toEqual([2, 1, 1, 2, 3, 2])
    expect((runs.length - 7) / 6).toBe(1 + 3 + 1)
  })

  it('恰两位数字也走 C；三位数字走 B 逐位编', () => {
    expect((barEncode('code128', '42').runs.length - 7) / 6).toBe(1 + 1 + 1)
    const three = barEncode('code128', '423')
    expect(three.runs.slice(0, 6)).toEqual([2, 1, 1, 2, 1, 4])
    expect((three.runs.length - 7) / 6).toBe(1 + 3 + 1)
  })

  it('小写起始用 B，控制字符起始用 A', () => {
    expect(barEncode('code128', 'abc').runs.slice(0, 6)).toEqual([2, 1, 1, 2, 1, 4])
    expect(barEncode('code128', '\u0001ABC').runs.slice(0, 6)).toEqual([2, 1, 1, 4, 1, 2])
  })

  it('b 里遇到单个控制字符用 SHIFT，连续两个就 CODE A 切过去', () => {
    // 'a' + TAB + 'b'：SHIFT + TAB，不切子集 → 起始 B、a、SHIFT、TAB、b、校验、终止 = 5 个数据码字
    expect((barEncode('code128', 'a\tb').runs.length - 7) / 6).toBe(1 + 4 + 1)
    // 'a' + TAB + TAB：CODE A + TAB + TAB
    expect((barEncode('code128', 'a\t\t').runs.length - 7) / 6).toBe(1 + 4 + 1)
  })

  it('中途 ≥ 4 位数字切到 C，之后再切回来', () => {
    // 起始 B、A、B、CODE C、12、34、CODE B、x、校验、终止
    expect((barEncode('code128', 'AB1234x').runs.length - 7) / 6).toBe(1 + 7 + 1)
  })

  it('gs1：起始符后一个 FNC1，内容里的 GS 也是 FNC1；人读文字不含它们', () => {
    const plain = barEncode('code128', '0112345678901231', { gs1: false })
    const gs1 = barEncode('code128', `0112345678901231${BAR_FNC1_CHAR}10ABC`, { gs1: true })
    // FNC1 的图案是 411131
    expect(gs1.runs.slice(6, 12)).toEqual([4, 1, 1, 1, 3, 1])
    expect(gs1.runs.slice(0, 6)).toEqual(plain.runs.slice(0, 6))
    expect(gs1.encoded).toBe('011234567890123110ABC')
    expect(gs1.text[0]!.text).toBe('011234567890123110ABC')
  })

  it('非 ASCII 与不在 gs1 模式下的 GS 都拒收', () => {
    expect(() => barEncode('code128', 'héllo')).toThrow('「é」不在其中')
    expect(() => barEncode('code128', `01${BAR_FNC1_CHAR}`)).toThrow('只在 gs1 模式下')
  })
})

describe('iTF-14', () => {
  it('14 位：起始 4 窄、7 对交叉、终止宽窄窄，共 135 个模块，13 位补校验位', () => {
    const symbol = barEncode('itf14', '1540014128876')
    expect(symbol.encoded).toBe('15400141288763')
    expect(symbol.width).toBe(135)
    expect(symbol.runs.slice(0, 4)).toEqual([1, 1, 1, 1])
    expect(symbol.runs.slice(-3)).toEqual([3, 1, 1])
    expectWellFormed(symbol.runs)
    // 每对 10 段：两位各两宽三窄
    for (let pair = 0; pair < 7; pair++) {
      const seg = symbol.runs.slice(4 + pair * 10, 14 + pair * 10)
      expect(seg.filter(w => w === 3)).toHaveLength(4)
      expect(seg.filter(w => w === 1)).toHaveLength(6)
    }
    expect(symbol.text).toEqual([{ x: 67.5, anchor: 'middle', text: '15400141288763' }])
  })

  it('位数不对与校验位不对都拒收', () => {
    expect(() => barEncode('itf14', '123')).toThrow('要 13 或 14 位')
    expect(() => barEncode('itf14', '15400141288760')).toThrow('校验位不对')
  })
})

describe('code 39', () => {
  it('星号起止，每字符九段三宽，字符间一个窄空', () => {
    const { runs, width, encoded } = barEncode('code39', 'CODE39')
    expectWellFormed(runs)
    // (6 + 2) 个字符 × 9 段 + 7 个间隔
    expect(runs.length).toBe(8 * 9 + 7)
    expect(width).toBe(8 * 15 + 7)
    expect(encoded).toBe('CODE39')
    for (let c = 0; c < 8; c++) {
      const seg = runs.slice(c * 10, c * 10 + 9)
      expect(seg.filter(w => w === 3)).toHaveLength(3)
      if (c < 7)
        expect(runs[c * 10 + 9]).toBe(1)
    }
    // 起止符 nwnnwnwnn
    expect(runs.slice(0, 9)).toEqual([1, 3, 1, 1, 3, 1, 3, 1, 1])
  })

  it('checksum 附一个 mod 43 字符，且进人读文字', () => {
    // C=12 O=24 D=13 E=14 3=3 9=9 → 75 mod 43 = 32 → 'W'
    const symbol = barEncode('code39', 'CODE39', { checksum: true })
    expect(symbol.encoded).toBe('CODE39W')
    expect(symbol.runs.length).toBe(9 * 9 + 8)
  })

  it('小写与字符集外的符号拒收', () => {
    expect(() => barEncode('code39', 'code')).toThrow('「c」不在其中')
    expect(() => barEncode('code39', 'A#B')).toThrow('「#」不在其中')
  })
})
