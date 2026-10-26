/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 use mention 相关实现。

import type { Layer, Service } from '@xihan-ui/core'
import type { MentionApi, MentionInputEl, MentionSchema } from '@xihan-ui/headless'
import type { RefObject } from 'react'
import type { OverlayWiring } from '../../runtime/use-overlay'
import { connectMention, mentionMachine } from '@xihan-ui/headless'
import { createDeferredPositionEngine } from '@xihan-ui/position'
import { useCallback, useRef, useState } from 'react'
import { useFormReset } from '../../runtime/attach-form-reset'
import { reactNormalize } from '../../runtime/normalize-props'
import { useReactIdGenerator, useReactScope } from '../../runtime/react-id'
import { useMachine } from '../../runtime/use-machine'
import { useOverlay } from '../../runtime/use-overlay'

export interface MentionContext extends OverlayWiring {
  /**
   * label 部件挂载时登记、卸载时注销。可聚焦部件的 aria-labelledby 据此决定输不输出；
   * 首帧（含服务端直出）还没登记，不写这条引用。
   */
  registerLabel: () => () => void
  /** 状态机实例，供部件直接上报 DOM 侧事实。 */
  service: Service<MentionSchema>
  api: MentionApi
  /** 表单重置的锚点：接在根节点上。 */
  rootRef: RefObject<HTMLElement | null>
  /** 输入宿主，textarea 或 input；由 XhMentionInput 的 as 决定渲染为哪个。 */
  inputRef: RefObject<MentionInputEl | null>
  positionerRef: RefObject<HTMLElement | null>
  contentRef: RefObject<HTMLElement | null>
  /** 上报候选集合可能已变化；同一拍内多次调用只上报一次。 */
  syncItems: () => void
}

export function useMention(props: MentionSchema['props']): MentionContext {
  const idGenerator = useReactIdGenerator()
  const scope = useReactScope()
  const rootRef = useRef<HTMLElement | null>(null)
  const inputRef = useRef<MentionInputEl | null>(null)
  const positionerRef = useRef<HTMLElement | null>(null)
  const contentRef = useRef<HTMLElement | null>(null)
  const serviceRef = useRef<Service<MentionSchema> | null>(null)

  const layer = useCallback((): Omit<Layer, 'id' | 'node' | 'surfaces'> => ({
    kind: 'popover',
    // 输入框记为本层分支：在正文里打字、点击都算层内交互，不该把浮层点没。
    // 浮层壳一并记上：候选列表之外还浮着自绘滚动条，按住它拖动不该把列表消解掉
    branches: () => [inputRef.current, positionerRef.current].filter(Boolean) as Element[],
    isModal: () => false,
  }), [])

  const overlay = useOverlay({
    scope,
    idGenerator,
    // 挂载那一刻光标在哪还不知道，机器一律从收起态起步
    initialOpen: false,
    isOpen: () => serviceRef.current?.state.get() === 'open',
    layer,
    node: () => contentRef.current,
    refs: (service) => {
      // 定位引擎由适配器注入，机器只经端口驱动；锚点就是输入框本身
      service.refs.set('position', createDeferredPositionEngine())
      service.refs.set('getFloatingEl', () => positionerRef.current)
      service.refs.set('getContentEl', () => contentRef.current)
      service.refs.set('getInputEl', () => inputRef.current)
    },
  })

  // 用状态而不是 ref：登记数要能把根重渲一次，connect 在渲染期求值
  const [labelCount, setLabelCount] = useState(0)
  const registerLabel = useCallback(() => {
    setLabelCount(n => n + 1)
    return () => setLabelCount(n => n - 1)
  }, [])
  const service = useMachine(mentionMachine, () => ({ ...props, labelled: labelCount > 0 }), {
    scope,
    onCreate: overlay.onCreate as never,
  })
  serviceRef.current = service

  // 正文攥在机器里，原生 reset 只还原原生控件——不接这条线，点重置什么都不会发生
  useFormReset(service, rootRef)

  // 合并到下一拍统一上报：同一次提交里进出的候选各自调一次，只送一个事件
  const scheduled = useRef(false)
  const syncItems = useCallback(() => {
    if (scheduled.current)
      return
    scheduled.current = true
    queueMicrotask(() => {
      scheduled.current = false
      if (service.getStatus() === 'Started')
        service.send({ type: 'ITEMS.SYNC' })
    })
  }, [service])

  return {
    registerLabel,
    ...overlay,
    service,
    api: connectMention(service, reactNormalize),
    rootRef,
    inputRef,
    positionerRef,
    contentRef,
    syncItems,
  }
}
