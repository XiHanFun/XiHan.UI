import type { Layer, MachineSchema, Service } from '@xihan-ui/core'
import type { CalendarSchema, DateFieldSchema, DatePickerApi, DatePickerSchema, DatePickerServices } from '@xihan-ui/headless'
import type { RefObject } from 'react'
import type { OverlayWiring } from '../../runtime/use-overlay'
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
import { useCallback, useRef } from 'react'
import { useFormReset } from '../../runtime/attach-form-reset'
import { reactNormalize } from '../../runtime/normalize-props'
import { useReactIdGenerator, useReactScope } from '../../runtime/react-id'
import { useMachine } from '../../runtime/use-machine'
import { useOverlay } from '../../runtime/use-overlay'

export interface DatePickerContext extends OverlayWiring {
  /** 四台机器的把手，供部件上报 DOM 侧的事实。 */
  services: DatePickerServices
  api: DatePickerApi
  /** 表单重置的锚点：接在根节点上。 */
  rootRef: RefObject<HTMLElement | null>
  controlRef: RefObject<HTMLElement | null>
  positionerRef: RefObject<HTMLElement | null>
  contentRef: RefObject<HTMLElement | null>
  /** 首个网格的节点：跨月重渲后日历机器按它现查焦点该落在哪一格。 */
  gridRef: RefObject<HTMLElement | null>
}

export function useDatePicker(props: DatePickerSchema['props']): DatePickerContext {
  const idGenerator = useReactIdGenerator()
  // 四台机器共用一份 scope，part id 里带组件名区分；两组段位不产出 id，同 scope 不会撞
  const scope = useReactScope()
  const rootRef = useRef<HTMLElement | null>(null)
  const controlRef = useRef<HTMLElement | null>(null)
  const positionerRef = useRef<HTMLElement | null>(null)
  const contentRef = useRef<HTMLElement | null>(null)
  const gridRef = useRef<HTMLElement | null>(null)
  const serviceRef = useRef<Service<DatePickerSchema> | null>(null)

  const initialOpen = (props.open ?? props.defaultOpen) ?? false

  const layer = useCallback((): Omit<Layer, 'id' | 'node' | 'surfaces'> => ({
    kind: 'popover',
    // 整个输入行记为本层分支，点 trigger 或段位算层内交互；
    // 浮层壳一并记上：content 之外还浮着自绘滚动条，按住它拖动不该把浮层消解掉
    branches: () => [controlRef.current, positionerRef.current].filter(Boolean) as Element[],
    isModal: () => false,
    setModal: () => {},
  }), [])

  const overlay = useOverlay({
    scope,
    idGenerator,
    initialOpen,
    isOpen: () => serviceRef.current?.state.get() === 'open',
    layer,
    node: () => contentRef.current,
    refs: (service: Service<MachineSchema>) => {
      // 定位引擎由适配器注入，机器只经端口驱动；锚点取整个输入行
      service.refs.set('position', createPositionEngine() as never)
      service.refs.set('getAnchorEl', (() => controlRef.current) as never)
      service.refs.set('getFloatingEl', (() => positionerRef.current) as never)
      service.refs.set('getContentEl', (() => contentRef.current) as never)
    },
  })

  // 三台内嵌机器的 props 都从编排机现读，编排机须先建立
  const root = useMachine(datePickerMachine, () => props, {
    scope,
    onCreate: overlay.onCreate as never,
  })
  serviceRef.current = root

  const calendar = useMachine<CalendarSchema>(calendarMachine, () => datePickerCalendarProps(root), {
    scope,
    // 跨月后的焦点落点要等重渲，日历机器推迟一拍再从这里取网格现查
    onCreate: (svc) => {
      svc.refs.set('getGridEl', () => gridRef.current)
    },
  })
  const field = useMachine<DateFieldSchema>(dateFieldMachine, () => datePickerFieldProps(root), { scope })
  // 终点那组段位无条件建：机器实例数不随模式变，非区间模式下它的值恒为空且不参与写值
  const fieldEnd = useMachine<DateFieldSchema>(dateFieldMachine, () => datePickerFieldEndProps(root), { scope })
  const services: DatePickerServices = { root, calendar, field, fieldEnd }

  // 值攥在机器里，原生 reset 只还原原生控件——不接这条线，点重置什么都不会发生。
  // 四台逐一挂：认重置的那几台各自收到事件，不认的那台由 hook 自己让位
  useFormReset(root, rootRef)
  useFormReset(calendar, rootRef)
  useFormReset(field, rootRef)
  useFormReset(fieldEnd, rootRef)

  return {
    ...overlay,
    services,
    api: connectDatePicker(services, reactNormalize),
    rootRef,
    controlRef,
    positionerRef,
    contentRef,
    gridRef,
  }
}
