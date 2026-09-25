/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 use drawer 相关实现。

import type { Cleanup, Layer, RuntimeConfig, Service } from '@xihan-ui/core'
import type { DrawerApi, DrawerSchema } from '@xihan-ui/headless'
import type { ComputedRef, Ref } from 'vue'
import { createRuntimeConfig, createScope } from '@xihan-ui/core'
import { connectDrawer, drawerMachine } from '@xihan-ui/headless'
import { computed, ref } from 'vue'
import { useXhConfig } from '../../config/config'
import { vueNormalize } from '../../runtime/normalize-props'
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
}

export function useDrawer(
  props: DrawerSchema['props'],
  onOpenChange?: DrawerSchema['props']['onOpenChange'],
  container?: () => string | Element | null | undefined,
  onExitComplete?: DrawerSchema['props']['onExitComplete'],
): DrawerContext {
  // 应用级默认挂载点：core 的 RuntimeConfig 一直留着这个字段，这里把它真正接上
  const xhConfig = useXhConfig()
  const contentRef = ref<HTMLElement | null>(null)
  const backdropRef = ref<HTMLElement | null>(null)

  const idGen = createVueIdGenerator()
  const scope = createScope(null, idGen)
  // contained 由 container 派生,在 getter 里算:在 setup 期展开 props 会把响应式冻住,
  // 之后改 side / open 这些都推不动了
  const service = useMachine(
    drawerMachine,
    // 显式写了 contained 以它为准；没写则「给了容器即局部」
    () => ({ ...props, contained: props.contained ?? container?.() != null, onOpenChange, onExitComplete }),
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

  const api = computed(() => connectDrawer(service, vueNormalize))
  // 实例给的容器优先；没给就问全局配置；都没有才落单一落点
  const portalTarget = computed<string | Element>(() => container?.() ?? xhConfig.value.portalContainer?.() ?? config?.portalContainer() ?? 'body')

  return { service, api, rendered, contentRef, backdropRef, portalTarget }
}
