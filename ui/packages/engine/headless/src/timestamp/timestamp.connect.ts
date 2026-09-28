/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 timestamp 相关实现。

import type { NormalizeProps, PropTypes, Service } from '@xihan-ui/core'
import type { TimestampType } from './timestamp.format'
import type { TimestampApi, TimestampProps, TimestampSchema, TimestampState } from './timestamp.types'
import { dataAttr, resolveLocale } from '@xihan-ui/core'
import { timestampAnatomy } from './timestamp.anatomy'
import {
  formatRelativeTime,
  formatTimePattern,
  formatTimestampDate,
  isTimestampTimeZone,
  timestampMachineStamp,
  toTimeDate,
} from './timestamp.format'

const parts = timestampAnatomy.build()

const DEFAULT_TYPE: TimestampType = 'datetime'

/** 给了一个空白的串等于没给：它落不到任何时刻上，却也不是「写错了」。 */
function isProvided(value: TimestampProps['value']): boolean {
  if (value == null)
    return false
  return typeof value !== 'string' || value.trim() !== ''
}

/**
 * 文本与戳由 props 与机器里的参照时刻算出；机器只负责按时改写参照时刻。
 *
 * 没给时区时显示的文本与 datetime 取自运行时本地的同一个墙钟，datetime 不带偏移量；
 * 给了时区时两者都按那个时区，datetime 带上偏移量。
 *
 * 认不出的时刻或时区不抛：抛在 Vue 的 computed 或 WC 的 wire 里会连累整棵树。
 * 改成落到 `state: 'invalid'` 且一个字都不显示，也不写 datetime——
 * 与其给机器一个瞎编的时间戳，不如什么都不给。
 */
export function connectTimestamp<T extends PropTypes>(
  service: Service<TimestampSchema>,
  normalize: NormalizeProps<T>,
): TimestampApi<T> {
  const { prop, context, state: machineState, scope } = service
  const type = prop('type') ?? DEFAULT_TYPE
  const locale = resolveLocale(prop('locale'), scope)
  const timeZone = prop('timeZone')
  const zoneKnown = isTimestampTimeZone(timeZone)

  const provided = isProvided(prop('value'))
  const date = provided && zoneKnown ? toTimeDate(prop('value'), timeZone) : undefined
  let state: TimestampState = 'empty'
  if (provided)
    state = date ? 'ready' : 'invalid'

  let text = ''
  let relative = false
  if (date) {
    const format = prop('format')
    if (type === 'relative') {
      const now = toTimeDate(prop('now'), timeZone) ?? new Date(context.get('now'))
      const phrase = formatRelativeTime(date, now, locale, prop('translations')?.justNow)
      relative = phrase !== undefined
      // 退回绝对日期时的格式：作者给了格式串就用作者的
      text = phrase ?? (format ? formatTimePattern(date, format, timeZone) : formatTimestampDate(date, 'date', locale, timeZone))
    }
    else {
      text = format ? formatTimePattern(date, format, timeZone) : formatTimestampDate(date, type, locale, timeZone)
    }
  }

  const stamp = date ? timestampMachineStamp(date, type, timeZone) : undefined

  return {
    date,
    text,
    stamp,
    state,
    relative,
    refreshing: machineState.matches('live'),

    getRootProps: () => normalize.element({
      ...parts.root.attrs,
      // 机器按 id 找到它，离开视口就暂停刷新
      'id': scope.partId('timestamp', 'root'),
      // 没有可读时刻时不写：空的 datetime 是一条机器读得进去、却指不到任何时刻的假信息
      'datetime': stamp,
      'data-format': type,
      'data-state': state,
      // 这一次真按相对说法念了才立；离现在三十天及以上退回绝对日期时不写
      'data-relative': dataAttr(relative),
    }),
  }
}
