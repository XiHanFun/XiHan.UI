/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 时区：时间点与墙上时间互换。偏移量一律向 Intl 询问，库里不带时区数据库。
// 墙上时间在这里编码成「当它是 UTC 时的毫秒数」，与时间点同单位，差值就是偏移量。

import type { Disambiguation } from './types'
import { civilOf, epochDayOf, MS_PER_DAY, MS_PER_HOUR, MS_PER_MINUTE, MS_PER_SECOND } from './calendar'

let localTimeZone: string | undefined

/** 运行环境所在的时区（IANA 名）。第一次读取后缓存。 */
export function getLocalTimeZone(): string {
  localTimeZone ??= new Intl.DateTimeFormat().resolvedOptions().timeZone
  return localTimeZone
}

const formatters = new Map<string, Intl.DateTimeFormat>()

function formatterFor(timeZone: string): Intl.DateTimeFormat {
  let formatter = formatters.get(timeZone)
  if (!formatter) {
    try {
      formatter = new Intl.DateTimeFormat('en-US-u-ca-gregory-nu-latn', {
        timeZone,
        hourCycle: 'h23',
        era: 'short',
        year: 'numeric',
        month: 'numeric',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        second: 'numeric',
      })
    }
    catch {
      throw new RangeError(`[xh] 运行环境不认识时区 ${JSON.stringify(timeZone)}`)
    }
    formatters.set(timeZone, formatter)
  }
  return formatter
}

/** 运行环境是否认得这个时区名。 */
export function isValidTimeZone(timeZone: string): boolean {
  try {
    formatterFor(timeZone)
    return true
  }
  catch {
    return false
  }
}

/** 把别名归一为当前 Intl 实现返回的 IANA 标识；无效名称抛 RangeError。 */
export function canonicalizeTimeZone(timeZone: string): string {
  return formatterFor(timeZone).resolvedOptions().timeZone
}

let availableTimeZones: readonly string[] | undefined

/**
 * 当前运行环境支持的 IANA 时区，按名称排序并显式包含 UTC。
 * Intl.supportedValuesOf 不可用时抛错，调用方应提供自己的时区集合，不静默伪造不完整列表。
 */
export function getAvailableTimeZones(): readonly string[] {
  if (availableTimeZones)
    return availableTimeZones
  if (typeof Intl.supportedValuesOf !== 'function')
    throw new Error('[xh] 当前运行环境不支持 Intl.supportedValuesOf；请显式提供时区集合')
  const zones = Intl.supportedValuesOf('timeZone').filter(zone => zone !== 'UTC' && zone !== 'Etc/UTC')
  availableTimeZones = Object.freeze(['UTC', ...zones])
  return availableTimeZones
}

/** UTC 偏移量 → ISO 字符串；东正西负，零偏移写成 +00:00。 */
export function formatTimeZoneOffset(offsetMilliseconds: number): string {
  if (!Number.isInteger(offsetMilliseconds))
    throw new RangeError(`[xh] UTC 偏移量必须是整数毫秒，收到 ${offsetMilliseconds}`)
  const sign = offsetMilliseconds < 0 ? '-' : '+'
  let rest = Math.abs(offsetMilliseconds)
  const hour = Math.floor(rest / MS_PER_HOUR)
  rest -= hour * MS_PER_HOUR
  const minute = Math.floor(rest / MS_PER_MINUTE)
  rest -= minute * MS_PER_MINUTE
  const second = Math.floor(rest / MS_PER_SECOND)
  const millisecond = rest - second * MS_PER_SECOND
  const pad = (value: number, length = 2): string => String(value).padStart(length, '0')
  const seconds = second || millisecond ? `:${pad(second)}${millisecond ? `.${pad(millisecond, 3)}` : ''}` : ''
  return `${sign}${pad(hour)}:${pad(minute)}${seconds}`
}

function isUtc(timeZone: string): boolean {
  return timeZone === 'UTC' || timeZone === 'Etc/UTC'
}

