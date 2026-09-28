/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 画布的样式全部从 CSS 来：绘图区里每个系列的分组照常输出，组里放与数据标记同部件、同状态属性、空几何的样式探针，
// 这里读探针的计算样式换成画布能用的值。主题、暗色、强制色（系统色）、打印、纹理、作者对系列色的覆盖与淡出的过渡
// 都由同一份 CSS 决定；画布拿到的就是 SVG 那一个标记此刻会画的颜色与线宽。

import type { CssColor } from '@xihan-ui/viz/canvas'
import { formatSrgbColor, parseCssColor } from '@xihan-ui/viz/canvas'

/** 一个探针的画法：填充、描边、线宽、虚线与不透明度，已换成画布能用的值。 */
export interface ChartPaint {
  /** 颜色串或纹理；none 与全透明为 null。 */
  readonly fill: string | CanvasPattern | null
  readonly fillOpacity: number
  readonly stroke: string | CanvasPattern | null
  readonly strokeWidth: number
  readonly strokeOpacity: number
  /** 虚线的线段与间隔（px）；实线为空表。 */
  readonly dash: readonly number[]
  readonly lineJoin: CanvasLineJoin
  readonly lineCap: CanvasLineCap
  /** 元素自己的不透明度（标记被单独淡出时）。 */
  readonly opacity: number
  /** 计算样式里原样的颜色串：顺序色阶按它的原空间插值。 */
  readonly fillColor: CssColor | null
}

/** 样式读取器：一次重绘里建一个，颜色写法的支持与纹理跨重绘缓存在宿主里。 */
export interface ChartStyleReader {
  /** 读一个探针的画法。 */
  readonly read: (el: Element) => ChartPaint
  /** 读一个元素的计算不透明度（系列分组的淡出）。 */
  readonly opacity: (el: Element) => number
  /** 颜色串换成画布认得的写法：画布不认的函数式按浏览器在 sRGB 屏上的画法截断成 rgb()。 */
  readonly color: (css: string) => string
}

/** 跨重绘的缓存：颜色写法的支持情况与纹理图块。 */
export interface ChartStyleCache {
  readonly supported: Map<string, boolean>
  readonly patterns: Map<string, CanvasPattern | null>
}

export function createChartStyleCache(): ChartStyleCache {
  return { supported: new Map(), patterns: new Map() }
}

/** 探测值：一个不会被当作颜色误用的颜色串，赋值前后比较 fillStyle 是否变了。 */
const SENTINEL = '#010203'

function number(text: string, fallback: number): number {
  const value = Number.parseFloat(text)
  return Number.isFinite(value) ? value : fallback
}

/** 不透明度：数或百分比。 */
function alpha(text: string): number {
  const trimmed = text.trim()
  if (trimmed.endsWith('%'))
    return Math.min(1, Math.max(0, number(trimmed, 100) / 100))
  return Math.min(1, Math.max(0, number(trimmed, 1)))
}

/** 虚线：「8px, 4px」或「none」。 */
function dashOf(text: string): number[] {
  if (!text || text === 'none')
    return []
  const values = text.split(/[\s,]+/).filter(Boolean).map(part => number(part, 0))
  return values.every(v => v === 0) ? [] : values
}

