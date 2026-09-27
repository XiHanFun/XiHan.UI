/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 time zone select 组合根；交互与可访问语义由内部 Combobox 提供。

import type { NormalizeProps, PropTypes } from '@xihan-ui/core'
import type { TimeZoneSelectApi, TimeZoneSelectProps } from './time-zone-select.types'
import { timeZoneSelectAnatomy } from './time-zone-select.anatomy'
import { createTimeZoneOptions, filterTimeZoneOptions } from './time-zone-select.options'

const parts = timeZoneSelectAnatomy.build()

export function connectTimeZoneSelect<T extends PropTypes>(
  props: TimeZoneSelectProps,
  normalize: NormalizeProps<T>,
): TimeZoneSelectApi<T> {
  const options = createTimeZoneOptions({
    timeZones: props.timeZones,
    referenceTime: props.referenceTime,
    locale: props.locale,
  })
  return {
    options,
    filter: query => filterTimeZoneOptions(options, query, props.locale),
    getRootProps: () => normalize.element({
      ...parts.root.attrs,
    }),
  }
}