/** 时间点在该时区的偏移量（毫秒，东正西负）。 */
function offsetAt(epochMs: number, timeZone: string): number {
  if (isUtc(timeZone))
    return 0
  // Intl 只给到秒，毫秒位先截掉再比
  const base = epochMs - (((epochMs % MS_PER_SECOND) + MS_PER_SECOND) % MS_PER_SECOND)
  let year = 0
  let month = 1
  let day = 1
  let hour = 0
  let minute = 0
  let second = 0
  let bc = false
  for (const part of formatterFor(timeZone).formatToParts(base)) {
    switch (part.type) {
      case 'year': year = Number(part.value)
        break
      case 'month': month = Number(part.value)
        break
      case 'day': day = Number(part.value)
        break
      case 'hour': hour = Number(part.value)
        break
      case 'minute': minute = Number(part.value)
        break
      case 'second': second = Number(part.value)
        break
      case 'era': bc = part.value === 'BC' || part.value === 'B'
        break
    }
  }
  if (bc)
    year = 1 - year
  const wall = epochDayOf(year, month, day) * MS_PER_DAY + hour * MS_PER_HOUR + minute * MS_PER_MINUTE + second * MS_PER_SECOND
  return wall - base
}

/** 时间点所在时区的偏移量（毫秒，东正西负）；时区缺省为运行环境所在时区。 */
export function getTimeZoneOffset(instant: Date | number, timeZone: string = getLocalTimeZone()): number {
  return offsetAt(toEpochMs(instant), timeZone)
}

/** Date 或毫秒数 → 毫秒数；无效的 Date 抛 RangeError。 */
export function toEpochMs(instant: Date | number): number {
  const ms = typeof instant === 'number' ? instant : instant.getTime()
  if (!Number.isFinite(ms) || Math.abs(ms) > 8.64e15)
    throw new RangeError(`[xh] 时间点超出 Date 的范围：${String(instant)}`)
  return ms
}

/** 时间点 → 墙上时间（编码为毫秒）。 */
export function wallOf(epochMs: number, timeZone: string): number {
  return epochMs + offsetAt(epochMs, timeZone)
}

/**
 * 墙上时间 → 时间点。先按前后一天的两个偏移量各试一次：
 * 两个都对得上是重复的时间，都对不上是跳过的时间，按 disambiguation 取舍。
 */
export function instantOf(wall: number, timeZone: string, disambiguation: Disambiguation = 'compatible'): number {
  if (isUtc(timeZone))
    return checkInstant(wall)
  const before = offsetAt(wall - MS_PER_DAY, timeZone)
  const after = offsetAt(wall + MS_PER_DAY, timeZone)
  const candidates: number[] = []
  for (const offset of before === after ? [before] : [before, after]) {
    const instant = wall - offset
    if (offsetAt(instant, timeZone) === offset)
      candidates.push(instant)
  }
  candidates.sort((a, b) => a - b)
  if (candidates.length === 1)
    return checkInstant(candidates[0]!)
  if (disambiguation === 'reject')
    throw new RangeError(`[xh] 墙上时间 ${describeWall(wall)} 在时区 ${timeZone} 里${candidates.length ? '出现两次' : '不存在'}`)
  if (candidates.length === 2)
    return checkInstant(disambiguation === 'later' ? candidates[1]! : candidates[0]!)
  // 跳过的时间：沿用跳变前的偏移量落在跳变之后，沿用跳变后的偏移量落在之前
  return checkInstant(disambiguation === 'earlier' ? wall - after : wall - before)
}

function checkInstant(ms: number): number {
  if (Math.abs(ms) > 8.64e15)
    throw new RangeError('[xh] 时间点超出 Date 的范围')
  return ms
}

function describeWall(wall: number): string {
  const epochDay = Math.floor(wall / MS_PER_DAY)
  const [year, month, day] = civilOf(epochDay)
  const ms = wall - epochDay * MS_PER_DAY
  const pad = (n: number): string => String(n).padStart(2, '0')
  return `${year}-${pad(month)}-${pad(day)}T${pad(Math.floor(ms / MS_PER_HOUR))}:${pad(Math.floor(ms / MS_PER_MINUTE) % 60)}`
}
