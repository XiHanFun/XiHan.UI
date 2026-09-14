/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 date range picker.presets 相关实现。

import { getLocalTimeZone, startOfMonth, startOfYear, today } from '@internationalized/date'
import { datePickerPresetValue } from '../date-picker'

/**
 * 快捷选项的值：用 ISO 8601 的区间写法把两端拼在一起（`2026-08-15/2026-08-21`），
 * 一个串同时充当这一项的身份，作者在 Web Components 侧把它写在节点的 value 属性上。
 *
 * 这里的函数全是纯函数，"今天"由调用方传进来的时区决定。库不在渲染期算日子：
 * connect 每帧都会跑一遍，每帧算一次 today() 会让缓存永远失配，跨零点还会算出两个答案。
 * 作者在自己的 computed / memo 里算好一次，把结果当常量交给组件。
 */

/** 相对今天的两个偏移量圈出的区间（近 7 天是 -6 到 0），顺序无所谓。 */
export function dateRangePickerPresetRange(fromOffsetDays: number, toOffsetDays: number, timeZone?: string): string {
  const base = today(timeZone ?? getLocalTimeZone())
  const from = base.add({ days: Math.min(fromOffsetDays, toOffsetDays) })
  const to = base.add({ days: Math.max(fromOffsetDays, toOffsetDays) })
  return datePickerPresetValue([from.toString(), to.toString()])
}

/** 相对本月偏移若干个月的那一整月。0 是本月，-1 是上月。 */
export function dateRangePickerPresetMonth(offsetMonths = 0, timeZone?: string): string {
  const first = startOfMonth(today(timeZone ?? getLocalTimeZone()).add({ months: offsetMonths }))
  // 下个月 1 号往回退一天，比查每月天数省事，也自动吃掉闰年
  const last = startOfMonth(first.add({ months: 1 })).subtract({ days: 1 })
  return datePickerPresetValue([first.toString(), last.toString()])
}

/** 相对今年偏移若干年的那一整年。 */
export function dateRangePickerPresetYear(offsetYears = 0, timeZone?: string): string {
  const first = startOfYear(today(timeZone ?? getLocalTimeZone()).add({ years: offsetYears }))
  const last = startOfYear(first.add({ years: 1 })).subtract({ days: 1 })
  return datePickerPresetValue([first.toString(), last.toString()])
}
