/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 use time zone select 相关实现。

import type { TimeZoneSelectApi, TimeZoneSelectProps } from '@xihan-ui/headless'
import { connectTimeZoneSelect } from '@xihan-ui/headless'
import { useRef } from 'react'
import { reactNormalize } from '../../runtime/normalize-props'

export interface TimeZoneSelectContext {
  api: TimeZoneSelectApi
}

export function useTimeZoneSelect(props: TimeZoneSelectProps): TimeZoneSelectContext {
  const createdAt = useRef(Date.now())
  return {
    api: connectTimeZoneSelect({
      ...props,
      referenceTime: props.referenceTime ?? createdAt.current,
    }, reactNormalize),
  }
}
