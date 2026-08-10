// 把渲染出来的几何读回网格，再与 qrEncode 的矩阵逐格对账。
//
// 这里不看 d 是怎么写的，只看墨最后落在哪儿：自带一个 SVG 路径求值器——记号解析、
// 圆弧展成折线、按非零填充规则算绕数——然后照读码器的取样规则，在每个模块的几何中心
// 问一句「这一点有没有墨」。回环解码那份验的是矩阵本身，这份验的是矩阵被画成了什么样。
import type { DiagnosticRecord } from '@xihan-ui/core'
import type { QrCodeLogoArea, QrCodeProps, QrEyeShape, QrLevel, QrModuleShape } from '../src/qr-code'
import {
  DIAGNOSTIC_CODES,
  normalizeProps,
  onDiagnostic,
  resetDiagnostics,
  setDiagnosticsConsoleOutput,
  setDiagnosticsDedupe,
  setDiagnosticsLevel,
} from '@xihan-ui/core'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { connectQrCode, qrAlignmentPositions, qrCapacityBytes, qrEncode } from '../src/qr-code'

/** logo 损伤警告的诊断码。写成字面量，订阅方按它分流，改了就是改契约。 */
const LOGO_DAMAGE_CODE = 'qr-code.logo-damage'

/** 本轮收到的诊断记录；连 logo 的用例会往通道里报，逐条收下来自己看。 */
let diagnostics: DiagnosticRecord[] = []

beforeEach(() => {
  resetDiagnostics()
  setDiagnosticsConsoleOutput(false)
  setDiagnosticsLevel('warn')
  // 这份判据一次跑很多组同码同文案的记录，去重会把后面的吃掉
  setDiagnosticsDedupe(false)
  diagnostics = []
  onDiagnostic(record => void diagnostics.push(record))
})

afterEach(() => {
  resetDiagnostics()
})

/** 本轮报出的 logo 损伤警告。 */
function damageWarnings(): DiagnosticRecord[] {
  return diagnostics.filter(record => record.code === LOGO_DAMAGE_CODE)
}

// ── SVG 路径求值器 ──

type Point = readonly [number, number]
/** 一条闭合子路径，圆弧已展成折线。 */
type SubPath = Point[]

const TOKEN = /([MLHVAZ])|(-?(?:\d*\.\d+|\d+\.?)(?:e[-+]?\d+)?)/gi

/** 圆弧展开的角步长；半径最大 3.5 时折线与真弧的偏差在 1e-3 以内。 */
const ARC_STEP = Math.PI / 24

/**
 * 端点式圆弧转中心式，再按角步长取点。
 * 末点直接取给定端点，不用三角函数算出来的近似值，闭合处不留浮点缝。
 */
function arcPoints(
  x0: number,
  y0: number,
  rxIn: number,
  ryIn: number,
  rotation: number,
  largeArc: boolean,
  sweep: boolean,
  x1: number,
  y1: number,
): Point[] {
  const phi = (rotation * Math.PI) / 180
  const cosPhi = Math.cos(phi)
  const sinPhi = Math.sin(phi)
  let rx = Math.abs(rxIn)
  let ry = Math.abs(ryIn)
  if (rx === 0 || ry === 0)
    return [[x1, y1]]

  const dx = (x0 - x1) / 2
  const dy = (y0 - y1) / 2
  const xp = cosPhi * dx + sinPhi * dy
  const yp = -sinPhi * dx + cosPhi * dy
  const lambda = (xp * xp) / (rx * rx) + (yp * yp) / (ry * ry)
  if (lambda > 1) {
    const scale = Math.sqrt(lambda)
    rx *= scale
    ry *= scale
  }

  const numerator = rx * rx * ry * ry - rx * rx * yp * yp - ry * ry * xp * xp
  const denominator = rx * rx * yp * yp + ry * ry * xp * xp
  const factor = (largeArc === sweep ? -1 : 1) * Math.sqrt(Math.max(0, numerator / denominator))
  const cxp = (factor * rx * yp) / ry
  const cyp = (-factor * ry * xp) / rx
  const cx = cosPhi * cxp - sinPhi * cyp + (x0 + x1) / 2
  const cy = sinPhi * cxp + cosPhi * cyp + (y0 + y1) / 2

  const theta = Math.atan2((yp - cyp) / ry, (xp - cxp) / rx)
  let delta = Math.atan2((-yp - cyp) / ry, (-xp - cxp) / rx) - theta
  if (!sweep && delta > 0)
    delta -= 2 * Math.PI
  if (sweep && delta < 0)
    delta += 2 * Math.PI

  const steps = Math.max(4, Math.ceil(Math.abs(delta) / ARC_STEP))
  const out: Point[] = []
  for (let i = 1; i <= steps; i++) {
    const angle = theta + (delta * i) / steps
    out.push([
      cx + rx * Math.cos(angle) * cosPhi - ry * Math.sin(angle) * sinPhi,
      cy + rx * Math.cos(angle) * sinPhi + ry * Math.sin(angle) * cosPhi,
    ])
  }
  out[out.length - 1] = [x1, y1]
  return out
}

/** 解析一条 d，得到若干条闭合子路径。只认这些几何用到的命令。 */
function parsePath(d: string): SubPath[] {
  const tokens = [...d.matchAll(TOKEN)].map(m => (m[1] === undefined ? { value: Number(m[2]) } : { command: m[1] }))
  const subs: SubPath[] = []
  let sub: Point[] = []
  let x = 0
  let y = 0
  let startX = 0
  let startY = 0
  let at = 0
  let command = ''

  const value = (): number => {
    const token = tokens[at++]
    if (token?.value === undefined)
      throw new Error(`路径缺少参数：第 ${at} 个记号`)
    return token.value
  }
  const flush = (): void => {
    if (sub.length > 1)
      subs.push(sub)
    sub = []
  }

  while (at < tokens.length) {
    const head = tokens[at]
    if (head?.command !== undefined) {
      command = head.command
      at++
    }
    switch (command) {
      case 'M':
      case 'm': {
        const nx = value()
        const ny = value()
        flush()
        x = command === 'M' ? nx : x + nx
        y = command === 'M' ? ny : y + ny
        startX = x
        startY = y
        sub = [[x, y]]
        // 隐式续写：M 之后重复的坐标对按 L 处理
        command = command === 'M' ? 'L' : 'l'
        break
      }
      case 'L':
      case 'l': {
        const nx = value()
        const ny = value()
        x = command === 'L' ? nx : x + nx
        y = command === 'L' ? ny : y + ny
        sub.push([x, y])
        break
      }
      case 'H':
      case 'h': {
        const nx = value()
        x = command === 'H' ? nx : x + nx
        sub.push([x, y])
        break
      }
      case 'V':
      case 'v': {
        const ny = value()
        y = command === 'V' ? ny : y + ny
        sub.push([x, y])
        break
      }
      case 'A':
      case 'a': {
        const rx = value()
        const ry = value()
        const rotation = value()
        const largeArc = value()
        const sweep = value()
        const dx = value()
        const dy = value()
        const nx = command === 'A' ? dx : x + dx
        const ny = command === 'A' ? dy : y + dy
        for (const point of arcPoints(x, y, rx, ry, rotation, largeArc !== 0, sweep !== 0, nx, ny))
          sub.push(point)
        x = nx
        y = ny
        break
      }
      case 'Z':
      case 'z': {
        flush()
        x = startX
        y = startY
        command = ''
        break
      }
      default:
        throw new Error(`路径命令 ${command || '缺失'} 不认识`)
    }
  }
  flush()
  return subs
}

