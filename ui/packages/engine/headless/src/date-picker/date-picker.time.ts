/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// showTime 的日期与时间拆并：值升格为 'YYYY-MM-DDTHH:mm[:ss]'，
// 日历与段位只认日期段、时间列只认时间段，拆并全在编排边界完成。纯运算，不碰 DOM。
import type { TimeColumn, TimeColumnUnit, TimeStep, TimeUnavailablePredicate } from '../shared/time-constraint'
import type { TimeGranularity, TimeHourCycle } from '../time-field'
import { dayPeriodLabel } from '../shared/day-period'
import {
  isTimeItemUnavailable,
  laterTimeBound,
  timeBoundsOnDate,
  timeColumns,
  timeColumnsFor,
  timeDraftPeriod,
  timeItemValue,
} from '../shared/time-constraint'
import { draftFromTime, formatTimeValue, parseTimeValue, segmentNumber, setTimeSegment } from '../time-field'

/** showTime 下时间段的精度：分或秒（时间列没有只到小时的形态）。 */
export type DatePickerTimeGranularity = Extract<TimeGranularity, 'minute' | 'second'>

/** 取日期段；空串原样返回（区间占位）。 */
export function datePickerDatePart(value: string): string {
  const at = value.indexOf('T')
  return at === -1 ? value : value.slice(0, at)
}

/** 取时间段；没有时间段（纯日期或空串）为 null。 */
export function datePickerTimePart(value: string): string | null {
  const at = value.indexOf('T')
  return at === -1 ? null : value.slice(at + 1)
}

/** 精度对应的零点。 */
export function datePickerZeroTime(granularity: DatePickerTimeGranularity): string {
  return granularity === 'second' ? '00:00:00' : '00:00'
}

/** 拼回 datetime；日期为空（区间占位）不拼，时间缺席补零点。 */
export function datePickerJoinDateTime(
  date: string,
  time: string | null,
  granularity: DatePickerTimeGranularity,
): string {
  if (date === '')
    return ''
  return `${date}T${time ?? datePickerZeroTime(granularity)}`
}

/** 把时间段的某个单位换成新值（两位补零串），其余单位原样；时间缺席从零点起改。 */
export function datePickerSetTimeUnit(
  time: string | null,
  unit: 'hour' | 'minute' | 'second',
  next: string,
  granularity: DatePickerTimeGranularity,
): string {
  const parts = (time ?? datePickerZeroTime(granularity)).split(':')
  const out = [parts[0] ?? '00', parts[1] ?? '00', ...(granularity === 'second' ? [parts[2] ?? '00'] : [])]
  const at = unit === 'hour' ? 0 : unit === 'minute' ? 1 : 2
  if (at < out.length)
    out[at] = next
  return out.join(':')
}

/**
 * 时间段按精度归一（'9:00' → '09:00'，多出的秒按精度截掉）；解析不了为 null。
 * defaultTime 与作者写的时刻都经这里，写进值的一律是组件自己的形状。
 */
export function datePickerNormalizeTime(raw: string | null | undefined, granularity: DatePickerTimeGranularity): string | null {
  const time = parseTimeValue(raw)
  if (!time)
    return null
  const text = formatTimeValue(draftFromTime(time), granularity)
  return text === '' ? null : text
}

/** 一份时间列的入参：值、所属日期与约束，全部是值。 */
export interface DatePickerTimeModelInput {
  /** 此刻的时间段（'HH:mm[:ss]'）；还没有时为 null。 */
  time: string | null
  /** 这份时间所属的日期（ISO 日期串）；min / max 的时间界按它落。 */
  date: string | null
  granularity: DatePickerTimeGranularity
  hourCycle: TimeHourCycle
  timeStep?: TimeStep
  /** 可选范围的下界 / 上界：日期或日期时间，带时间段时只约束与它同一天的时刻。 */
  min?: string
  max?: string
  /** 另加的时间下界（区间终点与起点同一天时，起点的时刻）。 */
  timeMin?: string
  isTimeUnavailable?: TimeUnavailablePredicate
  /** 区间的哪一端；单值组件缺席。 */
  index?: 0 | 1
  locale?: string
}

