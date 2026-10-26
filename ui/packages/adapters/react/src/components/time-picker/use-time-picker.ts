/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 use time picker 相关实现。

import type { Layer, MachineSchema, Service } from '@xihan-ui/core'
import type { TimePickerApi, TimePickerSchema } from '@xihan-ui/headless'
import type { RefObject } from 'react'
import type { OverlayWiring } from '../../runtime/use-overlay'
import { connectTimePicker, timePickerMachine } from '@xihan-ui/headless'
import { createDeferredPositionEngine } from '@xihan-ui/position'
import { useCallback, useRef, useState } from 'react'
import { useFormReset } from '../../runtime/attach-form-reset'
import { reactNormalize } from '../../runtime/normalize-props'
import { useReactIdGenerator, useReactScope } from '../../runtime/react-id'
import { useMachine } from '../../runtime/use-machine'
import { useOverlay } from '../../runtime/use-overlay'

export interface TimePickerContext extends OverlayWiring {
  /**
   * label 部件挂载时登记、卸载时注销。可聚焦部件的 aria-labelledby 据此决定输不输出；
   * 首帧（含服务端直出）还没登记，不写这条引用。
   */
  registerLabel: () => () => void
  /** 状态机实例，供部件上报 DOM 侧的事实。 */
  service: Service<TimePickerSchema>
  api: TimePickerApi
  /** 表单重置的锚点：接在根节点上。 */
  rootRef: RefObject<HTMLElement | null>
  controlRef: RefObject<HTMLElement | null>
  triggerRef: RefObject<HTMLElement | null>
  positionerRef: RefObject<HTMLElement | null>
  contentRef: RefObject<HTMLElement | null>
}

export function useTimePicker(props: TimePickerSchema['props']): TimePickerContext {
  const idGenerator = useReactIdGenerator()
  const scope = useReactScope()
  const rootRef = useRef<HTMLElement | null>(null)
  const controlRef = useRef<HTMLElement | null>(null)
  const triggerRef = useRef<HTMLElement | null>(null)
  const positionerRef = useRef<HTMLElement | null>(null)
  const contentRef = useRef<HTMLElement | null>(null)
  const serviceRef = useRef<Service<TimePickerSchema> | null>(null)

  const initialOpen = (props.open ?? props.defaultOpen) ?? false

  const layer = useCallback((): Omit<Layer, 'id' | 'node' | 'surfaces'> => ({
    kind: 'popover',
    // 整个输入行记为本层分支，点触发器算层内交互
    branches: () => [controlRef.current].filter(Boolean) as Element[],
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
      service.refs.set('position', createDeferredPositionEngine())
      service.refs.set('getAnchorEl', () => controlRef.current)
      service.refs.set('getTriggerEl', () => triggerRef.current)
      service.refs.set('getFloatingEl', () => positionerRef.current)
      service.refs.set('getContentEl', () => contentRef.current)
    },
  })

  // 用状态而不是 ref：登记数要能把根重渲一次，connect 在渲染期求值
  const [labelCount, setLabelCount] = useState(0)
  const registerLabel = useCallback(() => {
    setLabelCount(n => n + 1)
    return () => setLabelCount(n => n - 1)
  }, [])
  const service = useMachine(timePickerMachine, () => ({ ...props, labelled: labelCount > 0 }), {
    scope,
    onCreate: overlay.onCreate as never,
  })
  serviceRef.current = service

  // 值攥在机器里，原生 reset 只还原原生控件——不接这条线，点重置什么都不会发生
  useFormReset(service, rootRef)

  return {
    registerLabel,
    ...overlay,
    service,
    api: connectTimePicker(service, reactNormalize),
    rootRef,
    controlRef,
    triggerRef,
    positionerRef,
    contentRef,
  }
}
