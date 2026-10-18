/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// @xihan-ui/core/svg-export —— 把页面上的 SVG 导出成文件：克隆成能独立打开的一份（计算样式内联成属性），
// 序列化成文本，再按倍率与背景栅格化成 PNG。只在浏览器里用：要读计算样式、要用 Image 与 canvas。

import { colorParse, colorRgbaToHex } from '../color'

const SVG_NS = 'http://www.w3.org/2000/svg'

/**
 * 内联进独立 SVG 的表现属性与它们的初始值：填充与描边、透明度、文字的字体与排布、可见性。
 * 只抄这一张白名单；计算值等于初始值的不写，独立 SVG 里缺省就是它。
 */
const PRESENTATION: Readonly<Record<string, string | undefined>> = {
  'fill': undefined,
  'fill-opacity': '1',
  'stroke': undefined,
  'stroke-width': undefined,
  'stroke-opacity': '1',
  'stroke-dasharray': 'none',
  'stroke-linecap': 'butt',
  'stroke-linejoin': 'miter',
  'opacity': '1',
  'visibility': 'visible',
  'font-family': undefined,
  'font-size': undefined,
  'font-style': 'normal',
  'font-weight': undefined,
  'text-anchor': 'start',
  'dominant-baseline': 'auto',
}

/** 会继承的表现属性：子元素的值与父元素相同时不写，交给继承。opacity 不继承；dominant-baseline 在 SVG 1.1 里不继承，也逐个照写。 */
const INHERITED: ReadonlySet<string> = new Set([
  'fill',
  'fill-opacity',
  'stroke',
  'stroke-width',
  'stroke-opacity',
  'stroke-dasharray',
  'stroke-linecap',
  'stroke-linejoin',
  'visibility',
  'font-family',
  'font-size',
  'font-style',
  'font-weight',
  'text-anchor',
])

/** 颜色属性与它的透明度属性：颜色写成 #rrggbb，颜色自带的透明度乘进透明度属性。 */
const PAINT_OPACITY: Readonly<Record<string, string>> = { fill: 'fill-opacity', stroke: 'stroke-opacity' }

/** 克隆时去掉的属性：依赖页面样式表与脚本的那些（class、style、data-*、事件与交互）。id 留着，渐变、裁剪与遮罩靠它引用。 */
const DROPPED = /^(?:class|style|data-.*|on.*|aria-.*|role|tabindex)$/

/**
 * 浏览器画布的上限：单边像素数与总像素数。Chromium 与桌面 Firefox 取这两个数，超过时画布画不出东西，
 * 导出的会是一张空白图，所以先在这里拦下。
 */
const MAX_CANVAS_SIDE = 32767
const MAX_CANVAS_AREA = 268_435_456

function rejectForeignObject(): never {
  throw new TypeError('[xh] svg-export 不支持 foreignObject：带它的 SVG 画进画布后导不出 PNG，请把其中的内容画成 SVG 元素')
}

/** 透明度的小数留三位，避免浮点尾巴。 */
function opacityText(value: number): string {
  return String(Math.round(value * 1000) / 1000)
}

/**
 * 一个元素要写的表现属性值：取计算值，fill 与 stroke 认得出的颜色换成 sRGB 的 #rrggbb，
 * 颜色自带的透明度乘进 fill-opacity / stroke-opacity；认不出的颜色写法原样保留。
 */
function presentationOf(style: CSSStyleDeclaration): Record<string, string> {
  const values: Record<string, string> = {}
  for (const name of Object.keys(PRESENTATION))
    values[name] = style.getPropertyValue(name)
  for (const [paint, opacity] of Object.entries(PAINT_OPACITY)) {
    const color = colorParse(values[paint]!)
    if (!color)
      continue
    values[paint] = colorRgbaToHex(color)
    if (color.a < 1)
      values[opacity] = opacityText(Number.parseFloat(values[opacity] || '1') * color.a)
  }
  return values
}

export interface StandaloneSvgOptions {
  /** 返回 false 的元素连同子树不进克隆，如只供命中的透明粗线。缺省全收。 */
  readonly include?: (element: Element) => boolean
}

