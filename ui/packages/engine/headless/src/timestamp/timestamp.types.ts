/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 定义 timestamp 类型契约。

import type { PropTypes } from '@xihan-ui/core'
import type { TimestampType, TimestampValue } from './timestamp.format'

/** 根的三态：已获得可识别的时刻 / 未提供时刻 / 已提供但无法识别。 */
export type TimestampState = 'ready' | 'empty' | 'invalid'

export interface TimestampProps {
  /** 要显示的时刻。只写年月日的串按本地零点解读。 */
  value?: TimestampValue
  /** 呈现方式：date 只到日、datetime 到秒、relative 表述为「几分钟前」，默认 datetime。 */
  type?: TimestampType
  /**
   * 自定义格式串，记号为 YYYY / YY / MM / M / DD / D / HH / H / mm / m / ss / s。
   * 提供后覆盖该 locale 的默认格式串；relative 型下只在回退为绝对日期时使用。
   */
  format?: string
  /**
   * BCP 47 语言标记，决定用词与默认格式串：zh 开头使用中文，其余一律英文。
   * 未提供时按宿主语言，宿主也没有时按 en-US。它只切换面向用户的文本，datetime 恒为同一种写法。
   */
  locale?: string
  /** 计算相对表述时的参照时刻，默认取当前时刻。提供后整个组件的产出完全由入参决定。 */
  now?: TimestampValue
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
  /** 本次是否实际按相对表述朗读。落在四档之外回退为绝对日期时为 false。 */
  relative: boolean
  getRootProps: () => T['element']
}

/** 读屏文案。本组件目前没有需要外露的文案，保留该位。 */
export interface TimestampTranslations {}
