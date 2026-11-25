/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 时间值的共用纯函数：ISO 串的解析、12 / 24 小时换算与两条缺省。
// 时间输入、时间选择器、日期选择器的时间段与时间约束都用这一份，不经任何一个组件的状态机。

import type { TimeDayPeriod, TimeGranularity, TimeHourCycle } from '../time-field/time-field.types'
import { PlainTime } from '@xihan-ui/core/date'

/** 未显式给 hourCycle、也没有 locale 可推断时的小时制。 */
export const TIME_FIELD_HOUR_CYCLE: TimeHourCycle = 24
/** 未显式给 granularity 时的精度：时分。 */
export const TIME_FIELD_GRANULARITY: TimeGranularity = 'minute'

/** 解析 ISO 时间串；解析不了返回 null，不抛。 */
export function parseTimeValue(value: string | null | undefined): PlainTime | null {
  if (!value)
    return null
  try {
    return PlainTime.from(value)
  }
  catch {
    return null
  }
}

/**
 * 24 → 12 小时制。0 点显示 12 AM、12 点显示 12 PM，其余取 12 的余数。
 * 入参先回绕到 0-23。
 */
export function to12Hour(hour24: number): { hour: number, period: TimeDayPeriod } {
  const h = ((Math.trunc(hour24) % 24) + 24) % 24
  const period: TimeDayPeriod = h < 12 ? 'am' : 'pm'
  const hour = h % 12 === 0 ? 12 : h % 12
  return { hour, period }
}

/** 12 → 24 小时制。12 AM 是 0 点、12 PM 是 12 点，其余下午加 12。 */
export function to24Hour(hour12: number, period: TimeDayPeriod): number {
  const base = ((Math.trunc(hour12) % 12) + 12) % 12
  return period === 'pm' ? base + 12 : base
}
