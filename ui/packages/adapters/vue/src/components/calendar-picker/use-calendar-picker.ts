/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 use calendar picker 相关实现。

import type { Service } from '@xihan-ui/core'
import type { CalendarPickerApi, CalendarPickerSchema } from '@xihan-ui/headless'
import type { ComputedRef, Ref } from 'vue'
import { createScope } from '@xihan-ui/core'
import { calendarPickerMachine, connectCalendarPicker } from '@xihan-ui/headless'
import { computed, ref } from 'vue'
import { vueNormalize } from '../../runtime/normalize-props'
import { useMachine } from '../../runtime/use-machine'
import { createVueIdGenerator } from '../../runtime/vue-id'

export interface CalendarPickerContext {
  api: ComputedRef<CalendarPickerApi>
  /** 状态机实例，供部件上报 DOM 侧的事实。 */
  service: Service<CalendarPickerSchema>
  gridRef: Ref<HTMLElement | null>
  rootRef: Ref<HTMLElement | null>
}

export function useCalendarPicker(
  props: CalendarPickerSchema['props'],
  onValueChange?: CalendarPickerSchema['props']['onValueChange'],
  onFocusedValueChange?: CalendarPickerSchema['props']['onFocusedValueChange'],
  onActiveViewChange?: CalendarPickerSchema['props']['onActiveViewChange'],
): CalendarPickerContext {
  const gridRef = ref<HTMLElement | null>(null)
  const rootRef = ref<HTMLElement | null>(null)
  const idGen = createVueIdGenerator()
  const scope = createScope(null, idGen)
  const service = useMachine(calendarPickerMachine, () => ({ ...props, onValueChange, onFocusedValueChange, onActiveViewChange }), scope)

  // 跨月后的焦点落点要等重渲，机器推迟一拍再从这里取网格现查
  service.refs.set('getGridEl', () => gridRef.value)

  const api = computed(() => connectCalendarPicker(service, vueNormalize))
  return { api, service, gridRef, rootRef }
}