/** 一份时间列此刻的投影：排哪几列、每格选没选中、可不可选、显示什么字、点下去写成什么时刻。 */
export interface DatePickerTimeModel {
  /** 排哪几列、每列的格（按步进取样，不按 min / max 删格：列长不随所选的日子变）。 */
  columns: readonly TimeColumn[]
  /** 这一列选中的格（两位补零）；时间还空着时为 null。12 小时制的时列是显示值，上下午列是 '00' / '01'。 */
  selectedOf: (unit: TimeColumnUnit) => string | null
  /** 界外、被作者判为不可用的格：仍在列里、仍可聚焦，只是按不下去。 */
  isUnavailable: (unit: TimeColumnUnit, value: string) => boolean
  /** 这一列的 Tab 落点：选中且可选的那一格，否则头一个可选的格；一格都不可选时给头一格，全列为空时 null。 */
  anchorOf: (unit: TimeColumnUnit) => string | null
  /** 格上的字：数字列即格值，上下午列按 locale 现译。 */
  itemText: (unit: TimeColumnUnit, value: string) => string
  /** 选中一格之后的时间段：只改这一单位，时间缺席从零点起改。 */
  pick: (unit: TimeColumnUnit, value: string) => string
}

/**
 * 日期选择器与日期范围选择器的时间列共用这一份运算：
 * 格按步进取样、界外的格只标不可选，判定交给共享的时间约束。
 */
export function datePickerTimeModel(input: DatePickerTimeModelInput): DatePickerTimeModel {
  const { granularity, hourCycle, timeStep, locale } = input
  const draft = draftFromTime(parseTimeValue(input.time))
  // 起改的底：时间缺席从零点起，与日历选日时补的零点同一口径
  const base = draftFromTime(parseTimeValue(input.time ?? datePickerZeroTime(granularity)))
  const columns = timeColumns({ granularity, hourCycle, timeStep, dayPeriod: timeDraftPeriod(draft) })

  const bounds = timeBoundsOnDate(input.date, input.min, input.max)
  const lower = laterTimeBound(bounds.min, input.timeMin)
  const available = bounds.closed
    ? []
    : timeColumnsFor(draft, { granularity, hourCycle, timeStep, min: lower, max: bounds.max })
  const availableOf = (unit: TimeColumnUnit): readonly string[] =>
    available.find(column => column.unit === unit)?.options ?? []

  const selectedOf = (unit: TimeColumnUnit): string | null => {
    if (input.time == null)
      return null
    const current = segmentNumber(draft, unit, hourCycle)
    return current == null ? null : timeItemValue(current)
  }

  const isUnavailable = (unit: TimeColumnUnit, value: string): boolean =>
    !availableOf(unit).includes(value)
    || isTimeItemUnavailable(input.isTimeUnavailable, {
      unit,
      value,
      hourCycle,
      draft,
      date: input.date,
      index: input.index,
    })

  const anchorOf = (unit: TimeColumnUnit): string | null => {
    const options = columns.find(column => column.unit === unit)?.options ?? []
    if (options.length === 0)
      return null
    const picked = selectedOf(unit)
    if (picked != null && options.includes(picked) && !isUnavailable(unit, picked))
      return picked
    return options.find(option => !isUnavailable(unit, option)) ?? options[0]!
  }

  const itemText = (unit: TimeColumnUnit, value: string): string =>
    unit === 'dayPeriod' ? dayPeriodLabel(Number(value) >= 1 ? 'pm' : 'am', locale) : value

  const pick = (unit: TimeColumnUnit, value: string): string =>
    formatTimeValue(setTimeSegment(base, unit, Number(value), hourCycle), granularity)

  return { columns, selectedOf, isUnavailable, anchorOf, itemText, pick }
}
