// 把路径展平成折线多边形：弧与贝塞尔按细步长取样。用来量面积、查点的位置，检验形状的几何性质。

import type { PathSink } from '../../src'

type Pt = [number, number]

export interface FlatPath extends PathSink {
  /** 每个子路径展平后的顶点。 */
  readonly subpaths: Pt[][]
  /** 各子路径带符号面积之和的绝对值（非零环绕：反向的内圈抵消外圈）。 */
  area: () => number
  /** 所有顶点。 */
  points: () => Pt[]
}

export function flatten(steps = 256): FlatPath {
  const subpaths: Pt[][] = []
  let current: Pt[] | null = null
  let start: Pt = [0, 0]
  const last = (): Pt => (current && current.length > 0 ? current[current.length - 1]! : start)
  const push = (x: number, y: number): void => {
    if (!current) {
      current = []
      subpaths.push(current)
    }
    current.push([x, y])
  }
  const sink: FlatPath = {
    subpaths,
    moveTo(x, y) {
      current = [[x, y]]
      subpaths.push(current)
      start = [x, y]
    },
    lineTo: (x, y) => push(x, y),
    bezierCurveTo(x1, y1, x2, y2, x, y) {
      const [x0, y0] = last()
      for (let i = 1; i <= steps; i++) {
        const t = i / steps
        const u = 1 - t
        push(
          u * u * u * x0 + 3 * u * u * t * x1 + 3 * u * t * t * x2 + t * t * t * x,
          u * u * u * y0 + 3 * u * u * t * y1 + 3 * u * t * t * y2 + t * t * t * y,
        )
      }
    },
    quadraticCurveTo(x1, y1, x, y) {
      const [x0, y0] = last()
      for (let i = 1; i <= steps; i++) {
        const t = i / steps
        const u = 1 - t
        push(u * u * x0 + 2 * u * t * x1 + t * t * x, u * u * y0 + 2 * u * t * y1 + t * t * y)
      }
    },
    arc(x, y, r, a0, a1, ccw = false) {
      let sweep = ccw ? a0 - a1 : a1 - a0
      if (sweep < 0)
        sweep = (sweep % (2 * Math.PI)) + 2 * Math.PI
      sweep = Math.min(sweep, 2 * Math.PI)
      const n = Math.max(2, Math.ceil((steps * sweep) / (2 * Math.PI)))
      for (let i = 0; i <= n; i++) {
        const a = a0 + (ccw ? -1 : 1) * sweep * (i / n)
        push(x + r * Math.cos(a), y + r * Math.sin(a))
      }
    },
    arcTo(x1, y1, x2, y2, r) {
      const [x0, y0] = last()
      const l01 = Math.hypot(x0 - x1, y0 - y1)
      const l21 = Math.hypot(x2 - x1, y2 - y1)
      const u01: Pt = [(x0 - x1) / l01, (y0 - y1) / l01]
      const u21: Pt = [(x2 - x1) / l21, (y2 - y1) / l21]
      const half = Math.acos(Math.max(-1, Math.min(1, u01[0] * u21[0] + u01[1] * u21[1]))) / 2
      if (r === 0 || !Number.isFinite(half) || half < 1e-9 || Math.abs(half - Math.PI / 2) < 1e-9) {
        push(x1, y1)
        return
      }
      const bis: Pt = [u01[0] + u21[0], u01[1] + u21[1]]
      const bl = Math.hypot(bis[0], bis[1])
      const cx = x1 + (bis[0] / bl) * (r / Math.sin(half))
      const cy = y1 + (bis[1] / bl) * (r / Math.sin(half))
      const t = r / Math.tan(half)
      const a: Pt = [x1 + u01[0] * t, y1 + u01[1] * t]
      const b: Pt = [x1 + u21[0] * t, y1 + u21[1] * t]
      push(a[0], a[1])
      const a0 = Math.atan2(a[1] - cy, a[0] - cx)
      let d = Math.atan2(b[1] - cy, b[0] - cx) - a0
      while (d > Math.PI) d -= 2 * Math.PI
      while (d < -Math.PI) d += 2 * Math.PI
      for (let i = 1; i <= steps; i++)
        push(cx + r * Math.cos(a0 + (d * i) / steps), cy + r * Math.sin(a0 + (d * i) / steps))
    },
    rect(x, y, w, h) {
      sink.moveTo(x, y)
      push(x + w, y)
      push(x + w, y + h)
      push(x, y + h)
    },
    closePath() {
      current = null
    },
    area() {
      let total = 0
      for (const poly of subpaths) {
        for (let i = 0; i < poly.length; i++) {
          const [ax, ay] = poly[i]!
          const [bx, by] = poly[(i + 1) % poly.length]!
          total += ax * by - bx * ay
        }
      }
      return Math.abs(total / 2)
    },
    points: () => subpaths.flat(),
  }
  return sink
}