interface Crossing {
  x: number
  /** 向下穿过取样行记 +1，向上记 −1。 */
  direction: number
}

interface Edge {
  x0: number
  y0: number
  x1: number
  y1: number
}

/**
 * 一条 path 的求值体：子路径，外加按整行分桶的非水平边。
 * 分桶是因为满码有上百万条边，逐行重扫一遍会把这份判据拖成分钟级。
 */
interface Layer {
  subs: SubPath[]
  rows: Map<number, Edge[]>
}

function makeLayer(subs: SubPath[]): Layer {
  const rows = new Map<number, Edge[]>()
  for (const sub of subs) {
    for (let i = 0; i < sub.length; i++) {
      const [x0, y0] = sub[i]!
      const [x1, y1] = sub[(i + 1) % sub.length]!
      // 水平边穿不过取样线，不入桶
      if (y0 === y1)
        continue
      const edge: Edge = { x0, y0, x1, y1 }
      for (let row = Math.floor(Math.min(y0, y1)); row <= Math.floor(Math.max(y0, y1)); row++) {
        const bucket = rows.get(row)
        if (bucket)
          bucket.push(edge)
        else rows.set(row, [edge])
      }
    }
  }
  return { subs, rows }
}

/** 一条水平取样线与该行桶里各边的交点。 */
function rowCrossings(layer: Layer, y: number): Crossing[] {
  const out: Crossing[] = []
  for (const { x0, y0, x1, y1 } of layer.rows.get(Math.floor(y)) ?? []) {
    // 半开区间 [y0, y1)：顶点落在取样线上时只算一次
    if (y0 <= y && y1 > y)
      out.push({ x: x0 + ((y - y0) / (y1 - y0)) * (x1 - x0), direction: 1 })
    else if (y1 <= y && y0 > y)
      out.push({ x: x0 + ((y - y0) / (y1 - y0)) * (x1 - x0), direction: -1 })
  }
  out.sort((a, b) => a.x - b.x)
  return out
}

/** 取样线上一排横坐标（升序）各自的绕数；绕数非零即有墨。 */
function rowWindings(layer: Layer, y: number, xs: readonly number[]): number[] {
  const crossings = rowCrossings(layer, y)
  const suffix = Array.from<number>({ length: crossings.length + 1 }).fill(0)
  for (let i = crossings.length - 1; i >= 0; i--)
    suffix[i] = suffix[i + 1]! + crossings[i]!.direction
  const out: number[] = []
  let cursor = 0
  for (const x of xs) {
    while (cursor < crossings.length && crossings[cursor]!.x <= x)
      cursor++
    out.push(suffix[cursor]!)
  }
  return out
}

// ── 从几何读回墨 ──

interface Painted {
  /** 模块与码眼两条 path 各自成一层；两层分别按非零规则求值，不能合起来算绕数。 */
  layers: Layer[]
  /** 盖在两条 path 之上的挖空矩形。 */
  clear: QrCodeLogoArea | undefined
}

/**
 * 一批取样点上有没有墨。挖空矩形排在两条 path 之后画，落在它里面的点一律判为没墨。
 */
function inkGrid(painted: Painted, xs: readonly number[], ys: readonly number[]): boolean[][] {
  const { clear } = painted
  return ys.map((y) => {
    const windings = painted.layers.map(layer => rowWindings(layer, y, xs))
    return xs.map((x, i) => {
      if (!windings.some(row => row[i] !== 0))
        return false
      if (clear && x > clear.x && x < clear.x + clear.size && y > clear.y && y < clear.y + clear.size)
        return false
      return true
    })
  })
}

function paintedOf(pathD: string, eyeD: string, clear: QrCodeLogoArea | undefined): Painted {
  return { layers: [makeLayer(parsePath(pathD)), makeLayer(parsePath(eyeD))], clear }
}

interface Readback {
  api: ReturnType<typeof connectQrCode>
  matrix: readonly (readonly boolean[])[]
  painted: Painted
  /** 每个模块中心是否有墨，[行][列]。 */
  ink: boolean[][]
}

function readback(props: QrCodeProps): Readback {
  const api = connectQrCode(props, normalizeProps)
  const { count, margin } = api
  const centers = Array.from({ length: count }, (_, i) => i + margin + 0.5)
  const painted = paintedOf(api.path, api.eyePath, api.logoArea)
  return {
    api,
    matrix: qrEncode(props.value ?? '', props.level).modules,
    painted,
    ink: inkGrid(painted, centers, centers),
  }
}

// ── 取样点到墨边的余量 ──

/** 按整格分桶的边索引：查一个点只看它周围 3×3 格。 */
function indexSegments(layers: readonly Layer[]): Map<string, Edge[]> {
  const index = new Map<string, Edge[]>()
  for (const layer of layers) {
    for (const sub of layer.subs) {
      for (let i = 0; i < sub.length; i++) {
        const [x0, y0] = sub[i]!
        const [x1, y1] = sub[(i + 1) % sub.length]!
        const segment: Edge = { x0, y0, x1, y1 }
        for (let cx = Math.floor(Math.min(x0, x1)); cx <= Math.floor(Math.max(x0, x1)); cx++) {
          for (let cy = Math.floor(Math.min(y0, y1)); cy <= Math.floor(Math.max(y0, y1)); cy++) {
            const key = `${cx},${cy}`
            const bucket = index.get(key)
            if (bucket)
              bucket.push(segment)
            else index.set(key, [segment])
          }
        }
      }
    }
  }
  return index
}

