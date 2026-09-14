// bar-code 的 connect：条空序列换算成像素几何、人读文字落位、三态、命名与选项警告。
import type { DiagnosticRecord } from '@xihan-ui/core'
import type { BarCodeProps } from '../src/bar-code'
import {
  normalizeProps,
  onDiagnostic,
  resetDiagnostics,
  setDiagnosticsConsoleOutput,
  setDiagnosticsDedupe,
  setDiagnosticsLevel,
} from '@xihan-ui/core'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { barEncode, connectBarCode } from '../src/bar-code'

/** 选项被忽略时的诊断码。写成字面量，订阅方按它分流，改了就是改契约。 */
const OPTION_IGNORED = 'bar-code.option-ignored'

let diagnostics: DiagnosticRecord[] = []

beforeEach(() => {
  resetDiagnostics()
  setDiagnosticsConsoleOutput(false)
  setDiagnosticsLevel('warn')
  setDiagnosticsDedupe(false)
  diagnostics = []
  onDiagnostic(record => void diagnostics.push(record))
})

afterEach(() => {
  resetDiagnostics()
})

function ignoredWarnings(): DiagnosticRecord[] {
  return diagnostics.filter(record => record.code === OPTION_IGNORED)
}

interface Rect { x: number, y: number, w: number, h: number }

/** 把 `M x y h w v h h-w z` 一串拆回矩形。 */
function rects(path: string): Rect[] {
  const out: Rect[] = []
  const re = /M(-?[\d.]+) (-?[\d.]+)h(-?[\d.]+)v(-?[\d.]+)h-(-?[\d.]+)z/g
  let m: RegExpExecArray | null
  let consumed = 0
  // eslint-disable-next-line no-cond-assign
  while ((m = re.exec(path)) !== null) {
    consumed += m[0].length
    out.push({ x: Number(m[1]), y: Number(m[2]), w: Number(m[3]), h: Number(m[4]) })
    expect(Number(m[5])).toBe(Number(m[3]))
  }
  // 整条 d 只由这种矩形拼成，没有别的段
  expect(consumed).toBe(path.length)
  return out
}

function connect(props: BarCodeProps) {
  return connectBarCode(props, normalizeProps)
}

describe('缺省与三态', () => {
  it('缺省 code128、barWidth 2、height 64、静区 10，根上落 data-format / data-modules / data-state', () => {
    const api = connect({ value: 'XH-001' })
    expect(api.format).toBe('code128')
    expect(api.state).toBe('ready')
    expect(api.margin).toBe(10)
    const symbol = barEncode('code128', 'XH-001')
    expect(api.modules).toBe(symbol.width)
    expect(api.runs).toEqual(symbol.runs)
    expect(api.encoded).toBe('XH-001')
    const root = api.getRootProps()
    expect(root['data-format']).toBe('code128')
    expect(root['data-modules']).toBe(String(symbol.width))
    expect(root['data-state']).toBe('ready')
    expect(root['shape-rendering']).toBe('crispEdges')
  })

  it('viewBox 直接用像素：宽 = (模块 + 两侧静区) × barWidth，高 = 条高 + 10X 文字区', () => {
    const api = connect({ value: 'XH-001' })
    const w = (api.modules + 20) * 2
    const h = 64 + 20
    expect(api.pixelWidth).toBe(w)
    expect(api.pixelHeight).toBe(h)
    expect(api.viewBox).toBe(`0 0 ${w} ${h}`)
    const root = api.getRootProps()
    expect(root.viewBox).toBe(api.viewBox)
    expect(root.style).toEqual({ inlineSize: `${w}px`, blockSize: `${h}px` })
  })

  it('空串是 empty：不铺条、不铺字、viewBox 只剩静区与条高', () => {
    const api = connect({ value: '' })
    expect(api.state).toBe('empty')
    expect(api.path).toBe('')
    expect(api.text).toEqual([])
    expect(api.runs).toEqual([])
    expect(api.modules).toBe(0)
    expect(api.viewBox).toBe(`0 0 ${20 * 2} 64`)
    const root = api.getRootProps()
    expect(root['data-modules']).toBeUndefined()
    expect(root['data-state']).toBe('empty')
  })

  it('内容不合码制规则是 error：一根条都不铺，error 说清原因', () => {
    const api = connect({ format: 'ean13', value: '12345' })
    expect(api.state).toBe('error')
    expect(api.error).toContain('EAN-13')
    expect(api.error).toContain('收到 5 位')
    expect(api.path).toBe('')
    expect(api.text).toEqual([])
    expect(api.getRootProps()['data-state']).toBe('error')
  })

  it('不认识的码制：落 error 态、说明只认哪些、data-format 原样写上', () => {
    const api = connect({ format: 'code93' as never, value: '123' })
    expect(api.state).toBe('error')
    expect(api.error).toContain('code93')
    expect(api.error).toContain('code128')
    expect(api.path).toBe('')
    expect(api.getRootProps()['data-format']).toBe('code93')
    // 不认识的码制拿不到规范静区，按 code128 的 10 兜住 viewBox
    expect(api.margin).toBe(10)
  })

  it('码制不认识时先于内容判定：空内容也落 error', () => {
    expect(connect({ format: 'pdf417' as never, value: '' }).state).toBe('error')
  })
})

