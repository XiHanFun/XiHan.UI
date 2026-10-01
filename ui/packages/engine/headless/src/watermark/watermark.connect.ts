/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 watermark 相关实现。

import type { NormalizeProps, PropTypes, Service } from '@xihan-ui/core'
import type { WatermarkApi, WatermarkProps, WatermarkSchema, WatermarkState, WatermarkTile } from './watermark.types'
import { dataAttr, DIAGNOSTIC_CODES, reportDiagnostic } from '@xihan-ui/core'
import { watermarkAnatomy } from './watermark.anatomy'

const parts = watermarkAnatomy.build()

const DEFAULT_ROTATE = -22
const DEFAULT_GAP = 24
const DEFAULT_FONT_SIZE = 14
const DEFAULT_OPACITY = 0.15

/** 字号收在这个区间：再小印不出形，再大一块图样就是几千像素见方。 */
const MIN_FONT_SIZE = 1
const MAX_FONT_SIZE = 256

/** 空白同样有上限，理由与字号一样。 */
const MAX_GAP = 512

/** 行距按字号的这个倍数算。 */
const LINE_HEIGHT_RATIO = 1.4

/** 基线相对行中线的下移量，按字号折算。 */
const BASELINE_SHIFT = 0.35

/** 没指定字体时用的通用无衬线字体。 */
const DEFAULT_FONT_FAMILY = 'sans-serif'

/** 图片印子的缺省边长。 */
const DEFAULT_IMAGE_SIZE = 64

/** 图片同样有上限，理由与字号一样。 */
const MAX_IMAGE_SIZE = 512

/** 图片与文字块之间留的空白，按字号折算。 */
const IMAGE_TEXT_GAP_RATIO = 0.4

/** 直接收进图样的图片来源前缀：内联的图片 data URI。 */
const IMAGE_PREFIX = 'data:image/'

/** 地址形式的图片可以取回的协议；不带协议的相对路径同样可取。 */
const IMAGE_ADDRESS_PROTOCOLS = ['http:', 'https:', 'blob:']

/** 窄字按这个比例折算成字宽，宽字按一个字宽算。 */
const NARROW_ADVANCE = 0.55

/** 几何值保留两位小数，同一份 props 每次算出逐字相同的图样。 */
function round(value: number): number {
  return Math.round(value * 100) / 100
}

/** 占满一个字宽的码位：汉字、假名、谚文、全角标点与绘文字。 */
function isWide(cp: number): boolean {
  return (cp >= 0x1100 && cp <= 0x115F)
    || (cp >= 0x2E80 && cp <= 0xA4CF)
    || (cp >= 0xAC00 && cp <= 0xD7A3)
    || (cp >= 0xF900 && cp <= 0xFAFF)
    || (cp >= 0xFE30 && cp <= 0xFE4F)
    || (cp >= 0xFF00 && cp <= 0xFF60)
    || (cp >= 0xFFE0 && cp <= 0xFFE6)
    || (cp >= 0x1F300 && cp <= 0x1FAFF)
}

/** 一行文字的宽度，单位是字宽；按码位逐个折算，不量真实字形。 */
function advance(line: string): number {
  let units = 0
  for (const ch of line)
    units += isWide(ch.codePointAt(0) ?? 0) ? 1 : NARROW_ADVANCE
  return units
}

const XML_ESCAPES: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  '\'': '&apos;',
}