function distanceToSegment(x: number, y: number, s: Edge): number {
  const dx = s.x1 - s.x0
  const dy = s.y1 - s.y0
  const lengthSq = dx * dx + dy * dy
  const t = lengthSq === 0 ? 0 : Math.max(0, Math.min(1, ((x - s.x0) * dx + (y - s.y0) * dy) / lengthSq))
  return Math.hypot(x - (s.x0 + t * dx), y - (s.y0 + t * dy))
}

/** 取样点到最近墨边的距离；周围 3×3 格里没有边就返回 1（已远超判据门槛）。 */
function inkMarginAt(index: Map<string, Edge[]>, x: number, y: number): number {
  let best = 1
  const cx = Math.floor(x)
  const cy = Math.floor(y)
  for (let ix = cx - 1; ix <= cx + 1; ix++) {
    for (let iy = cy - 1; iy <= cy + 1; iy++) {
      for (const segment of index.get(`${ix},${iy}`) ?? [])
        best = Math.min(best, distanceToSegment(x, y, segment))
    }
  }
  return best
}

// ── 按规格自己铺一遍的格子分类 ──

const CELL_PLAIN = 0
const CELL_ALWAYS_SQUARE = 1
const CELL_FINDER = 2

/** 中心落在定位图形那三个角上的校正图形不画。 */
function collidesWithFinder(row: number, col: number, size: number): boolean {
  const nearStart = (v: number): boolean => v <= 8
  const nearEnd = (v: number): boolean => v >= size - 9
  return (nearStart(row) && nearStart(col)) || (nearStart(row) && nearEnd(col)) || (nearEnd(row) && nearStart(col))
}

/** 三个定位图形的 7×7、时序图形整行整列、校正图形 5×5，其余是普通格。 */
function cellKinds(version: number): Uint8Array {
  const size = 4 * version + 17
  const kinds = new Uint8Array(size * size)
  for (const [top, left] of [[0, 0], [0, size - 7], [size - 7, 0]] as const) {
    for (let r = 0; r < 7; r++) {
      for (let c = 0; c < 7; c++)
        kinds[(top + r) * size + left + c] = CELL_FINDER
    }
  }
  for (let i = 0; i < size; i++) {
    if (kinds[6 * size + i] === CELL_PLAIN)
      kinds[6 * size + i] = CELL_ALWAYS_SQUARE
    if (kinds[i * size + 6] === CELL_PLAIN)
      kinds[i * size + 6] = CELL_ALWAYS_SQUARE
  }
  const centers = qrAlignmentPositions(version)
  for (const row of centers) {
    for (const col of centers) {
      if (collidesWithFinder(row, col, size))
        continue
      for (let dr = -2; dr <= 2; dr++) {
        for (let dc = -2; dc <= 2; dc++) {
          const at = (row + dr) * size + col + dc
          if (kinds[at] === CELL_PLAIN)
            kinds[at] = CELL_ALWAYS_SQUARE
        }
      }
    }
  }
  return kinds
}

/** 功能图形与格式 / 版本信息占用的格子，数据码字铺不进去。 */
function reservedMap(version: number): boolean[][] {
  const size = 4 * version + 17
  const map = Array.from({ length: size }, () => Array.from<boolean>({ length: size }).fill(false))
  const mark = (row: number, col: number): void => {
    if (row >= 0 && row < size && col >= 0 && col < size)
      map[row]![col] = true
  }
  for (const [top, left] of [[0, 0], [0, size - 8], [size - 8, 0]] as const) {
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++)
        mark(top + r, left + c)
    }
  }
  for (let i = 0; i < size; i++) {
    mark(6, i)
    mark(i, 6)
  }
  for (let i = 0; i < 9; i++) {
    mark(8, i)
    mark(i, 8)
  }
  for (let i = 0; i < 8; i++) {
    mark(8, size - 1 - i)
    mark(size - 1 - i, 8)
  }
  const centers = qrAlignmentPositions(version)
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

/** 只标校正图形那些 5×5；功能格里唯一可能落在码面中央的就是它们。 */
function alignmentMap(version: number): boolean[][] {
  const size = 4 * version + 17
  const map = Array.from({ length: size }, () => Array.from<boolean>({ length: size }).fill(false))
  const centers = qrAlignmentPositions(version)
  for (const row of centers) {
    for (const col of centers) {
      if (collidesWithFinder(row, col, size))
        continue
      for (let dr = -2; dr <= 2; dr++) {
        for (let dc = -2; dc <= 2; dc++)
          map[row + dr]![col + dc] = true
      }
    }
  }
  return map
}

/** 每个非功能格属于第几个码字；功能格记 −1。自右向左两列一组、方向逐组翻转。 */
function codewordMap(version: number): number[][] {
  const size = 4 * version + 17
  const reserved = reservedMap(version)
  const out = Array.from({ length: size }, () => Array.from<number>({ length: size }).fill(-1))
  let bit = 0
  let upward = true
  for (let col = size - 1; col >= 1; col -= 2) {
    if (col === 6)
      col = 5
    for (let i = 0; i < size; i++) {
      const row = upward ? size - 1 - i : i
      for (const c of [col, col - 1]) {
        if (!reserved[row]![c]) {
          out[row]![c] = Math.floor(bit / 8)
          bit++
        }
      }
    }
    upward = !upward
  }
  return out
}

/** 该版本的总码字数（数据 + 纠错），按可用模块数的闭式算。 */
function totalCodewords(version: number): number {
  let modules = (16 * version + 128) * version + 64
  if (version >= 2) {
    const groups = Math.floor(version / 7) + 2
    modules -= (25 * groups - 10) * groups - 55
    if (version >= 7)
      modules -= 36
  }
  return Math.floor(modules / 8)
}

/** 四个纠错级别标称可恢复的码字比例。 */
const RECOVERY: Readonly<Record<QrLevel, number>> = { L: 0.07, M: 0.15, Q: 0.25, H: 0.3 }

// ── 判据用到的常量与样本 ──

const MODULE_SHAPES: readonly QrModuleShape[] = ['square', 'dot', 'rounded']
const EYE_SHAPES: readonly QrEyeShape[] = ['square', 'rounded']
const LEVELS: readonly QrLevel[] = ['L', 'M', 'Q', 'H']

/** 取样点到最近墨边的最小余量门槛，单位是模块边长。 */
const MIN_INK_MARGIN = 0.25

