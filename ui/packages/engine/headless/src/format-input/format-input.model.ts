/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 格式输入的编辑模型：编辑中的草稿与 FormatSpec 互转、换种类、换小数位写法、样例文字，全部是纯函数。
// 草稿可以不完整（日期模式清空、小数位范围的下限大于上限），不完整时不产出格式说明，只给问题码。

import type { FormatOptions, FormatRounding, FormatSpec, FormatSpecIssueCode, NumeralStyle } from '@xihan-ui/expression'
import { checkFormatSpec, FORMAT_DECIMALS_LIMIT, FORMAT_KINDS, FORMAT_ROUNDINGS, formatValue, NUMERAL_STYLES } from '@xihan-ui/expression'

/** 格式种类。 */
export type FormatInputKind = FormatSpec['kind']

/** 小数位的写法：固定位数、位数范围、不舍入。 */
export type FormatInputDecimalsMode = 'fixed' | 'range' | 'exact'

/** 全部小数位写法，依次是固定、范围、不舍入。 */
export const FORMAT_INPUT_DECIMALS_MODES: readonly FormatInputDecimalsMode[] = /* @__PURE__ */ Object.freeze(['fixed', 'range', 'exact'] as const)

/** 日期模式的缺省预设，第一个是新切到日期时的模式。 */
export const FORMAT_INPUT_DATE_PATTERNS: readonly string[] = /* @__PURE__ */ Object.freeze([
  'yyyy-MM-dd',
  'yyyy/MM/dd',
  'yyyy年M月d日',
  'yyyy-MM',
  'yyyy-MM-dd HH:mm',
  'yyyy-MM-dd HH:mm:ss',
  'HH:mm',
  'HH:mm:ss',
])

/** 固定位数与范围上限的缺省值。 */
const DEFAULT_DECIMALS = 2

/**
 * 编辑中的格式。各种类的参数都留在草稿里：换种类时能沿用的直接沿用，换回来时还是上次填的。
 * kind 为 null 表示不设格式。数字为 null 表示输入框清空了。
 */
export interface FormatInputDraft {
  readonly kind: FormatInputKind | null
  readonly decimalsMode: FormatInputDecimalsMode
  readonly decimals: number | null
  readonly minDecimals: number | null
  readonly maxDecimals: number | null
  readonly grouping: boolean
  readonly rounding: FormatRounding
  readonly pattern: string
  readonly style: NumeralStyle
}

/** 草稿不完整时的问题码；草稿完整、但 checkFormatSpec 仍不接受时是它的问题码。 */
export type FormatInputIssueCode = 'decimals-empty' | 'range-inverted' | 'pattern-empty' | FormatSpecIssueCode

/** 草稿换成格式说明的结果。 */
export type FormatInputResult
  = | { readonly ok: true, readonly value: FormatSpec | undefined }
    | { readonly ok: false, readonly issue: FormatInputIssueCode }

/** 空草稿：不设格式，各参数取缺省。 */
export function emptyFormatDraft(patterns: readonly string[] = FORMAT_INPUT_DATE_PATTERNS): FormatInputDraft {
  return {
    kind: null,
    decimalsMode: 'exact',
    decimals: null,
    minDecimals: null,
    maxDecimals: null,
    grouping: false,
    rounding: FORMAT_ROUNDINGS[0]!,
    pattern: patterns[0] ?? FORMAT_INPUT_DATE_PATTERNS[0]!,
    style: NUMERAL_STYLES[0]!,
  }
}

/** 按格式说明改写草稿：说明里写到的参数覆盖草稿，没写到的照旧留着。 */
export function draftFromFormat(value: FormatSpec | undefined, base: FormatInputDraft): FormatInputDraft {
  if (value === undefined)
    return { ...base, kind: null }
  switch (value.kind) {
    case 'number':
    case 'percent': {
      const mode: FormatInputDecimalsMode = value.decimals !== undefined
        ? 'fixed'
        : value.minDecimals !== undefined || value.maxDecimals !== undefined ? 'range' : 'exact'
      return {
        ...base,
        kind: value.kind,
        decimalsMode: mode,
        decimals: mode === 'fixed' ? value.decimals! : base.decimals,
        minDecimals: mode === 'range' ? value.minDecimals ?? 0 : base.minDecimals,
        maxDecimals: mode === 'range' ? value.maxDecimals ?? FORMAT_DECIMALS_LIMIT : base.maxDecimals,
        grouping: value.grouping ?? false,
        rounding: value.rounding ?? FORMAT_ROUNDINGS[0]!,
      }
    }
    case 'date':
      return { ...base, kind: 'date', pattern: value.pattern }
    case 'rmb-upper':
      return { ...base, kind: 'rmb-upper', rounding: value.rounding ?? FORMAT_ROUNDINGS[0]! }
    case 'numeral':
      return { ...base, kind: 'numeral', style: value.style }
  }
}

