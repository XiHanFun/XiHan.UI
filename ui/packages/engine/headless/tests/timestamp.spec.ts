// @vitest-environment jsdom
import type { TimestampApi, TimestampProps } from '../src/timestamp'
import { createService, normalizeProps } from '@xihan-ui/core'
import { createVanillaRuntime } from '@xihan-ui/core/vanilla'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
// 直接从组件目录导入，不经包主入口
import {
  connectTimestamp,
  formatRelativeTime,
  formatTimePattern,
  formatTimestampDate,
  timestampMachine,
  timestampMachineStamp,
  timestampRefreshDelay,
  toTimeDate,
} from '../src/timestamp'

type Dict = Record<string, unknown>

const MINUTE = 60_000
const HOUR = 60 * MINUTE
const DAY = 24 * HOUR

function makeTimestamp(initial: TimestampProps = {}) {
  const runtime = createVanillaRuntime()
  const props = runtime.signal<TimestampProps>(initial)
  const service = createService(timestampMachine, { props: () => props.get(), runtime })
  runtime.start()
  return {
    service,
    state: () => service.state.get(),
    setProps: (next: TimestampProps) => props.set({ ...props.get(), ...next }),
    api: (): TimestampApi => connectTimestamp(service, normalizeProps),
    stop: () => runtime.stop(),
  }
}