interface Sample {
  value: string
  level: QrLevel
}

const SAMPLES: readonly Sample[] = [
  { value: 'Hi', level: 'H' },
  { value: 'https://ui.xihanfun.com', level: 'M' },
  { value: '曦寒 UI · 快速、轻量、高效、用心', level: 'Q' },
  { value: 'x'.repeat(200), level: 'L' },
  { value: 'x'.repeat(700), level: 'H' },
]

/** 三处定位图形逐格应有的样子：外环 + 空一圈 + 3×3 内心。 */
const FINDER = [
  [1, 1, 1, 1, 1, 1, 1],
  [1, 0, 0, 0, 0, 0, 1],
  [1, 0, 1, 1, 1, 0, 1],
  [1, 0, 1, 1, 1, 0, 1],
  [1, 0, 1, 1, 1, 0, 1],
  [1, 0, 0, 0, 0, 0, 1],
  [1, 1, 1, 1, 1, 1, 1],
].map(line => line.map(Boolean))

/** 逐格对账，最多列出前 8 处不同。 */
function mismatches(ink: readonly boolean[][], matrix: readonly (readonly boolean[])[], clear?: QrCodeLogoArea, margin = 0): string[] {
  const out: string[] = []
  for (let row = 0; row < matrix.length && out.length < 8; row++) {
    for (let col = 0; col < matrix.length && out.length < 8; col++) {
      const x = col + margin + 0.5
      const y = row + margin + 0.5
      const cleared = clear !== undefined
        && x > clear.x && x < clear.x + clear.size && y > clear.y && y < clear.y + clear.size
      const want = cleared ? false : matrix[row]![col]!
      const got = ink[row]![col]!
      if (want !== got)
        out.push(`行 ${row} 列 ${col}：矩阵要 ${want ? '深' : '浅'}，几何给 ${got ? '有墨' : '无墨'}`)
    }
  }
  return out
}

describe('缺省形状的几何总量不变', () => {
  // 码眼独立成一条之后，缺省形状的 path 不再逐字等于整张码合并出来的那条。
  // 这一组钉的是墨的总量：两条 path 合起来必须与整张码合并出来的那条盖住同一片面积、
  // 同一批格子——差一格就是一张扫不出来的码。

  /** 参照实现：整张码（含三个码眼）逐行找深色游程，一段一个矩形子路径。 */
  function mergedRunPath(modules: readonly (readonly boolean[])[], margin: number): string {
    const out: string[] = []
    modules.forEach((line, row) => {
      let start = -1
      for (let col = 0; col <= line.length; col++) {
        const dark = col < line.length && line[col] === true
        if (dark && start < 0)
          start = col
        if (!dark && start >= 0) {
          const run = col - start
          out.push(`M${start + margin} ${row + margin}h${run}v1h-${run}z`)
          start = -1
        }
      }
    })
    return out.join('')
  }

  /**
   * 一条 d 围出的有向面积（鞋带公式逐子路径求和）。
   * 顺绕记正、逆绕记负，于是码眼那种「外框挖孔再补内心」的环算出来正好是环本身的面积。
   */
  function signedArea(d: string): number {
    let total = 0
    for (const sub of parsePath(d)) {
      let sum = 0
      for (let i = 0; i < sub.length; i++) {
        const [x0, y0] = sub[i]!
        const [x1, y1] = sub[(i + 1) % sub.length]!
        sum += x0 * y1 - x1 * y0
      }
      total += sum / 2
    }
    return total
  }

  /** 深色模块个数，即那张码该有的墨的总面积（每格边长 1）。 */
  function darkCount(modules: readonly (readonly boolean[])[]): number {
    return modules.reduce((n, line) => n + line.filter(Boolean).length, 0)
  }

  it('square + square 的 path + eyePath 与整张码合并出来的那条盖住同一片墨', () => {
    for (const { value, level } of SAMPLES) {
      for (const margin of [0, 1, 4, 9]) {
        const api = connectQrCode({ value, level, margin }, normalizeProps)
        const matrix = qrEncode(value, level).modules
        const merged = mergedRunPath(matrix, margin)
        const tag = { value: value.slice(0, 8), margin }

        // 一、面积：两条加起来恰好是深色模块数，一格不多一格不少
        const dark = darkCount(matrix)
        expect({ ...tag, area: Number((signedArea(api.path) + signedArea(api.eyePath)).toFixed(6)) })
          .toEqual({ ...tag, area: dark })
        expect(Number(signedArea(merged).toFixed(6))).toBe(dark)

        // 二、落点：缺省形状的边界全在整数坐标上，格内墨色恒定，
        // 于是逐格取样就是完备判据——整个 viewBox（含静区）每一格都与参照实现相同
        const side = api.count + margin * 2
        const coords = Array.from({ length: side }, (_, i) => i + 0.5)
        const now = inkGrid(paintedOf(api.path, api.eyePath, undefined), coords, coords)
        const before = inkGrid(paintedOf(merged, '', undefined), coords, coords)
        const diff: string[] = []
        for (let row = 0; row < side && diff.length < 8; row++) {
          for (let col = 0; col < side && diff.length < 8; col++) {
            if (now[row]![col] !== before[row]![col])
              diff.push(`格 ${row},${col}：原先 ${before[row]![col] ? '有墨' : '无墨'}，现在 ${now[row]![col] ? '有墨' : '无墨'}`)
          }
        }
        expect({ ...tag, diff }).toEqual({ ...tag, diff: [] })

        // 三、码眼确实拆了出去：eyePath 非空，主 path 比参照实现短
        expect(api.eyePath).not.toBe('')
        expect(api.path.length).toBeLessThan(merged.length)
      }
    }
  })

  it('显式写死缺省值、以及只写其中一个，几何逐字不变', () => {
    const base = connectQrCode({ value: '曦寒 UI', level: 'M' }, normalizeProps)
    for (const props of [
      { moduleShape: 'square' as const },
      { eyeShape: 'square' as const },
      { moduleShape: 'square' as const, eyeShape: 'square' as const },
      { logo: true },
    ]) {
      const api = connectQrCode({ value: '曦寒 UI', level: 'M', ...props }, normalizeProps)
      expect(api.path).toBe(base.path)
      expect(api.eyePath).toBe(base.eyePath)
    }
    expect(base.eyePath).not.toBe('')
  })

  it('六种形状组合都拆出 eyePath，且 path 里不含码眼那三块', () => {
    // 码眼恒独立成一条，皮肤的 --xh-qr-code-eye-fg 才有落地的节点；缺省形状也不例外
    for (const moduleShape of MODULE_SHAPES) {
      for (const eyeShape of EYE_SHAPES) {
        const api = connectQrCode({ value: '曦寒 UI', level: 'M', moduleShape, eyeShape }, normalizeProps)
        expect({ moduleShape, eyeShape, split: api.eyePath !== '' }).toEqual({ moduleShape, eyeShape, split: true })
        // 码眼的 7×7 由 eyePath 管，modules 那条不许在那三块里落墨
        const painted = paintedOf(api.path, '', undefined)
        const near = api.margin
        const far = api.margin + api.count - 7
        for (const [ex, ey] of [[near, near], [far, near], [near, far]] as const) {
          const xs = Array.from({ length: 7 }, (_, i) => ex + i + 0.5)
          const ys = Array.from({ length: 7 }, (_, i) => ey + i + 0.5)
          expect({ moduleShape, eyeShape, ink: inkGrid(painted, xs, ys).flat().filter(Boolean).length })
            .toEqual({ moduleShape, eyeShape, ink: 0 })
        }
      }
    }
  })

  it('没画出码时两条 d 都是空串', () => {
    for (const props of [{ value: '' }, { value: 'x'.repeat(3000), level: 'H' as const }]) {
      const api = connectQrCode(props, normalizeProps)
      expect({ path: api.path, eyePath: api.eyePath }).toEqual({ path: '', eyePath: '' })
    }
  })
})

