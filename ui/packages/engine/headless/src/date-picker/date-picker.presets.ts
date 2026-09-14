/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 date picker.presets 相关实现。

import { getLocalTimeZone, today } from '@internationalized/date'

/**
 * 快捷选项的值：单日就是一条 ISO 日期串，多天用 `/` 拼在一起（`2026-08-15/2026-08-21`）。
 * 一个串同时充当这一项的身份，作者在 Web Components 侧把它写在节点的 value 属性上。
 * 日期范围选择器的快捷选项沿用同一种写法，两端拼成 ISO 8601 的区间形式。
 *
 * 这里的函数全是纯函数，"今天"由调用方传进来的时区决定。库不在渲染期算日子：
 * connect 每帧都会跑一遍，每帧算一次 today() 会让缓存永远失配，跨零点还会算出两个答案。
 * 作者在自己的 computed / memo 里算好一次，把结果当常量交给组件。
 */

/** 多条日期之间的分隔符。 */
export const DATE_PICKER_PRESET_SEPARATOR = '/'

/** 把快捷选项的值拆成写进选中集合的那几条日期；单日得到长度 1 的数组。 */
export function datePickerPresetDates(value: string): string[] {
  return value.split(DATE_PICKER_PRESET_SEPARATOR).filter(part => part !== '')
}

/** 反向：把若干条日期拼成快捷选项的值。 */
export function datePickerPresetValue(dates: readonly string[]): string {
  return dates.join(DATE_PICKER_PRESET_SEPARATOR)
}

/** 相对今天偏移若干天的那一日。0 是今天，-1 是昨天。 */
export function datePickerPresetDay(offsetDays = 0, timeZone?: string): string {
  return today(timeZone ?? getLocalTimeZone()).add({ days: offsetDays }).toString()
}
