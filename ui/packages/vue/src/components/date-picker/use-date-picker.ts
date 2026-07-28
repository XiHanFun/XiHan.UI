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
import { createFloatingUiPositionEngine } from '@xihan-ui/position-floating-ui'
import { computed, ref } from 'vue'
import { vueNormalize } from '../../runtime/normalize-props'
import { useMachine } from '../../runtime/use-machine'
import { createVueIdGenerator } from '../../runtime/vue-id'

export interface DatePickerContext {
  api: ComputedRef<DatePickerApi>
  /** 三台机器的把手：部件要上报 DOM 侧的事实时得直接够到对应那台。 */
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

  // 三台机器共用一份 scope：part id 里带组件名（date-picker / calendar / date-field），
  // 同一个 scope 也撞不到一起，而共用能让日历的 heading id 与本组件的 content id 出自同源
  const idGen = createVueIdGenerator()
  const scope = createScope(null, idGen)

  // 顺序要紧：两台内嵌机器的 props 都从编排机现读，编排机必须先立起来
  const root = useMachine(datePickerMachine, () => ({ ...props, ...handlers }), scope)
  const calendar = useMachine<CalendarSchema>(calendarMachine, () => datePickerCalendarProps(root), scope)
  const field = useMachine<DateFieldSchema>(dateFieldMachine, () => datePickerFieldProps(root), scope)
  const services: DatePickerServices = { root, calendar, field }

  if (typeof document !== 'undefined') {
    const config: RuntimeConfig = createRuntimeConfig({ scope, idGenerator: idGen })

    // 只给注册函数、不在这里注册：层的入栈出栈跟着展开态走（机器的 trackLayer 效应负责）。
    // 挂载期就注册会让层与开合无关地常驻栈里，把同页其它层的 Escape 堵死。
    const registerLayer = (): { layer: Layer, dispose: Cleanup } => config.layerRegistry.register({
      kind: 'popover',
      node: () => contentRef.value,
      // 整个输入行记为本层分支：点 trigger 或段位算层内交互，开合交给它们自己切换。
      // 否则同一次点击先被判为层外交互关一次、再被 click 打开一次，等于关不掉。
      branches: () => [controlRef.value].filter(Boolean) as Element[],
      isModal: () => false,
      setModal: () => {},
      surfaces: () => [],
    })

    // 定位引擎由适配器建好注入；机器只经端口驱动，不认识具体引擎。
    // 锚点取整个输入行，浮层因此与输入框对齐而不是只贴着图标按钮。
    root.refs.set('config', config)
    root.refs.set('registerLayer', registerLayer)
    root.refs.set('position', createFloatingUiPositionEngine())
    root.refs.set('getAnchorEl', () => controlRef.value)
    root.refs.set('getFloatingEl', () => positionerRef.value)
    root.refs.set('getContentEl', () => contentRef.value)
  }

  // 键盘跨月时要把焦点送进新月份的那一格，而那一格是本帧重渲之后才存在的：
  // 日历机器推迟一拍再从这里拿到网格、现查落点。不注入的话状态照常流转，只是焦点搬不动。
  calendar.refs.set('getGridEl', () => gridRef.value)

  const api = computed(() => connectDatePicker(services, vueNormalize))
  return { api, services, controlRef, positionerRef, contentRef, gridRef }
}
