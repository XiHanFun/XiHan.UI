import type { NormalizeProps, PropTypes } from '@xihan-ui/core'
import type { QrCodeApi, QrCodeLogoArea, QrCodeProps, QrCodeState, QrEyeShape, QrModuleShape } from './qr-code.types'
import type { QrLevel } from './qr-encode'
import { dataAttr } from '@xihan-ui/core'
import { qrCodeAnatomy } from './qr-code.anatomy'
import { qrAlignmentPositions, qrEncode } from './qr-encode'

const parts = qrCodeAnatomy.build()

const DEFAULT_LEVEL: QrLevel = 'M'
const DEFAULT_MARGIN = 4
const DEFAULT_SIZE = 160
const DEFAULT_MODULE_SHAPE: QrModuleShape = 'square'
const DEFAULT_EYE_SHAPE: QrEyeShape = 'square'

// ── 形状的几何常量，单位一律是模块边长 ──
// 读码器按模块中心取样，这几个数各自的上限就是"墨还盖得住格心"这一条。

/** 圆码点的半径：0.5 即格内最大内切圆，格心到墨边留满半格。 */
const DOT_RADIUS = 0.5
/** 圆角码点的圆角半径：小于半格，切掉的四个角够不着格心。 */
const MODULE_CORNER = 0.25
/** 圆角码眼外框 7×7 的圆角半径：外环四角那格的格心距外角 (0.5, 0.5)，圆角超过 1.707 就盖不住它。 */
const EYE_CORNER = 1
/** 圆角码眼挖孔 5×5 的圆角半径：孔的圆角只让墨变多，啃不到外环任何一格的格心。 */
const EYE_HOLE_CORNER = 0.5
/** 圆角码眼内心 3×3 的圆角半径。 */
const EYE_CORE_CORNER = 0.75

/** logo 边长占每边模块数的上限：1/5 边长约合 4% 面积。 */
const LOGO_SIDE_DIVISOR = 5

// 格子分三类：数据模块、一律保持方块的时序与校正图形、三个码眼的 7×7 块。
const CELL_DATA = 0
const CELL_FIXED = 1
const CELL_EYE = 2

/** 没画出码时透出的空矩阵，恒等以免每次调用都换一个新数组。 */
const EMPTY_MODULES: readonly (readonly boolean[])[] = []

/**
 * 把矩阵合成一条路径的 d：每一行里连续的深色模块并成一个矩形子路径。
 * 一格一个 `<rect>` 的话，40 版满码是三万多个节点。
 */
function buildPath(modules: readonly (readonly boolean[])[], margin: number): string {
  const segments: string[] = []
  for (let row = 0; row < modules.length; row++) {
    const line = modules[row]!
    let col = 0
    while (col < line.length) {
      if (!line[col]) {
        col++
        continue
      }
      let run = 1
      while (col + run < line.length && line[col + run])
        run++
      segments.push(`M${col + margin} ${row + margin}h${run}v1h-${run}z`)
      col += run
    }
  }
  return segments.join('')
}

/**
 * 逐格标出三类：三个定位图形的 7×7 块、时序图形与校正图形、其余数据模块。
 * 时序与校正图形单列一类是因为它们不跟着码点形状变形。
 */
function classifyCells(count: number, version: number): Uint8Array {
  const cells = new Uint8Array(count * count)

  const corners: readonly (readonly [number, number])[] = [[0, 0], [0, count - 7], [count - 7, 0]]
  for (const [top, left] of corners) {
    for (let row = 0; row < 7; row++) {
      for (let col = 0; col < 7; col++)
        cells[(top + row) * count + left + col] = CELL_EYE
    }
  }

  for (let i = 0; i < count; i++) {
    if (cells[6 * count + i] === CELL_DATA)
      cells[6 * count + i] = CELL_FIXED
    if (cells[i * count + 6] === CELL_DATA)
      cells[i * count + 6] = CELL_FIXED
  }

  const positions = qrAlignmentPositions(version)
  const last = positions.length - 1
  for (let i = 0; i <= last; i++) {
    for (let j = 0; j <= last; j++) {
      // 三个角上的校正图形压在定位图形里，不单独标
      if ((i === 0 && j === 0) || (i === 0 && j === last) || (i === last && j === 0))
        continue
      for (let dr = -2; dr <= 2; dr++) {
        for (let dc = -2; dc <= 2; dc++) {
          const at = (positions[i]! + dr) * count + positions[j]! + dc
          if (cells[at] === CELL_DATA)
            cells[at] = CELL_FIXED
        }
      }
    }
  }
  return cells
}

/** 一段横向游程的方块，与合并路径同一种写法。 */
function runRect(x: number, y: number, run: number): string {
  return `M${x} ${y}h${run}v1h-${run}z`
}

