/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 use time zone select 相关实现。

import type { TimeZoneSelectApi, TimeZoneSelectProps } from '@xihan-ui/headless'
import type { ComputedRef } from 'vue'
import { connectTimeZoneSelect } from '@xihan-ui/headless'
import { computed } from 'vue'
import { vueNormalize } from '../../runtime/normalize-props'

export interface TimeZoneSelectContext {
  api: ComputedRef<TimeZoneSelectApi>
}

export function useTimeZoneSelect(props: TimeZoneSelectProps): TimeZoneSelectContext {
  const createdAt = Date.now()
  return {
    api: computed(() => connectTimeZoneSelect({
      ...props,
      referenceTime: props.referenceTime ?? createdAt,
    }, vueNormalize)),
  }
}
