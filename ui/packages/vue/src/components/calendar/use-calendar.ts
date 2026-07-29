import type { CalendarApi, CalendarSchema } from '@xihan-ui/headless'
import type { Service } from '@xihan-ui/machine'
import type { ComputedRef, Ref } from 'vue'
import { createScope } from '@xihan-ui/core'
import { calendarMachine, connectCalendar } from '@xihan-ui/headless'
import { computed, ref } from 'vue'
import { vueNormalize } from '../../runtime/normalize-props'
import { useMachine } from '../../runtime/use-machine'
import { createVueIdGenerator } from '../../runtime/vue-id'

export interface CalendarContext {
  api: ComputedRef<CalendarApi>
  /** 机器实例，供部件上报 DOM 侧的事实。 */
  service: Service<CalendarSchema>
  gridRef: Ref<HTMLElement | null>
}

export function useCalendar(
  props: CalendarSchema['props'],
  onValueChange?: CalendarSchema['props']['onValueChange'],
  onFocusedValueChange?: CalendarSchema['props']['onFocusedValueChange'],
): CalendarContext {
  const gridRef = ref<HTMLElement | null>(null)
  const idGen = createVueIdGenerator()
  const scope = createScope(null, idGen)
  const service = useMachine(calendarMachine, () => ({ ...props, onValueChange, onFocusedValueChange }), scope)

  // 跨月后的焦点落点要等重渲，机器推迟一拍再从这里取网格现查
  service.refs.set('getGridEl', () => gridRef.value)

  const api = computed(() => connectCalendar(service, vueNormalize))
  return { api, service, gridRef }
}
