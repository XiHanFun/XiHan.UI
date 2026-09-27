/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 时间列的约束：小时制、按单位的步进、min / max 裁剪与带上下文的逐值可选性。
// 时间选择器、时间范围选择器、日期选择器与日期范围选择器的时间列共用这一份，纯运算，不碰 DOM。

import type { TimeDayPeriod, TimeDraft, TimeGranularity, TimeHourCycle } from '../time-field'
import { PlainDate, PlainTime } from '@xihan-ui/core/date'
import { parseTimeValue, TIME_FIELD_GRANULARITY, TIME_FIELD_HOUR_CYCLE, to12Hour, to24Hour } from '../time-field'

/**
 * 成列排布的单位，与分段输入里的段同名同域：列上选择与段上输入写入的是同一个值。
 * dayPeriod 只在 12 小时制下成列，恒排在末位。
 */
export type TimeColumnUnit = 'hour' | 'minute' | 'second' | 'dayPeriod'

/**
 * 一列可选值。value 是两位补零的显示串（'09' / '30'），与段上的文字同一写法；
 * 上下午列写 '00'（上午）与 '01'（下午），与该段在 aria-valuenow 上报的数同一个域。
 */
export interface TimeColumn<U extends TimeColumnUnit = TimeColumnUnit> {
  readonly unit: U
  readonly options: readonly string[]
}

/**
 * 按单位的步进：时列、分列、秒列各自每隔几格取一格，缺省都是 1。
 * 时的步进按 24 小时制的真实小时取（步进 2 即 0、2、4 … 22 点），12 小时制只是换一种写法显示。
 * 写坏的值（非正数、不小于该单位的进制）回退为 1。
 */
export interface TimeStep {
  hour?: number
  minute?: number
  second?: number
}

/** 生效的步进：三个单位都已落定。 */
export interface ResolvedTimeStep {
  readonly hour: number
  readonly minute: number
  readonly second: number
}

/**
 * isTimeUnavailable 收到的上下文：判定一格可不可选时，同一份值里其余几段已经选了什么。
 * 写得出「9 点只能选 30 分以后」「周末 18 点后不可约」这类规则。
 */
export interface TimeUnavailableContext {
  /** 已选的时，24 小时制（0-23）；尚未选时为 null。 */
  readonly hour: number | null
  /** 已选的分；尚未选时为 null。 */
  readonly minute: number | null
  /** 这份时间所属的日期（ISO 日期串）；时间选择器没有日期，恒为 null。 */
  readonly date: string | null
  /** 区间的哪一端（0 起点、1 终点）；单值组件恒为 null。 */
  readonly index: 0 | 1 | null
}

/**
 * 逐值可选性。value 是两位补零的格值：时列恒按 24 小时制给出（'00'-'23'，12 小时制下也换算成真实的时），
 * 分列与秒列是分秒本身，上下午列是 '00'（上午）/ '01'（下午）。unit 区分同一个 '30' 属于哪一列。
 * 判定为真的格子仍在列里、仍可聚焦，只是不可选中，与 min / max 之外的时刻同等对待。
 */
export type TimeUnavailablePredicate = (value: string, unit: TimeColumnUnit, context: TimeUnavailableContext) => boolean

/** 生成可选值列表的入参，全部是值，不涉及 DOM 也不读取状态机。 */
export interface TimeColumnsOptions {
  /** 精度：hour 只有时列，minute 时分两列，second 再多一列秒。 */
  granularity?: TimeGranularity
  /** 12 小时制下时列是 1-12 并多出上下午列，24 小时制是 0-23。 */
  hourCycle?: TimeHourCycle
  /** 按单位的步进。 */
  timeStep?: TimeStep
  /** 下界（含），ISO 时间串。落在界外的格子不出现在结果里。 */
  min?: string
  /** 上界（含）。同上。 */
  max?: string
  /** 已选的时（0-23）。分列与秒列据此收窄；尚未选时两列不收窄。 */
  hour?: number | null
  /** 已选的分。秒列据此收窄。 */
  minute?: number | null
  /** 12 小时制下把时列的显示值换算回 0-23 的依据，默认上午。 */
  dayPeriod?: TimeDayPeriod
}

/** 某一天上的时间界。 */
export interface TimeBounds {
  /** 下界（含），ISO 时间串；这一天不设下界时缺席。 */
  min?: string
  /** 上界（含）。 */
  max?: string
  /** 这一天整天落在 min / max 之外：没有一格可选。 */
  closed: boolean
}

const MINUTES_IN_HOUR = 60
const SECONDS_IN_MINUTE = 60
const HOURS_IN_DAY = 24

/** 列上的格值与段上的文字用同一套两位补零，选中比对才对得上。 */
export function timeItemValue(display: number): string {
  return String(display).padStart(2, '0')
}

