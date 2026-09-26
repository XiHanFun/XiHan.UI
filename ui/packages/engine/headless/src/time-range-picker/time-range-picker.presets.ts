/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 time range picker.presets 相关实现。

import type { TimeGranularity } from '../time-field'
import { getLocalTimeZone, now } from '@xihan-ui/core/date'
import { formatTimeValue } from '../time-field'

/**
 * 快捷选项的值：用 ISO 8601 的区间写法把两端拼在一起（`09:00/18:00`），
 * 一个串同时充当这一项的身份，作者在 Web Components 侧把它写在节点的 value 属性上。
 *
 * 这里取「此刻」的函数在被调用的那一刻取时刻，所以只能在作者自己的 computed / memo 里算一次。
 * 连接层每帧都会跑一遍，把它放进渲染期会每帧算出一个新的「此刻」，缓存永远失配。
 */

/** 两端之间的分隔符，与日期选择器的快捷区间同一个写法。 */
export const TIME_RANGE_PICKER_PRESET_SEPARATOR = '/'

/** 把起止两个 ISO 时间串拼成快捷选项的值。 */
export function timeRangePickerPresetValue(start: string, end: string): string {
  return `${start}${TIME_RANGE_PICKER_PRESET_SEPARATOR}${end}`
}

/** 反向：把快捷选项的值拆成两端；不是恰好两端时为 null。 */
export function timeRangePickerPresetTimes(value: string): [string, string] | null {
  const parts = value.split(TIME_RANGE_PICKER_PRESET_SEPARATOR).filter(part => part !== '')
  return parts.length === 2 ? [parts[0]!, parts[1]!] : null
}

/**
 * 从此刻起往后若干分钟的一段（「接下来一小时」），按 granularity 决定带不带秒；
 * 终点不越过当天末尾。
 */
export function timeRangePickerPresetFromNow(minutes: number, granularity: TimeGranularity = 'minute', timeZone?: string): string {
  const at = now(timeZone ?? getLocalTimeZone())
  const start = formatTimeValue({ hour: at.hour, minute: at.minute, second: at.second, dayPeriod: null }, granularity)
  const total = Math.min(at.hour * 60 + at.minute + Math.max(0, Math.trunc(minutes)), 23 * 60 + 59)
  const end = formatTimeValue({ hour: Math.trunc(total / 60), minute: total % 60, second: at.second, dayPeriod: null }, granularity)
  return timeRangePickerPresetValue(start, end)
}
