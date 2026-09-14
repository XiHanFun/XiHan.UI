// matrix-code 走 pdf417 / aztec 时的 connect：根属性、级别的取值域、静区、码点形状与选项警告。
import type { DiagnosticRecord } from '@xihan-ui/core'
import type { MatrixCodeProps } from '../src/matrix-code'
import {
  normalizeProps,
  onDiagnostic,
  resetDiagnostics,
  setDiagnosticsConsoleOutput,
  setDiagnosticsDedupe,
  setDiagnosticsLevel,
} from '@xihan-ui/core'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { aztecEncode, connectMatrixCode, pdf417Encode } from '../src/matrix-code'

const OPTION_IGNORED = 'matrix-code.option-ignored'

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

function ignored(): string[] {
  return diagnostics.filter(r => r.code === OPTION_IGNORED).map(r => String((r.detail as { option: string }).option))
}

function connect(props: MatrixCodeProps) {
  return connectMatrixCode(props, normalizeProps)
}

describe('pdf417', () => {
  it('根上落码制、模块列行数与实际用的级别；静区缺省 2 格；宽高比按模块算', () => {
    const api = connect({ format: 'pdf417', value: 'Hello, World!' })
    const m = pdf417Encode('Hello, World!')
    expect(api.state).toBe('ready')
    expect(api.columns).toBe(m.width)
    expect(api.rows).toBe(m.rows * m.rowHeight)
    expect(api.margin).toBe(2)
    expect(api.eyePath).toBe('')
    const root = api.getRootProps()
    expect(root['data-format']).toBe('pdf417')
    expect(root['data-level']).toBe(String(m.level))
    expect(root['data-version']).toBeUndefined()
    expect(root['data-columns']).toBe(String(m.width))
    expect(root['data-rows']).toBe(String(m.rows * m.rowHeight))
    expect(root.viewBox).toBe(`0 0 ${m.width + 4} ${m.rows * 3 + 4}`)
    expect(root.style).toEqual({ inlineSize: '160px', blockSize: `${(160 * (m.rows * 3 + 4)) / (m.width + 4)}px` })
  })

  it('level 收 0–8（数字或数字串），columns 收 1–30；取值不合落 error 态', () => {
    expect(connect({ format: 'pdf417', value: 'x', level: 5 }).getRootProps()['data-level']).toBe('5')
    expect(connect({ format: 'pdf417', value: 'x', level: '7' as never }).getRootProps()['data-level']).toBe('7')
    expect(connect({ format: 'pdf417', value: 'x', columns: 4 }).columns).toBe(17 * 7 + 18)
    for (const level of ['H', 9, -1, 2.5, 'x']) {
      const api = connect({ format: 'pdf417', value: 'x', level: level as never })
      expect(api.state).toBe('error')
      expect(api.error).toContain('0–8')
      expect(api.path).toBe('')
    }
    const badColumns = connect({ format: 'pdf417', value: 'x', columns: 31 })
    expect(badColumns.state).toBe('error')
    expect(badColumns.error).toContain('1–30')
  })

  it('级别取值不合时连空内容也落 error：这是参数错，不是没内容', () => {
    expect(connect({ format: 'pdf417', value: '', level: 'H' }).state).toBe('error')
    expect(connect({ format: 'pdf417', value: '', level: 3 }).state).toBe('empty')
  })

  it('每根条是整格矩形游程，行高 3 格逐行复制', () => {
    const api = connect({ format: 'pdf417', value: 'rows', margin: 0, moduleShape: undefined })
    const rects = api.path.match(/M(\d+) (\d+)h(\d+)v1h-\d+z/g) ?? []
    expect(rects.length).toBeGreaterThan(0)
    // 前三模块行完全一样：同一码字行的三份复制
    const byRow = (y: number): string => rects.filter(r => r.split(' ')[1]!.startsWith(`${y}h`)).map(r => r.replace(/ \d+h/, ' h')).join('|')
    expect(byRow(1)).toBe(byRow(0))
    expect(byRow(2)).toBe(byRow(0))
    // 起始图形 81111113：第一根条宽 8
    expect(rects[0]).toBe('M0 0h8v1h-8z')
  })

  it('moduleShape / rectangular / gs1 对 pdf417 没有意义：各报一条，几何仍是方块', () => {
    const api = connect({ format: 'pdf417', value: 'x', moduleShape: 'dot', rectangular: true, gs1: true })
    expect(api.state).toBe('ready')
    expect(api.path).toMatch(/^(?:M\d+ \d+h\d+v1h-\d+z)+$/)
    expect(api.getRootProps()['shape-rendering']).toBe('crispEdges')
    expect(ignored()).toEqual(['rectangular', 'moduleShape', 'gs1'])
  })

  it('内容超出 929 个码字落 error 态', () => {
    const api = connect({ format: 'pdf417', value: 'x'.repeat(1200), level: 0 })
    expect(api.state).toBe('error')
    expect(api.error).toContain('929')
  })
})