describe('中心覆盖', () => {
  it('六种形状组合下，每个深色模块的格心都有墨、浅色模块的格心都没有', () => {
    for (const moduleShape of MODULE_SHAPES) {
      for (const eyeShape of EYE_SHAPES) {
        for (const { value, level } of SAMPLES) {
          const got = readback({ value, level, moduleShape, eyeShape })
          expect({ moduleShape, eyeShape, version: got.api.version, bad: mismatches(got.ink, got.matrix) })
            .toEqual({ moduleShape, eyeShape, version: got.api.version, bad: [] })
        }
      }
    }
  })

  it('大版本（含版本信息与多组校正图形）也逐格对得上', () => {
    const value = 'x'.repeat(qrCapacityBytes(32, 'L'))
    for (const [moduleShape, eyeShape] of [['dot', 'rounded'], ['rounded', 'square']] as const) {
      const got = readback({ value, level: 'L', moduleShape, eyeShape })
      expect(got.api.version).toBe(32)
      expect({ moduleShape, eyeShape, bad: mismatches(got.ink, got.matrix) })
        .toEqual({ moduleShape, eyeShape, bad: [] })
    }
  })

  it('形状给了词表外的值时退到盖得住格心的画法，扫得出的码不变成扫不出的', () => {
    // 属性是字符串，`eye-shape="circle"` 这类写法进得来；退化成什么样都行，但不许把码画坏
    for (const [moduleShape, eyeShape] of [['circle', 'square'], ['square', 'circle'], ['circle', 'circle']] as const) {
      const got = readback({
        value: 'https://ui.xihanfun.com',
        level: 'M',
        moduleShape: moduleShape as QrModuleShape,
        eyeShape: eyeShape as QrEyeShape,
      })
      expect({ moduleShape, eyeShape, bad: mismatches(got.ink, got.matrix) })
        .toEqual({ moduleShape, eyeShape, bad: [] })
    }
  })

  it('静区一滴墨都没有，各档 margin 都是', () => {
    for (const moduleShape of MODULE_SHAPES) {
      for (const margin of [0, 1, 4, 9]) {
        const api = connectQrCode({ value: '曦寒 UI', level: 'Q', margin, moduleShape, eyeShape: 'rounded' }, normalizeProps)
        const side = api.count + margin * 2
        const coords = Array.from({ length: side }, (_, i) => i + 0.5)
        const grid = inkGrid(paintedOf(api.path, api.eyePath, api.logoArea), coords, coords)
        const strays: string[] = []
        for (let row = 0; row < side; row++) {
          for (let col = 0; col < side; col++) {
            const inside = row >= margin && row < margin + api.count && col >= margin && col < margin + api.count
            if (!inside && grid[row]![col])
              strays.push(`静区 ${row},${col} 有墨`)
          }
        }
        expect({ moduleShape, margin, strays: strays.slice(0, 4) }).toEqual({ moduleShape, margin, strays: [] })
      }
    }
  })

  it('取样点到最近墨边留足余量，深浅两侧都是', () => {
    let worst = { margin: Number.POSITIVE_INFINITY, where: '' }
    for (const moduleShape of MODULE_SHAPES) {
      for (const eyeShape of EYE_SHAPES) {
        for (const { value, level } of SAMPLES.slice(0, 3)) {
          const api = connectQrCode({ value, level, moduleShape, eyeShape }, normalizeProps)
          const index = indexSegments(paintedOf(api.path, api.eyePath, undefined).layers)
          for (let row = 0; row < api.count; row++) {
            for (let col = 0; col < api.count; col++) {
              const gap = inkMarginAt(index, col + api.margin + 0.5, row + api.margin + 0.5)
              if (gap < worst.margin)
                worst = { margin: gap, where: `${moduleShape}/${eyeShape} 行 ${row} 列 ${col}` }
            }
          }
        }
      }
    }
    expect({ ...worst, ok: worst.margin >= MIN_INK_MARGIN }).toMatchObject({ ok: true })
    // 全场最紧的一处是圆角码眼外环角上那格：格心到 7×7 圆角（半径 1 格）的距离恰是 1 − √½。
    // 圆角一旦调大，这个数就往下掉，超过 1.707 格时格心直接落到墨外
    expect(worst.where).toContain('/rounded')
    expect(worst.margin).toBeCloseTo(1 - Math.SQRT1_2, 2)
  })
})

