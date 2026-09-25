// 用 Intl 模拟任意时区的日历，让夏令时相关的断言不依赖运行测试那台机器所在的时区。

import type { TimeCalendar, WallTime } from '../../src'
import { utcCalendar } from '../../src'

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export function zonedCalendar(timeZone: string): TimeCalendar {
  const format = new Intl.DateTimeFormat('en-US', {
    timeZone,
    hourCycle: 'h23',
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
    weekday: 'short',
  })

  function toWall(time: number): WallTime {
    const parts: Record<string, string> = {}
    for (const part of format.formatToParts(new Date(time)))
      parts[part.type] = part.value
    return {
      year: Number(parts.year),
      month: Number(parts.month) - 1,
      day: Number(parts.day),
      weekday: WEEKDAYS.indexOf(parts.weekday as string),
      hour: Number(parts.hour),
      minute: Number(parts.minute),
      second: Number(parts.second),
      millisecond: ((time % 1000) + 1000) % 1000,
    }
  }

  /** 把墙上时间按 UTC 读成一个时间点；它与真实时间点之差就是该时刻的时区偏移。 */
  function wallAsUtc(time: number): number {
    const w = toWall(time)
    return utcCalendar.fromWall(w.year, w.month, w.day, w.hour, w.minute, w.second, w.millisecond)
  }

  function fromWall(year: number, month: number, day: number, hour = 0, minute = 0, second = 0, millisecond = 0): number {
    const target = utcCalendar.fromWall(year, month, day, hour, minute, second, millisecond)
    // 前后一天各取一次偏移，覆盖目标附近可能发生的切换
    const offsets = new Set([wallAsUtc(target - 86_400_000) - (target - 86_400_000), wallAsUtc(target + 86_400_000) - (target + 86_400_000)])
    const candidates = [...offsets].map(offset => target - offset)
    const valid = candidates.filter(time => wallAsUtc(time) === target)
    // 重复的墙上时间取较早者；被跳过的墙上时间取其后的时刻（与 Date 的本地时间语义一致）
    return valid.length > 0 ? Math.min(...valid) : Math.max(...candidates)
  }

  return { toWall, fromWall }
}
