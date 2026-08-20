import type { SignaturePadDrawingOptions, SignaturePadPoint, SignaturePadStroke, SignaturePadSurface } from './signature-pad.types'

/** 笔画宽度的缺省值，单位像素。 */
export const SIGNATURE_PAD_SIZE = 4

/** 相邻两点的最小间距：低于它的移动是手抖或采样噪声，收进来只会让轮廓自交，还白涨点数。 */
export const SIGNATURE_PAD_MIN_DISTANCE = 1

/** 半径下限：半径为 0 的那一段会退化成一条没有面积的缝，填充出来什么都看不见。 */
const MIN_RADIUS = 0.1

interface Vec {
  x: number
  y: number
}

function clamp01(value: number): number {
  if (!Number.isFinite(value))
    return 0
  return Math.min(Math.max(value, 0), 1)
}

/** 路径里的数字统一保留两位小数：再多的位数只是浮点尾巴，白撑大 d 串。 */
function num(value: number): string {
  return String(Math.round(value * 100) / 100)
}

/** 两点间距。坐标不是有限数时按 0 算。 */
export function pointDistance(a: Vec, b: Vec): number {
  const dx = b.x - a.x
  const dy = b.y - a.y
  const d = Math.sqrt(dx * dx + dy * dy)
  return Number.isFinite(d) ? d : 0
}

/**
 * 由落笔速度模拟压感：两点间距越大说明手划得越快，压感越轻。
 * 下限 0.2 而不是 0——压感为 0 的那一段会细成一条看不见的线。
 */
export function simulatedPressure(distance: number, size: number = SIGNATURE_PAD_SIZE): number {
  const span = Math.max(size, 1) * 2
  const raw = 1 - distance / span
  if (!Number.isFinite(raw))
    return 0.2
  return Math.min(Math.max(raw, 0.2), 1)
}

/** 某一点上的笔画半径。thinning 为 0（默认）时压感不参与，粗细恒定。 */
export function strokeRadius(pressure: number, options: SignaturePadDrawingOptions = {}): number {
  const half = Math.max(options.size ?? SIGNATURE_PAD_SIZE, 0) / 2
  const thinning = clamp01(options.thinning ?? 0)
  return Math.max(half * (1 - thinning * (1 - clamp01(pressure))), MIN_RADIUS)
}

/** 丢掉坐标不是有限数的点，以及与前一点完全重合的点——重合点量不出走向。 */
function usablePoints(points: readonly SignaturePadPoint[]): SignaturePadPoint[] {
  const out: SignaturePadPoint[] = []
  for (const point of points) {
    if (!Number.isFinite(point.x) || !Number.isFinite(point.y))
      continue
    const last = out[out.length - 1]
    if (last && last.x === point.x && last.y === point.y)
      continue
    out.push(point)
  }
  return out
}

/** 该点处的走向（单位向量）：取前后两点的连线，端点退回相邻那一段；量不出方向时按 +x。 */
function tangentAt(points: readonly Vec[], index: number): Vec {
  const prev = points[index - 1] ?? points[index]!
  const next = points[index + 1] ?? points[index]!
  const dx = next.x - prev.x
  const dy = next.y - prev.y
  const len = Math.sqrt(dx * dx + dy * dy)
  if (!(len > 0))
    return { x: 1, y: 0 }
  return { x: dx / len, y: dy / len }
}

/** 半圆笔帽：从当前点绕到对面那一点，鼓向笔画之外。 */
function cap(radius: number, to: Vec): string {
  return `A${num(radius)} ${num(radius)} 0 0 0 ${num(to.x)} ${num(to.y)}`
}

/** 单点成笔：画一个圆点，两段半圆弧闭合。 */
function dotPath(point: SignaturePadPoint, radius: number): string {
  const r = num(radius)
  const west = num(point.x - radius)
  const east = num(point.x + radius)
  const y = num(point.y)
  return `M${west} ${y}A${r} ${r} 0 1 0 ${east} ${y}A${r} ${r} 0 1 0 ${west} ${y}Z`
}

/**
 * 一笔的轮廓：左右两侧各偏移半个笔宽，两端补半圆笔帽，闭成一条可填充的路径。
 *
 * 产出的是填充轮廓而不是描边中线：粗细要随压感变，而 stroke-width 全线只有一个值。
 * 点不足时退化成一个圆点。轮廓自交由 nonzero 填充规则兜住，重叠处照样是实心。
 */
