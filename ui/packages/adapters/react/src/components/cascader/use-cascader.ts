/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 use cascader 相关实现。

import type { Layer, Service } from '@xihan-ui/core'
import type { CascaderApi, CascaderSchema } from '@xihan-ui/headless'
import type { RefObject } from 'react'
import type { OverlayWiring } from '../../runtime/use-overlay'
import { cascaderMachine, connectCascader } from '@xihan-ui/headless'
import { createDeferredPositionEngine } from '@xihan-ui/position'
import { useCallback, useRef, useState } from 'react'
import { useFormReset } from '../../runtime/attach-form-reset'
import { reactNormalize } from '../../runtime/normalize-props'
import { useReactIdGenerator, useReactScope } from '../../runtime/react-id'
import { useMachine } from '../../runtime/use-machine'
import { useOverlay } from '../../runtime/use-overlay'

export interface CascaderContext extends OverlayWiring {
  /**
   * label 部件挂载时登记、卸载时注销。可聚焦部件的 aria-labelledby 据此决定输不输出；
   * 首帧（含服务端直出）还没登记，不写这条引用。
   */
  registerLabel: () => () => void
  /** 状态机实例，供部件上报 DOM 侧的事实（如条目卸载带走了焦点）。 */
  service: Service<CascaderSchema>
  api: CascaderApi
  rootRef: RefObject<HTMLDivElement | null>
  triggerRef: RefObject<HTMLElement | null>
  controlRef: RefObject<HTMLElement | null>
  positionerRef: RefObject<HTMLElement | null>
  contentRef: RefObject<HTMLElement | null>
}

export function useCascader(props: CascaderSchema['props']): CascaderContext {
  const idGenerator = useReactIdGenerator()
  const scope = useReactScope()
  const rootRef = useRef<HTMLDivElement | null>(null)
  const triggerRef = useRef<HTMLElement | null>(null)
  const controlRef = useRef<HTMLElement | null>(null)
  const positionerRef = useRef<HTMLElement | null>(null)
  const contentRef = useRef<HTMLElement | null>(null)
  const serviceRef = useRef<Service<CascaderSchema> | null>(null)

  const initialOpen = (props.open ?? props.defaultOpen) ?? false

  const layer = useCallback((): Omit<Layer, 'id' | 'node' | 'surfaces'> => ({
    kind: 'popover',
    // trigger 记为本层分支，点它算层内交互；
    // 浮层壳一并记上：content 之外还浮着自绘滚动条，按住它拖动不该把浮层消解掉
    branches: () => [triggerRef.current, positionerRef.current].filter(Boolean) as Element[],
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
      service.refs.set('position', createDeferredPositionEngine())
      // 锚点是字段盒：面板起始缘与盒对齐；作者没写 control 时退回触发器
      service.refs.set('getAnchorEl', () => controlRef.current ?? triggerRef.current)
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
  const service = useMachine(cascaderMachine, () => ({ ...props, labelled: labelCount > 0 }), {
    scope,
    onCreate: overlay.onCreate as never,
  })
  serviceRef.current = service
  useFormReset(service, rootRef)

  return {
    registerLabel,
    ...overlay,
    service,
    api: connectCascader(service, reactNormalize),
    rootRef,
    triggerRef,
    controlRef,
    positionerRef,
    contentRef,
  }
}
