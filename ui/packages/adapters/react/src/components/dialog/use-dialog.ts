/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 use dialog 相关实现。

import type { Layer, Service } from '@xihan-ui/core'
import type { DialogActionIntents, DialogApi, DialogConfirmErrorDetails, DialogSchema } from '@xihan-ui/headless'
import type { RefObject } from 'react'
import type { TitleDescriptionPresence } from '../../runtime/title-description'
import type { OverlayWiring } from '../../runtime/use-overlay'
import { connectDialog, dialogMachine } from '@xihan-ui/headless'
import { useCallback, useRef, useState } from 'react'
import { invalidateMachineProps } from '../../runtime/create-react-runtime'
import { reactNormalize } from '../../runtime/normalize-props'
import { useReactIdGenerator, useReactScope } from '../../runtime/react-id'
import { useTitleDescriptionPresence } from '../../runtime/title-description'
import { useMachine } from '../../runtime/use-machine'
import { useOverlay } from '../../runtime/use-overlay'

export interface DialogContext extends OverlayWiring {
  service: Service<DialogSchema>
  api: DialogApi
  contentRef: RefObject<HTMLElement | null>
  backdropRef: RefObject<HTMLElement | null>
  /** 标题与说明在不在场，由 XhDialogTitle / XhDialogDescription 登记；content 只引用在场的部件。 */
  presence: TitleDescriptionPresence
}

/** 页脚确定与取消两颗钮的回调；pending 与 actionError 两个状态由这里持有。 */
export type DialogActionNotifiers = Pick<DialogActionIntents, 'onConfirm' | 'onConfirmError' | 'onCancelPress'>

export function useDialog(props: DialogSchema['props'], actions?: DialogActionNotifiers): DialogContext {
  const idGenerator = useReactIdGenerator()
  const scope = useReactScope()
  const contentRef = useRef<HTMLElement | null>(null)
  const backdropRef = useRef<HTMLElement | null>(null)
  const modalRef = useRef(props.modal)
  modalRef.current = props.modal

  // 机器还没建出来，首帧的展开态先按 props 算：与 initialState 同一条判定
  const initialOpen = (props.open ?? props.defaultOpen) ?? false
  // 建好之后进出场跟着机器状态走；渲染期写进 ref，提交后的效应现读
  const serviceRef = useRef<Service<DialogSchema> | null>(null)

  const layer = useCallback((): Omit<Layer, 'id' | 'node' | 'surfaces'> => ({
    kind: 'modal',
    branches: () => [],
    isModal: () => modalRef.current ?? true,
  }), [])

  const overlay = useOverlay({
    scope,
    idGenerator,
    initialOpen,
    isOpen: () => serviceRef.current?.state.get() === 'open',
    layer,
    node: () => contentRef.current,
    surfaces: () => [backdropRef.current].filter(Boolean) as Element[],
    additionalExitNodes: () => [backdropRef.current],
    refs: (service) => {
      service.refs.set('getContentEl', () => contentRef.current)
      service.refs.set('getTriggerEl', () => null)
      service.refs.set('branches', () => [])
    },
  })

  // 事务状态既要进 React 渲染，也要同步落 ref：确认回调返回 thenable 的同一拍里，
  // Escape / 层外交互就可能到达机器，不能等下一轮渲染才开始拦截
  const [pending, setPendingState] = useState(false)
  const pendingRef = useRef(false)
  const [actionError, setActionError] = useState<DialogConfirmErrorDetails | null>(null)

  const presence = useTitleDescriptionPresence()
  const service = useMachine(dialogMachine, () => ({
    ...props,
    closeOnEscape: pendingRef.current ? false : props.closeOnEscape,
    closeOnInteractOutside: pendingRef.current ? false : props.closeOnInteractOutside,
    parts: presence.parts,
  }), {
    scope,
    onCreate: overlay.onCreate as never,
  })
  serviceRef.current = service

  // 每次点击现读回调，宿主换回调也立刻生效；onConfirm 的返回值原样透传，异步门靠它
  const actionsRef = useRef(actions)
  actionsRef.current = actions
  const intents: DialogActionIntents = {
    onConfirm: () => actionsRef.current?.onConfirm?.(),
    onConfirmError: details => actionsRef.current?.onConfirmError?.(details),
    onCancelPress: () => { actionsRef.current?.onCancelPress?.() },
    pending,
    onPendingChange: (next) => {
      // ref 同步落位，props 记忆当场作废：机器下一次读 props 立刻看到拦截态
      pendingRef.current = next
      invalidateMachineProps()
      setPendingState(next)
    },
    actionError,
    onActionErrorChange: setActionError,
  }

  return { ...overlay, service, api: connectDialog(service, reactNormalize, intents), contentRef, backdropRef, presence }
}
