/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 富文本样式值的判定与换算：颜色、字号、字体名，以及行内样式落到标签与 CSS 的映射（序列化与渲染共用）。

import type { RichMarks, RichTextAlign } from './types'
import { toSafeLinkHref } from '../url'
import { RICH_TEXT_ALIGNS, RICH_TEXT_FONT_SIZE_RANGE } from './types'

const HEX_COLOR = /^#(?:[0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})$/i
const RGB_COLOR = /^rgba?\(([^)]*)\)$/i
const CSS_LENGTH = /^(\d+(?:\.\d+)?|\.\d+)(px|pt)$/i

/** 基本色名到十六进制。 */
const NAMED_COLORS: Readonly<Record<string, string>> = {
  black: '#000000',
  silver: '#C0C0C0',
  gray: '#808080',
  grey: '#808080',
  white: '#FFFFFF',
  maroon: '#800000',
  red: '#FF0000',
  purple: '#800080',
  fuchsia: '#FF00FF',
  green: '#008000',
  lime: '#00FF00',
  olive: '#808000',
  yellow: '#FFFF00',
  navy: '#000080',
  blue: '#0000FF',
  teal: '#008080',
  aqua: '#00FFFF',
  orange: '#FFA500',
}

/** 字体名的最大长度。 */
export const RICH_TEXT_FONT_FAMILY_MAX = 200

/** 是否为模型认的颜色：`#RGB`、`#RGBA`、`#RRGGBB` 或 `#RRGGBBAA`。 */
export function isRichColor(value: unknown): value is string {
  return typeof value === 'string' && HEX_COLOR.test(value)
}

/** 是否为范围内的字号（pt）。 */
export function isRichFontSize(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value >= RICH_TEXT_FONT_SIZE_RANGE.min && value <= RICH_TEXT_FONT_SIZE_RANGE.max
}

/** 是否为可用的字体名：非空、不超长、不含控制字符。 */
export function isRichFontFamily(value: unknown): value is string {
  // eslint-disable-next-line no-control-regex -- 判定的就是控制字符
  return typeof value === 'string' && value.trim() !== '' && value.length <= RICH_TEXT_FONT_FAMILY_MAX && !/[\u0000-\u001F\u007F]/.test(value)
}

/** 是否为对齐取值。 */
export function isRichAlign(value: unknown): value is RichTextAlign {
  return typeof value === 'string' && (RICH_TEXT_ALIGNS as readonly string[]).includes(value)
}

function channel(text: string, max: number): number | undefined {
  const value = text.endsWith('%') ? Number(text.slice(0, -1)) / 100 * max : Number(text)
  return Number.isFinite(value) ? Math.min(max, Math.max(0, value)) : undefined
}

function hex2(value: number): string {
  return Math.round(value).toString(16).padStart(2, '0').toUpperCase()
}

/** CSS 颜色换成模型的颜色：认十六进制、`rgb()` / `rgba()` 与基本色名；认不出时返回 undefined。 */
export function parseCssColor(text: string): string | undefined {
  const value = text.trim()
  if (HEX_COLOR.test(value))
    return value
  const named = NAMED_COLORS[value.toLowerCase()]
  if (named !== undefined)
    return named
  const rgb = RGB_COLOR.exec(value)
  if (rgb === null)
    return undefined
  const parts = (rgb[1] as string).trim().split(/\s*[,/]\s*|\s+/).filter(Boolean)
  if (parts.length !== 3 && parts.length !== 4)
    return undefined
  const [r, g, b] = parts.slice(0, 3).map(part => channel(part, 255))
  const alpha = parts[3] === undefined ? 1 : channel(parts[3], 1)
  if (r === undefined || g === undefined || b === undefined || alpha === undefined)
    return undefined
  return `#${hex2(r)}${hex2(g)}${hex2(b)}${alpha < 1 ? hex2(alpha * 255) : ''}`
}

/** CSS 字号换成 pt：只认 px 与 pt 两种绝对单位，结果落在字号范围外时返回 undefined。 */
export function parseCssFontSize(text: string): number | undefined {
  const match = CSS_LENGTH.exec(text.trim())
  if (match === null)
    return undefined
  const value = Number(match[1])
  const points = (match[2] as string).toLowerCase() === 'px' ? value * 0.75 : value
  const rounded = Math.round(points * 100) / 100
  return isRichFontSize(rounded) ? rounded : undefined
}

/** 一段行内内容落到标签与 CSS：外层到内层依次是链接、上下标、粗体、斜体、下划线、删除线，最后是带样式的 span。 */
export interface MarkPlan {
  /** 过了链接判定的地址。 */
  readonly href?: string
  readonly tags: readonly ('sup' | 'sub' | 'strong' | 'em' | 'u' | 's')[]
  /** 写在最内层 span 上的 CSS 属性与值，值已判定合法。 */
  readonly styles: readonly (readonly [property: string, value: string])[]
}

/** 按行内样式算出要包的标签与 CSS；不合法的值跳过。 */
export function planMarks(marks: RichMarks | undefined): MarkPlan {
  if (marks === undefined)
    return { tags: [], styles: [] }
  const tags: MarkPlan['tags'][number][] = []
  if (marks.superscript === true)
    tags.push('sup')
  else if (marks.subscript === true)
    tags.push('sub')
  if (marks.bold === true)
    tags.push('strong')
  if (marks.italic === true)
    tags.push('em')
  if (marks.underline === true)
    tags.push('u')
  if (marks.lineThrough === true)
    tags.push('s')
  const styles: [string, string][] = []
  if (isRichColor(marks.color))
    styles.push(['color', marks.color])
  if (isRichColor(marks.background))
    styles.push(['background-color', marks.background])
  if (isRichFontSize(marks.fontSize))
    styles.push(['font-size', `${marks.fontSize}pt`])
  if (isRichFontFamily(marks.fontFamily))
    styles.push(['font-family', marks.fontFamily])
  const href = toSafeLinkHref(marks.link)
  return href === undefined ? { tags, styles } : { href, tags, styles }
}
