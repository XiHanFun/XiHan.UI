/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 边缘折射：backdrop-filter 引用一段 SVG 位移滤镜，只在距边缘 bezel 以内把下层内容朝中心拉弯。
//
// 只有 Chromium 内核渲染 SVG 背景滤镜。其余引擎能解析 url()，却不渲染，元素连模糊都会丢掉，
// 所以不能用 CSS.supports 判断，按内核品牌门控。

const SVG_NS = 'http://www.w3.org/2000/svg'
/** 位移图按这个比例缩小生成，再由 feImage 拉伸回原尺寸：位移本身是平滑的，缩小生成不损失形状。 */
export const MAP_SCALE = 0.25
/** 超过这个尺寸不折射：大面积折射开销高，而大面本就不该是液态。 */
export const MAX_REFRACT_WIDTH = 640
export const MAX_REFRACT_HEIGHT = 120

/** 本内核能否渲染 SVG 背景滤镜。 */
export function supportsRefraction(nav: Navigator | undefined): boolean {
  const brands = (nav as { userAgentData?: { brands?: Array<{ brand: string }> } } | undefined)?.userAgentData?.brands
  return !!brands?.some(entry => /Chromium/.test(entry.brand))
}

/**
 * 圆角矩形的位移场：返回 [dx, dy]，取值 -1–1。只在距边缘 bezel 以内有值，方向为边缘法线向内，
 * 强度按平滑步进从边缘向内衰减——边缘处像凸透镜一样把内容放大、拉弯。
 */
export function displacementAt(px: number, py: number, width: number, height: number, radius: number, bezel: number): [number, number] {
  const hw = width / 2
  const hh = height / 2
  const x = px - hw
  const y = py - hh
  const qx = Math.abs(x) - (hw - radius)
  const qy = Math.abs(y) - (hh - radius)
  const outside = Math.hypot(Math.max(qx, 0), Math.max(qy, 0))
  const inside = -(outside + Math.min(Math.max(qx, qy), 0) - radius)
  if (inside < 0 || inside >= bezel)
    return [0, 0]
  let nx: number
  let ny: number
  if (qx > 0 && qy > 0) {
    nx = qx / outside
    ny = qy / outside
  }
  else if (qx > qy) {
    nx = 1
    ny = 0
  }
  else {
    nx = 0
    ny = 1
  }
  nx *= Math.sign(x) || 1
  ny *= Math.sign(y) || 1
  const t = 1 - inside / bezel
  const magnitude = t * t * (3 - 2 * t)
  return [-nx * magnitude, -ny * magnitude]
}

/** 生成位移图（R、G 编码 x、y，128 为零），返回 PNG data URL。宿主没有画布时返回 null。 */
export function displacementMap(doc: Document, width: number, height: number, radius: number, bezel: number): string | null {
  const w = Math.max(2, Math.round(width * MAP_SCALE))
  const h = Math.max(2, Math.round(height * MAP_SCALE))
  const canvas = doc.createElement('canvas')
  canvas.width = w
  canvas.height = h
  const context = canvas.getContext('2d')
  if (!context)
    return null
  const image = context.createImageData(w, h)
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const [dx, dy] = displacementAt((x + 0.5) / MAP_SCALE, (y + 0.5) / MAP_SCALE, width, height, radius, bezel)
      const i = (y * w + x) * 4
      image.data[i] = 128 + dx * 127
      image.data[i + 1] = 128 + dy * 127
      image.data[i + 2] = 128
      image.data[i + 3] = 255
    }
  }
  context.putImageData(image, 0, 0)
  return canvas.toDataURL()
}

export interface LensSpec {
  width: number
  height: number
  radius: number
  bezel: number
  /** 背景滤镜里原有的模糊半径（px）与饱和度，折射滤镜内照做一遍。 */
  blur: number
  saturate: number
}

