import type { NormalizeProps, PropTypes } from '@xihan-ui/kernel'
import type { TimeType } from './time.format'
import type { TimeApi, TimeProps, TimeState } from './time.types'
import { dataAttr, resolveLocale } from '@xihan-ui/kernel'
import { timeAnatomy } from './time.anatomy'
import { formatRelativeTime, formatTimePattern, timeMachineStamp, timeWords, toTimeDate } from './time.format'

const parts = timeAnatomy.build()

const DEFAULT_TYPE: TimeType = 'datetime'

/** 给了一个空白的串等于没给：它落不到任何时刻上，却也不是「写错了」。 */
function isProvided(value: TimeProps['value']): boolean {
  if (value == null)
    return false
  return typeof value !== 'string' || value.trim() !== ''
}

/**
 * Time 无状态机：文本与戳全部由 props 算出。
 *
 * 显示的文本与 datetime 取自同一个墙钟，组件不做时区换算——选时区是宿主的事。
 * datetime 因此不带偏移量，它是一个本地日期时间串。
 *
 * 认不出的时刻不抛：抛在 Vue 的 computed 或 WC 的 wire 里会连累整棵树。
 * 改成落到 `state: 'invalid'` 且一个字都不显示，也不写 datetime——
 * 与其给机器一个瞎编的时间戳，不如什么都不给。
 *
 * @example
 * // 参照时刻给定后产出完全确定：文本是「30 分钟前」，datetime 是 2026-08-11T09:00:00
 * connectTime({ value: '2026-08-11T09:00:00', type: 'relative', now: '2026-08-11T09:30:00' }, normalize)
 */
export function connectTime<T extends PropTypes>(
  props: TimeProps,
  normalize: NormalizeProps<T>,
): TimeApi<T> {
  const type = props.type ?? DEFAULT_TYPE
  // 无状态机也就没有 scope，宿主语言只能问全局；SSR 期问不到，落到 en-US
  const locale = resolveLocale(props.locale)
  const words = timeWords(locale)

  const provided = isProvided(props.value)
  const date = provided ? toTimeDate(props.value) : undefined
  let state: TimeState = 'empty'
  if (provided)
    state = date ? 'ready' : 'invalid'

  let text = ''
  let relative = false
  if (date) {
    if (type === 'relative') {
      const phrase = formatRelativeTime(date, toTimeDate(props.now) ?? new Date(), locale)
      relative = phrase !== undefined
      // 退回绝对日期时的格式串：作者给了就用作者的
      text = phrase ?? formatTimePattern(date, props.format ?? words.date)
    }
    else {
      text = formatTimePattern(date, props.format ?? (type === 'date' ? words.date : words.datetime))
    }
  }

  const stamp = date ? timeMachineStamp(date, type) : undefined

  return {
    date,
    text,
    stamp,
    state,
    relative,

    getRootProps: () => normalize.element({
      ...parts.root.attrs,
      // 没有可读时刻时不写：空的 datetime 是一条机器读得进去、却指不到任何时刻的假信息
      'datetime': stamp,
      'data-type': type,
      'data-state': state,
      // 这一次真按相对说法念了才立；落在四档之外退回绝对日期时不写
      'data-relative': dataAttr(relative),
    }),
  }
}
