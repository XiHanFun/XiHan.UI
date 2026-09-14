// matrix-code 走 data-matrix 时的 connect：根属性、几何、矩形比例、码点形状与选项警告。
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
import { connectMatrixCode, dmEncode } from '../src/matrix-code'

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

/** 把一串 `M x y h w v1 h-w z` 拆回 (x, y, w)。 */
function runs(path: string): { x: number, y: number, w: number }[] {
  const out: { x: number, y: number, w: number }[] = []
  const re = /M(\d+) (\d+)h(\d+)v1h-\d+z/g
  let m: RegExpExecArray | null
  // eslint-disable-next-line no-cond-assign
  while ((m = re.exec(path)) !== null)
    out.push({ x: Number(m[1]), y: Number(m[2]), w: Number(m[3]) })
  return out
}

describe('data-matrix 的根与几何', () => {
  it('根上落码制与行列数，没有 QR 才有的 level 与 version；缺省静区 1 格', () => {
    const api = connect({ format: 'data-matrix', value: 'Hello' })
    expect(api.state).toBe('ready')
    expect(api.format).toBe('data-matrix')
    expect(api.version).toBe(0)
    expect({ columns: api.columns, rows: api.rows, margin: api.margin }).toEqual({ columns: 12, rows: 12, margin: 1 })
    const root = api.getRootProps()
    expect(root['data-format']).toBe('data-matrix')
    expect(root['data-columns']).toBe('12')
    expect(root['data-rows']).toBe('12')
    expect(root['data-level']).toBeUndefined()
    expect(root['data-version']).toBeUndefined()
    expect(root.viewBox).toBe('0 0 14 14')
    expect(root.style).toEqual({ inlineSize: '160px', blockSize: '160px' })
  })

  it('没有码眼：eyePath 恒空，全部深色模块都在 path 里，逐格与编码器矩阵对得上', () => {
    const api = connect({ format: 'data-matrix', value: 'Hello, World!', margin: 2 })
    expect(api.eyePath).toBe('')
    const { modules } = dmEncode('Hello, World!')
    const painted = new Set<string>()
    for (const { x, y, w } of runs(api.path)) {
      for (let k = 0; k < w; k++) painted.add(`${y - 2},${x - 2 + k}`)
    }
    let dark = 0
    for (let r = 0; r < modules.length; r++) {
      for (let c = 0; c < modules[r]!.length; c++) {
        if (modules[r]![c]) {
          dark++
          expect(painted.has(`${r},${c}`)).toBe(true)
        }
      }
    }
    expect(painted.size).toBe(dark)
  })

  it('矩形：宽是 pixelSize，高按含静区的模块比例', () => {
    const api = connect({ format: 'data-matrix', value: 'rectangle', rectangular: true, pixelSize: 200 })
    expect({ columns: api.columns, rows: api.rows }).toEqual({ columns: 32, rows: 8 })
    expect(api.viewBox).toBe('0 0 34 10')
    const root = api.getRootProps()
    expect(root['data-columns']).toBe('32')
    expect(root['data-rows']).toBe('8')
    expect(root.style).toEqual({ inlineSize: '200px', blockSize: `${(200 * 10) / 34}px` })
  })

  it('码点形状连定位图形一起换：dot 下每个深色模块一段圆，没有整格矩形游程', () => {
    const square = connect({ format: 'data-matrix', value: 'dots' })
    const dot = connect({ format: 'data-matrix', value: 'dots', moduleShape: 'dot' })
    expect(runs(square.path).length).toBeGreaterThan(0)
    expect(runs(dot.path)).toEqual([])
    const circles = dot.path.match(/a0\.5 0\.5 0 1 0 1 0a0\.5 0\.5 0 1 0 -1 0z/g) ?? []
    const { modules } = dmEncode('dots')
    const dark = modules.flat().filter(Boolean).length
    expect(circles).toHaveLength(dark)
    expect(dot.getRootProps()['shape-rendering']).toBe('geometricPrecision')
  })

  it('gs1 换一张码；内容装不下落 error 态且说明上限', () => {
    const plain = connect({ format: 'data-matrix', value: '0112345678901231' })
    const gs1 = connect({ format: 'data-matrix', value: '0112345678901231', gs1: true })
    expect(gs1.path).not.toBe(plain.path)
    const tooLong = connect({ format: 'data-matrix', value: 'x'.repeat(1600) })
    expect(tooLong.state).toBe('error')
    expect(tooLong.error).toContain('1558')
    expect(tooLong.path).toBe('')
    expect(tooLong.getRootProps()['data-columns']).toBeUndefined()
  })
})

describe('对当前码制没有意义的选项', () => {
  it('data-matrix 给了 level / eyeShape / logo：各报一条警告，码照画且不留 logo 位', () => {
    const api = connect({ format: 'data-matrix', value: 'x', level: 'H', eyeShape: 'rounded', logo: true })
    expect(api.state).toBe('ready')
    expect(api.logoArea).toBeUndefined()
    expect(api.logoDamage).toBeUndefined()
    expect(api.getRootProps()['data-logo']).toBeUndefined()
    expect(ignored()).toEqual(['level', 'eyeShape', 'logo'])
  })

  it('qr 给了 rectangular 报一条；用对了地方一条都不报', () => {
    connect({ format: 'qr', value: 'x', rectangular: true })
    expect(ignored()).toEqual(['rectangular'])
    diagnostics = []
    connect({ format: 'qr', value: 'x', level: 'H', eyeShape: 'rounded', gs1: true })
    connect({ format: 'data-matrix', value: 'x', rectangular: false, gs1: true, moduleShape: 'rounded' })
    expect(ignored()).toEqual([])
  })

  it('不认识的码制不再逐项报选项：那一条 error 已经说清了', () => {
    connect({ format: 'pdf417' as never, value: 'x', level: 'H', rectangular: true })
    expect(ignored()).toEqual([])
  })
})
