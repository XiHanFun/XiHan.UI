import type { NormalizeProps, PropTypes } from '@xihan-ui/core'
import type { WatermarkApi, WatermarkProps, WatermarkState, WatermarkTile } from './watermark.types'
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

/** 图样里写死通用无衬线字体：SVG 当图片用时取不到页面里的字体，写具体字体名也落不到实处。 */
const FONT_FAMILY = 'sans-serif'

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

// Watermark 无状态机：图样由 props 算出来，是一张 SVG 拼成的 data URI。
// 用 SVG 而不是 canvas：canvas 要一个能绘图的运行时才产得出位图，服务端渲染与判据都拿不到，
// 而 SVG 是一段可以直接比对的文本，同一份 props 每次算出逐字相同的一张图。
export function connectWatermark<T extends PropTypes>(
  props: WatermarkProps,
  normalize: NormalizeProps<T>,
): WatermarkApi<T> {
  const lines = toLines(props.text)
  const fontSize = clamp(props.fontSize, MIN_FONT_SIZE, MAX_FONT_SIZE, DEFAULT_FONT_SIZE)
  const gap = clamp(props.gap, 0, MAX_GAP, DEFAULT_GAP)
  const opacity = clamp(props.opacity, 0, 1, DEFAULT_OPACITY)
  // 收进一圈之内：转 400 度与转 40 度画出来是同一张图，而超大的角度值会写成科学计数法，SVG 认不了
  const rotate = round(finite(props.rotate, DEFAULT_ROTATE) % 360)

  const state: WatermarkState = lines.length > 0 ? 'ready' : 'empty'

  // 倾斜后的一行字占的地方比它自己宽也比它自己高：把未倾斜的文字块按角度投影到两条轴上，
  // 再各加一份空白，得到的就是不会让相邻两块咬在一起的最小步距
  const lineHeight = fontSize * LINE_HEIGHT_RATIO
  const textWidth = lines.reduce((max, line) => Math.max(max, advance(line)), 0) * fontSize
  const textHeight = lines.length * lineHeight
  const radians = (rotate * Math.PI) / 180
  const cos = Math.abs(Math.cos(radians))
  const sin = Math.abs(Math.sin(radians))
  const tile: WatermarkTile = state === 'ready'
    ? {
        width: Math.ceil(textWidth * cos + textHeight * sin + gap),
        height: Math.ceil(textWidth * sin + textHeight * cos + gap),
      }
    : { width: 0, height: 0 }

  const image = state === 'ready' ? buildImage(lines, tile, { fontSize, lineHeight, opacity, rotate }) : ''

  // 图样与步距走根上的内联 CSS 变量：自定义属性是唯一能同时落到两个适配器上的通道。
  // 给了文字时根节点的内联 style 归本组件管，作者自己的内联样式写在外层元素上
  const rootAttrs = {
    ...parts.root.attrs,
    'data-state': state,
    ...(state === 'ready'
      ? { style: `--xh-watermark-image: url("${image}"); --xh-watermark-tile: ${tile.width}px ${tile.height}px` }
      : {}),
  }

  return {
    lines,
    tile,
    image,
    state,
    getRootProps: () => normalize.element(rootAttrs),
    getContentProps: () => normalize.element(parts.content.attrs),
  }
}

interface ImageGeometry {
  fontSize: number
  lineHeight: number
  opacity: number
  rotate: number
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
  const first = cy - ((lines.length - 1) * geom.lineHeight) / 2 + geom.fontSize * BASELINE_SHIFT
  const texts = lines
    .map((line, i) => `<text x="${cx}" y="${round(first + i * geom.lineHeight)}">${escapeXml(line)}</text>`)
    .join('')
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${tile.width}" height="${tile.height}" `
    + `viewBox="0 0 ${tile.width} ${tile.height}">`
    // 整块绕图样中心转；填的是纯黑，颜色由皮肤那层底色决定，这里只提供透明度
    + `<g transform="rotate(${geom.rotate} ${cx} ${cy})" fill="#000" fill-opacity="${geom.opacity}" `
    + `font-family="${FONT_FAMILY}" font-size="${geom.fontSize}" text-anchor="middle">${
      texts
    }</g></svg>`
  return `data:image/svg+xml,${encodeURIComponent(svg)}`
}
