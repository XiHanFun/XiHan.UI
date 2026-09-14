/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 bar code 相关实现。

import type { NormalizeProps, PropTypes } from '@xihan-ui/core'
import type { BarCodeApi, BarCodeFormat, BarCodeProps, BarCodeState, BarCodeTextRun } from './bar-code.types'
import type { BarSymbol } from './bar-encode'
import { DIAGNOSTIC_CODES, reportDiagnostic } from '@xihan-ui/core'
import { barCodeAnatomy } from './bar-code.anatomy'
import { barEncode } from './bar-encode'

const parts = barCodeAnatomy.build()

const DEFAULT_FORMAT: BarCodeFormat = 'code128'
/** 认识的码制；`format` 是从 DOM 特性来的字符串，得按运行时的表核，光靠类型拦不住。 */
const FORMATS: ReadonlySet<string> = new Set<BarCodeFormat>(['code128', 'ean13', 'ean8', 'upca', 'upce', 'itf14', 'code39'])
const DEFAULT_BAR_WIDTH = 2
const DEFAULT_HEIGHT = 64

/**
 * 各码制的规范静区，单位是模块。EAN-13 规范是左 11 右 7、UPC-E 左 9 右 7，
 * 这里两侧取大的那个：静区只嫌少不嫌多，多出来的那几格也正好放得下挪到静区里的人读数字。
 */
const DEFAULT_MARGIN: Readonly<Record<BarCodeFormat, number>> = {
  code128: 10,
  ean13: 11,
  ean8: 7,
  upca: 9,
  upce: 9,
  itf14: 10,
  code39: 10,
}

// ── 纵向几何，单位是模块（X）──
// 规范里守卫条与人读文字的尺寸都按 X 给，这里照抄成 X 的倍数，换 barWidth 时整体等比。

/** 守卫条比数据条长出的模块数。 */
const GUARD_EXTENSION = 5
/** 人读文字的字号，模块。规范里数字高约 8X。 */
const TEXT_SIZE = 8
/** 文字区总高，模块：字号加一格呼吸。 */
const TEXT_ZONE = 10
/** 文字基线到条底的距离，模块：守卫条延长 5X，数字大体落在延长段的右侧那一格里。 */
const TEXT_BASELINE = 9
/** 承载条的厚度，模块。 */
const BEARER_THICKNESS = 2

const EMPTY_RUNS: readonly number[] = []
const EMPTY_TEXT: readonly BarCodeTextRun[] = []

/**
 * 取一个正整数档位。
 * 没给、给了 null、非有限数或不到 1 一律落回缺省值：0 宽的条与 NaN 一样，得到的是一张什么都不显示的码。
 */
function resolvePositive(value: number | undefined, fallback: number): number {
  return typeof value === 'number' && Number.isFinite(value) && value >= 1 ? Math.trunc(value) : fallback
}

/** 静区可以是 0（作者自己在外面留白）；负数按 0，NaN 落回缺省——与二维码的静区同一条规则。 */
function resolveMargin(value: number | undefined, fallback: number): number {
  return typeof value === 'number' && Number.isFinite(value) ? Math.max(0, Math.trunc(value)) : fallback
}

/** 一根条的矩形，与二维码的游程矩形同一种写法。 */
function barRect(x: number, y: number, w: number, h: number): string {
  return `M${x} ${y}h${w}v${h}h-${w}z`
}

/** 这根条（模块区间 [at, at + w)）是否整根落在某段守卫区间里。 */
function inGuard(symbol: BarSymbol, at: number, w: number): boolean {
  for (const [start, end] of symbol.guards) {
    if (at >= start && at + w <= end)
      return true
  }
  return false
}

/** 对当前码制没有意义的选项：往诊断通道报一条警告，按没给处理。 */
function warnIgnored(format: BarCodeFormat, option: string, onlyFor: BarCodeFormat): void {
  reportDiagnostic({
    code: DIAGNOSTIC_CODES.barCodeOptionIgnored,
    level: 'warn',
    scope: barCodeAnatomy.name,
    message: `${option} 只对 ${onlyFor} 有意义，${format} 不认它，这次按没给处理`,
    detail: { format, option, onlyFor },
  })
}

/**
 * BarCode 无状态机：条空序列全部由 props 算出。
 *
 * 序列只在这里算一遍，适配器直接取 api 上现成的 `path` 与 `text` 画，两端不各算一次。
 * viewBox 直接用像素：`barWidth` 与 `height` 都是像素入参，换算成模块再缩放回去只会引入分数坐标。
 *
 * 纵向从上到下：承载条（仅 itf14）→ 条 → 守卫条的延长段与人读文字共用的文字区 → 承载条。
 * 守卫条不管印不印文字都延长：它是符号几何的一部分，规范里就比数据条长 5X。
 *
 * 编码失败（字符不在字符集、位数不对、校验位对不上）不往外抛：抛在 Vue 的 computed 或 WC 的 wire 里
 * 会连累整棵树。改成落到 `state: 'error'` 并且一根条都不铺——宁可什么都不画，也不画一张扫出错内容的码。
 *
 * 命名分两态且互斥，与 Icon 同一套判据：
 * · 有名字 → role="img" + aria-label，不写 aria-hidden；
 * · 无名字（label 与 value 都是空白） → aria-hidden="true"，不写 role 与 aria-label。
 *
 * @example
 * // 12 位商品码补上校验位，95 个模块加两侧各 11 格静区，barWidth 2 → 234px 宽
 * connectBarCode({ format: 'ean13', value: '400638133393' }, normalize)
 */
