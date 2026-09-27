/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 定义 time zone select 类型契约。

import type { ControlVariant, Direction, Placement, PropTypes, Size, Tone } from '@xihan-ui/core'
import type { ComboboxNode } from '../combobox'

export interface TimeZoneSelectOption extends ComboboxNode {
  value: string
  label: string
  description: string
  /** 参考时刻下的 UTC 偏移量，东正西负。 */
  offsetMilliseconds: number
  /** ISO 偏移串，例如 +08:00。 */
  offset: string
  /** 已归一化的检索文本。 */
  searchText: string
}

export interface TimeZoneSelectValueChangeDetails {
  value: string | null
}

export interface TimeZoneSelectInputValueChangeDetails {
  inputValue: string
}

export interface TimeZoneSelectTranslations {
  label: string
  placeholder: string
  empty: string
  trigger: string
  clearTrigger: string
}

export interface TimeZoneSelectProps {
  /** 受控 IANA 时区；null 表示未选择。 */
  value?: string | null
  defaultValue?: string | null
  /** 候选时区；缺省读取运行环境的 Intl.supportedValuesOf('timeZone')。 */
  timeZones?: readonly string[]
  /** 用哪个时刻计算候选的 UTC 偏移，缺省为创建选项时的 Date.now()。 */
  referenceTime?: Date | number
  /** 排序与大小写折叠使用的地区。 */
  locale?: string
  name?: string
  form?: string
  disabled?: boolean
  readOnly?: boolean
  invalid?: boolean
  loading?: boolean
  loop?: boolean
  placement?: Placement
  dir?: Direction
  offset?: number
  variant?: ControlVariant
  tone?: Tone
  size?: Size
  translations?: Partial<TimeZoneSelectTranslations>
  onValueChange?: (details: TimeZoneSelectValueChangeDetails) => void
  onInputValueChange?: (details: TimeZoneSelectInputValueChangeDetails) => void
}

export interface TimeZoneSelectApi<T extends PropTypes = PropTypes> {
  options: readonly TimeZoneSelectOption[]
  filter: (query: string) => TimeZoneSelectOption[]
  getRootProps: () => T['element']
}