describe('条的几何', () => {
  it('每根条一个矩形，x 按累计宽度落位、宽按段宽，都乘 barWidth 并加上静区', () => {
    const api = connect({ format: 'code39', value: 'AB', barWidth: 3, margin: 4 })
    const bars = rects(api.path)
    const runs = api.runs
    expect(bars).toHaveLength((runs.length + 1) / 2)
    let at = 0
    let k = 0
    for (let i = 0; i < runs.length; i++) {
      if (i % 2 === 0) {
        expect(bars[k]).toEqual({ x: (4 + at) * 3, y: 0, w: runs[i]! * 3, h: 64 })
        k++
      }
      at += runs[i]!
    }
    // 最后一根条的右缘正好在静区起点
    const last = bars.at(-1)!
    expect(last.x + last.w).toBe((4 + api.modules) * 3)
  })

  it('静区一滴墨都没有：第一根条从 margin × barWidth 起，最后一根到 (margin + 模块) × barWidth 止', () => {
    for (const margin of [0, 5, 10]) {
      const api = connect({ format: 'ean8', value: '96385074', margin })
      const bars = rects(api.path)
      expect(bars[0]!.x).toBe(margin * 2)
      const last = bars.at(-1)!
      expect(last.x + last.w).toBe((margin + 67) * 2)
      expect(api.pixelWidth).toBe((margin + 67 + margin) * 2)
    }
  })

  it('eAN-13 三组守卫条长 5X，其余条按 height', () => {
    const api = connect({ format: 'ean13', value: '4006381333931', barWidth: 2, height: 50 })
    const bars = rects(api.path)
    const guardX = new Set<number>()
    for (const [start, end] of barEncode('ean13', '4006381333931').guards) {
      for (let m = start; m < end; m++) guardX.add((11 + m) * 2)
    }
    let tall = 0
    for (const bar of bars) {
      if (guardX.has(bar.x)) {
        expect(bar.h).toBe(50 + 10)
        tall++
      }
      else {
        expect(bar.h).toBe(50)
      }
    }
    // 101 + 01010 + 101 里共 2 + 2 + 2 根条
    expect(tall).toBe(6)
  })

  it('uPC-A 守卫连同首末两位数字的条一起延长', () => {
    const api = connect({ format: 'upca', value: '036000291452', height: 40 })
    const bars = rects(api.path)
    const tall = bars.filter(b => b.h === 50)
    const short = bars.filter(b => b.h === 40)
    expect(tall.length + short.length).toBe(bars.length)
    // 左守卫 2 根 + 首位 2 根 + 中央 2 根 + 末位 2 根 + 右守卫 2 根
    expect(tall).toHaveLength(10)
  })

  it('关掉 text：有守卫的码制尾部只留 5X 延长段，没有守卫的码制条底就是根底', () => {
    const ean = connect({ format: 'ean13', value: '4006381333931', text: false })
    expect(ean.text).toEqual([])
    expect(ean.pixelHeight).toBe(64 + 10)
    const c128 = connect({ value: 'no-text', text: false })
    expect(c128.text).toEqual([])
    expect(c128.pixelHeight).toBe(64)
  })

  it('itf14 缺省画承载条：上下各一根通宽的 2X 横条，数据条整体下移 2X', () => {
    const api = connect({ format: 'itf14', value: '15400141288763', barWidth: 2 })
    const bars = rects(api.path)
    expect(bars[0]).toEqual({ x: 0, y: 0, w: api.pixelWidth, h: 4 })
    expect(bars[1]).toEqual({ x: 0, y: 4 + 64, w: api.pixelWidth, h: 4 })
    for (const bar of bars.slice(2)) {
      expect(bar.y).toBe(4)
      expect(bar.h).toBe(64)
    }
    expect(bars.length - 2).toBe((api.runs.length + 1) / 2)
    // 文字落在下承载条之下
    expect(api.pixelHeight).toBe(4 + 64 + 4 + 20)
    expect(api.text[0]!.y).toBe(4 + 64 + 4 + 18)
  })

  it('itf14 关掉承载条就没有那两根横条，几何回到别的码制的样子', () => {
    const api = connect({ format: 'itf14', value: '15400141288763', bearerBars: false })
    const bars = rects(api.path)
    expect(bars).toHaveLength((api.runs.length + 1) / 2)
    expect(bars[0]!.y).toBe(0)
    expect(api.pixelHeight).toBe(64 + 20)
  })
})

