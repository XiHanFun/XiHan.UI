/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 use date range picker 相关实现。

import type { Layer, MachineSchema, Service } from '@xihan-ui/core'
import type { CalendarRangePickerSchema, DateFieldSchema, DateRangePickerApi, DateRangePickerSchema, DateRangePickerServices } from '@xihan-ui/headless'
import type { RefObject } from 'react'
import type { OverlayWiring } from '../../runtime/use-overlay'
import {
  calendarRangePickerMachine,
  connectDateRangePicker,
  dateFieldMachine,
  dateRangePickerCalendarProps,
  dateRangePickerFieldEndProps,
  dateRangePickerFieldProps,
  dateRangePickerMachine,
} from '@xihan-ui/headless'
import { createPositionEngine } from '@xihan-ui/position'
import { useCallback, useRef } from 'react'
import { useFormReset } from '../../runtime/attach-form-reset'
import { reactNormalize } from '../../runtime/normalize-props'
import { useReactIdGenerator, useReactScope } from '../../runtime/react-id'
import { useMachine } from '../../runtime/use-machine'
import { useOverlay } from '../../runtime/use-overlay'

export interface DateRangePickerContext extends OverlayWiring {
  /** 四台机器的把手，供部件上报 DOM 侧的事实。 */
  services: DateRangePickerServices
  api: DateRangePickerApi
  /** 表单重置的锚点：接在根节点上。 */
  rootRef: RefObject<HTMLElement | null>
  controlRef: RefObject<HTMLElement | null>
  positionerRef: RefObject<HTMLElement | null>
  contentRef: RefObject<HTMLElement | null>
  /** 首个网格的节点：跨月重渲后日历机器按它现查焦点该落在哪一格。 */
  gridRef: RefObject<HTMLElement | null>
}

export function useDateRangePicker(props: DateRangePickerSchema['props']): DateRangePickerContext {
  const idGenerator = useReactIdGenerator()
  // 四台机器共用一份 scope，part id 里带组件名区分；两组段位不产出 id，同 scope 不会撞
  const scope = useReactScope()
  const rootRef = useRef<HTMLElement | null>(null)
  const controlRef = useRef<HTMLElement | null>(null)
  const positionerRef = useRef<HTMLElement | null>(null)
  const contentRef = useRef<HTMLElement | null>(null)
  const gridRef = useRef<HTMLElement | null>(null)
  const serviceRef = useRef<Service<DateRangePickerSchema> | null>(null)

  const initialOpen = (props.open ?? props.defaultOpen) ?? false

  const layer = useCallback((): Omit<Layer, 'id' | 'node' | 'surfaces'> => ({
    kind: 'popover',
    // 整个输入行记为本层分支，点 trigger 或段位算层内交互；
    // 浮层壳一并记上：content 之外还浮着自绘滚动条，按住它拖动不该把浮层消解掉
    branches: () => [controlRef.current, positionerRef.current].filter(Boolean) as Element[],
    isModal: () => false,
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
  const root = useMachine(dateRangePickerMachine, () => props, {
    scope,
    onCreate: overlay.onCreate as never,
  })
  serviceRef.current = root

  const calendar = useMachine<CalendarRangePickerSchema>(calendarRangePickerMachine, () => dateRangePickerCalendarProps(root), {
    scope,
    // 跨月后的焦点落点要等重渲，日历机器推迟一拍再从这里取网格现查
    onCreate: (svc) => {
      svc.refs.set('getGridEl', () => gridRef.current)
      // 挑到一半时，指针在浮层与输入行之外松开就地收口
      svc.refs.set('getBoundaryEls', () => [contentRef.current, controlRef.current])
    },
  })
  const field = useMachine<DateFieldSchema>(dateFieldMachine, () => dateRangePickerFieldProps(root), { scope })
  // 终点那组段位：与起点那组同一台分段输入机器，各管区间的一端
  const fieldEnd = useMachine<DateFieldSchema>(dateFieldMachine, () => dateRangePickerFieldEndProps(root), { scope })
  const services: DateRangePickerServices = { root, calendar, field, fieldEnd }

  // 值攥在机器里，原生 reset 只还原原生控件——不接这条线，点重置什么都不会发生。
  // 四台逐一挂：认重置的那几台各自收到事件，不认的那台由 hook 自己让位
  useFormReset(root, rootRef)
  useFormReset(calendar, rootRef)
  useFormReset(field, rootRef)
  useFormReset(fieldEnd, rootRef)

  return {
    ...overlay,
    services,
    api: connectDateRangePicker(services, reactNormalize),
    rootRef,
    controlRef,
    positionerRef,
    contentRef,
    gridRef,
  }
}