/**
 * 克隆一份能独立打开的 SVG：逐个元素把白名单里的表现属性（fill、stroke、stroke-width、stroke-dasharray、
 * stroke-linecap / linejoin、opacity、fill-opacity / stroke-opacity、font-family / size / weight / style、
 * text-anchor、dominant-baseline、visibility）按计算值写成属性，设计令牌、currentColor 与继承来的值都换成具体值。
 * 根上等于初始值的不写；会继承的属性（除 opacity 与 dominant-baseline 外都是）与父元素的值相同时不写，交给继承。
 * fill 与 stroke 的颜色换成 sRGB 的 #rrggbb，供只认 sRGB 的工具（办公软件、矢量编辑器）打开：
 * 认得的写法是 @xihan-ui/core/color 的 colorParse 收的那些（含 oklch、oklab 与 color(srgb …)），
 * 超出 sRGB 色域的按通道裁剪（每一路夹回 0-255），颜色自带的透明度乘进 fill-opacity / stroke-opacity；
 * 认不出的写法（lab、lch、display-p3 等）原样保留。
 * 去掉 class、style、data-*、事件与交互相关的属性，不再依赖页面的样式表与脚本；计算出 display: none 的元素不进克隆。
 * 遇到 foreignObject 抛 TypeError。克隆的元素都建在 SVG 命名空间里，序列化时由序列化器写出 xmlns，根上不手写这个属性。
 * source 必须在文档里（要读计算样式），返回的克隆不在文档里。
 */
export function standaloneSvg(source: SVGSVGElement, options: StandaloneSvgOptions = {}): SVGSVGElement {
  const include = options.include ?? (() => true)
  const initial = PRESENTATION as Readonly<Record<string, string | undefined>>
  const copy = (element: Element, inherited: Readonly<Record<string, string | undefined>>): Element | undefined => {
    if (!include(element))
      return undefined
    if (element.localName === 'foreignObject')
      rejectForeignObject()
    const style = getComputedStyle(element)
    if (style.display === 'none')
      return undefined
    const clone = element.ownerDocument.createElementNS(SVG_NS, element.localName)
    for (const attribute of Array.from(element.attributes)) {
      if (!DROPPED.test(attribute.name))
        clone.setAttribute(attribute.name, attribute.value)
    }
    const values = presentationOf(style)
    for (const [name, value] of Object.entries(values)) {
      if (value !== '' && value !== (INHERITED.has(name) ? inherited[name] : initial[name]))
        clone.setAttribute(name, value)
    }
    for (const child of Array.from(element.childNodes)) {
      if (child.nodeType === Node.TEXT_NODE) {
        clone.append(child.textContent ?? '')
        continue
      }
      if (child instanceof Element) {
        const next = copy(child, values)
        if (next)
          clone.append(next)
      }
    }
    return clone
  }
  return copy(source, initial) as SVGSVGElement | undefined ?? source.ownerDocument.createElementNS(SVG_NS, 'svg')
}

/**
 * 把 SVG 序列化成能单独存成 .svg 文件的文本。xmlns 由序列化器按元素的命名空间写出一份；
 * 根上再手写 xmlns 属性时，有的序列化器（如 jsdom）会写出两份，得到的文本不是合法的 XML。
 * 不在 SVG 命名空间里的元素抛 TypeError。
 */
export function serializeSvg(svg: SVGSVGElement): string {
  if (svg.namespaceURI !== SVG_NS)
    throw new TypeError('[xh] serializeSvg 只收 SVG 命名空间里的 <svg> 元素')
  return new XMLSerializer().serializeToString(svg)
}

