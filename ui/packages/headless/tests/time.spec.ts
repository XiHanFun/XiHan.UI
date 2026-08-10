import type { TimeApi, TimeProps } from '../src/time'
import { normalizeProps } from '@xihan-ui/kernel'
import { describe, expect, it } from 'vitest'
// 直接从组件目录导入，不经包主入口
import { connectTime, formatRelativeTime, formatTimePattern, timeMachineStamp, toTimeDate } from '../src/time'

type Dict = Record<string, unknown>

/** 用给定 props 调一次连接层，返回其 API。 */
function api(props: TimeProps = {}): TimeApi {
  return connectTime(props, normalizeProps)
}

/** 本地墙钟建的时刻：不写偏移量，换台机器跑出来的年月日时分秒还是同一组数。 */
function at(year: number, month: number, day: number, hour = 0, minute = 0, second = 0): Date {
  return new Date(year, month - 1, day, hour, minute, second)
}

describe('toTimeDate', () => {
  it('只写年月日的串按本地零点建，不落到前一天去', () => {
    const parsed = toTimeDate('2026-08-11')!
    expect(parsed.getFullYear()).toBe(2026)
    expect(parsed.getMonth()).toBe(7)
    expect(parsed.getDate()).toBe(11)
    expect(parsed.getHours()).toBe(0)
  })

  it('带时分秒、不带偏移量的串按本地时间解读', () => {
    const parsed = toTimeDate('2026-08-11T09:30:05')!
    expect(parsed.getHours()).toBe(9)
    expect(parsed.getMinutes()).toBe(30)
    expect(parsed.getSeconds()).toBe(5)
  })

  it('数字当毫秒时间戳收', () => {
    expect(toTimeDate(at(2026, 8, 11, 9).getTime())?.getHours()).toBe(9)
  })

  it('date 原样收，无效的 Date 认不出', () => {
    const date = at(2026, 8, 11)
    expect(toTimeDate(date)).toBe(date)
    expect(toTimeDate(new Date(Number.NaN))).toBeUndefined()
  })

  it('空、空白与认不出的写法一律返回 undefined', () => {
    expect(toTimeDate(undefined)).toBeUndefined()
    expect(toTimeDate(null)).toBeUndefined()
    expect(toTimeDate('   ')).toBeUndefined()
    expect(toTimeDate('下周三下午')).toBeUndefined()
    expect(toTimeDate(Number.NaN)).toBeUndefined()
  })
})

describe('formatTimePattern', () => {
  const date = at(2026, 8, 5, 9, 3, 7)

  it('两位记号补零，一位记号不补', () => {
    expect(formatTimePattern(date, 'YYYY-MM-DD HH:mm:ss')).toBe('2026-08-05 09:03:07')
    expect(formatTimePattern(date, 'YYYY-M-D H:m:s')).toBe('2026-8-5 9:3:7')
  })

  it('yY 只取年份后两位', () => {
    expect(formatTimePattern(date, 'YY')).toBe('26')
  })

  it('记号之外的字符原样留着', () => {
    expect(formatTimePattern(date, 'YYYY 年 M 月 D 日')).toBe('2026 年 8 月 5 日')
  })

  it('一遍扫完：换上去的数字不会被当成记号再扫一次', () => {
    // 五月里的 M 换出 5，若再扫一遍，s 记号会把这个 5 后面的东西一起啃掉
    expect(formatTimePattern(at(2026, 5, 5, 5, 5, 5), 'M-D-H-m-s')).toBe('5-5-5-5-5')
  })
})