describe('码眼结构', () => {
  it('两种 eyeShape 下三处定位图形都是外环 + 空一圈 + 内心，没被画成实心块', () => {
    for (const moduleShape of MODULE_SHAPES) {
      for (const eyeShape of EYE_SHAPES) {
        for (const { value, level } of SAMPLES) {
          const { api, painted } = readback({ value, level, moduleShape, eyeShape })
          const near = api.margin
          const far = api.margin + api.count - 7
          for (const [ex, ey] of [[near, near], [far, near], [near, far]] as const) {
            const xs = Array.from({ length: 7 }, (_, i) => ex + i + 0.5)
            const ys = Array.from({ length: 7 }, (_, i) => ey + i + 0.5)
            const patch = inkGrid(painted, xs, ys)
            expect({ moduleShape, eyeShape, at: `${ex},${ey}`, patch }).toEqual({ moduleShape, eyeShape, at: `${ex},${ey}`, patch: FINDER })
            // 中间那圈必须整圈是空的：外环与内心连成一片就没有 1:1:3:1:1
            expect(patch[1]!.slice(1, 6).some(Boolean)).toBe(false)
            expect(patch[5]!.slice(1, 6).some(Boolean)).toBe(false)
          }
        }
      }
    }
  })

  it('码眼的墨全部落在自己那 7×7 里，没有溢到分隔带上', () => {
    for (const eyeShape of EYE_SHAPES) {
      const api = connectQrCode({ value: '曦寒 UI', level: 'M', moduleShape: 'dot', eyeShape }, normalizeProps)
      const eyes = paintedOf(api.eyePath, '', undefined)
      const side = api.count + api.margin * 2
      const coords = Array.from({ length: side * 2 }, (_, i) => i / 2 + 0.25)
      const grid = inkGrid(eyes, coords, coords)
      const near = api.margin
      const far = api.margin + api.count - 7
      const boxes = [[near, near], [far, near], [near, far]] as const
      const strays: string[] = []
      coords.forEach((y, r) => {
        coords.forEach((x, c) => {
          if (!grid[r]![c])
            return
          const inside = boxes.some(([bx, by]) => x >= bx && x <= bx + 7 && y >= by && y <= by + 7)
          if (!inside && strays.length < 4)
            strays.push(`${eyeShape}：${x},${y} 有墨却不在任何一块 7×7 里`)
        })
      })
      expect(strays).toEqual([])
    }
  })
})

describe('时序图形与校正图形没被变形', () => {
  /** 四个顶点正好构成轴对齐矩形的子路径；带圆弧的子路径顶点多，不会被认成矩形。 */
  function rectOf(sub: SubPath): { x0: number, y0: number, x1: number, y1: number } | undefined {
    if (sub.length !== 4)
      return undefined
    const xs = sub.map(p => p[0])
    const ys = sub.map(p => p[1])
    const box = { x0: Math.min(...xs), y0: Math.min(...ys), x1: Math.max(...xs), y1: Math.max(...ys) }
    for (const [x, y] of sub) {
      if ((x !== box.x0 && x !== box.x1) || (y !== box.y0 && y !== box.y1))
        return undefined
    }
    return box
  }

  it('三种 moduleShape 下，深色的时序 / 校正模块整格都在某一个矩形子路径里', () => {
    for (const moduleShape of MODULE_SHAPES) {
      for (const { value, level } of SAMPLES) {
        const api = connectQrCode({ value, level, moduleShape, eyeShape: 'rounded' }, normalizeProps)
        const matrix = qrEncode(value, level).modules
        const kinds = cellKinds(api.version)
        const rects = parsePath(api.path).map(rectOf).filter(box => box !== undefined)
        const bad: string[] = []
        for (let row = 0; row < api.count && bad.length < 6; row++) {
          for (let col = 0; col < api.count && bad.length < 6; col++) {
            if (kinds[row * api.count + col] !== CELL_ALWAYS_SQUARE || !matrix[row]![col])
              continue
            const x = col + api.margin
            const y = row + api.margin
            const covered = rects.some(box => box.x0 <= x && box.x1 >= x + 1 && box.y0 <= y && box.y1 >= y + 1)
            if (!covered)
              bad.push(`${moduleShape}：行 ${row} 列 ${col} 的时序 / 校正模块不是整格方块`)
          }
        }
        expect({ moduleShape, version: api.version, bad }).toEqual({ moduleShape, version: api.version, bad: [] })
      }
    }
  })
})

