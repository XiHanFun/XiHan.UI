/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 use dialog 相关实现。

import type { Cleanup, Layer, RuntimeConfig, Service } from '@xihan-ui/core'
import type { DialogActionIntents, DialogApi, DialogConfirmErrorDetails, DialogSchema } from '@xihan-ui/headless'
import type { ComputedRef, Ref } from 'vue'
import type { TitleDescriptionPresence } from '../../runtime/title-description'
import { createRuntimeConfig, createScope } from '@xihan-ui/core'
import { connectDialog, dialogMachine } from '@xihan-ui/headless'
import { computed, ref } from 'vue'
import { useXhConfig } from '../../config/config'
import { vueNormalize } from '../../runtime/normalize-props'
import { useTitleDescriptionPresence } from '../../runtime/title-description'
import { useMachine } from '../../runtime/use-machine'
import { useOverlayExit } from '../../runtime/use-overlay-exit'
import { createVueIdGenerator } from '../../runtime/vue-id'

export interface DialogContext {
  service: Service<DialogSchema>
  api: ComputedRef<DialogApi>
  /** 浮层迁移到的位置：全局配置 > 单一落点。 */
  portalTarget: ComputedRef<string | Element>
  rendered: Ref<boolean>
  contentRef: Ref<HTMLElement | null>
  backdropRef: Ref<HTMLElement | null>
  /** 标题与说明在不在场，由 XhDialogTitle / XhDialogDescription 登记；content 只引用在场的部件。 */
  presence: TitleDescriptionPresence
}

/** 页脚确定与取消两颗钮的回调；pending 与 actionError 两个状态由这里持有。 */
export type DialogActionNotifiers = Pick<DialogActionIntents, 'onConfirm' | 'onConfirmError' | 'onCancelPress'>

export function useDialog(
  props: DialogSchema['props'],
  onOpenChange?: DialogSchema['props']['onOpenChange'],
  onExitComplete?: DialogSchema['props']['onExitComplete'],
  actions: DialogActionNotifiers = {},
): DialogContext {
  const contentRef = ref<HTMLElement | null>(null)
  const backdropRef = ref<HTMLElement | null>(null)

  const idGen = createVueIdGenerator()
  const scope = createScope(null, idGen)
  const presence = useTitleDescriptionPresence()
  // ref 同步写入：thenable 被识别的同一拍里，机器就要开始拒绝 Escape 与层外交互关闭
  const pending = ref(false)
  const actionError = ref<DialogConfirmErrorDetails | null>(null)
  const service = useMachine(dialogMachine, () => ({
    ...props,
    closeOnEscape: pending.value ? false : props.closeOnEscape,
    closeOnInteractOutside: pending.value ? false : props.closeOnInteractOutside,
    parts: presence.parts.value,
    onOpenChange,
    onExitComplete,
  }), scope)

  const xhConfig = useXhConfig()
  let config: RuntimeConfig | null = null

  if (typeof document !== 'undefined') {
    config = createRuntimeConfig({
      scope,
      idGenerator: idGen,
      // 宿主把滚动搬进内容容器时 body 本身不滚，加锁会是空操作；这条把真正在滚的那层交给滚动锁
      scrollRoot: () => xhConfig.value.scrollRoot?.() ?? null,
    })
    // 只提供注册函数，入栈出栈由机器的 trackOverlay 效应按展开态驱动
    const registerLayer = (): { layer: Layer, dispose: Cleanup } => config!.layerRegistry.register({
      kind: 'modal',
      node: () => contentRef.value,
      branches: () => [],
      isModal: () => props.modal ?? true,
      surfaces: () => [backdropRef.value].filter(Boolean) as Element[],
    })
    service.refs.set('config', config!)
    service.refs.set('registerLayer', registerLayer)
    service.refs.set('getContentEl', () => contentRef.value)
    service.refs.set('getTriggerEl', () => null)
    service.refs.set('branches', () => [])
  }

  // 内容与遮罩的退场动画共同决定何时收起；服务端没有 DOM，可见与否跟着展开态走
  const rendered = useOverlayExit({
    config,
    isOpen: () => service.state.get() === 'open',
    contentRef,
    additionalExitRefs: [backdropRef],
    onPresence: presence => service.refs.set('presence', presence),
  })

  const api = computed(() => connectDialog(service, vueNormalize, {
    ...actions,
    pending: pending.value,
    onPendingChange: (next) => { pending.value = next },
    actionError: actionError.value,
    onActionErrorChange: (next) => { actionError.value = next },
  }))
  const portalTarget = computed<string | Element>(() => xhConfig.value.portalContainer?.() ?? config?.portalContainer() ?? 'body')

  return { service, api, rendered, contentRef, backdropRef, portalTarget, presence }
}