/** 一个单位的步进：取整后落在 [1, 进制) 里才算数，否则回退为 1。 */
function stepWithin(step: number | undefined, radix: number): number {
  const n = Math.trunc(step ?? 1)
  return Number.isFinite(n) && n >= 1 && n < radix ? n : 1
}

/**
 * 生效的步进。0 与负数会让循环停不下来，不小于进制的只剩一格，界外一律回退为 1。
 */
export function resolveTimeStep(step?: TimeStep): ResolvedTimeStep {
  return {
    hour: stepWithin(step?.hour, HOURS_IN_DAY),
    minute: stepWithin(step?.minute, MINUTES_IN_HOUR),
    second: stepWithin(step?.second, SECONDS_IN_MINUTE),
  }
}

/** 时列的显示值序列：12 小时制是 1-12，24 小时制是 0-23。 */
function hourDisplays(hourCycle: TimeHourCycle): number[] {
  if (hourCycle === 12)
    return Array.from({ length: 12 }, (_, i) => i + 1)
  return Array.from({ length: HOURS_IN_DAY }, (_, i) => i)
}

/**
 * 可选值裁剪，逐段比大小而不是整点比较：
 * 时列只看时、分列在时相等时才看分、秒列在时分都相等时才看秒。
 */
function withinLower(parts: readonly number[], bound: readonly number[]): boolean {
  for (let i = 0; i < parts.length; i++) {
    if (parts[i]! > bound[i]!)
      return true
    if (parts[i]! < bound[i]!)
      return false
  }
  return true
}

function withinUpper(parts: readonly number[], bound: readonly number[]): boolean {
  for (let i = 0; i < parts.length; i++) {
    if (parts[i]! < bound[i]!)
      return true
    if (parts[i]! > bound[i]!)
      return false
  }
  return true
}

function inRange(parts: readonly number[], lo: readonly number[] | null, hi: readonly number[] | null): boolean {
  if (lo && !withinLower(parts, lo.slice(0, parts.length)))
    return false
  if (hi && !withinUpper(parts, hi.slice(0, parts.length)))
    return false
  return true
}

/** ISO 串 → [时, 分, 秒]；解析不了就是 null（此侧不设界）。 */
function boundParts(value: string | undefined): number[] | null {
  const time = parseTimeValue(value)
  return time ? [time.hour, time.minute, time.second] : null
}

/**
 * 浮层里排哪几列、每列有哪些可选值。纯函数，入参全是值，不读机器也不碰 DOM。
 * 步进按单位取样；min / max 把不可选的裁掉而不是置灰；
 * 分列与秒列的裁剪取决于已选的时（分），没选时不收窄。
 */
export function timeColumns(options: TimeColumnsOptions = {}): TimeColumn[] {
  const hourCycle = options.hourCycle ?? TIME_FIELD_HOUR_CYCLE
  const granularity = options.granularity ?? TIME_FIELD_GRANULARITY
  const step = resolveTimeStep(options.timeStep)
  const lo = boundParts(options.min)
  const hi = boundParts(options.max)
  const period = options.dayPeriod ?? 'am'
  const hour = options.hour ?? null
  const minute = options.minute ?? null
  // 时的步进按真实小时取：12 小时制下同一个显示值落在哪个小时要看上下午
  const hourFits = (h24: number): boolean => h24 % step.hour === 0 && inRange([h24], lo, hi)

  const hours: string[] = []
  for (const display of hourDisplays(hourCycle)) {
    const h24 = hourCycle === 12 ? to24Hour(display, period) : display
    if (hourFits(h24))
      hours.push(timeItemValue(display))
  }
  const columns: TimeColumn[] = [{ unit: 'hour', options: hours }]

  if (granularity !== 'hour') {
    const minutes: string[] = []
    for (let m = 0; m < MINUTES_IN_HOUR; m += step.minute) {
      if (hour == null || inRange([hour, m], lo, hi))
        minutes.push(timeItemValue(m))
    }
    columns.push({ unit: 'minute', options: minutes })
  }

  if (granularity === 'second') {
    const seconds: string[] = []
    for (let s = 0; s < SECONDS_IN_MINUTE; s += step.second) {
      if (hour == null || minute == null || inRange([hour, minute, s], lo, hi))
        seconds.push(timeItemValue(s))
    }
    columns.push({ unit: 'second', options: seconds })
  }

  // 上下午列只在 12 小时制下存在，恒排末位：与分段输入里的段序一致，
  // 也让数字列的下标不随小时制变动。
  // 裁剪与时列互为对方的条件——时列按当前上下午换算成 0-23 比界，这一列则按当前的显示小时比：
  // 小时还没填时不收窄（同分列与秒列在时未填时的做法）
  if (hourCycle === 12) {
    const display = hour == null ? null : to12Hour(hour).hour
    const periods: string[] = []
    for (const candidate of ['am', 'pm'] as const) {
      if (display == null || hourFits(to24Hour(display, candidate)))
        periods.push(timeItemValue(candidate === 'pm' ? 1 : 0))
    }
    columns.push({ unit: 'dayPeriod', options: periods })
  }

  return columns
}

