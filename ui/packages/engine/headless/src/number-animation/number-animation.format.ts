/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 展示格式化：按语言交给 Intl.NumberFormat，小数位与分组符由组件自己的两个属性决定。
// 纯字符串处理，不认识动画也不认识 DOM。

import { XH_FALLBACK_LOCALE } from '@xihan-ui/core'

/**
 * 交给 Intl.NumberFormat 的选项：样式（货币、百分比、单位）、记数法（紧凑）、符号与数字系统。
 *
 * 小数位不在其中：它归 `precision`，每一帧都按同一个位数铺，数字不会在滚动中忽长忽短。
 * 分组开关 `useGrouping` 在其中，打开即按该语言的习惯分组；要指定分组符用 `separator`。
 */
export type NumberAnimationFormatOptions = Pick<
  Intl.NumberFormatOptions,
  | 'style'
  | 'currency'
  | 'currencyDisplay'
  | 'currencySign'
  | 'unit'
  | 'unitDisplay'
  | 'notation'
  | 'compactDisplay'
  | 'signDisplay'
  | 'numberingSystem'
  | 'useGrouping'
>

/** 格式化时的语言与 Intl 选项。 */
export interface NumberAnimationIntl {
  /** BCP 47 语言标记，决定小数点、分组习惯、数字系统与货币写法；缺省 en-US。 */
  locale?: string
  /** 其余交给 Intl.NumberFormat 的选项。 */
  options?: NumberAnimationFormatOptions
}

/** 小数位缺省：整数。 */
export const NUMBER_ANIMATION_PRECISION = 0

/** 小数位上限，与 Intl.NumberFormat 的 maximumFractionDigits 定义域一致。 */
export const NUMBER_ANIMATION_PRECISION_MAX = 20

/** 小数位归一：取整并夹进 [0, 20]，缺省或非有限数退回 0。 */
export function resolveNumberAnimationPrecision(precision: number | undefined): number {
  if (precision == null || !Number.isFinite(precision))
    return NUMBER_ANIMATION_PRECISION
  return Math.min(Math.max(Math.trunc(precision), 0), NUMBER_ANIMATION_PRECISION_MAX)
}

/**
 * 只给真负数带符号：舍入后是零的负数不再写成 "-0"。
 * 这个取值在 ES2023 进入 Intl，库的类型声明仍停在 ES2022，类型里还没有它。
 */
const SIGN_NEGATIVE = 'negative' as unknown as NonNullable<Intl.NumberFormatOptions['signDisplay']>

/** 格式化器缓存：补间每帧都要铺一次字，每帧新建一个 Intl.NumberFormat 太贵。 */
const formatters = new Map<string, Intl.NumberFormat>()

function formatterOf(locale: string, options: Intl.NumberFormatOptions): Intl.NumberFormat {
  const key = `${locale}|${JSON.stringify(options)}`
  let formatter = formatters.get(key)
  if (!formatter) {
    formatter = new Intl.NumberFormat(locale, options)
    formatters.set(key, formatter)
  }
  return formatter
}

/**
 * 按语言与小数位铺出一个数。
 *
 * 分组缺省关着：数字在滚动时每跨一个量级就多出一个分隔符，宽度一跳一跳；要分组时打开
 * `useGrouping` 取该语言的习惯，或给 `separator` 指定分组符（给了即分组）。
 * 定长之后整个数是零就不带负号（`signDisplay: 'negative'`）：-0.4 取整写成 "-0" 只会让人以为坏了。
 * 非有限数按 0 铺，免得 NaN 一路写进文本。
 */
export function formatNumberAnimation(
  value: number,
  precision: number,
  separator?: string,
  intl?: NumberAnimationIntl,
): string {
  const safe = Number.isFinite(value) ? value : 0
  const options = intl?.options
  const formatter = formatterOf(intl?.locale ?? XH_FALLBACK_LOCALE, {
    signDisplay: SIGN_NEGATIVE,
    ...options,
    useGrouping: separator ? true : (options?.useGrouping ?? false),
    minimumFractionDigits: precision,
    maximumFractionDigits: precision,
  })
  if (!separator)
    return formatter.format(safe)
  return formatter
    .formatToParts(safe)
    .map(part => (part.type === 'group' ? separator : part.value))
    .join('')
}