describe('formatRelativeTime', () => {
  const now = at(2026, 8, 11, 12, 0, 0)

  it('一分钟以内是刚刚', () => {
    expect(formatRelativeTime(at(2026, 8, 11, 11, 59, 30), now, 'zh-CN')).toBe('刚刚')
  })

  it('按分、时、天逐档取整', () => {
    expect(formatRelativeTime(at(2026, 8, 11, 11, 30, 0), now, 'zh-CN')).toBe('30 分钟前')
    expect(formatRelativeTime(at(2026, 8, 11, 9, 0, 0), now, 'zh-CN')).toBe('3 小时前')
    expect(formatRelativeTime(at(2026, 8, 9, 12, 0, 0), now, 'zh-CN')).toBe('2 天前')
  })

  it('英文用词单复数跟着数走', () => {
    expect(formatRelativeTime(at(2026, 8, 11, 11, 59, 0), now, 'en')).toBe('1 minute ago')
    expect(formatRelativeTime(at(2026, 8, 11, 11, 58, 0), now, 'en')).toBe('2 minutes ago')
  })

  it('超出三十天就没有档位可用', () => {
    expect(formatRelativeTime(at(2026, 1, 1), now, 'zh-CN')).toBeUndefined()
  })

  it('领先一分钟以内仍算刚刚，更远的未来没有档位可用', () => {
    expect(formatRelativeTime(at(2026, 8, 11, 12, 0, 30), now, 'zh-CN')).toBe('刚刚')
    expect(formatRelativeTime(at(2026, 8, 11, 13, 0, 0), now, 'zh-CN')).toBeUndefined()
  })
})

describe('timeMachineStamp', () => {
  const date = at(2026, 8, 11, 9, 30, 5)

  it('date 型收到日期精度，其余到秒', () => {
    expect(timeMachineStamp(date, 'date')).toBe('2026-08-11')
    expect(timeMachineStamp(date, 'datetime')).toBe('2026-08-11T09:30:05')
    expect(timeMachineStamp(date, 'relative')).toBe('2026-08-11T09:30:05')
  })

  it('不带偏移量：这是一个本地日期时间串，组件不替宿主宣称时区', () => {
    expect(timeMachineStamp(date, 'datetime')).not.toMatch(/[Z+]/)
  })
})

describe('connectTime', () => {
  it('没给时刻落 empty：不出戳、不出字', () => {
    const it0 = api()
    expect(it0.state).toBe('empty')
    expect(it0.stamp).toBeUndefined()
    expect(it0.text).toBe('')
    expect((it0.getRootProps() as Dict).datetime).toBeUndefined()
  })

  it('给了空白的串等于没给', () => {
    expect(api({ value: '   ' }).state).toBe('empty')
  })

  it('认不出的时刻落 invalid，仍不出戳', () => {
    const it0 = api({ value: '下周三下午' })
    expect(it0.state).toBe('invalid')
    expect(it0.stamp).toBeUndefined()
    expect(it0.text).toBe('')
  })

  it('缺省是 datetime 型', () => {
    expect((api({ value: '2026-08-11T09:30:05' }).getRootProps() as Dict)['data-type']).toBe('datetime')
  })

  it('戳与文本取自同一个墙钟', () => {
    const it0 = api({ value: '2026-08-11T09:30:05' })
    expect(it0.stamp).toBe('2026-08-11T09:30:05')
    expect(it0.text).toBe('2026-08-11 09:30:05')
  })

  it('自定义格式串只改文本，戳不跟着变', () => {
    const it0 = api({ value: '2026-08-11T09:30:05', format: 'M/D' })
    expect(it0.text).toBe('8/11')
    expect(it0.stamp).toBe('2026-08-11T09:30:05')
  })

  it('相对说法落在档位里就立 relative，超出档位退回绝对日期', () => {
    const inRange = api({ value: '2026-08-11T09:00:00', type: 'relative', now: '2026-08-11T09:30:00' })
    expect(inRange.relative).toBe(true)
    expect(inRange.text).toBe('30 分钟前')
    expect((inRange.getRootProps() as Dict)['data-relative']).toBe('')

    const tooFar = api({ value: '2026-01-01T00:00:00', type: 'relative', now: '2026-08-11T09:30:00' })
    expect(tooFar.relative).toBe(false)
    expect(tooFar.text).toBe('2026-01-01')
    expect((tooFar.getRootProps() as Dict)['data-relative']).toBeUndefined()
  })

  it('退回绝对日期时用作者给的格式串', () => {
    const it0 = api({ value: '2026-01-01T00:00:00', type: 'relative', now: '2026-08-11T09:30:00', format: 'YYYY/MM/DD' })
    expect(it0.text).toBe('2026/01/01')
  })

  it('locale 只换用词，戳恒是同一种写法', () => {
    const zh = api({ value: '2026-08-11T09:30:05', type: 'date' })
    const en = api({ value: '2026-08-11T09:30:05', type: 'date', locale: 'en' })
    expect(zh.text).toBe('2026-08-11')
    expect(en.text).toBe('08/11/2026')
    expect(en.stamp).toBe(zh.stamp)
  })
})