/** 一格的内切圆：起点取圆的最左点，两段半圆合成整圆。 */
function dotCell(x: number, y: number): string {
  const r = DOT_RADIUS
  return `M${x} ${y + r}a${r} ${r} 0 1 0 ${r * 2} 0a${r} ${r} 0 1 0 ${-r * 2} 0z`
}

/**
 * 矩形子路径。clockwise 决定绕向：同一条 d 里外框顺绕、挖孔逆绕，
 * 按非零填充规则得到一个中空的环。
 */
function rectPath(x: number, y: number, w: number, h: number, clockwise: boolean): string {
  return clockwise ? `M${x} ${y}h${w}v${h}h${-w}z` : `M${x} ${y}v${h}h${w}v${-h}z`
}

/** 圆角矩形子路径，绕向含义与 rectPath 相同。 */
function roundedRectPath(x: number, y: number, w: number, h: number, r: number, clockwise: boolean): string {
  const ix = w - r * 2
  const iy = h - r * 2
  if (clockwise) {
    return `M${x + r} ${y}h${ix}a${r} ${r} 0 0 1 ${r} ${r}v${iy}a${r} ${r} 0 0 1 ${-r} ${r}`
      + `h${-ix}a${r} ${r} 0 0 1 ${-r} ${-r}v${-iy}a${r} ${r} 0 0 1 ${r} ${-r}z`
  }
  return `M${x} ${y + r}v${iy}a${r} ${r} 0 0 0 ${r} ${r}h${ix}a${r} ${r} 0 0 0 ${r} ${-r}`
    + `v${-iy}a${r} ${r} 0 0 0 ${-r} ${-r}h${-ix}a${r} ${r} 0 0 0 ${-r} ${r}z`
}

/** 一个 7×7 定位图形：外框挖掉 5×5 得到外环，再补一个 3×3 的内心。 */
function eyeAt(x: number, y: number, shape: QrEyeShape): string {
  if (shape === 'rounded') {
    return roundedRectPath(x, y, 7, 7, EYE_CORNER, true)
      + roundedRectPath(x + 1, y + 1, 5, 5, EYE_HOLE_CORNER, false)
      + roundedRectPath(x + 2, y + 2, 3, 3, EYE_CORE_CORNER, true)
  }
  return rectPath(x, y, 7, 7, true)
    + rectPath(x + 1, y + 1, 5, 5, false)
    + rectPath(x + 2, y + 2, 3, 3, true)
}

/** 左上、右上、左下三个定位图形合成一条 d。 */
function buildEyePath(count: number, margin: number, shape: QrEyeShape): string {
  const near = margin
  const far = margin + count - 7
  return eyeAt(near, near, shape) + eyeAt(far, near, shape) + eyeAt(near, far, shape)
}

/**
 * 除码眼以外的模块合成一条 d：码眼那 3 块 7×7 留给 buildEyePath。
 * 方块码点、以及一律保持方块的时序与校正图形，横向连续的同类并成一个矩形；
 * 圆点与圆角码点一格一段。
 */
function buildShapedPath(
  modules: readonly (readonly boolean[])[],
  cells: Uint8Array,
  count: number,
  margin: number,
  shape: QrModuleShape,
): string {
  const merged = shape === 'square'
  const segments: string[] = []
  for (let row = 0; row < count; row++) {
    const line = modules[row]!
    let col = 0
    while (col < count) {
      const kind = cells[row * count + col]!
      if (!line[col] || kind === CELL_EYE) {
        col++
        continue
      }
      if (merged || kind === CELL_FIXED) {
        let run = 1
        while (col + run < count && line[col + run]) {
          const next = cells[row * count + col + run]!
          if (next === CELL_EYE || (!merged && next !== CELL_FIXED))
            break
          run++
        }
        segments.push(runRect(col + margin, row + margin, run))
        col += run
        continue
      }
      segments.push(shape === 'dot'
        ? dotCell(col + margin, row + margin)
        : roundedRectPath(col + margin, row + margin, 1, 1, MODULE_CORNER, true))
      col++
    }
  }
  return segments.join('')
}

/**
 * 中心留给 logo 的正方形边长，单位是模块：取不超过每边模块数 1/5 的最大奇数。
 * 每边模块数恒为奇数，取奇数边长才能整格居中，挖空的四条边不会切开半个模块。
 */
function logoSideModules(count: number): number {
  const limit = Math.floor(count / LOGO_SIDE_DIVISOR)
  return limit % 2 === 0 ? limit - 1 : limit
}

/**
 * 取一个非负整数档位。
 * 没给、给了 null、或给了非有限数一律落回缺省值：NaN 会一路写进 viewBox 与内联尺寸，
 * 得到的是一个不报错也不显示的 `viewBox="0 0 NaN NaN"`。
 */
function resolveNumber(value: number | undefined, fallback: number): number {
  return typeof value === 'number' && Number.isFinite(value) ? Math.max(0, Math.trunc(value)) : fallback
}

