/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 use drawer 相关实现。

import type { Cleanup, Layer, RuntimeConfig, Service } from '@xihan-ui/core'
import type { DrawerActionIntents, DrawerApi, DrawerConfirmErrorDetails, DrawerSchema } from '@xihan-ui/headless'
import type { ComputedRef, Ref } from 'vue'
import type { TitleDescriptionPresence } from '../../runtime/title-description'
import { createRuntimeConfig, createScope } from '@xihan-ui/core'
import { connectDrawer, drawerMachine } from '@xihan-ui/headless'
import { computed, ref } from 'vue'
import { useXhConfig } from '../../config/config'
import { vueNormalize } from '../../runtime/normalize-props'
import { useTitleDescriptionPresence } from '../../runtime/title-description'
import { useMachine } from '../../runtime/use-machine'
import { useOverlayExit } from '../../runtime/use-overlay-exit'
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
  // 应用级默认挂载点：core 的 RuntimeConfig 一直留着这个字段，这里把它真正接上
  const xhConfig = useXhConfig()
  const contentRef = ref<HTMLElement | null>(null)
  const backdropRef = ref<HTMLElement | null>(null)

  const idGen = createVueIdGenerator()
  const scope = createScope(null, idGen)
  // contained 由 container 派生,在 getter 里算:在 setup 期展开 props 会把响应式冻住,
  // 之后改 side / open 这些都推不动了
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

  const api = computed(() => connectDrawer(service, vueNormalize, {
    ...actions,
    pending: pending.value,
    onPendingChange: (next) => { pending.value = next },
    actionError: actionError.value,
    onActionErrorChange: (next) => { actionError.value = next },
  }))
  // 实例给的容器优先；没给就问全局配置；都没有才落单一落点
  const portalTarget = computed<string | Element>(() => container?.() ?? xhConfig.value.portalContainer?.() ?? config?.portalContainer() ?? 'body')

  return { service, api, rendered, contentRef, backdropRef, portalTarget, presence }
}
