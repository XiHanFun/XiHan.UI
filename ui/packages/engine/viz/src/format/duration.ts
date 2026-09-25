/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 时长格式：把毫秒拆成日、时、分、秒、毫秒，从最高的非零单位起连续取几个单位；单位文字由调用方按语言提供。

import { invalidArgument } from '../errors'

/** 各单位的文字模板，`{n}` 处填入按语言格式化的数字，如 `'{n} h'`、`'{n}小时'`。 */
export interface DurationUnitTexts {
  readonly day: string
  readonly hour: string
  readonly minute: string
  readonly second: string
  readonly millisecond: string
  /** 单位之间的分隔；缺省一个空格。 */
  readonly separator?: string
}

export interface DurationFormatOptions {
  /** 从最高的非零单位起连续取几个单位，缺省 2（其中为零的不写）。更小单位的零头直接舍去，不进位。 */
  readonly maxUnits?: number
}

const UNITS = [
  ['day', 86_400_000],
  ['hour', 3_600_000],
  ['minute', 60_000],
  ['second', 1000],
  ['millisecond', 1],
] as const

/** 按语言与单位文字返回时长格式函数；负时长带负号，0 显示为「0 秒」。 */
export function createDurationFormat(locale: string, units: DurationUnitTexts, options: DurationFormatOptions = {}): (ms: number) => string {
  const maxUnits = options.maxUnits ?? 2
  if (!Number.isInteger(maxUnits) || maxUnits < 1)
    throw invalidArgument('maxUnits 必须是正整数', { maxUnits })
  for (const [name] of UNITS) {
    if (!units[name].includes('{n}'))
      throw invalidArgument(`单位文字 ${name} 缺少 {n} 占位`, { [name]: units[name] })
  }
  let number: Intl.NumberFormat
  try {
    number = new Intl.NumberFormat(locale, { maximumFractionDigits: 0 })
  }
  catch (error) {
    throw invalidArgument('时长格式的语言标签不合法', { locale, reason: (error as Error).message })
  }
  const separator = units.separator ?? ' '
  const fill = (name: typeof UNITS[number][0], n: number): string => units[name].replace('{n}', number.format(n))

  return (ms) => {
    if (!Number.isFinite(ms))
      throw invalidArgument('时长必须是有限数', { ms })
    // 从最高的非零单位起连续取 maxUnits 个单位，其中为零的不写
    let rest = Math.floor(Math.abs(ms))
    let first = -1
    const parts: string[] = []
    for (const [k, [name, size]] of UNITS.entries()) {
      const n = Math.floor(rest / size)
      rest -= n * size
      if (first < 0 && n > 0)
        first = k
      if (first < 0)
        continue
      if (k - first >= maxUnits)
        break
      if (n > 0)
        parts.push(fill(name, n))
    }
    if (parts.length === 0)
      return fill('second', 0)
    const text = parts.join(separator)
    return ms < 0 ? `-${text}` : text
  }
}