describe('logo 挖空', () => {
  it('挖空区整格居中、边长是奇数、不超过每边模块数的 1/5', () => {
    for (const { value, level } of SAMPLES) {
      for (const margin of [0, 4, 9]) {
        const api = connectQrCode({ value, level, margin, logo: true }, normalizeProps)
        const area = api.logoArea!
        expect(area).toBeDefined()
        expect(area.size % 2).toBe(1)
        expect(area.size).toBeLessThanOrEqual(api.count / 5)
        expect(Number.isInteger(area.x)).toBe(true)
        expect(Number.isInteger(area.y)).toBe(true)
        // 四条边都压在模块边界上，且整块在码面之内
        expect(area.x).toBe(margin + (api.count - area.size) / 2)
        expect(area.y).toBe(area.x)
        expect(area.x).toBeGreaterThanOrEqual(margin)
        expect(area.x + area.size).toBeLessThanOrEqual(margin + api.count)
        expect(api.getLogoProps()).toMatchObject({ x: area.x, y: area.y, width: area.size, height: area.size })
      }
    }
  })

  it('挖空区一格都不碰定位图形、时序图形、格式信息与版本信息', () => {
    // 纠错码字补得回数据，功能图形补不回来：定位与时序是取样网格的基准，缺一格就没法定位
    const clearedAlignment: Array<[number, number]> = []
    for (const version of [1, 2, 6, 7, 20, 32, 40] as const) {
      const value = 'x'.repeat(qrCapacityBytes(version, 'H'))
      const api = connectQrCode({ value, level: 'H', logo: true }, normalizeProps)
      expect(api.version).toBe(version)
      const area = api.logoArea!
      const kinds = cellKinds(version)
      const reserved = reservedMap(version)
      const alignments = alignmentMap(version)
      const touched: string[] = []
      let alignment = 0
      for (let row = area.y - api.margin; row < area.y - api.margin + area.size; row++) {
        for (let col = area.x - api.margin; col < area.x - api.margin + area.size; col++) {
          if (kinds[row * api.count + col] === CELL_FINDER)
            touched.push(`定位图形 ${row},${col}`)
          // 功能格里除校正图形以外的全部：定位图形与分隔带、时序图形、格式信息、版本信息
          if (reserved[row]![col] && !alignments[row]![col])
            touched.push(`功能图形 ${row},${col}`)
          if (alignments[row]![col])
            alignment++
        }
      }
      expect({ version, touched: touched.slice(0, 4) }).toEqual({ version, touched: [] })
      // 唯一可能被压到的功能图形就是校正图形，api 上如实报出来
      expect({ version, hits: api.logoDamage!.hitsFunctionPatterns }).toEqual({ version, hits: alignment > 0 })
      // 右下角那个校正图形是多数读码器建取样网格用的那一个，它离中心最远，整块永远碰不着
      const far = api.count - 7
      expect(alignments[far]?.[far] ?? false).toBe(version >= 2)
      expect(far - 2).toBeGreaterThanOrEqual(area.x - api.margin + area.size)
      clearedAlignment.push([version, alignment])
    }
    // 大版本上中央的校正图形会被挖掉一部分，纠错码字补不回功能图形；
    // 这里锁住实测的格数，数一涨就是挖空变大了。右下角那个不受影响，见上面那条。
    expect(clearedAlignment).toEqual([[1, 0], [2, 0], [6, 0], [7, 25], [20, 0], [32, 64], [40, 25]])
  })

  it('挖空区里的模块中心一律没墨，区外逐格照旧', () => {
    for (const moduleShape of MODULE_SHAPES) {
      for (const eyeShape of EYE_SHAPES) {
        for (const { value, level } of SAMPLES) {
          const got = readback({ value, level, moduleShape, eyeShape, logo: true })
          const area = got.api.logoArea!
          expect({ moduleShape, eyeShape, bad: mismatches(got.ink, got.matrix, area, got.api.margin) })
            .toEqual({ moduleShape, eyeShape, bad: [] })
          // 判据得真的看见过一片被挖掉的深色模块，不然它什么都没验
          let erasedDark = 0
          for (let row = 0; row < got.api.count; row++) {
            for (let col = 0; col < got.api.count; col++) {
              const inArea = row + got.api.margin >= area.y && row + got.api.margin < area.y + area.size
                && col + got.api.margin >= area.x && col + got.api.margin < area.x + area.size
              if (inArea && got.matrix[row]![col])
                erasedDark++
            }
          }
          expect(erasedDark).toBeGreaterThan(0)
        }
      }
    }
  })

  it('挖掉的码字比例在 Q / H 的纠错余量之内，L / M 则赔不起', () => {
    const worst: Record<QrLevel, { fraction: number, version: number }> = {
      L: { fraction: 0, version: 0 },
      M: { fraction: 0, version: 0 },
      Q: { fraction: 0, version: 0 },
      H: { fraction: 0, version: 0 },
    }
    for (const version of [1, 2, 6, 7, 14, 20, 27, 32, 40] as const) {
      const codewords = codewordMap(version)
      const total = totalCodewords(version)
      for (const level of LEVELS) {
        const value = 'x'.repeat(qrCapacityBytes(version, level))
        const api = connectQrCode({ value, level, logo: true }, normalizeProps)
        expect(api.version).toBe(version)
        const area = api.logoArea!
        const damaged = new Set<number>()
        for (let row = area.y - api.margin; row < area.y - api.margin + area.size; row++) {
          for (let col = area.x - api.margin; col < area.x - api.margin + area.size; col++) {
            const index = codewords[row]![col]!
            // 末尾的余数位不成码字，不计进损伤
            if (index >= 0 && index < total)
              damaged.add(index)
          }
        }
        const fraction = damaged.size / total
        // api 报的比例必须与这里独立铺一遍码字得出的完全相同，量化才有意义
        expect({ version, level, ratio: api.logoDamage!.ratio }).toEqual({ version, level, ratio: fraction })
        expect({ version, level, modules: api.logoDamage!.modules })
          .toEqual({ version, level, modules: area.size * area.size })
        if (fraction > worst[level].fraction)
          worst[level] = { fraction, version }
      }
    }
    // 组件文档要求放 logo 就把 level 提到 Q 或 H；这两档必须真的兜得住
    expect({ Q: worst.Q.fraction <= RECOVERY.Q, H: worst.H.fraction <= RECOVERY.H }).toEqual({ Q: true, H: true })
    // 挖空只跟版本走，四档纠错级别损伤同样多；峰值在 2 版，锁住它，挖空变大就会响
    expect({
      peak: Number(worst.H.fraction.toFixed(4)),
      version: worst.H.version,
      allSame: LEVELS.every(level => worst[level].fraction === worst.H.fraction),
    }).toEqual({ peak: 0.1364, version: 2, allSame: true })
    // 同一片挖空按 L 级的纠错余量已经赔不起：缺省的 M 级也只剩一点点富余
    expect(worst.L.fraction).toBeGreaterThan(RECOVERY.L)
  })

  it('没给 logo 时不留位，getLogoProps 收成 0 宽 0 高', () => {
    for (const props of [{ value: '曦寒 UI' }, { value: '曦寒 UI', logo: false }, { value: '' }, { value: 'x', logo: true, level: 'H' as const }]) {
      const api = connectQrCode(props, normalizeProps)
      if (props.logo === true && props.value !== '') {
        expect(api.logoArea).toBeDefined()
        continue
      }
      expect(api.logoArea).toBeUndefined()
      expect(api.getLogoProps()).toMatchObject({ x: 0, y: 0, width: 0, height: 0 })
    }
  })

  it('没画出码时不留位：内容超容量落到 error 也一样', () => {
    const api = connectQrCode({ value: 'x'.repeat(3000), level: 'H', logo: true }, normalizeProps)
    expect(api.state).toBe('error')
    expect(api.logoArea).toBeUndefined()
    expect(api.getLogoProps()).toMatchObject({ width: 0, height: 0 })
  })
})

