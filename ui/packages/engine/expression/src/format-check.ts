/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 格式说明的静态校验：保存模板时就报出 formatValue 会拒绝的格式说明，不必等到格式化时抛错。

import type { FormatSpec } from './format'
import { FORMAT_DECIMALS_LIMIT, FORMAT_KINDS, FORMAT_ROUNDINGS, NUMERAL_STYLES } from './format'
import { isPlainObject } from './value'

/**
 * 格式说明的问题码：
 * - `XH_EXPR_FORMAT_INVALID_SPEC`：格式说明不是普通对象；
 * - `XH_EXPR_FORMAT_INVALID_KIND`：`kind` 缺失、不认识，或不在允许的种类里；
 * - `XH_EXPR_FORMAT_INVALID_OPTION`：某一项的取值不合法，或必填项缺失；
 * - `XH_EXPR_FORMAT_CONFLICT`：`decimals` 与 `minDecimals` / `maxDecimals` 同时给出，或 `minDecimals` 大于 `maxDecimals`；
 * - `XH_EXPR_FORMAT_UNKNOWN_KEY`：该种类没有这一项。
 */
export type FormatSpecIssueCode
  = | 'XH_EXPR_FORMAT_INVALID_SPEC'
    | 'XH_EXPR_FORMAT_INVALID_KIND'
    | 'XH_EXPR_FORMAT_INVALID_OPTION'
    | 'XH_EXPR_FORMAT_CONFLICT'
    | 'XH_EXPR_FORMAT_UNKNOWN_KEY'

/** 格式说明的一条问题：`path` 是出问题的那一项在格式说明里的键路径，整体问题为空数组。 */
export interface FormatSpecIssue {
  readonly code: FormatSpecIssueCode
  readonly path: readonly string[]
}

/** 校验选项。 */
export interface CheckFormatSpecOptions {
  /** 允许的种类，缺省为全部；图表数值这类只收数字的位置传 `['number', 'percent']`。 */
  readonly kinds?: readonly FormatSpec['kind'][]
}

const NUMERIC_KEYS = ['kind', 'decimals', 'minDecimals', 'maxDecimals', 'grouping', 'rounding']
const KEYS: Readonly<Record<FormatSpec['kind'], readonly string[]>> = {
  'number': NUMERIC_KEYS,
  'percent': NUMERIC_KEYS,
  'date': ['kind', 'pattern'],
  'rmb-upper': ['kind', 'rounding'],
  'numeral': ['kind', 'style'],
}

function isSpecObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && isPlainObject(value)
}

function isDecimals(value: unknown): value is number {
  return Number.isSafeInteger(value) && (value as number) >= 0 && (value as number) <= FORMAT_DECIMALS_LIMIT
}

/**
 * 校验一份格式说明，返回全部问题，不抛异常；没有问题时为空数组。
 * 通过校验的格式说明交给 `formatValue` 不会因格式说明本身出错；`formatValue` 不理会多余的键，这里报 `XH_EXPR_FORMAT_UNKNOWN_KEY`。
 */
export function checkFormatSpec(spec: unknown, options: CheckFormatSpecOptions = {}): readonly FormatSpecIssue[] {
  if (!isSpecObject(spec))
    return Object.freeze([Object.freeze({ code: 'XH_EXPR_FORMAT_INVALID_SPEC', path: Object.freeze([]) })])
  const issues: FormatSpecIssue[] = []
  const report = (code: FormatSpecIssueCode, key?: string): void => {
    issues.push(Object.freeze({ code, path: Object.freeze(key === undefined ? [] : [key]) }))
  }
  const kind = spec.kind
  const allowed = options.kinds ?? FORMAT_KINDS
  if (typeof kind !== 'string' || !(FORMAT_KINDS as readonly string[]).includes(kind) || !(allowed as readonly string[]).includes(kind)) {
    report('XH_EXPR_FORMAT_INVALID_KIND', 'kind')
    return Object.freeze(issues)
  }
  const known = KEYS[kind as FormatSpec['kind']]
  for (const key of Object.keys(spec)) {
    if (!known.includes(key))
      report('XH_EXPR_FORMAT_UNKNOWN_KEY', key)
  }
  const rounding = (): void => {
    if (spec.rounding !== undefined && !(FORMAT_ROUNDINGS as readonly unknown[]).includes(spec.rounding))
      report('XH_EXPR_FORMAT_INVALID_OPTION', 'rounding')
  }
  switch (kind as FormatSpec['kind']) {
    case 'number':
    case 'percent': {
      for (const key of ['decimals', 'minDecimals', 'maxDecimals']) {
        if (spec[key] !== undefined && !isDecimals(spec[key]))
          report('XH_EXPR_FORMAT_INVALID_OPTION', key)
      }
      if (spec.grouping !== undefined && typeof spec.grouping !== 'boolean')
        report('XH_EXPR_FORMAT_INVALID_OPTION', 'grouping')
      rounding()
      if (spec.decimals !== undefined && (spec.minDecimals !== undefined || spec.maxDecimals !== undefined))
        report('XH_EXPR_FORMAT_CONFLICT', 'decimals')
      if (isDecimals(spec.minDecimals) && isDecimals(spec.maxDecimals) && spec.minDecimals > spec.maxDecimals)
        report('XH_EXPR_FORMAT_CONFLICT', 'minDecimals')
      break
    }
    case 'date':
      if (typeof spec.pattern !== 'string' || spec.pattern === '')
        report('XH_EXPR_FORMAT_INVALID_OPTION', 'pattern')
      break
    case 'rmb-upper':
      rounding()
      break
    case 'numeral':
      if (!(NUMERAL_STYLES as readonly unknown[]).includes(spec.style))
        report('XH_EXPR_FORMAT_INVALID_OPTION', 'style')
      break
  }
  return Object.freeze(issues)
}
