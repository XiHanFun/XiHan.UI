import type { TimeGranularity } from '../time-field'
import { getLocalTimeZone, now } from '@internationalized/date'
import { formatTimeValue } from '../time-field'

/**
 * 快捷选项的值就是一条整份 ISO 时间串，与组件的 value 同一个形状。
 *
 * 这里的函数在被调用的那一刻取时刻，所以只能在作者自己的 computed / memo 里算一次。
 * 连接层每帧都会跑一遍，把它放进渲染期会每帧算出一个新的「此刻」，缓存永远失配。
 */

/** 此刻，按 granularity 决定带不带秒。 */
export function timePickerPresetNow(granularity: TimeGranularity = 'minute', timeZone?: string): string {
  const at = now(timeZone ?? getLocalTimeZone())
  return formatTimeValue(
    { hour: at.hour, minute: at.minute, second: at.second, dayPeriod: null },
    granularity,
  )
}
