/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 use calendar range picker 相关实现。

import type { Service } from '@xihan-ui/core'
import type { CalendarRangePickerApi, CalendarRangePickerSchema } from '@xihan-ui/headless'
import type { RefObject } from 'react'
import { calendarRangePickerMachine, connectCalendarRangePicker } from '@xihan-ui/headless'
import { useRef } from 'react'
import { reactNormalize } from '../../runtime/normalize-props'
import { useReactScope } from '../../runtime/react-id'
import { useMachine } from '../../runtime/use-machine'

export interface CalendarRangePickerContext {
  /** 机器实例，供部件上报 DOM 侧的事实。 */
  service: Service<CalendarRangePickerSchema>
  api: CalendarRangePickerApi
  /** 首个网格的节点：跨月重渲后机器按它现查焦点该落在哪一格。 */
  gridRef: RefObject<HTMLElement | null>
  /** 根节点：区间挑到一半时，指针在它之外松开就地收口。 */
  rootRef: RefObject<HTMLElement | null>
}

export function useCalendarRangePicker(props: CalendarRangePickerSchema['props']): CalendarRangePickerContext {
  const scope = useReactScope()
  const gridRef = useRef<HTMLElement | null>(null)
  const rootRef = useRef<HTMLElement | null>(null)

  const service = useMachine(calendarRangePickerMachine, () => props, {
    scope,
    // 机器的挂载效应会立刻读 refs，交在 onCreate 里才赶得上
    onCreate: (svc) => {
      svc.refs.set('getGridEl', () => gridRef.current)
      svc.refs.set('getBoundaryEls', () => [rootRef.current])
    },
  })

  return { service, api: connectCalendarRangePicker(service, reactNormalize), gridRef, rootRef }
}
