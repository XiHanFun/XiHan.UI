/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 日期函数：当前时间、构造、取部分、加减、相差与格式化。
import type { DateParts, DateUnit } from '../date'
import type { ExprValue } from '../value'
import type { FunctionEntry } from './entry'
import { addToDate, daysInMonth, diffDates, ExprDate, formatDate, isDateUnit, startOfDay } from '../date'
import { numberFromInteger } from '../decimal'
import { Fault } from '../issues'
import { builtin } from './entry'
import { anyNull, integerArg, invalidArgument, limitString, numberArg, stringArg, typeMismatch } from './helpers'

/** `DATE_ADD` 数量实参的绝对值上限，超出即越界。 */
const AMOUNT_LIMIT = 1e15

function dateArg(args: readonly ExprValue[], index: number): ExprDate | Fault {
  const value = args[index] ?? null
  return value instanceof ExprDate ? value : typeMismatch(index, value)
}

/* @__NO_SIDE_EFFECTS__ */
function datePart(name: string, read: (parts: DateParts, date: ExprDate) => number): FunctionEntry {
  return builtin(name, ['date'], 1, 1, (args) => {
    if (anyNull(args))
      return null
    const date = dateArg(args, 0)
    return date instanceof Fault ? date : numberFromInteger(read(date.parts, date))
  })
}

function unitArg(args: readonly ExprValue[], index: number): DateUnit | Fault {
  const unit = stringArg(args, index)
  if (unit instanceof Fault)
    return unit
  return isDateUnit(unit) ? unit : invalidArgument(index)
}

const PART_RANGES: readonly (readonly [number, number])[] = [[1, 9999], [1, 12], [1, 31], [0, 23], [0, 59], [0, 59], [0, 999]]

/** 日期函数：日期不带时区，`NOW()` / `TODAY()` 取宿主提供的当前时间。 */
export const DATE_FUNCTIONS: readonly FunctionEntry[] = [
  builtin('NOW', [], 0, 0, (_args, runtime) => runtime.now ?? new Fault('XH_EXPR_NOW_UNAVAILABLE')),
  builtin('TODAY', [], 0, 0, (_args, runtime) => (runtime.now === null ? new Fault('XH_EXPR_NOW_UNAVAILABLE') : startOfDay(runtime.now))),
  builtin('DATE', ['year', 'month', 'day', 'hour', 'minute', 'second', 'millisecond'], 3, 7, (args) => {
    if (anyNull(args))
      return null
    const parts: number[] = []
    for (let index = 0; index < args.length; index += 1) {
      const [min, max] = PART_RANGES[index]!
      const part = integerArg(args, index, min, index === 2 ? daysInMonth(parts[0]!, parts[1]!) : max)
      if (part instanceof Fault)
        return part
      parts.push(part)
    }
    const [year = 1, month = 1, day = 1, hour = 0, minute = 0, second = 0, millisecond = 0] = parts
    return ExprDate.fromParts(year, month, day, hour, minute, second, millisecond)
  }),
  builtin('TO_DATE', ['value'], 1, 1, (args) => {
    const value = args[0]!
    if (value === null || value instanceof ExprDate)
      return value
    return typeof value === 'string' ? ExprDate.parse(value) : typeMismatch(0, value)
  }),
  datePart('YEAR', parts => parts.year),
  datePart('MONTH', parts => parts.month),
  datePart('DAY', parts => parts.day),
  datePart('HOUR', parts => parts.hour),
  datePart('MINUTE', parts => parts.minute),
  datePart('SECOND', parts => parts.second),
  datePart('WEEKDAY', (_parts, date) => date.weekday),
  builtin('DATE_ADD', ['date', 'amount', 'unit'], 3, 3, (args) => {
    if (anyNull(args))
      return null
    const date = dateArg(args, 0)
    if (date instanceof Fault)
      return date
    const amount = numberArg(args, 1)
    if (amount instanceof Fault)
      return amount
    if (!amount.isInteger)
      return invalidArgument(1)
    const unit = unitArg(args, 2)
    if (unit instanceof Fault)
      return unit
    const count = amount.toJs()
    return Math.abs(count) > AMOUNT_LIMIT ? new Fault('XH_EXPR_DATE_OUT_OF_RANGE') : addToDate(date, count, unit)
  }),
  builtin('DATE_DIFF', ['start', 'end', 'unit'], 3, 3, (args) => {
    if (anyNull(args))
      return null
    const start = dateArg(args, 0)
    if (start instanceof Fault)
      return start
    const end = dateArg(args, 1)
    if (end instanceof Fault)
      return end
    const unit = unitArg(args, 2)
    return unit instanceof Fault ? unit : numberFromInteger(diffDates(start, end, unit))
  }),
  builtin('FORMAT_DATE', ['date', 'pattern'], 2, 2, (args, runtime) => {
    if (anyNull(args))
      return null
    const date = dateArg(args, 0)
    if (date instanceof Fault)
      return date
    const pattern = stringArg(args, 1)
    return pattern instanceof Fault ? pattern : limitString(formatDate(date, pattern), runtime)
  }),
]