/** 这份逐段值此刻落在上午还是下午：小时填了由它定，没填看缓冲里记着的那次按键，都没有按上午。 */
export function timeDraftPeriod(draft: TimeDraft): TimeDayPeriod {
  return draft.hour != null ? to12Hour(draft.hour).period : (draft.dayPeriod ?? 'am')
}

/** 逐段缓冲转成生成列表所需的入参，再生成列表。 */
export function timeColumnsFor(
  draft: TimeDraft,
  options: Omit<TimeColumnsOptions, 'hour' | 'minute' | 'dayPeriod'>,
): TimeColumn[] {
  return timeColumns({
    ...options,
    hour: draft.hour,
    minute: draft.minute,
    dayPeriod: timeDraftPeriod(draft),
  })
}

/**
 * 交给 isTimeUnavailable 的格值：时列换算成 24 小时制的真实小时（12 小时制下按这份值当前的上下午），
 * 其余列原样。判定规则因此不必跟着小时制改写。
 */
export function timeUnavailableValue(
  unit: TimeColumnUnit,
  value: string,
  hourCycle: TimeHourCycle,
  period: TimeDayPeriod,
): string {
  if (unit !== 'hour' || hourCycle !== 12)
    return value
  return timeItemValue(to24Hour(Number(value), period))
}

/** 一格该不该交给作者的判定：它是哪一列哪一格、这份值此刻的几段、这份值属于哪一天哪一端。 */
export interface TimeItemAvailability {
  unit: TimeColumnUnit
  /** 格值（两位补零的显示串）。 */
  value: string
  hourCycle: TimeHourCycle
  /** 这份值此刻的逐段缓冲，时列换算与上下文都从它取。 */
  draft: TimeDraft
  /** 所属日期；没有日期的组件缺席。 */
  date?: string | null
  /** 区间的哪一端；单值组件缺席。 */
  index?: 0 | 1 | null
}

/** 作者的逐值判定：没提供判定时恒为可选。 */
export function isTimeItemUnavailable(
  predicate: TimeUnavailablePredicate | undefined,
  item: TimeItemAvailability,
): boolean {
  if (!predicate)
    return false
  const context: TimeUnavailableContext = {
    hour: item.draft.hour,
    minute: item.draft.minute,
    date: item.date ?? null,
    index: item.index ?? null,
  }
  return predicate(timeUnavailableValue(item.unit, item.value, item.hourCycle, timeDraftPeriod(item.draft)), item.unit, context)
}

/** 取 ISO 串的日期段；空串与写坏的串给 null。 */
function datePartOf(value: string | undefined): PlainDate | null {
  if (!value)
    return null
  const at = value.indexOf('T')
  try {
    return PlainDate.from(at === -1 ? value : value.slice(0, at))
  }
  catch {
    return null
  }
}

/** 取 ISO 串的时间段；没有时间段时为 undefined。 */
function timePartOf(value: string | undefined): string | undefined {
  if (!value)
    return undefined
  const at = value.indexOf('T')
  return at === -1 ? undefined : value.slice(at + 1)
}

/**
 * 某一天上的时间界。min / max 是日期（'2026-09-28'）或日期时间（'2026-09-28T09:30'）：
 * 这一天早于 min 的日期段或晚于 max 的日期段时整天不可选；与带时间段的 min / max 同一天时取它的时间段作界；
 * 其余日子（以及只到日期的 min / max）不设时间界。
 */
export function timeBoundsOnDate(date: string | null, min?: string, max?: string): TimeBounds {
  const day = datePartOf(date ?? undefined)
  if (!day)
    return { closed: false }
  const lower = datePartOf(min)
  const upper = datePartOf(max)
  const beforeMin = lower ? PlainDate.compare(day, lower) : 1
  const afterMax = upper ? PlainDate.compare(day, upper) : -1
  if (beforeMin < 0 || afterMax > 0)
    return { closed: true }
  return {
    min: beforeMin === 0 ? timePartOf(min) : undefined,
    max: afterMax === 0 ? timePartOf(max) : undefined,
    closed: false,
  }
}

/** 两个下界取较晚的那个；任一缺席取另一个。 */
export function laterTimeBound(a: string | undefined, b: string | undefined): string | undefined {
  const pa = parseTimeValue(a)
  const pb = parseTimeValue(b)
  if (!pa)
    return pb ? b : undefined
  if (!pb)
    return a
  return PlainTime.compare(pa, pb) >= 0 ? a : b
}
