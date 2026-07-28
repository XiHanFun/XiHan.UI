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
  /** 部件要上报 DOM 侧的事实时得直接够到机器。 */
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

  // 键盘跨月时要把焦点送进新月份的那一格，而那一格是本帧重渲之后才存在的：
  // 机器推迟一拍再从这里拿到网格、现查落点。不注入的话状态照常流转，只是焦点搬不动。
  service.refs.set('getGridEl', () => gridRef.value)

  const api = computed(() => connectCalendar(service, vueNormalize))
  return { api, service, gridRef }
}