export interface RasterizeSvgOptions {
  /** 输出图在 SVG 里的宽，缺省取 viewBox 的宽，没有 viewBox 再取根的 width 属性。 */
  readonly width?: number
  /** 输出图在 SVG 里的高，取法同 width。 */
  readonly height?: number
  /** 倍率：PNG 的像素宽高是宽高乘它，缺省 1。 */
  readonly scale?: number
  /** 先铺满的底色（任何 CSS 颜色）；不给即透明。 */
  readonly background?: string
  /**
   * 宽高乘倍率超过浏览器画布的上限（单边 32767 像素、总数 268435456 像素）时怎么办：
   * error（缺省）以 RangeError 拒绝；shrink 把倍率降到正好放得下，导出的图按比例缩小。
   */
  readonly oversize?: 'error' | 'shrink'
}

/** 根的宽高：先看 viewBox，没有再看 width / height 属性。 */
function intrinsicSize(svg: SVGSVGElement): { width: number, height: number } {
  const viewBox = (svg.getAttribute('viewBox') ?? '').trim().split(/[\s,]+/).map(Number)
  if (viewBox.length === 4 && viewBox.every(Number.isFinite))
    return { width: viewBox[2]!, height: viewBox[3]! }
  return { width: Number.parseFloat(svg.getAttribute('width') ?? ''), height: Number.parseFloat(svg.getAttribute('height') ?? '') }
}

/** 画布放得下的倍率：不超过给的倍率，也不让单边与总像素数超过上限。 */
function fittingScale(width: number, height: number, scale: number): number {
  return Math.min(scale, MAX_CANVAS_SIDE / width, MAX_CANVAS_SIDE / height, Math.sqrt(MAX_CANVAS_AREA / (width * height)))
}

/**
 * 把 SVG 栅格化成 PNG：按宽高乘倍率建画布，先铺底色（不给即透明），再把 SVG 画上去。
 * SVG 当作图片画，不加载外部资源与网页字体，文字按 font-family 用本机的系统字体画。
 * 宽高算不出、倍率不是正数、超过画布上限（oversize 为 error 时）以 RangeError 拒绝；带 foreignObject 的以 TypeError 拒绝；
 * 图载不进来或画布导不出时以错误拒绝。
 */
export async function rasterizeSvg(svg: SVGSVGElement | string, options: RasterizeSvgOptions = {}): Promise<Blob> {
  const element = typeof svg === 'string'
    ? new DOMParser().parseFromString(svg, 'image/svg+xml').documentElement as unknown as SVGSVGElement
    : svg
  if (element.localName === 'foreignObject' || element.getElementsByTagNameNS(SVG_NS, 'foreignObject').length > 0)
    rejectForeignObject()
  const size = intrinsicSize(element)
  const width = options.width ?? size.width
  const height = options.height ?? size.height
  let scale = options.scale ?? 1
  if (!(width > 0 && height > 0 && scale > 0))
    throw new RangeError(`[xh] rasterizeSvg 需要正的宽高与倍率，得到 ${width} × ${height} × ${scale}`)
  const fitting = fittingScale(width, height, scale)
  if (fitting < scale) {
    if (options.oversize !== 'shrink')
      throw new RangeError(`[xh] rasterizeSvg 的画布 ${Math.round(width * scale)} × ${Math.round(height * scale)} 超过浏览器上限，可以调小倍率或给 oversize: 'shrink'`)
    scale = fitting
  }
  const text = typeof svg === 'string' ? svg : serializeSvg(svg)
  const url = URL.createObjectURL(new Blob([text], { type: 'image/svg+xml' }))
  try {
    const image = new Image()
    image.src = url
    await image.decode()
    const canvas = document.createElement('canvas')
    canvas.width = Math.max(1, Math.floor(width * scale))
    canvas.height = Math.max(1, Math.floor(height * scale))
    const context = canvas.getContext('2d')
    if (!context)
      throw new Error('[xh] rasterizeSvg 拿不到 2d 画布')
    if (options.background !== undefined) {
      context.fillStyle = options.background
      context.fillRect(0, 0, canvas.width, canvas.height)
    }
    context.drawImage(image, 0, 0, canvas.width, canvas.height)
    return await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(blob => (blob ? resolve(blob) : reject(new Error('[xh] rasterizeSvg 导不出 PNG'))), 'image/png')
    })
  }
  finally {
    URL.revokeObjectURL(url)
  }
}