/**
 * QrCode 无状态机：矩阵全部由 props 算出。
 *
 * 矩阵只在这里算一遍，适配器直接取 api 上现成的 `path` / `eyePath` / `logoArea` 画，两端不各算一次。
 *
 * 码点与码眼都是缺省形状时走合并路径，整张码（含三个码眼）合成 `path` 一条；
 * 任一形状不是缺省值时码眼另起 `eyePath`，两条分开是因为它们的形状与颜色都可能不同。
 *
 * 编码失败（内容超出 40 版容量）不往外抛：抛在 Vue 的 computed 或 WC 的 wire 里会连累整棵树。
 * 改成落到 `state: 'error'` 并且一个模块都不铺——宁可什么都不画，也不画一张扫出半截内容的码。
 *
 * 命名分两态且互斥，与 Icon 同一套判据：
 * · 有名字 → role="img" + aria-label，不写 aria-hidden；
 * · 无名字（label 与 value 都是空白） → aria-hidden="true"，不写 role 与 aria-label。
 */
export function connectQrCode<T extends PropTypes>(
  props: QrCodeProps,
  normalize: NormalizeProps<T>,
): QrCodeApi<T> {
  const value = props.value ?? ''
  const level = props.level ?? DEFAULT_LEVEL
  const margin = resolveNumber(props.margin, DEFAULT_MARGIN)
  const size = resolveNumber(props.size, DEFAULT_SIZE)
  const moduleShape = props.moduleShape ?? DEFAULT_MODULE_SHAPE
  const eyeShape = props.eyeShape ?? DEFAULT_EYE_SHAPE

  let modules = EMPTY_MODULES
  let version = 0
  let state: QrCodeState = 'empty'
  let error: string | undefined
  if (value !== '') {
    try {
      const matrix = qrEncode(value, level)
      modules = matrix.modules
      version = matrix.version
      state = 'ready'
    }
    catch (cause) {
      state = 'error'
      error = cause instanceof Error ? cause.message : String(cause)
    }
  }

  const count = version === 0 ? 0 : 4 * version + 17
  const viewBox = `0 0 ${count + margin * 2} ${count + margin * 2}`

  const splitEyes = moduleShape !== DEFAULT_MODULE_SHAPE || eyeShape !== DEFAULT_EYE_SHAPE
  let path = ''
  let eyePath = ''
  if (version !== 0) {
    if (splitEyes) {
      path = buildShapedPath(modules, classifyCells(count, version), count, margin, moduleShape)
      eyePath = buildEyePath(count, margin, eyeShape)
    }
    else {
      path = buildPath(modules, margin)
    }
  }

  let logoArea: QrCodeLogoArea | undefined
  if (props.logo === true && version !== 0) {
    const side = logoSideModules(count)
    const at = margin + (count - side) / 2
    logoArea = { x: at, y: at, size: side }
  }

  // 空串与纯空白不算给过名字：认了它就得到一个有 role="img" 却没有名字的对象，读屏只报"图像"
  const named = props.label ?? value
  const label = named.trim() === '' ? undefined : named

  return {
    modules,
    version,
    count,
    margin,
    viewBox,
    path,
    eyePath,
    logoArea,
    state,
    error,
    label,

    getRootProps: () => normalize.element({
      ...parts.root.attrs,
      'viewBox': viewBox,
      // 缺省形状全是轴对齐的方块，边界都落在整数坐标上，交给渲染器按整像素画，
      // 边缘不出现半透明的过渡带；带圆弧的形状按整像素画会变成锯齿，改走精确几何
      'shape-rendering': splitEyes ? 'geometricPrecision' : 'crispEdges',
      'role': label === undefined ? undefined : 'img',
      'aria-label': label,
      'aria-hidden': label === undefined ? 'true' : undefined,
      'data-level': level,
      // 没画出码时这两个属性不写，皮肤与调试都不会读到一个假的版本号
      'data-version': version === 0 ? undefined : String(version),
      'data-modules': version === 0 ? undefined : String(count),
      'data-state': state,
      // 码面上留了 logo 位；皮肤据此不做别的事，留给作者当选择器用
      'data-logo': dataAttr(logoArea !== undefined),
      'style': { inlineSize: `${size}px`, blockSize: `${size}px` },
    }),

    // 没画出码时收成 0 宽 0 高：viewBox 里只剩静区，这块摆哪儿都不对，
    // 而宽高为 0 的嵌套 <svg> 连同里面的图形一起不渲染
    getLogoProps: () => normalize.element({
      ...parts.logo.attrs,
      // 嵌套 <svg> 自带裁剪，作者的图形溢不出这块方框；里面写 100% 即铺满这块
      x: logoArea?.x ?? 0,
      y: logoArea?.y ?? 0,
      width: logoArea?.size ?? 0,
      height: logoArea?.size ?? 0,
    }),
  }
}