describe('人读文字', () => {
  it('code128 一段居中文字，基线在条底下 9X，字号 8X', () => {
    const api = connect({ value: 'XH-001', barWidth: 3 })
    expect(api.fontSize).toBe(24)
    expect(api.text).toEqual([{ x: (10 + api.modules / 2) * 3, y: 64 + 27, anchor: 'middle', text: 'XH-001' }])
  })

  it('eAN-13 十三段：首位落在左静区里锚右，其余各在自己那格正中', () => {
    const api = connect({ format: 'ean13', value: '4006381333931', barWidth: 2 })
    expect(api.text).toHaveLength(13)
    expect(api.text[0]).toEqual({ x: (11 - 1) * 2, y: 64 + 18, anchor: 'end', text: '4' })
    expect(api.text[1]).toEqual({ x: (11 + 3 + 3.5) * 2, y: 64 + 18, anchor: 'middle', text: '0' })
    expect(api.text[12]).toEqual({ x: (11 + 50 + 35 + 3.5) * 2, y: 64 + 18, anchor: 'middle', text: '1' })
  })

  it('uPC-A 校验位落在右静区里锚左', () => {
    const api = connect({ format: 'upca', value: '036000291452', barWidth: 2 })
    expect(api.text.at(-1)).toEqual({ x: (9 + 96) * 2, y: 64 + 18, anchor: 'start', text: '2' })
  })

  it('人读文字显示的是实际编进去的内容：补上的校验位在，GS1 的 FNC1 不在', () => {
    expect(connect({ format: 'ean13', value: '400638133393' }).text.map(t => t.text).join('')).toBe('4006381333931')
    expect(connect({ value: '01\u001D10', gs1: true }).text[0]!.text).toBe('0110')
  })
})

describe('命名', () => {
  it('缺省拿 value 当名字：role=img + aria-label，不写 aria-hidden', () => {
    const root = connect({ value: 'XH-001' }).getRootProps()
    expect(root.role).toBe('img')
    expect(root['aria-label']).toBe('XH-001')
    expect(root['aria-hidden']).toBeUndefined()
  })

  it('给了 label 用 label；label 与 value 都是空白就退出无障碍树', () => {
    const named = connect({ value: '123', label: '货号' }).getRootProps()
    expect(named['aria-label']).toBe('货号')
    const blank = connect({ value: '', label: '  ' }).getRootProps()
    expect(blank.role).toBeUndefined()
    expect(blank['aria-label']).toBeUndefined()
    expect(blank['aria-hidden']).toBe(true)
  })

  it('error 态下名字照给：内容还在，读屏该报出来', () => {
    const root = connect({ format: 'ean13', value: 'abc' }).getRootProps()
    expect(root.role).toBe('img')
    expect(root['aria-label']).toBe('abc')
  })
})

describe('非法数字入参', () => {
  it('barWidth / height 不是 ≥ 1 的有限数就落回缺省；margin NaN 落回缺省，负数按 0，0 保留', () => {
    const base = connect({ value: 'x' })
    for (const bad of [0, -1, Number.NaN, Number.POSITIVE_INFINITY, undefined]) {
      const api = connect({ value: 'x', barWidth: bad, height: bad })
      expect(api.viewBox).toBe(base.viewBox)
    }
    expect(connect({ value: 'x', margin: -3 }).margin).toBe(0)
    expect(connect({ value: 'x', margin: Number.NaN }).margin).toBe(10)
    expect(connect({ value: 'x', margin: 0 }).margin).toBe(0)
    // 小数截断
    expect(connect({ value: 'x', barWidth: 2.9 }).fontSize).toBe(16)
  })
})

describe('对当前码制没有意义的选项', () => {
  it('gs1 给了 code128 以外的码制：报一条 option-ignored 警告，码照画', () => {
    const api = connect({ format: 'ean13', value: '4006381333931', gs1: true })
    expect(api.state).toBe('ready')
    const warnings = ignoredWarnings()
    expect(warnings).toHaveLength(1)
    expect(warnings[0]!.detail).toEqual({ format: 'ean13', option: 'gs1', onlyFor: 'code128' })
    expect(warnings[0]!.message).toContain('gs1')
  })

  it('checksum 给了 code39 以外、bearerBars 给了 itf14 以外都报', () => {
    connect({ format: 'ean8', value: '96385074', checksum: false })
    connect({ value: 'x', bearerBars: true })
    expect(ignoredWarnings().map(w => w.detail)).toEqual([
      { format: 'ean8', option: 'checksum', onlyFor: 'code39' },
      { format: 'code128', option: 'bearerBars', onlyFor: 'itf14' },
    ])
  })

  it('用对了地方一条都不报；gs1: false 也不算给了', () => {
    connect({ value: 'x', gs1: true })
    connect({ value: 'x', gs1: false })
    connect({ format: 'code39', value: 'X', checksum: true })
    connect({ format: 'itf14', value: '15400141288763', bearerBars: false })
    expect(ignoredWarnings()).toEqual([])
  })

  it('不认识的码制不再逐项报选项：那一条 error 已经说清了', () => {
    connect({ format: 'nope' as never, value: 'x', gs1: true, checksum: true, bearerBars: true })
    expect(ignoredWarnings()).toEqual([])
  })
})