/** 转义 XML 里有结构意义的五个字符；一个没转的 `<` 就足以把整张图样打断。 */
function escapeXml(text: string): string {
  return text.replace(/[&<>"']/g, ch => XML_ESCAPES[ch] ?? ch)
}

/** 拆成文字行：数组是多行，字符串里的换行也断行，只留下印得出东西的行。 */
function toLines(text: string | readonly string[] | undefined): string[] {
  const raw = typeof text === 'string' ? [text] : text ?? []
  return raw.flatMap(item => item.split('\n')).filter(line => line.trim() !== '')
}

/** 取一个能参与计算的数：非数字与非有限值一律退回缺省。 */
function finite(value: number | undefined, fallback: number): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback
}

function clamp(value: number | undefined, min: number, max: number, fallback: number): number {
  return Math.min(max, Math.max(min, finite(value, fallback)))
}

/** 取一段能印的字体名：空白与非字符串退回缺省。 */
function toFontFamily(value: string | undefined): string {
  return typeof value === 'string' && value.trim() !== '' ? value.trim() : DEFAULT_FONT_FAMILY
}

/** 能直接收进图样的内联图片：`data:image/` 开头的串。 */
function toInlineImage(value: string | undefined): string | undefined {
  if (typeof value !== 'string')
    return undefined
  const src = value.trim()
  if (src.slice(0, IMAGE_PREFIX.length).toLowerCase() !== IMAGE_PREFIX)
    return undefined
  return src
}

/**
 * 地址形式、要先取回再印的图片：http(s)、`blob:` 与不带协议的相对路径。
 *
 * 别的协议一律挡在入口：`javascript:` 这类值放进 `url()` 与图片地址里是一条不该开的路；
 * 内联的 `data:` 由 toInlineImage 收，非图片的 `data:` 不收。
 */
export function toWatermarkImageAddress(value: string | undefined): string | undefined {
  if (typeof value !== 'string')
    return undefined
  const src = value.trim()
  if (src === '')
    return undefined
  const scheme = /^([a-z][a-z0-9+.-]*):/i.exec(src)?.[1]
  if (scheme == null)
    return src
  return IMAGE_ADDRESS_PROTOCOLS.includes(`${scheme.toLowerCase()}:`) ? src : undefined
}

/** 一份 props 算出的图样与根节点上归本组件管的那几样：属性与两支内联变量。 */
export interface WatermarkPlan {
  lines: string[]
  tile: WatermarkTile
  image: string
  state: WatermarkState
  fullscreen: boolean
  /** 根节点上的状态属性：值为 undefined 即不该在场。 */
  attrs: Record<'data-state' | 'data-fullscreen', string | undefined>
  /** 根节点上的内联变量；没有图样时为空。 */
  vars: Record<string, string>
}

/**
 * 按 props 算出图样：一张 SVG 拼成的 data URI。用 SVG 而不是 canvas：canvas 要一个能绘图的运行时才产得出位图，
 * 服务端渲染与判据都拿不到，而 SVG 是一段可以直接比对的文本，同一份 props 每次算出逐字相同的一张图。
 * 地址形式的图片由机器取回转成内联图片后经 imageData 交进来，取回之前这张图不进图样。
 */
export function planWatermark(props: WatermarkProps, imageData: string | null = null): WatermarkPlan {
  const lines = toLines(props.text)
  const fontSize = clamp(props.fontSize, MIN_FONT_SIZE, MAX_FONT_SIZE, DEFAULT_FONT_SIZE)
  const gap = clamp(props.gap, 0, MAX_GAP, DEFAULT_GAP)
  const opacity = clamp(props.opacity, 0, 1, DEFAULT_OPACITY)
  const fontFamily = toFontFamily(props.fontFamily)
  const fullscreen = !!props.fullscreen
  const address = toWatermarkImageAddress(props.image)
  const imageSource = toInlineImage(props.image) ?? (address === undefined ? undefined : (imageData ?? undefined))
  // 收进一圈之内：转 400 度与转 40 度画出来是同一张图，而超大的角度值会写成科学计数法，SVG 认不了
  const rotate = round(finite(props.rotate, DEFAULT_ROTATE) % 360)

  const state: WatermarkState = lines.length > 0 || imageSource !== undefined ? 'ready' : 'empty'

  // 倾斜后的一行字占的地方比它自己宽也比它自己高：把未倾斜的文字块按角度投影到两条轴上，
  // 再各加一份空白，得到的就是不会让相邻两块咬在一起的最小步距
  const lineHeight = fontSize * LINE_HEIGHT_RATIO
  const textWidth = lines.reduce((max, line) => Math.max(max, advance(line)), 0) * fontSize
  const textHeight = lines.length * lineHeight
  const imageWidth = imageSource === undefined ? 0 : clamp(props.imageSize?.width, 1, MAX_IMAGE_SIZE, DEFAULT_IMAGE_SIZE)
  const imageHeight = imageSource === undefined ? 0 : clamp(props.imageSize?.height, 1, MAX_IMAGE_SIZE, DEFAULT_IMAGE_SIZE)
  // 图与字同时在场才留中间那道空白
  const imageGap = imageSource !== undefined && lines.length > 0 ? round(fontSize * IMAGE_TEXT_GAP_RATIO) : 0
  // 图摞在字上面：整块的宽取两者较宽的那个，高是两者相加再加中间的空白
  const blockWidth = Math.max(textWidth, imageWidth)
  const blockHeight = imageHeight + imageGap + textHeight
  const radians = (rotate * Math.PI) / 180
  const cos = Math.abs(Math.cos(radians))
  const sin = Math.abs(Math.sin(radians))
  const tile: WatermarkTile = state === 'ready'
    ? {
        width: Math.ceil(blockWidth * cos + blockHeight * sin + gap),
        height: Math.ceil(blockWidth * sin + blockHeight * cos + gap),
      }
    : { width: 0, height: 0 }

  const image = state === 'ready'
    ? buildImage(lines, tile, {
        fontSize,
        lineHeight,
        opacity,
        rotate,
        fontFamily,
        imageSource,
        imageWidth,
        imageHeight,
        imageGap,
        blockHeight,
      })
    : ''

  const vars: Record<string, string> = state === 'ready'
    ? { '--xh-watermark-image': `url("${image}")`, '--xh-watermark-tile': `${tile.width}px ${tile.height}px` }
    : {}

  return {
    lines,
    tile,
    image,
    state,
    fullscreen,
    attrs: { 'data-state': state, 'data-fullscreen': dataAttr(fullscreen) },
    vars,
  }
}

/** 收了 image 却一张图都印不出来时说一声，免得作者对着一块空地找原因。 */
function warnUnusableImage(image: string | undefined): void {
  if (typeof image !== 'string' || image.trim() === '')
    return
  if (toInlineImage(image) !== undefined || toWatermarkImageAddress(image) !== undefined)
    return
  reportDiagnostic({
    code: DIAGNOSTIC_CODES.warn,
    level: 'warn',
    scope: watermarkAnatomy.name,
    message: `水印图片只收 ${IMAGE_PREFIX} 开头的内联图片与 http(s)、blob、相对路径的地址，这一张不印`,
    detail: { image },
  })
}

// 图样由 props 算出；机器只承载地址形式图片的取回与防篡改两件副作用。
export function connectWatermark<T extends PropTypes>(
  service: Service<WatermarkSchema>,
  normalize: NormalizeProps<T>,
): WatermarkApi<T> {
  const { prop, context } = service
  const props: WatermarkProps = {
    text: prop('text'),
    rotate: prop('rotate'),
    gap: prop('gap'),
    fontSize: prop('fontSize'),
    opacity: prop('opacity'),
    fontFamily: prop('fontFamily'),
    image: prop('image'),
    imageSize: prop('imageSize'),
    fullscreen: prop('fullscreen'),
  }
  warnUnusableImage(props.image)
  const plan = planWatermark(props, context.get('imageData') ?? null)

  // 图样与步距走根上的内联 CSS 变量：自定义属性是唯一能同时落到三个适配器上的通道。
  // 逐条给出而不是一整串：Web Components 照条写、照条撤，作者写在 root 上的内联样式不被整串盖掉；
  // 没有图样时一条都不给，上一帧写过的由适配器撤掉
  const rootAttrs = {
    ...parts.root.attrs,
    ...plan.attrs,
    style: { ...plan.vars },
  }

  return {
    lines: plan.lines,
    tile: plan.tile,
    image: plan.image,
    state: plan.state,
    fullscreen: plan.fullscreen,
    getRootProps: () => normalize.element(rootAttrs),
    getContentProps: () => normalize.element(parts.content.attrs),
  }
}

interface ImageGeometry {
  fontSize: number
  lineHeight: number
  opacity: number
  rotate: number
  fontFamily: string
  imageSource: string | undefined
  imageWidth: number
  imageHeight: number
  /** 图与字之间的空白。 */
  imageGap: number
  /** 图与字合起来那一整块的高，用来把整块摆到图样正中。 */
  blockHeight: number
}

/**
 * 把文字行拼成一张 SVG，再整段百分号编码成 data URI。
 *
 * 编码后的串里不会剩下 `"` `;` `#` `%` 这些字符，因此它拼进 `url("…")` 与内联 style 都收得住口，
 * 作者写进 text 的任何字符都出不了自己的那对标签。
 */
function buildImage(lines: readonly string[], tile: WatermarkTile, geom: ImageGeometry): string {
  const cx = round(tile.width / 2)
  const cy = round(tile.height / 2)
  // 图与字合起来那一整块居中，图在上、字在下；没有图时整块就是文字块，落点与从前逐值相同
  const top = cy - geom.blockHeight / 2
  const textCenter = top + geom.imageHeight + geom.imageGap + (lines.length * geom.lineHeight) / 2
  const first = textCenter - ((lines.length - 1) * geom.lineHeight) / 2 + geom.fontSize * BASELINE_SHIFT
  const texts = lines
    .map((line, i) => `<text x="${cx}" y="${round(first + i * geom.lineHeight)}">${escapeXml(line)}</text>`)
    .join('')
  // 遮罩只取透明度，图印出来是它自己的剪影；透明度写在这个节点上，fill-opacity 管不到图片
  const picture = geom.imageSource === undefined
    ? ''
    : `<image href="${escapeXml(geom.imageSource)}" x="${round(cx - geom.imageWidth / 2)}" y="${round(top)}" `
      + `width="${geom.imageWidth}" height="${geom.imageHeight}" opacity="${geom.opacity}" `
      + `preserveAspectRatio="xMidYMid meet"/>`
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${tile.width}" height="${tile.height}" `
    + `viewBox="0 0 ${tile.width} ${tile.height}">`
    // 整块绕图样中心转；填的是纯黑，颜色由皮肤那层底色决定，这里只提供透明度
    + `<g transform="rotate(${geom.rotate} ${cx} ${cy})" fill="#000" fill-opacity="${geom.opacity}" `
    + `font-family="${escapeXml(geom.fontFamily)}" font-size="${geom.fontSize}" text-anchor="middle">${
      picture
    }${
      texts
    }</g></svg>`
  return `data:image/svg+xml,${encodeURIComponent(svg)}`
}
