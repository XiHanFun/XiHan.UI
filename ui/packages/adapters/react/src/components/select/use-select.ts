/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 use select 相关实现。

import type { Layer, Service } from '@xihan-ui/core'
import type { SelectApi, SelectSchema } from '@xihan-ui/headless'
import type { RefObject } from 'react'
import type { OverlayWiring } from '../../runtime/use-overlay'
import { connectSelect, selectMachine } from '@xihan-ui/headless'
import { createPositionEngine } from '@xihan-ui/position'
import { useCallback, useRef, useState } from 'react'
import { useFormReset } from '../../runtime/attach-form-reset'
import { reactNormalize } from '../../runtime/normalize-props'
import { useReactIdGenerator, useReactScope } from '../../runtime/react-id'
import { useMachine } from '../../runtime/use-machine'
import { useOverlay } from '../../runtime/use-overlay'

export interface SelectContext extends OverlayWiring {
  /**
   * label 部件挂载时登记、卸载时注销。可聚焦部件的 aria-labelledby 据此决定输不输出；
   * 首帧（含服务端直出）还没登记，不写这条引用。
   */
  registerLabel: () => () => void
  /** 状态机实例，供部件上报 DOM 侧的事实（如条目卸载带走了焦点）。 */
  service: Service<SelectSchema>
  api: SelectApi
  /** 表单重置的锚点：接在根节点上。 */
  rootRef: RefObject<HTMLElement | null>
  triggerRef: RefObject<HTMLElement | null>
  /** 盒：触发器与清空按钮在里面并排，记为浮层分支 */
  controlRef: RefObject<HTMLElement | null>
  positionerRef: RefObject<HTMLElement | null>
  contentRef: RefObject<HTMLElement | null>
  /** 列表框本体：真正在滚动的层，自绘条挂在 positioner 上跟着它走 */
  listRef: RefObject<HTMLElement | null>
}

export function useSelect(props: SelectSchema['props']): SelectContext {
  const idGenerator = useReactIdGenerator()
  const scope = useReactScope()
  const rootRef = useRef<HTMLElement | null>(null)
  const triggerRef = useRef<HTMLElement | null>(null)
  const controlRef = useRef<HTMLElement | null>(null)
  const positionerRef = useRef<HTMLElement | null>(null)
  const contentRef = useRef<HTMLElement | null>(null)
  const listRef = useRef<HTMLElement | null>(null)
  const serviceRef = useRef<Service<SelectSchema> | null>(null)

  const initialOpen = (props.open ?? props.defaultOpen) ?? false

  const layer = useCallback((): Omit<Layer, 'id' | 'node' | 'surfaces'> => ({
    kind: 'popover',
    // 整个盒记为本层分支：点触发器或清空钮算层内交互，开合交给 trigger 自己切换；
    // 浮层壳一并记上：列表之外还浮着自绘滚动条，按住它拖动不该把列表消解掉
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
    refs: (service) => {
      // 定位引擎由适配器注入，机器只经端口驱动
      service.refs.set('position', createPositionEngine() as never)
      // 锚点是字段盒：列表面板与盒子同宽、左缘对齐；作者没写 control 时退回触发器
      service.refs.set('getAnchorEl', (() => controlRef.current ?? triggerRef.current) as never)
      service.refs.set('getTriggerEl', (() => triggerRef.current) as never)
      service.refs.set('getFloatingEl', (() => positionerRef.current) as never)
      service.refs.set('getContentEl', (() => contentRef.current) as never)
    },
  })

  // 用状态而不是 ref：登记数要能把根重渲一次，connect 在渲染期求值
  const [labelCount, setLabelCount] = useState(0)
  const registerLabel = useCallback(() => {
    setLabelCount(n => n + 1)
    return () => setLabelCount(n => n - 1)
  }, [])
  const service = useMachine(selectMachine, () => ({ ...props, labelled: labelCount > 0 }), {
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
    api: connectSelect(service, reactNormalize),
    rootRef,
    triggerRef,
    controlRef,
    positionerRef,
    contentRef,
    listRef,
  }
}