/** url("#id") 里的 id；不是 url() 时为 null。 */
function urlId(text: string): string | null {
  const start = text.indexOf('url(')
  if (start < 0)
    return null
  const inner = text.slice(start + 4, text.indexOf(')', start)).trim().replace(/^["']|["']$/g, '')
  return inner.startsWith('#') ? inner.slice(1) : null
}

/** 纹理的旋转角：patternTransform 里的 rotate(a)。 */
function rotationOf(transform: string | null): number {
  if (!transform)
    return 0
  const start = transform.indexOf('rotate(')
  return start < 0 ? 0 : number(transform.slice(start + 7), 0)
}

/**
 * 建一次重绘用的读取器。ctx 用来判断画布认不认某种颜色写法、建纹理图块；dpr 让纹理图块按设备像素画。
 */
export function createChartStyleReader(ctx: CanvasRenderingContext2D, dpr: number, cache: ChartStyleCache): ChartStyleReader {
  const view = ctx.canvas.ownerDocument?.defaultView ?? globalThis.window
  const color = (css: string): string => {
    let ok = cache.supported.get(css)
    if (ok === undefined) {
      const previous = ctx.fillStyle
      ctx.fillStyle = SENTINEL
      ctx.fillStyle = css
      ok = ctx.fillStyle !== SENTINEL || css.trim().toLowerCase() === SENTINEL
      ctx.fillStyle = previous
      cache.supported.set(css, ok)
    }
    if (ok)
      return css
    const parsed = parseCssColor(css)
    return parsed ? formatSrgbColor(parsed) : 'transparent'
  }

  /** defs 里同 id 的纹理：按纹理线的计算描边与线宽画一个图块，按 DPR 缓存。 */
  const pattern = (el: Element, id: string): CanvasPattern | null => {
    const doc = el.ownerDocument
    const node = doc.getElementById(id)
    const line = node?.querySelector('path')
    if (!node || !line)
      return null
    const style = view.getComputedStyle(line)
    const size = number(node.getAttribute('width') ?? '', 0)
    const d = line.getAttribute('d') ?? ''
    const angle = rotationOf(node.getAttribute('patternTransform'))
    const key = `${id}|${style.stroke}|${style.strokeWidth}|${size}|${angle}|${d}|${dpr}`
    if (cache.patterns.has(key))
      return cache.patterns.get(key) ?? null
    let made: CanvasPattern | null = null
    const tileSize = Math.max(1, Math.round(size * dpr))
    if (size > 0 && d && typeof doc.createElement === 'function') {
      const tile = doc.createElement('canvas')
      tile.width = tileSize
      tile.height = tileSize
      const g = tile.getContext('2d')
      if (g && typeof Path2D === 'function') {
        g.scale(dpr, dpr)
        g.strokeStyle = color(style.stroke)
        g.lineWidth = number(style.strokeWidth, 1)
        g.lineCap = 'square'
        g.stroke(new Path2D(d))
        made = ctx.createPattern(tile, 'repeat')
        // 图块按设备像素画：缩回 CSS 像素，再按纹理自己的角度旋转，原点与 SVG 的 userSpaceOnUse 一致
        if (made && typeof DOMMatrix === 'function')
          made.setTransform(new DOMMatrix().rotateSelf(angle).scaleSelf(1 / dpr))
      }
    }
    cache.patterns.set(key, made)
    return made
  }

  const paintOf = (el: Element, value: string): string | CanvasPattern | null => {
    const text = value.trim()
    if (text === '' || text === 'none')
      return null
    const id = urlId(text)
    if (id)
      return pattern(el, id)
    const parsed = parseCssColor(text)
    if (parsed && parsed.alpha === 0)
      return null
    return color(text)
  }

  return {
    read(el) {
      const style = view.getComputedStyle(el)
      const fillText = style.fill
      return {
        fill: paintOf(el, fillText),
        fillOpacity: alpha(style.fillOpacity || '1'),
        stroke: paintOf(el, style.stroke),
        strokeWidth: number(style.strokeWidth, 0),
        strokeOpacity: alpha(style.strokeOpacity || '1'),
        dash: dashOf(style.strokeDasharray),
        lineJoin: (style.strokeLinejoin || 'miter') as CanvasLineJoin,
        lineCap: (style.strokeLinecap || 'butt') as CanvasLineCap,
        opacity: alpha(style.opacity || '1'),
        fillColor: parseCssColor(fillText),
      }
    },
    opacity: el => alpha(view.getComputedStyle(el).opacity || '1'),
    color,
  }
}