/** 用给定 props 建一台机器并取一次连接层。 */
function api(props: TimestampProps = {}): TimestampApi {
  const t = makeTimestamp(props)
  const out = t.api()
  t.stop()
  return out
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

  it('给了时区：不带偏移量的串按那个时区的墙钟解读', () => {
    expect(toTimeDate('2026-08-11T09:30:05', 'Asia/Tokyo')!.toISOString()).toBe('2026-08-11T00:30:05.000Z')
    expect(toTimeDate('2026-08-11', 'Asia/Shanghai')!.toISOString()).toBe('2026-08-10T16:00:00.000Z')
  })

  it('给了时区：带偏移量的串本来就是确切时刻，不受时区影响', () => {
    expect(toTimeDate('2026-08-11T09:30:05Z', 'Asia/Tokyo')!.toISOString()).toBe('2026-08-11T09:30:05.000Z')
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

  it('给了时区取那个时区的墙钟', () => {
    const instant = new Date(Date.UTC(2026, 7, 10, 23, 30, 0))
    expect(formatTimePattern(instant, 'YYYY-MM-DD HH:mm', 'Asia/Shanghai')).toBe('2026-08-11 07:30')
    expect(formatTimePattern(instant, 'YYYY-MM-DD HH:mm', 'America/New_York')).toBe('2026-08-10 19:30')
  })
})

describe('formatTimestampDate', () => {
  const date = at(2026, 8, 11, 9, 30, 5)

  it('缺省写法按语言交给 Intl：月日两位，datetime 另带 24 小时制的时分秒', () => {
    expect(formatTimestampDate(date, 'date', 'en-US')).toBe('08/11/2026')
    expect(formatTimestampDate(date, 'date', 'zh-CN')).toBe('2026/08/11')
    expect(formatTimestampDate(date, 'datetime', 'de-DE')).toBe('11.08.2026, 09:30:05')
  })

  it('给了时区按那个时区的墙钟', () => {
    const instant = new Date(Date.UTC(2026, 7, 11, 0, 30, 5))
    expect(formatTimestampDate(instant, 'datetime', 'en-US', 'Asia/Tokyo')).toBe('08/11/2026, 09:30:05')
  })
})

describe('formatRelativeTime', () => {
  const now = at(2026, 8, 11, 12, 0, 0)

  it('一分钟以内是该语言的「现在」，作者给了 justNow 就用作者的', () => {
    expect(formatRelativeTime(at(2026, 8, 11, 11, 59, 30), now, 'en')).toBe('now')
    expect(formatRelativeTime(at(2026, 8, 11, 11, 59, 30), now, 'zh-CN')).toBe('现在')
    expect(formatRelativeTime(at(2026, 8, 11, 11, 59, 30), now, 'zh-CN', '刚刚')).toBe('刚刚')
  })

  it('按分、时、天逐档取整，用词交给 Intl', () => {
    expect(formatRelativeTime(at(2026, 8, 11, 11, 30, 0), now, 'zh-CN')).toBe('30分钟前')
    expect(formatRelativeTime(at(2026, 8, 11, 9, 0, 0), now, 'zh-CN')).toBe('3小时前')
    expect(formatRelativeTime(at(2026, 8, 9, 12, 0, 0), now, 'zh-CN')).toBe('2天前')
    expect(formatRelativeTime(at(2026, 8, 11, 9, 0, 0), now, 'ja')).toBe('3 時間前')
  })

  it('英文用词单复数跟着数走', () => {
    expect(formatRelativeTime(at(2026, 8, 11, 11, 59, 0), now, 'en')).toBe('1 minute ago')
    expect(formatRelativeTime(at(2026, 8, 11, 11, 58, 0), now, 'en')).toBe('2 minutes ago')
  })

  it('将来的时刻说成「几分钟后」，取整同样向零', () => {
    expect(formatRelativeTime(at(2026, 8, 11, 12, 5, 30), now, 'zh-CN')).toBe('5分钟后')
    expect(formatRelativeTime(at(2026, 8, 11, 15, 0, 0), now, 'en')).toBe('in 3 hours')
    expect(formatRelativeTime(at(2026, 8, 11, 12, 0, 30), now, 'en')).toBe('now')
  })

  it('离现在三十天及以上就没有档位可用，过去将来都是', () => {
    expect(formatRelativeTime(at(2026, 1, 1), now, 'zh-CN')).toBeUndefined()
    expect(formatRelativeTime(at(2027, 1, 1), now, 'zh-CN')).toBeUndefined()
  })
})

describe('timestampRefreshDelay', () => {
  const now = new Date(Date.UTC(2026, 7, 11, 12, 0, 0))
  const ago = (ms: number): Date => new Date(now.getTime() - ms)
  const later = (ms: number): Date => new Date(now.getTime() + ms)

  it('过去的时刻：到下一个整数倍才会变，就在那一刻刷新', () => {
    expect(timestampRefreshDelay(ago(20_000), now)).toBe(40_000)
    expect(timestampRefreshDelay(ago(5 * MINUTE + 10_000), now)).toBe(50_000)
    expect(timestampRefreshDelay(ago(3 * HOUR + 20 * MINUTE), now)).toBe(40 * MINUTE)
    expect(timestampRefreshDelay(ago(2 * DAY + 6 * HOUR), now)).toBe(18 * HOUR)
  })

  it('将来的时刻：跌破当前整数倍才会变', () => {
    expect(timestampRefreshDelay(later(5 * MINUTE + 10_000), now)).toBe(10_001)
    expect(timestampRefreshDelay(later(20_000), now)).toBe(80_000)
  })

  it('已退回绝对日期的过去时刻不会再变，不必刷新', () => {
    expect(timestampRefreshDelay(ago(40 * DAY), now)).toBeNull()
  })

  it('三十天之后的将来时刻等它进入三十天再刷新，延时夹在计时器的上限里', () => {
    expect(timestampRefreshDelay(later(31 * DAY), now)).toBe(DAY + 1)
    expect(timestampRefreshDelay(later(400 * DAY), now)).toBe(2 ** 31 - 1)
  })
})

describe('timestampMachineStamp', () => {
  const date = at(2026, 8, 11, 9, 30, 5)

  it('date 型收到日期精度，其余到秒', () => {
    expect(timestampMachineStamp(date, 'date')).toBe('2026-08-11')
    expect(timestampMachineStamp(date, 'datetime')).toBe('2026-08-11T09:30:05')
    expect(timestampMachineStamp(date, 'relative')).toBe('2026-08-11T09:30:05')
  })

  it('不给时区不带偏移量：这是一个本地日期时间串，组件不替宿主宣称时区', () => {
    expect(timestampMachineStamp(date, 'datetime')).not.toMatch(/[Z+]/)
  })

  it('给了时区：取那个时区的墙钟并带上偏移量，date 型只到日', () => {
    const instant = new Date(Date.UTC(2026, 7, 11, 0, 30, 5))
    expect(timestampMachineStamp(instant, 'datetime', 'Asia/Tokyo')).toBe('2026-08-11T09:30:05+09:00')
    expect(timestampMachineStamp(instant, 'date', 'America/New_York')).toBe('2026-08-10')
  })
})

describe('connectTimestamp', () => {
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

  it('认不出的时区同样落 invalid，不拿本地时间冒充', () => {
    const it0 = api({ value: '2026-08-11T09:30:05', timeZone: 'Mars/Olympus' })
    expect(it0.state).toBe('invalid')
    expect(it0.stamp).toBeUndefined()
    expect(it0.text).toBe('')
  })

  it('缺省是 datetime 型', () => {
    expect((api({ value: '2026-08-11T09:30:05' }).getRootProps() as Dict)['data-format']).toBe('datetime')
  })

  it('戳与文本取自同一个墙钟', () => {
    const it0 = api({ value: '2026-08-11T09:30:05', locale: 'en-US' })
    expect(it0.stamp).toBe('2026-08-11T09:30:05')
    expect(it0.text).toBe('08/11/2026, 09:30:05')
  })

  it('给了时区：文本与戳都按那个时区，戳带偏移量', () => {
    const it0 = api({ value: '2026-08-11T09:30:05Z', timeZone: 'Asia/Shanghai', locale: 'zh-CN' })
    expect(it0.text).toBe('2026/08/11 17:30:05')
    expect(it0.stamp).toBe('2026-08-11T17:30:05+08:00')
  })

  it('自定义格式串只改文本，戳不跟着变', () => {
    const it0 = api({ value: '2026-08-11T09:30:05', format: 'M/D' })
    expect(it0.text).toBe('8/11')
    expect(it0.stamp).toBe('2026-08-11T09:30:05')
  })

  it('相对说法落在档位里就立 relative，超出档位退回绝对日期', () => {
    const inRange = api({ value: '2026-08-11T09:00:00', type: 'relative', now: '2026-08-11T09:30:00', locale: 'en-US' })
    expect(inRange.relative).toBe(true)
    expect(inRange.text).toBe('30 minutes ago')
    expect((inRange.getRootProps() as Dict)['data-relative']).toBe('')

    const tooFar = api({ value: '2026-01-01T00:00:00', type: 'relative', now: '2026-08-11T09:30:00', locale: 'en-US' })
    expect(tooFar.relative).toBe(false)
    expect(tooFar.text).toBe('01/01/2026')
    expect((tooFar.getRootProps() as Dict)['data-relative']).toBeUndefined()
  })

  it('退回绝对日期时用作者给的格式串', () => {
    const it0 = api({ value: '2026-01-01T00:00:00', type: 'relative', now: '2026-08-11T09:30:00', format: 'YYYY/MM/DD' })
    expect(it0.text).toBe('2026/01/01')
  })

  it('将来的时刻说成「几分钟后」', () => {
    const it0 = api({ value: '2026-08-11T10:00:00', type: 'relative', now: '2026-08-11T09:30:00', locale: 'zh-CN' })
    expect(it0.relative).toBe(true)
    expect(it0.text).toBe('30分钟后')
  })

  it('translations.justNow 替换一分钟以内的说法', () => {
    const it0 = api({ value: '2026-08-11T09:29:40', type: 'relative', now: '2026-08-11T09:30:00', locale: 'zh-CN', translations: { justNow: '刚刚' } })
    expect(it0.text).toBe('刚刚')
  })

  it('locale 只换用词，戳恒是同一种写法', () => {
    const zh = api({ value: '2026-08-11T09:30:05', type: 'date', locale: 'zh-CN' })
    const en = api({ value: '2026-08-11T09:30:05', type: 'date', locale: 'en-US' })
    expect(zh.text).toBe('2026/08/11')
    expect(en.text).toBe('08/11/2026')
    expect(en.stamp).toBe(zh.stamp)
  })
})

describe('timestampMachine', () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout', 'Date'] })
    vi.setSystemTime(new Date('2026-08-11T12:00:00'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('相对型、没给参照时刻：在文字下一次会变的那一刻刷新', () => {
    const t = makeTimestamp({ value: '2026-08-11T11:58:30', type: 'relative', locale: 'en-US' })
    expect(t.state()).toBe('live')
    expect(t.api().refreshing).toBe(true)
    expect(t.api().text).toBe('1 minute ago')

    vi.advanceTimersByTime(29_999)
    expect(t.api().text).toBe('1 minute ago')
    vi.advanceTimersByTime(1)
    expect(t.api().text).toBe('2 minutes ago')
    t.stop()
  })

  it('将来的时刻一路倒数到「现在」再转成「几分钟前」', () => {
    const t = makeTimestamp({ value: '2026-08-11T12:02:00', type: 'relative', locale: 'en-US' })
    expect(t.api().text).toBe('in 2 minutes')
    // 正好两分钟时再过 1 毫秒就跌破了「2 分钟」
    vi.advanceTimersByTime(1)
    expect(t.api().text).toBe('in 1 minute')
    vi.advanceTimersByTime(MINUTE)
    expect(t.api().text).toBe('now')
    // 「现在」一直到过去满一分钟为止
    vi.advanceTimersByTime(2 * MINUTE - 1)
    expect(t.api().text).toBe('1 minute ago')
    t.stop()
  })

  it('refreshInterval 给正数按固定间隔刷新，给 0 不刷新', () => {
    const fixed = makeTimestamp({ value: '2026-08-11T11:58:30', type: 'relative', refreshInterval: 10_000 })
    const spy = vi.spyOn(fixed.service.context, 'set')
    vi.advanceTimersByTime(10_000)
    expect(spy).toHaveBeenCalledWith('now', Date.now())
    fixed.stop()

    const off = makeTimestamp({ value: '2026-08-11T11:58:30', type: 'relative', refreshInterval: 0, locale: 'en-US' })
    expect(off.state()).toBe('idle')
    vi.advanceTimersByTime(10 * MINUTE)
    expect(off.api().text).toBe('1 minute ago')
    off.stop()
  })

  it('绝对型、给了参照时刻或已退回绝对日期都不刷新', () => {
    expect(makeTimestamp({ value: '2026-08-11T11:58:30' }).state()).toBe('idle')
    expect(makeTimestamp({ value: '2026-08-11T11:58:30', type: 'relative', now: '2026-08-11T12:00:00' }).state()).toBe('idle')
    expect(makeTimestamp({ value: '2026-01-01T00:00:00', type: 'relative' }).state()).toBe('idle')
  })

  it('改成相对型即开始刷新，改回绝对型即停', () => {
    const t = makeTimestamp({ value: '2026-08-11T11:58:30', locale: 'en-US' })
    expect(t.state()).toBe('idle')
    t.setProps({ type: 'relative' })
    expect(t.state()).toBe('live')
    t.setProps({ type: 'datetime' })
    expect(t.state()).toBe('idle')
    t.stop()
  })

  it('页面隐藏时撤掉计时器，重新可见时立即补刷一次', () => {
    const t = makeTimestamp({ value: '2026-08-11T11:58:30', type: 'relative', locale: 'en-US' })
    const visibility = vi.spyOn(document, 'visibilityState', 'get').mockReturnValue('hidden')
    document.dispatchEvent(new Event('visibilitychange'))
    vi.advanceTimersByTime(5 * MINUTE)
    expect(t.api().text).toBe('1 minute ago')

    visibility.mockReturnValue('visible')
    document.dispatchEvent(new Event('visibilitychange'))
    expect(t.api().text).toBe('6 minutes ago')
    visibility.mockRestore()
    t.stop()
  })

  it('停机即撤掉计时器', () => {
    const t = makeTimestamp({ value: '2026-08-11T11:58:30', type: 'relative' })
    t.stop()
    expect(vi.getTimerCount()).toBe(0)
  })
})
