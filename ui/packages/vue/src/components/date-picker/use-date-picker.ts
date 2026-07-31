import type { Cleanup, Layer, RuntimeConfig } from '@xihan-ui/core'
import type { CalendarSchema, DateFieldSchema, DatePickerApi, DatePickerSchema, DatePickerServices } from '@xihan-ui/headless'
import type { ComputedRef, Ref } from 'vue'
import { createRuntimeConfig, createScope } from '@xihan-ui/core'
import {
  calendarMachine,
  connectDatePicker,
  dateFieldMachine,
  datePickerCalendarProps,
  datePickerFieldProps,
  datePickerMachine,
} from '@xihan-ui/headless'
import { createPositionEngine } from '@xihan-ui/position'
import { computed, ref } from 'vue'
import { vueNormalize } from '../../runtime/normalize-props'
import { useMachine } from '../../runtime/use-machine'
import { createVueIdGenerator } from '../../runtime/vue-id'

export interface DatePickerContext {
  api: ComputedRef<DatePickerApi>
  /** 三台机器的把手，供部件上报 DOM 侧的事实。 */
  services: DatePickerServices
  controlRef: Ref<HTMLElement | null>
  positionerRef: Ref<HTMLElement | null>
  contentRef: Ref<HTMLElement | null>
  gridRef: Ref<HTMLElement | null>
}

export function useDatePicker(
  props: DatePickerSchema['props'],
  handlers: Pick<DatePickerSchema['props'], 'onValueChange' | 'onOpenChange' | 'onFocusedValueChange'> = {},
): DatePickerContext {
  const controlRef = ref<HTMLElement | null>(null)
  const positionerRef = ref<HTMLElement | null>(null)
  const contentRef = ref<HTMLElement | null>(null)
  const gridRef = ref<HTMLElement | null>(null)

  // 三台机器共用一份 scope，part id 里带组件名区分
  const idGen = createVueIdGenerator()
  const scope = createScope(null, idGen)

  // 两台内嵌机器的 props 都从编排机现读，编排机须先建立
  const root = useMachine(datePickerMachine, () => ({ ...props, ...handlers }), scope)
  const calendar = useMachine<CalendarSchema>(calendarMachine, () => datePickerCalendarProps(root), scope)
  const field = useMachine<DateFieldSchema>(dateFieldMachine, () => datePickerFieldProps(root), scope)
  const services: DatePickerServices = { root, calendar, field }

  if (typeof document !== 'undefined') {
    const config: RuntimeConfig = createRuntimeConfig({ scope, idGenerator: idGen })

    // 只提供注册函数，入栈出栈由机器的 trackLayer 效应按展开态驱动
    const registerLayer = (): { layer: Layer, dispose: Cleanup } => config.layerRegistry.register({
      kind: 'popover',
      node: () => contentRef.value,
      // 整个输入行记为本层分支，点 trigger 或段位算层内交互
      branches: () => [controlRef.value].filter(Boolean) as Element[],
      isModal: () => false,
      setModal: () => {},
      surfaces: () => [],
    })

    // 定位引擎由适配器注入，机器只经端口驱动；锚点取整个输入行
    root.refs.set('config', config)
    root.refs.set('registerLayer', registerLayer)
    root.refs.set('position', createPositionEngine())
    root.refs.set('getAnchorEl', () => controlRef.value)
    root.refs.set('getFloatingEl', () => positionerRef.value)
    root.refs.set('getContentEl', () => contentRef.value)
  }

  // 跨月后的焦点落点要等重渲，日历机器推迟一拍再从这里取网格现查
  calendar.refs.set('getGridEl', () => gridRef.value)

  const api = computed(() => connectDatePicker(services, vueNormalize))
  return { api, services, controlRef, positionerRef, contentRef, gridRef }
}
