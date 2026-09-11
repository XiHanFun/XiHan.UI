import type { Cleanup, Layer, RuntimeConfig } from '@xihan-ui/core'
import type { CalendarSchema, DateFieldSchema, DatePickerApi, DatePickerSchema, DatePickerServices } from '@xihan-ui/headless'
import type { ComputedRef, Ref } from 'vue'
import { createRuntimeConfig, createScope, isElement } from '@xihan-ui/core'
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
import { computed, ref, shallowRef, watch } from 'vue'
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
  /** 显式同 Document 目标优先，缺省使用真实根所属运行时的 Portal。 */
  portalTarget: ComputedRef<string | Element>
}

type DatePickerHandlers = Pick<
  DatePickerSchema['props'],
  'onValueChange' | 'onOpenChange' | 'onFocusedValueChange' | 'onActiveViewChange'
>

/** 已创建的 RuntimeConfig 永久归属首次根节点的 Document；动态 Scope 后续不能改写这份事实。 */
export function assertDatePickerRootDocument(expected: Document, node: Element): void {
  if (node.ownerDocument !== expected)
    throw new Error('[xh] DatePicker 根节点不能在运行期切换 Document')
}

/** 显式 Portal 是同 realm 目标，不是 Scope 来源；字段存在时 null 与伪节点都属于配置错误。 */
export function resolveDatePickerPortalTarget(
  runtime: RuntimeConfig,
  resolver: (() => unknown) | undefined,
): Element | undefined {
  if (!resolver)
    return undefined
  const target = resolver()
  if (!isElement(target))
    throw new TypeError('[xh] DatePicker 的 portalContainer 必须返回 Element')
  if (target.ownerDocument !== runtime.layerRegistry.ownerDocument)
    throw new Error('[xh] DatePicker 的 portalContainer 必须与组件根属于同一 Document')
  return target
}

function createDatePickerContext(
  props: DatePickerSchema['props'],
  handlers: DatePickerHandlers,
  rootRef?: Readonly<Ref<HTMLElement | null>>,
): DatePickerContext {
  const xhConfig = useXhConfig()
  const controlRef = ref<HTMLElement | null>(null)
  const positionerRef = ref<HTMLElement | null>(null)
  const contentRef = ref<HTMLElement | null>(null)
  const gridRef = ref<HTMLElement | null>(null)

  // 四台机器共用一份 scope，part id 里带组件名区分；两组段位不产出 id，同 scope 不会撞
  const idGen = createVueIdGenerator()
  const scope = rootRef ? createScope(() => rootRef.value, idGen) : createScope(null, idGen)

  // 三台内嵌机器的 props 都从编排机现读，编排机须先建立
  const root = useMachine(datePickerMachine, () => ({ ...props, ...handlers }), scope)
  const calendar = useMachine<CalendarSchema>(calendarMachine, () => datePickerCalendarProps(root), scope)
  const field = useMachine<DateFieldSchema>(dateFieldMachine, () => datePickerFieldProps(root), scope)
  // 终点那组段位无条件建：机器实例数不随模式变，非区间模式下它的值恒为空且不参与写值
  const fieldEnd = useMachine<DateFieldSchema>(dateFieldMachine, () => datePickerFieldEndProps(root), scope)
  const services: DatePickerServices = { root, calendar, field, fieldEnd }

  // 服务端没有 DOM、也就没有退场：config 传 null 时闸门退化成「跟着展开态」
  const config = shallowRef<RuntimeConfig | null>(null)
  let runtimeDocument: Document | null = null

  if (typeof document !== 'undefined') {
    const installConfig = (node?: HTMLElement): void => {
      const current = config.value
      if (current) {
        // scope 读取的是动态 rootRef；这里必须与创建配置时冻结的 Document 比，不能拿新根和自己比。
        if (node)
          assertDatePickerRootDocument(runtimeDocument!, node)
        return
      }

      const next = createRuntimeConfig({ scope, idGenerator: idGen })
      // 只提供注册函数，入栈出栈由机器的 trackLayer 效应按展开态驱动
      const registerLayer = (): { layer: Layer, dispose: Cleanup } => next.layerRegistry.register({
        kind: 'popover',
        node: () => contentRef.value,
        // 整个输入行记为本层分支，点 trigger 或段位算层内交互；
        // 浮层壳一并记上：content 之外还浮着自绘滚动条，按住它拖动不该把浮层消解掉
        branches: () => [controlRef.value, positionerRef.value].filter(Boolean) as Element[],
        isModal: () => false,
        surfaces: () => [],
      })

      root.refs.set('config', next)
      root.refs.set('registerLayer', registerLayer)
      runtimeDocument = next.layerRegistry.ownerDocument
      config.value = next
    }

    if (rootRef) {
      // 元素 ref 在 mounted hooks 之前同步提交：先绑定真实 realm、再让四台 service 启动。
      watch(rootRef, (node) => {
        if (node)
          installConfig(node)
      }, { flush: 'sync', immediate: true })
    }
    else {
      // 直接调用公开 composable 的既有合同仍代表 ambient Document。
      installConfig()
    }

    // 定位引擎由适配器注入，机器只经端口驱动；锚点取整个输入行
    root.refs.set('position', createPositionEngine())
    root.refs.set('getAnchorEl', () => controlRef.value)
    root.refs.set('getFloatingEl', () => positionerRef.value)
  }

  // 跨月后的焦点落点要等重渲，日历机器推迟一拍再从这里取网格现查
  calendar.refs.set('getGridEl', () => gridRef.value)

  const api = computed(() => connectDatePicker(services, vueNormalize))
  // 退场闸门：收起从跟着 open 走，改成跟着 presence 走
  const visible = useOverlayExit({ config, isOpen: () => api.value.open, contentRef })
  // 显式配置只选择同一 Document 内的落点，不能反过来决定 Scope，也不能跨 realm 搬运。
  const portalTarget = computed<string | Element>(() => {
    const runtime = config.value
    // 首次 render 时 rootRef 还没提交；不读取显式 getter，Portal 在来源位置正常挂载。
    if (!runtime)
      return 'body'
    const explicitTarget = resolveDatePickerPortalTarget(runtime, xhConfig.value.portalContainer)
    if (explicitTarget)
      return explicitTarget
    const defaultTarget = runtime.portalContainer()
    if (!isElement(defaultTarget))
      throw new TypeError('[xh] DatePicker 的运行时 portalContainer 必须返回 Element')
    return defaultTarget
  })

  if (typeof document !== 'undefined') {
    root.refs.set('getContentEl', () => {
      const content = contentRef.value
      if (!content || !rootRef)
        return content
      // 首次 mounted 时正文仍可能原地挂载，随后 Teleport 搬运会丢失刚取得的焦点。
      // 以真正进入目标容器为就绪事实，焦点域沿既有挂载流程等待，不提前聚焦临时位置。
      const target = portalTarget.value
      return typeof target !== 'string' && target.contains(content) ? content : null
    })
  }

  return { visible, api, services, controlRef, positionerRef, contentRef, gridRef, portalTarget }
}

/** 公开 composable 保留 ambient Scope 合同。 */
export function useDatePicker(
  props: DatePickerSchema['props'],
  handlers: DatePickerHandlers = {},
): DatePickerContext {
  return createDatePickerContext(props, handlers)
}

/** 组合组件内部从真实根节点绑定 Scope；不经包入口导出。 */
export function useDatePickerWithRoot(
  props: DatePickerSchema['props'],
  handlers: DatePickerHandlers,
  rootRef: Readonly<Ref<HTMLElement | null>>,
): DatePickerContext {
  return createDatePickerContext(props, handlers, rootRef)
}