export function connectBarCode<T extends PropTypes>(
  props: BarCodeProps,
  normalize: NormalizeProps<T>,
): BarCodeApi<T> {
  const format = props.format ?? DEFAULT_FORMAT
  const value = props.value ?? ''
  const showText = props.text !== false
  const barWidth = resolvePositive(props.barWidth, DEFAULT_BAR_WIDTH)
  const height = resolvePositive(props.height, DEFAULT_HEIGHT)

  let symbol: BarSymbol | undefined
  let state: BarCodeState = 'empty'
  let error: string | undefined
  // 不认识的码制与不合规则的内容同一条路：一根条都不铺，落 error 态并说明原因。
  // 不静默退回 code128——按别的码制扫出来的内容对不上，作者却看不出哪里错了。
  if (!FORMATS.has(format)) {
    state = 'error'
    error = `不认识的码制「${String(format)}」，只认 ${[...FORMATS].join(' / ')}`
  }
  else {
    if (props.gs1 === true && format !== 'code128')
      warnIgnored(format, 'gs1', 'code128')
    if (props.checksum !== undefined && format !== 'code39')
      warnIgnored(format, 'checksum', 'code39')
    if (props.bearerBars !== undefined && format !== 'itf14')
      warnIgnored(format, 'bearerBars', 'itf14')
    if (value !== '') {
      try {
        symbol = barEncode(format, value, { gs1: props.gs1, checksum: props.checksum })
        state = 'ready'
      }
      catch (cause) {
        state = 'error'
        error = cause instanceof Error ? cause.message : String(cause)
      }
    }
  }

  const margin = resolveMargin(props.margin, FORMATS.has(format) ? DEFAULT_MARGIN[format] : DEFAULT_MARGIN.code128)
  const bearer = format === 'itf14' && props.bearerBars !== false
  const modules = symbol?.width ?? 0
  const fontSize = TEXT_SIZE * barWidth

  // 没画出码时只剩两侧静区与条高，不为看不见的东西留位
  const pixelWidth = (modules + margin * 2) * barWidth
  const bearerHeight = bearer && symbol ? BEARER_THICKNESS * barWidth : 0
  const hasGuards = symbol !== undefined && symbol.guards.length > 0
  const tail = symbol === undefined
    ? 0
    : showText
      ? TEXT_ZONE * barWidth
      : hasGuards ? GUARD_EXTENSION * barWidth : 0
  const pixelHeight = bearerHeight * 2 + height + tail
  const viewBox = `0 0 ${pixelWidth} ${pixelHeight}`

  let path = ''
  let text = EMPTY_TEXT
  if (symbol) {
    const segments: string[] = []
    const top = bearerHeight
    if (bearer) {
      segments.push(barRect(0, 0, pixelWidth, bearerHeight))
      segments.push(barRect(0, top + height, pixelWidth, bearerHeight))
    }
    let at = 0
    for (let i = 0; i < symbol.runs.length; i++) {
      const w = symbol.runs[i]!
      if (i % 2 === 0) {
        const h = inGuard(symbol, at, w) ? height + GUARD_EXTENSION * barWidth : height
        segments.push(barRect((margin + at) * barWidth, top, w * barWidth, h))
      }
      at += w
    }
    path = segments.join('')

    if (showText) {
      // 有承载条时文字落在下面那根承载条之下
      const baseline = top + height + bearerHeight + TEXT_BASELINE * barWidth
      text = symbol.text.map(run => ({
        x: (margin + run.x) * barWidth,
        y: baseline,
        anchor: run.anchor,
        text: run.text,
      }))
    }
  }

  // 空串与纯空白不算给过名字：认了它就得到一个有 role="img" 却没有名字的对象，读屏只报"图像"
  const named = props.label ?? value
  const label = named.trim() === '' ? undefined : named

  return {
    format,
    runs: symbol?.runs ?? EMPTY_RUNS,
    modules,
    encoded: symbol?.encoded ?? '',
    margin,
    pixelWidth,
    pixelHeight,
    viewBox,
    path,
    text,
    fontSize,
    state,
    error,
    label,

    getRootProps: () => normalize.element({
      ...parts.root.attrs,
      'viewBox': viewBox,
      // 条的边界全落在整数像素上，交给渲染器按整像素画，条边不出现半透明的过渡带
      'shape-rendering': 'crispEdges',
      'role': label === undefined ? undefined : 'img',
      'aria-label': label,
      'aria-hidden': label === undefined ? true : undefined,
      // 不认识的码制也原样写上：error 态下作者要看的正是这个值
      'data-format': format,
      // 没画出码时不写，皮肤与调试都不会读到一个假的模块数
      'data-modules': modules === 0 ? undefined : String(modules),
      'data-state': state,
      'style': { inlineSize: `${pixelWidth}px`, blockSize: `${pixelHeight}px` },
    }),
  }
}