/** 换种类；null 表示不设格式。参数都留在草稿里，所以数字与百分比互换时小数位、千分位与舍入照旧，人民币大写沿用舍入。 */
export function switchFormatKind(draft: FormatInputDraft, kind: FormatInputKind | null): FormatInputDraft {
  return draft.kind === kind ? draft : { ...draft, kind }
}

/** 换小数位写法，数字尽量带过去：固定 n 换成范围是 0 到 n，范围换成固定取上限；没有可带的取缺省。 */
export function switchDecimalsMode(draft: FormatInputDraft, mode: FormatInputDecimalsMode): FormatInputDraft {
  if (draft.decimalsMode === mode)
    return draft
  if (mode === 'fixed')
    return { ...draft, decimalsMode: mode, decimals: draft.decimalsMode === 'range' ? draft.maxDecimals ?? draft.minDecimals ?? DEFAULT_DECIMALS : draft.decimals ?? DEFAULT_DECIMALS }
  if (mode === 'range') {
    const upper = draft.decimalsMode === 'fixed' ? draft.decimals ?? DEFAULT_DECIMALS : draft.maxDecimals ?? DEFAULT_DECIMALS
    return { ...draft, decimalsMode: mode, minDecimals: draft.decimalsMode === 'fixed' ? 0 : draft.minDecimals ?? 0, maxDecimals: upper }
  }
  return { ...draft, decimalsMode: mode }
}

/** 数字参数：小数位写法与位数、千分位、舍入；缺省值不写进格式说明。 */
function numericOptions(draft: FormatInputDraft): FormatInputResult | Record<string, number | boolean | FormatRounding> {
  const options: Record<string, number | boolean | FormatRounding> = {}
  if (draft.decimalsMode === 'fixed') {
    if (draft.decimals === null)
      return { ok: false, issue: 'decimals-empty' }
    options.decimals = draft.decimals
  }
  else if (draft.decimalsMode === 'range') {
    if (draft.minDecimals === null || draft.maxDecimals === null)
      return { ok: false, issue: 'decimals-empty' }
    if (draft.minDecimals > draft.maxDecimals)
      return { ok: false, issue: 'range-inverted' }
    options.minDecimals = draft.minDecimals
    options.maxDecimals = draft.maxDecimals
  }
  if (draft.grouping)
    options.grouping = true
  if (draft.rounding !== FORMAT_ROUNDINGS[0])
    options.rounding = draft.rounding
  return options
}

function isResult(value: object): value is FormatInputResult {
  return 'ok' in value
}

/**
 * 草稿换成格式说明：不完整时给问题码，完整时再经 checkFormatSpec 核对（kinds 限定可选的种类）。
 * 得到的格式说明只写这一种用得到、且不等于缺省的参数。
 */
export function formatFromDraft(draft: FormatInputDraft, kinds: readonly FormatInputKind[] = FORMAT_KINDS): FormatInputResult {
  let value: FormatSpec
  switch (draft.kind) {
    case null:
      return { ok: true, value: undefined }
    case 'number':
    case 'percent': {
      const options = numericOptions(draft)
      if (isResult(options))
        return options
      value = { kind: draft.kind, ...options }
      break
    }
    case 'date':
      if (draft.pattern === '')
        return { ok: false, issue: 'pattern-empty' }
      value = { kind: 'date', pattern: draft.pattern }
      break
    case 'rmb-upper':
      value = draft.rounding === FORMAT_ROUNDINGS[0] ? { kind: 'rmb-upper' } : { kind: 'rmb-upper', rounding: draft.rounding }
      break
    case 'numeral':
      value = { kind: 'numeral', style: draft.style }
      break
  }
  const issue = checkFormatSpec(value, { kinds })[0]
  return issue ? { ok: false, issue: issue.code } : { ok: true, value }
}

/** 各种类的缺省样例值。 */
const SAMPLES: Readonly<Record<FormatInputKind, unknown>> = {
  'number': '1234567.891',
  'percent': '0.1234',
  'date': '2026-01-02T03:04:05.006',
  'rmb-upper': '1234.5',
  'numeral': 2026,
}

/** 这一种格式的缺省样例值。 */
export function formatSample(kind: FormatInputKind): unknown {
  return SAMPLES[kind]
}

/** 样例文字；样例值套不上这份格式（如字形超出范围）时为 null。 */
export function formatPreview(value: FormatSpec, sample: unknown = formatSample(value.kind), options: FormatOptions = {}): string | null {
  try {
    return formatValue(sample, value, options)
  }
  catch {
    return null
  }
}
