/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 use calendar picker 相关实现。

import type { Service } from '@xihan-ui/core'
import type { CalendarPickerApi, CalendarPickerSchema } from '@xihan-ui/headless'
import type { RefObject } from 'react'
import { calendarPickerMachine, connectCalendarPicker } from '@xihan-ui/headless'
import { useRef } from 'react'
import { reactNormalize } from '../../runtime/normalize-props'
import { useReactScope } from '../../runtime/react-id'
import { useMachine } from '../../runtime/use-machine'

export interface CalendarPickerContext {
  /** 机器实例，供部件上报 DOM 侧的事实。 */
  service: Service<CalendarPickerSchema>
  api: CalendarPickerApi
  /** 首个网格的节点：跨月重渲后机器按它现查焦点该落在哪一格。 */
  gridRef: RefObject<HTMLElement | null>
  rootRef: RefObject<HTMLElement | null>
}

export function useCalendarPicker(props: CalendarPickerSchema['props']): CalendarPickerContext {
  const scope = useReactScope()
  const gridRef = useRef<HTMLElement | null>(null)
  const rootRef = useRef<HTMLElement | null>(null)

  const service = useMachine(calendarPickerMachine, () => props, {
    scope,
    // 机器的挂载效应会立刻读 refs，交在 onCreate 里才赶得上
    onCreate: (svc) => {
      svc.refs.set('getGridEl', () => gridRef.current)
    },
  })

  return { service, api: connectCalendarPicker(service, reactNormalize), gridRef, rootRef }
}