export function pathFromPoints(
  points: readonly SignaturePadPoint[],
  options: SignaturePadDrawingOptions = {},
): string {
  const pts = usablePoints(points)
  if (pts.length === 0)
    return ''
  const radii = pts.map(point => strokeRadius(point.pressure, options))
  if (pts.length === 1)
    return dotPath(pts[0]!, radii[0]!)

  const left: Vec[] = []
  const right: Vec[] = []
  for (let i = 0; i < pts.length; i++) {
    // 法线是走向逆时针转 90°：左侧加它、右侧减它
    const dir = tangentAt(pts, i)
    const r = radii[i]!
    left.push({ x: pts[i]!.x - dir.y * r, y: pts[i]!.y + dir.x * r })
    right.push({ x: pts[i]!.x + dir.y * r, y: pts[i]!.y - dir.x * r })
  }

  const last = pts.length - 1
  const d = [`M${num(left[0]!.x)} ${num(left[0]!.y)}`]
  for (let i = 1; i <= last; i++)
    d.push(`L${num(left[i]!.x)} ${num(left[i]!.y)}`)
  d.push(cap(radii[last]!, right[last]!))
  for (let i = last - 1; i >= 0; i--)
    d.push(`L${num(right[i]!.x)} ${num(right[i]!.y)}`)
  d.push(cap(radii[0]!, left[0]!))
  return `${d.join('')}Z`
}

/**
 * 已经算过的笔画轮廓，按笔画对象的身份存。
 * 机器每收一个点就换一个新的笔画对象，写完的那些笔身份不再变，于是只有正在写的那一笔要重算。
 * 就地改 stroke.points 会读到旧结果：笔画对象在机器里是只建不改的。
 */
const outlineCache = new WeakMap<SignaturePadStroke, { key: string, d: string }>()

/** 影响轮廓形状的两项选项；压感来源只改点上记的值，不改这里的算法。 */
function outlineKey(options: SignaturePadDrawingOptions): string {
  return `${options.size ?? ''}|${options.thinning ?? ''}`
}

/** 一笔的轮廓，命中缓存就直接给。 */
function strokeOutline(stroke: SignaturePadStroke, options: SignaturePadDrawingOptions): string {
  const key = outlineKey(options)
  const hit = outlineCache.get(stroke)
  if (hit && hit.key === key)
    return hit.d
  const d = pathFromPoints(stroke.points, options)
  outlineCache.set(stroke, { key, d })
  return d
}

/** 逐笔转成 d 串；画不出形状的那一笔（一个可用点都没有）不占位。 */
export function strokesToPaths(
  strokes: readonly SignaturePadStroke[],
  options: SignaturePadDrawingOptions = {},
): string[] {
  const out: string[] = []
  for (const stroke of strokes) {
    const d = strokeOutline(stroke, options)
    if (d !== '')
      out.push(d)
  }
  return out
}

/** 最后那一笔的轮廓；一笔都没有时是空串。 */
export function lastStrokePath(
  strokes: readonly SignaturePadStroke[],
  options: SignaturePadDrawingOptions = {},
): string {
  const last = strokes[strokes.length - 1]
  return last ? strokeOutline(last, options) : ''
}

/**
 * 把逐笔的 d 串装成一份独立 SVG 文档，可直接落库或随表单提交。
 * 填充写 currentColor：单独打开时按浏览器的初始文字色画，内嵌进页面时跟着上下文走。
 */
export function signaturePadSvg(paths: readonly string[], surface: SignaturePadSurface): string {
  if (paths.length === 0)
    return ''
  const w = Math.round(surface.width)
  const h = Math.round(surface.height)
  // 画布还没量到尺寸时不写视窗：写成 0 0 0 0 会把整张图缩没
  const box = w > 0 && h > 0 ? ` width="${w}" height="${h}" viewBox="0 0 ${w} ${h}"` : ''
  const body = paths.map(d => `<path d="${d}"/>`).join('')
  return `<svg xmlns="http://www.w3.org/2000/svg"${box}><g fill="currentColor">${body}</g></svg>`
}
