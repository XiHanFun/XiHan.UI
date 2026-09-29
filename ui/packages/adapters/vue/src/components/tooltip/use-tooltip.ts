/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 use tooltip 相关实现。

import type { Cleanup, Layer, RuntimeConfig } from '@xihan-ui/core'
import type { TooltipSchema } from '@xihan-ui/headless'
import type { TooltipContext } from './context'
import { createRuntimeConfig, createScope } from '@xihan-ui/core'
import { connectTooltip, tooltipMachine } from '@xihan-ui/headless'
import { createPositionEngine } from '@xihan-ui/position'
import { computed, ref } from 'vue'
import { useXhConfig } from '../../config/config'
import { vueNormalize } from '../../runtime/normalize-props'
import { useMachine } from '../../runtime/use-machine'
import { useOverlayExit } from '../../runtime/use-overlay-exit'
import { createVueIdGenerator } from '../../runtime/vue-id'
import { useTooltipGroup } from './context'

export function useTooltip(
  props: TooltipSchema['props'],
  onOpenChange?: TooltipSchema['props']['onOpenChange'],
): TooltipContext {
  const xhConfig = useXhConfig()
  const triggerRef = ref<HTMLElement | null>(null)
  const positionerRef = ref<HTMLElement | null>(null)
  const contentRef = ref<HTMLElement | null>(null)

  const idGen = createVueIdGenerator()
  const scope = createScope(null, idGen)
  // onOpenChange 由组件外壳（emit）或组合式调用方提供，随 props 一并喂给机器
  const service = useMachine(tooltipMachine, () => ({ ...props, onOpenChange }), scope)

  // 服务端没有 DOM、也就没有退场：config 传 null 时闸门退化成「跟着展开态」
  let config: RuntimeConfig | null = null

  if (typeof document !== 'undefined') {
    config = createRuntimeConfig({ scope, idGenerator: idGen })

    // 只提供注册函数，入栈出栈由机器的 trackLayer 效应按可见态驱动
    const registerLayer = (): { layer: Layer, dispose: Cleanup } => config!.layerRegistry.register({
      // 提示只参与 Escape 仲裁与栈顶判定：节点就在文档流里，不陷焦点、不锁滚动、没有遮罩
      kind: 'inline',
      node: () => contentRef.value,
      // trigger 记为本层分支，点它算层内交互
      branches: () => [triggerRef.value].filter(Boolean) as Element[],
      isModal: () => false,
      surfaces: () => [],
    })

    // 定位引擎经 refs 注入，展开态由机器的 effect 驱动
    service.refs.set('config', config)
    service.refs.set('registerLayer', registerLayer)
    service.refs.set('position', createPositionEngine())
  }
  service.refs.set('getAnchorEl', () => triggerRef.value)
  service.refs.set('getFloatingEl', () => positionerRef.value)
  // 放在 XhTooltipProvider 里就归它那一组：共用接替窗口、同组只开一个、延时取组的缺省
  service.refs.set('group', useTooltipGroup())

  const api = computed(() => connectTooltip(service, vueNormalize))

  // 退场闸门：收起从跟着 open 走，改成跟着 presence 走
  const visible = useOverlayExit({
    config,
    isOpen: () => api.value.open,
    contentRef,
    onPresence: presence => service.refs.set('presence', presence),
  })
  // 全局配置写了容器就用它，否则落到运行时那个单一浮层落点；没有 DOM 时才回到 body
  const portalTarget = computed<string | Element>(() => xhConfig.value.portalContainer?.() ?? config?.portalContainer() ?? 'body')

  return { service, api, triggerRef, positionerRef, contentRef, visible, portalTarget }
}