describe('aztec', () => {
  it('根上落码制与边长；不需要静区；没有 level 与 version', () => {
    const api = connect({ format: 'aztec', value: 'Hello, World!' })
    const m = aztecEncode('Hello, World!')
    expect(api.state).toBe('ready')
    expect(api.columns).toBe(m.size)
    expect(api.rows).toBe(m.size)
    expect(api.margin).toBe(0)
    expect(api.eyePath).toBe('')
    const root = api.getRootProps()
    expect(root['data-format']).toBe('aztec')
    expect(root['data-level']).toBeUndefined()
    expect(root['data-version']).toBeUndefined()
    expect(root.viewBox).toBe(`0 0 ${m.size} ${m.size}`)
    expect(root.style).toEqual({ inlineSize: '160px', blockSize: '160px' })
  })

  it('level 是纠错百分比 5–95：越高越大；取值不合落 error 态', () => {
    const text = 'Percent test 12345 with lower case tail'
    const low = connect({ format: 'aztec', value: text, level: 5 })
    const high = connect({ format: 'aztec', value: text, level: 90 })
    expect(high.columns).toBeGreaterThan(low.columns)
    expect(connect({ format: 'aztec', value: 'x', level: '50' as never }).state).toBe('ready')
    for (const level of ['H', 4, 96, 'x']) {
      const api = connect({ format: 'aztec', value: 'x', level: level as never })
      expect(api.state).toBe('error')
      expect(api.error).toContain('5–95')
    }
  })

  it('码点形状连牛眼一起换：dot 下每个深色模块一段圆', () => {
    const dot = connect({ format: 'aztec', value: 'dots', moduleShape: 'dot' })
    const circles = dot.path.match(/a0\.5 0\.5 0 1 0 1 0a0\.5 0\.5 0 1 0 -1 0z/g) ?? []
    const dark = aztecEncode('dots').modules.flat().filter(Boolean).length
    expect(circles).toHaveLength(dark)
    expect(ignored()).toEqual([])
  })

  it('columns / rectangular / gs1 / eyeShape / logo 对 aztec 没有意义：各报一条', () => {
    const api = connect({ format: 'aztec', value: 'x', columns: 3, rectangular: true, gs1: true, eyeShape: 'rounded', logo: true })
    expect(api.state).toBe('ready')
    expect(api.logoArea).toBeUndefined()
    expect(ignored()).toEqual(['eyeShape', 'logo', 'rectangular', 'columns', 'gs1'])
  })

  it('qr 给了 columns 报一条；qr 的 level 给了别的码制的值落 error', () => {
    connect({ format: 'qr', value: 'x', columns: 3 })
    expect(ignored()).toEqual(['columns'])
    const api = connect({ format: 'qr', value: 'x', level: 5 })
    expect(api.state).toBe('error')
    expect(api.error).toContain('L / M / Q / H')
  })
})
