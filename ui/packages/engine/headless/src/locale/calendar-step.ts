/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 日历翻页走过的跨度档，供各语言包给四颗翻页钮起名。

import type { CalendarView } from '../shared/calendar/grid'

/**
 * 翻一页（big 为假）或快速翻页（big 为真）走过的跨度：0 一个月、1 一年、2 十年、3 一百年。
 * 与 calendarPageMonths 同一张换算：日与周视图一页一个月，月与季度视图一页一年，年视图一页十年，快速翻页再大一档。
 */
export function calendarStepSpan(view: CalendarView, big: boolean): 0 | 1 | 2 | 3 {
  const page = view === 'year' ? 2 : view === 'month' || view === 'quarter' ? 1 : 0
  return (big ? page + 1 : page) as 0 | 1 | 2 | 3
}
