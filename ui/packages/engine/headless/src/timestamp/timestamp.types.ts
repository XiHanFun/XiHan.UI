/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 定义 timestamp 类型契约。

import type { MachineSchema, PropTypes } from '@xihan-ui/core'
import type { TimestampType, TimestampValue } from './timestamp.format'

/** 根的三态：已获得可识别的时刻 / 未提供时刻 / 已提供但无法识别（时刻或时区认不出）。 */
export type TimestampState = 'ready' | 'empty' | 'invalid'

export interface TimestampProps {
  /** 要显示的时刻。只写年月日的串按零点解读；不带偏移量的串按 `timeZone` 的墙钟解读，没给时区时按本地。 */
  value?: TimestampValue
  /** 呈现方式：date 只到日、datetime 到秒、relative 表述为「几分钟前」「几分钟后」，默认 datetime。 */
  type?: TimestampType
  /**
   * 自定义格式串，记号为 YYYY / YY / MM / M / DD / D / HH / H / mm / m / ss / s。
   * 提供后覆盖该语言的缺省写法；relative 型下只在回退为绝对日期时使用。
   */
  format?: string
  /**
   * BCP 47 语言标记，决定相对说法的用词与缺省的日期写法，任何语言都由 Intl 给出。
   * 未提供时按宿主语言，宿主也没有时按 en-US。它只切换面向用户的文本，datetime 与语言无关。
   */
  locale?: string
  /**
   * IANA 时区名（如 `Asia/Shanghai`）。给了就按这个时区的墙钟显示，datetime 带上该时区的偏移量；
   * 不带偏移量的 `value` 串也按这个时区解读。未提供时按运行时本地、datetime 不带偏移量。认不出的时区落 invalid。
   */
  timeZone?: string
  /** 计算相对说法时的参照时刻，默认取当前时刻并自动刷新。提供后整个组件的产出完全由入参决定，不再刷新。 */
  now?: TimestampValue
  /**
   * 相对型的刷新间隔（毫秒）。缺省按距今远近自适应：文字只在跨过分钟、小时、天的边界时才变，
   * 就只在那一刻刷新；给正数按固定间隔刷新，给 0 不刷新。页面隐藏或元素离开视口时暂停，回来时立即刷新一次。
   * 这是停留时长，不是动效，不受减弱动效影响。
   */
  refreshInterval?: number
  translations?: Partial<TimestampTranslations>
}

export interface TimestampSchema extends MachineSchema {
  props: TimestampProps
  context: {
    /** 相对说法的参照时刻（毫秒）。作者给了 `now` 时不用它；刷新即改写它。 */
    now: number
  }
  computed: Record<string, never>
  refs: Record<string, never>
  /**
   * idle：不需要刷新（绝对型、给了 now、刷新关闭或已退回绝对日期的过去时刻）；
   * live：挂着一个到下一次文字会变的那一刻的计时器。
   */
  state: 'idle' | 'live'
  event:
    /** 影响刷新的 props 变了：重新判断要不要刷新、多久之后刷新。 */
    | { type: 'REFRESH.SYNC' }
    /** 计时器到点、页面重新可见或元素重回视口：取一次当前时刻。 */
    | { type: 'TICK' }
  tag: never
  guard: 'shouldRefresh'
  action: 'syncRefresh' | 'syncNow'
  effect: 'trackRefresh'
}

export interface TimestampApi<T extends PropTypes = PropTypes> {
  /** 解析出的时刻；未提供或无法识别时为 undefined。 */
  date: Date | undefined
  /** 面向用户的文本；没有可读时刻时为空串。 */
  text: string
  /** 写入 datetime 的时间戳；没有可读时刻时为 undefined，此时根上不写该属性。 */
  stamp: string | undefined
  /** 当前状态。 */
  state: TimestampState
  /** 本次是否实际按相对说法朗读。离现在三十天及以上回退为绝对日期时为 false。 */
  relative: boolean
  /** 正在按时刷新相对说法。 */
  refreshing: boolean
  getRootProps: () => T['element']
}

/** 界面文案。其余用词都由 Intl 按 `locale` 给出。 */
export interface TimestampTranslations {
  /** 离现在一分钟以内的说法；缺省取该语言的「现在」（en「now」、zh「现在」）。 */
  justNow: string
}
