/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 use drawer 相关实现。

import type { Service } from '@xihan-ui/core'
import type { DrawerActionIntents, DrawerApi, DrawerConfirmErrorDetails, DrawerSchema } from '@xihan-ui/headless'
import type { ComputedRef, Ref } from 'vue'
import type { TitleDescriptionPresence } from '../../runtime/title-description'
import { createScope } from '@xihan-ui/core'
import { connectDrawer, drawerMachine } from '@xihan-ui/headless'
import { computed, ref } from 'vue'
import { vueNormalize } from '../../runtime/normalize-props'
import { useTitleDescriptionPresence } from '../../runtime/title-description'
import { useMachine } from '../../runtime/use-machine'
import { useOverlay } from '../../runtime/use-overlay'
import { createVueIdGenerator } from '../../runtime/vue-id'

export interface DrawerContext {
  service: Service<DrawerSchema>
  api: ComputedRef<DrawerApi>
  rendered: Ref<boolean>
  contentRef: Ref<HTMLElement | null>
  backdropRef: Ref<HTMLElement | null>
  /** 浮层迁移到的位置：实例提供的容器 > 全局配置 > 单一落点。 */
  portalTarget: ComputedRef<string | Element>
  /** 标题与说明在不在场，由 XhDrawerTitle / XhDrawerDescription 登记；content 只引用在场的部件。 */
  presence: TitleDescriptionPresence
}

/** 页脚确定与取消两颗钮的回调；pending 与 actionError 两个状态由这里持有。 */
export type DrawerActionNotifiers = Pick<DrawerActionIntents, 'onConfirm' | 'onConfirmError' | 'onCancelPress'>

export function useDrawer(
  props: DrawerSchema['props'],
  onOpenChange?: DrawerSchema['props']['onOpenChange'],
  container?: () => string | Element | null | undefined,
  onExitComplete?: DrawerSchema['props']['onExitComplete'],
  onPanelSizeChange?: DrawerSchema['props']['onPanelSizeChange'],
  actions: DrawerActionNotifiers = {},
): DrawerContext {
  const contentRef = ref<HTMLElement | null>(null)
  const backdropRef = ref<HTMLElement | null>(null)

  const idGen = createVueIdGenerator()
  const scope = createScope(null, idGen)
  // contained 由 container 派生,在 getter 里算:在 setup 期展开 props 会把响应式冻住,
  // 之后改 placement / open 这些都推不动了
  const presence = useTitleDescriptionPresence()
  // ref 同步写入：thenable 被识别的同一拍里，机器就要开始拒绝 Escape 与层外交互关闭
  const pending = ref(false)
  const actionError = ref<DrawerConfirmErrorDetails | null>(null)
  const service = useMachine(
    drawerMachine,
    // 显式写了 contained 以它为准；没写则「给了容器即局部」
    () => ({
      ...props,
      closeOnEscape: pending.value ? false : props.closeOnEscape,
      closeOnInteractOutside: pending.value ? false : props.closeOnInteractOutside,
      contained: props.contained ?? container?.() != null,
      parts: presence.parts.value,
      onOpenChange,
      onExitComplete,
      onPanelSizeChange,
    }),
    scope,
  )

  const api = computed(() => connectDrawer(service, vueNormalize, {
    ...actions,
    pending: pending.value,
    onPendingChange: (next) => { pending.value = next },
    actionError: actionError.value,
    onActionErrorChange: (next) => { actionError.value = next },
  }))
  // 内容与遮罩的退场动画共同决定何时收起；服务端没有 DOM，可见与否跟着展开态走
  const { visible: rendered, portalTarget } = useOverlay({
    scope,
    idGenerator: idGen,
    service,
    layer: () => ({
      kind: 'modal',
      node: () => contentRef.value,
      branches: () => [],
      isModal: () => props.modal ?? true,
      surfaces: () => [backdropRef.value].filter(Boolean) as Element[],
    }),
    refs: () => {
      service.refs.set('getContentEl', () => contentRef.value)
      service.refs.set('getTriggerEl', () => null)
      service.refs.set('branches', () => [])
    },
    isOpen: () => service.state.get() === 'open',
    contentRef,
    additionalExitRefs: [backdropRef],
    // 不靠落位藏面板：焦点陷阱与滚动锁所在的浮层按需块到了才露出内容
    awaitOverlayKit: true,
    // 实例给的容器优先；没给就问全局配置；都没有才落单一落点
    container,
  })

  return { service, api, rendered, contentRef, backdropRef, portalTarget, presence }
}
