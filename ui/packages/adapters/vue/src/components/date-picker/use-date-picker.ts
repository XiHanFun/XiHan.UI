import type { Cleanup, Layer, RuntimeConfig } from '@xihan-ui/core'
import type { CalendarSchema, DateFieldSchema, DatePickerApi, DatePickerSchema, DatePickerServices } from '@xihan-ui/headless'
import type { ComputedRef, Ref } from 'vue'
import { createRuntimeConfig, createScope } from '@xihan-ui/core'
import {
  calendarMachine,
  connectDatePicker,
  dateFieldMachine,
  datePickerCalendarProps,
  datePickerFieldEndProps,
  datePickerFieldProps,
  datePickerMachine,
} from '@xihan-ui/headless'
import { createPositionEngine } from '@xihan-ui/position'
import { computed, ref } from 'vue'
import { useXhConfig } from '../../config/config'
import { vueNormalize } from '../../runtime/normalize-props'
import { useMachine } from '../../runtime/use-machine'
import { useOverlayExit } from '../../runtime/use-overlay-exit'
import { createVueIdGenerator } from '../../runtime/vue-id'

export interface DatePickerContext {
  api: ComputedRef<DatePickerApi>
  /** 四台机器的把手，供部件上报 DOM 侧的事实。 */
  services: DatePickerServices
  controlRef: Ref<HTMLElement | null>
  positionerRef: Ref<HTMLElement | null>
  contentRef: Ref<HTMLElement | null>
  /** 此刻该不该渲染：退场动画播完之前仍为真。 */
  visible: Ref<boolean>
  gridRef: Ref<HTMLElement | null>
  /** 浮层搬到哪儿：全局配置的 portalContainer > body。 */
  portalTarget: ComputedRef<string | Element>
}

export function useDatePicker(
  props: DatePickerSchema['props'],
  handlers: Pick<DatePickerSchema['props'], 'onValueChange' | 'onOpenChange' | 'onFocusedValueChange' | 'onActiveViewChange'> = {},
): DatePickerContext {
  const xhConfig = useXhConfig()
  const controlRef = ref<HTMLElement | null>(null)
  const positionerRef = ref<HTMLElement | null>(null)
  const contentRef = ref<HTMLElement | null>(null)
  const gridRef = ref<HTMLElement | null>(null)

  // 四台机器共用一份 scope，part id 里带组件名区分；两组段位不产出 id，同 scope 不会撞
  const idGen = createVueIdGenerator()
  const scope = createScope(null, idGen)

  // 三台内嵌机器的 props 都从编排机现读，编排机须先建立
  const root = useMachine(datePickerMachine, () => ({ ...props, ...handlers }), scope)
  const calendar = useMachine<CalendarSchema>(calendarMachine, () => datePickerCalendarProps(root), scope)
  const field = useMachine<DateFieldSchema>(dateFieldMachine, () => datePickerFieldProps(root), scope)
  // 终点那组段位无条件建：机器实例数不随模式变，非区间模式下它的值恒为空且不参与写值
  const fieldEnd = useMachine<DateFieldSchema>(dateFieldMachine, () => datePickerFieldEndProps(root), scope)
  const services: DatePickerServices = { root, calendar, field, fieldEnd }

  // 服务端没有 DOM、也就没有退场：config 传 null 时闸门退化成「跟着展开态」
  let config: RuntimeConfig | null = null

  if (typeof document !== 'undefined') {
    config = createRuntimeConfig({ scope, idGenerator: idGen })

    // 只提供注册函数，入栈出栈由机器的 trackLayer 效应按展开态驱动
    const registerLayer = (): { layer: Layer, dispose: Cleanup } => config!.layerRegistry.register({
      kind: 'popover',
      node: () => contentRef.value,
      // 整个输入行记为本层分支，点 trigger 或段位算层内交互；
      // 浮层壳一并记上：content 之外还浮着自绘滚动条，按住它拖动不该把浮层消解掉
      branches: () => [controlRef.value, positionerRef.value].filter(Boolean) as Element[],
      isModal: () => false,
      setModal: () => {},
      surfaces: () => [],
    })

    // 定位引擎由适配器注入，机器只经端口驱动；锚点取整个输入行
    root.refs.set('config', config!)
    root.refs.set('registerLayer', registerLayer)
    root.refs.set('position', createPositionEngine())
    root.refs.set('getAnchorEl', () => controlRef.value)
    root.refs.set('getFloatingEl', () => positionerRef.value)
    root.refs.set('getContentEl', () => contentRef.value)
  }

  // 跨月后的焦点落点要等重渲，日历机器推迟一拍再从这里取网格现查
  calendar.refs.set('getGridEl', () => gridRef.value)

  const api = computed(() => connectDatePicker(services, vueNormalize))
  // 退场闸门：收起从跟着 open 走，改成跟着 presence 走
  const visible = useOverlayExit({ config, isOpen: () => api.value.open, contentRef })
  // 先问全局配置的落点，没有才落 body
  const portalTarget = computed<string | Element>(() => xhConfig.value.portalContainer?.() ?? config?.portalContainer() ?? 'body')

  return { visible, api, services, controlRef, positionerRef, contentRef, gridRef, portalTarget }
}