/** 从静态的 backdrop-filter 计算值里取出模糊半径与饱和度；是 none 时返回 null（减弱透明、高对比档）。 */
export function parseBackdrop(value: string): { blur: number, saturate: number } | null {
  if (!value || value === 'none')
    return null
  const blur = Number(/blur\(([\d.]+)px\)/.exec(value)?.[1] ?? 0)
  const saturate = Number(/saturate\(([\d.]+)\)/.exec(value)?.[1] ?? 1)
  return { blur, saturate }
}

export function lensKey(spec: LensSpec): string {
  // id 里不留小数点：url(#…) 与选择器里都得转义，写成下划线省掉这一步
  return `xh-liquid-lens-${Math.round(spec.width)}x${Math.round(spec.height)}-${Math.round(spec.radius)}-${spec.bezel}-${spec.blur}-${spec.saturate}`.replace(/\./g, '_')
}

/** 在宿主文档的滤镜库里取（没有就建）一段折射滤镜，返回它的 id；宿主没有画布时返回 null。 */
export function ensureLens(library: SVGDefsElement, spec: LensSpec): string | null {
  const id = lensKey(spec)
  if (library.querySelector(`#${CSS.escape(id)}`))
    return id
  const doc = library.ownerDocument
  const map = displacementMap(doc, spec.width, spec.height, spec.radius, spec.bezel)
  if (!map)
    return null
  const filter = doc.createElementNS(SVG_NS, 'filter')
  const attrs: Record<string, string> = {
    'id': id,
    'x': '0',
    'y': '0',
    'width': String(Math.round(spec.width)),
    'height': String(Math.round(spec.height)),
    'filterUnits': 'userSpaceOnUse',
    'primitiveUnits': 'userSpaceOnUse',
    // 缺省的 linearRGB 会把位移图的 128 当成非零，整面偏移
    'color-interpolation-filters': 'sRGB',
  }
  for (const [name, value] of Object.entries(attrs))
    filter.setAttribute(name, value)
  const blur = doc.createElementNS(SVG_NS, 'feGaussianBlur')
  blur.setAttribute('in', 'SourceGraphic')
  blur.setAttribute('stdDeviation', String(spec.blur))
  blur.setAttribute('result', 'blurred')
  const image = doc.createElementNS(SVG_NS, 'feImage')
  image.setAttribute('href', map)
  image.setAttribute('x', '0')
  image.setAttribute('y', '0')
  image.setAttribute('width', String(Math.round(spec.width)))
  image.setAttribute('height', String(Math.round(spec.height)))
  image.setAttribute('preserveAspectRatio', 'none')
  image.setAttribute('result', 'map')
  const displace = doc.createElementNS(SVG_NS, 'feDisplacementMap')
  displace.setAttribute('in', 'blurred')
  displace.setAttribute('in2', 'map')
  displace.setAttribute('scale', String(Math.round(spec.bezel * 2.2)))
  displace.setAttribute('xChannelSelector', 'R')
  displace.setAttribute('yChannelSelector', 'G')
  displace.setAttribute('result', 'bent')
  const saturate = doc.createElementNS(SVG_NS, 'feColorMatrix')
  saturate.setAttribute('in', 'bent')
  saturate.setAttribute('type', 'saturate')
  saturate.setAttribute('values', String(spec.saturate))
  filter.append(blur, image, displace, saturate)
  library.append(filter)
  return id
}

/** 宿主文档里的滤镜库：一个不占位、读屏看不到的 <svg>。 */
export function lensLibrary(doc: Document): SVGDefsElement {
  const existing = doc.querySelector<SVGDefsElement>('svg[data-xh-liquid-lenses] > defs')
  if (existing)
    return existing
  const svg = doc.createElementNS(SVG_NS, 'svg')
  svg.setAttribute('data-xh-liquid-lenses', '')
  svg.setAttribute('aria-hidden', 'true')
  svg.setAttribute('width', '0')
  svg.setAttribute('height', '0')
  svg.setAttribute('style', 'position: absolute; inline-size: 0; block-size: 0; overflow: hidden')
  const defs = doc.createElementNS(SVG_NS, 'defs')
  svg.append(defs)
  doc.body.append(svg)
  return defs
}