describe('logo 损伤量与警告', () => {
  it('没留 logo 位就没有损伤可报', () => {
    for (const props of [
      { value: '曦寒 UI' },
      { value: '曦寒 UI', logo: false },
      { value: '', logo: true },
      // 内容超容量落到 error，一个模块都没铺，也就无从挖起
      { value: 'x'.repeat(3000), level: 'H' as const, logo: true },
    ]) {
      expect(connectQrCode(props, normalizeProps).logoDamage).toBeUndefined()
    }
    expect(damageWarnings()).toEqual([])
  })

  it('2 版那张峰值码：25 个模块、44 个码字里的 6 个', () => {
    // 挖空只跟版本走，四档纠错级别挖掉的是同一片；峰值在 2 版，L 级赔不起、M 起兜得住
    const value = 'x'.repeat(qrCapacityBytes(2, 'L'))
    const api = connectQrCode({ value, level: 'L', logo: true }, normalizeProps)
    expect(api.version).toBe(2)
    expect(api.logoDamage).toEqual({ modules: 25, ratio: 6 / 44, hitsFunctionPatterns: false })
    expect(Number((6 / 44).toFixed(4))).toBe(0.1364)
  })

  it('损伤超出所选级别的余量才报警告，且只报一条', () => {
    const warned: string[] = []
    for (const version of [1, 2, 7, 20, 40] as const) {
      for (const level of LEVELS) {
        diagnostics = []
        const value = 'x'.repeat(qrCapacityBytes(version, level))
        const api = connectQrCode({ value, level, logo: true }, normalizeProps)
        expect(api.version).toBe(version)
        const over = api.logoDamage!.ratio > RECOVERY[level]
        expect({ version, level, warned: damageWarnings().length }).toEqual({ version, level, warned: over ? 1 : 0 })
        if (over)
          warned.push(`${version}/${level}`)
      }
    }
    // 判据得真的见过响与不响两侧，不然「按余量分流」这句什么都没验；
    // 只有 L 级会响，且不是每个版本都响——挖空占的码字比例随版本变
    expect(warned).toEqual(['1/L', '2/L'])
  })

  it('警告说清了怎么办：把 level 提到 Q 或 H', () => {
    const value = 'x'.repeat(qrCapacityBytes(2, 'L'))
    connectQrCode({ value, level: 'L', logo: true }, normalizeProps)
    const [record] = damageWarnings()
    expect(record).toBeDefined()
    expect(DIAGNOSTIC_CODES.qrCodeLogoDamage).toBe(LOGO_DAMAGE_CODE)
    expect({ code: record!.code, level: record!.level, scope: record!.scope })
      .toEqual({ code: LOGO_DAMAGE_CODE, level: 'warn', scope: 'qr-code' })
    // 两个数与那句怎么办都得在：只说"损伤了"而不给出路，读到的人还是不知道改什么
    expect(record!.message).toContain('13.6%')
    expect(record!.message).toContain('7%')
    expect(record!.message).toContain('把 level 提到 Q 或 H')
    // 浮点乘出来的 7.000000000000001% 不能露到文案里
    expect(record!.message).not.toMatch(/\d\.0000/)
    expect(record!.detail).toMatchObject({ level: 'L', version: 2, recoverable: RECOVERY.L })
  })

  it('警告不抛错：码照画，几何一条不少', () => {
    // 这是可渲染但不明智的组合；抛在 Vue 的 computed 或 WC 的 wire 里会连累整棵树
    const value = 'x'.repeat(qrCapacityBytes(2, 'L'))
    const api = connectQrCode({ value, level: 'L', logo: true }, normalizeProps)
    expect(damageWarnings()).toHaveLength(1)
    expect({ state: api.state, error: api.error }).toEqual({ state: 'ready', error: undefined })
    expect(api.path).not.toBe('')
    expect(api.eyePath).not.toBe('')
    expect(api.logoArea).toBeDefined()
    // 报了警告也照样逐格画对
    const got = readback({ value, level: 'L', logo: true })
    expect(mismatches(got.ink, got.matrix, got.api.logoArea, got.api.margin)).toEqual([])
  })

  it('压到校正图形不拦：7 版与 10 版的正中格就是校正中心，只如实报出来', () => {
    // 定位图形、分隔带、时序图形、格式信息、版本信息才是碰不得的，1/5 的边长上限已经保证够不着；
    // 校正图形丢一个在多校正图形的版本上仍可恢复，拦住等于这些版本放不了居中 logo，
    // 而居中正是 logo 唯一的摆法
    for (const version of [7, 10] as const) {
      const middle = (4 * version + 17 - 1) / 2
      expect({ version, isAlignmentCenter: qrAlignmentPositions(version).includes(middle) })
        .toEqual({ version, isAlignmentCenter: true })
      const value = 'x'.repeat(qrCapacityBytes(version, 'H'))
      const api = connectQrCode({ value, level: 'H', logo: true }, normalizeProps)
      expect(api.version).toBe(version)
      expect({ version, hits: api.logoDamage!.hitsFunctionPatterns, state: api.state })
        .toEqual({ version, hits: true, state: 'ready' })
      expect(api.path).not.toBe('')
    }
    // 压到校正图形本身不构成警告，只有损伤比例超余量才会响
    expect(damageWarnings()).toEqual([])
  })
})

describe('判据自身有牙', () => {
  // 上面全绿也可能是判据太松。这一组反过来证明：几何被改坏，判据就会响。

  it('抠掉 path 里一段子路径，中心对账立刻报出缺墨', () => {
    const api = connectQrCode({ value: '曦寒 UI', level: 'M', moduleShape: 'dot' }, normalizeProps)
    const matrix = qrEncode('曦寒 UI', 'M').modules
    const broken = api.path.replace(/^M[^M]*/, '')
    expect(broken).not.toBe(api.path)
    const centers = Array.from({ length: api.count }, (_, i) => i + api.margin + 0.5)
    const ink = inkGrid(paintedOf(broken, api.eyePath, undefined), centers, centers)
    expect(mismatches(ink, matrix).length).toBeGreaterThan(0)
  })

  it('把码眼画成实心 7×7，三层结构判据必然报错', () => {
    const api = connectQrCode({ value: '曦寒 UI', level: 'M', moduleShape: 'dot' }, normalizeProps)
    const near = api.margin
    const solid = `M${near} ${near}h7v7h-7z`
    const xs = Array.from({ length: 7 }, (_, i) => near + i + 0.5)
    const patch = inkGrid(paintedOf('', solid, undefined), xs, xs)
    expect(patch).not.toEqual(FINDER)
    expect(patch[1]!.slice(1, 6).some(Boolean)).toBe(true)
  })

  it('半径缩到 0.2 的圆码点仍盖住格心，但余量判据抓得住它', () => {
    const layer = makeLayer(parsePath('M4.3 4.5a0.2 0.2 0 1 0 0.4 0a0.2 0.2 0 1 0 -0.4 0z'))
    expect(rowWindings(layer, 4.5, [4.5])[0]).not.toBe(0)
    const gap = inkMarginAt(indexSegments([layer]), 4.5, 4.5)
    expect(gap).toBeCloseTo(0.2, 2)
    expect(gap).toBeLessThan(MIN_INK_MARGIN)
  })

  it('路径求值器认得中空环：外框顺绕、挖孔逆绕，孔里没墨', () => {
    const layer = makeLayer(parsePath('M0 0h7v7h-7zM1 1v5h5v-5z'))
    expect(rowWindings(layer, 0.5, [0.5, 3.5, 6.5])).toEqual([1, 1, 1])
    expect(rowWindings(layer, 3.5, [0.5, 3.5, 6.5])).toEqual([1, 0, 1])
  })
})
