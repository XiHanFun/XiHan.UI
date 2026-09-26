/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 日期值与运算的公开类型。命名与取值沿用 Temporal，将来换成原生 Temporal 时调用点不必改写。

/** 星期几：1 = 星期一 … 7 = 星期日（ISO 8601）。 */
export type DayOfWeek = 1 | 2 | 3 | 4 | 5 | 6 | 7

/** 日期部分的单位。 */
export type DateUnit = 'year' | 'month' | 'week' | 'day'

/** 时间部分的单位。 */
export type TimeUnit = 'hour' | 'minute' | 'second' | 'millisecond'

/**
 * 字段越界时怎么办。
 * - `constrain`：夹到最近的合法值（1 月 31 日加一个月是 2 月 28/29 日）
 * - `reject`：抛 RangeError
 */
export type Overflow = 'constrain' | 'reject'

/**
 * 墙上时间在某个时区里不唯一时取哪一刻。
 * - 夏令时跳过的时间（不存在）：`compatible` 与 `later` 取跳过之后的那一刻，`earlier` 取之前
 * - 夏令时重复的时间（出现两次）：`compatible` 与 `earlier` 取较早的一次，`later` 取较晚的一次
 * - `reject`：两种情况都抛 RangeError
 */
export type Disambiguation = 'compatible' | 'earlier' | 'later' | 'reject'

/**
 * 取整方式。ceil / floor 朝正负无穷，expand / trunc 远离 / 朝向零，
 * half* 只在恰好一半时生效：halfExpand 远离零（四舍五入），halfEven 取偶数。
 */
export type RoundingMode = 'ceil' | 'floor' | 'expand' | 'trunc' | 'halfCeil' | 'halfFloor' | 'halfExpand' | 'halfTrunc' | 'halfEven'

export interface PlainDateLike {
  year: number
  /** 1–12。 */
  month: number
  /** 1 起。 */
  day: number
}

export interface PlainTimeLike {
  /** 0–23，缺省 0。 */
  hour?: number
  /** 0–59，缺省 0。 */
  minute?: number
  /** 0–59，缺省 0。 */
  second?: number
  /** 0–999，缺省 0。 */
  millisecond?: number
}

export interface PlainDateTimeLike extends PlainDateLike, PlainTimeLike {}

/** 加减日期用的时长；各字段是整数，可正可负，缺省 0。先加年月（按 overflow 处理越界的日），再加周与日。 */
export interface DateDurationLike {
  years?: number
  months?: number
  weeks?: number
  days?: number
}

/** 加减时间用的时长；各字段是整数，可正可负，缺省 0。 */
export interface TimeDurationLike {
  hours?: number
  minutes?: number
  seconds?: number
  milliseconds?: number
}

export interface DateTimeDurationLike extends DateDurationLike, TimeDurationLike {}

/** 两个日期之差。各字段符号一致：终点早于起点时全为负或零。 */
export interface DateDuration {
  readonly years: number
  readonly months: number
  readonly weeks: number
  readonly days: number
}

/** 两个时间之差。各字段符号一致。 */
export interface TimeDuration {
  readonly hours: number
  readonly minutes: number
  readonly seconds: number
  readonly milliseconds: number
}

export interface DateTimeDuration extends DateDuration, TimeDuration {}

export interface OverflowOptions {
  /** 缺省 `constrain`。 */
  overflow?: Overflow
}

export interface DisambiguationOptions {
  /** 缺省 `compatible`。 */
  disambiguation?: Disambiguation
}

export interface DateDifferenceOptions {
  /** 结果里最大的单位，缺省 `day`：只给天数。取 `month` 或 `year` 时月数取不越过终点的最大值，起点加上结果恰好落在终点。 */
  largestUnit?: DateUnit
}

export interface TimeDifferenceOptions {
  /** 结果里最大的单位，缺省 `hour`。 */
  largestUnit?: TimeUnit
}

export interface DateTimeDifferenceOptions {
  /** 结果里最大的单位，缺省 `day`。取时间单位时整段差值折成该单位及以下。 */
  largestUnit?: DateUnit | TimeUnit
}

export interface TimeRoundOptions {
  smallestUnit: TimeUnit
  /** 取整步长，缺省 1。必须整除上一级单位（小时整除 24，分、秒整除 60，毫秒整除 1000）且小于它。 */
  roundingIncrement?: number
  /** 缺省 `halfExpand`。 */
  roundingMode?: RoundingMode
}

export interface DateTimeRoundOptions {
  /** `day` 只能以 1 为步长，其余同 TimeRoundOptions。 */
  smallestUnit: TimeUnit | 'day'
  roundingIncrement?: number
  roundingMode?: RoundingMode
}

export interface TimeToStringOptions {
  /**
   * 输出到哪一位，更细的位直接截掉。缺省按值决定：秒恒输出，毫秒非零时才输出小数且去掉末尾的 0。
   */
  smallestUnit?: 'minute' | 'second' | 'millisecond'
}
