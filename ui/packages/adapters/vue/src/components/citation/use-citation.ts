/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 use citation 相关实现。

import type { Cleanup, Layer, RuntimeConfig, Service } from '@xihan-ui/core'
import type { CitationApi, CitationSchema } from '@xihan-ui/headless'
import type { ComputedRef, Ref } from 'vue'
import { createRuntimeConfig, createScope } from '@xihan-ui/core'
import { citationAnatomy, citationMachine, connectCitation } from '@xihan-ui/headless'
import { createPositionEngine } from '@xihan-ui/position'
import { computed, ref } from 'vue'
import { useXhConfig } from '../../config/config'
import { vueNormalize } from '../../runtime/normalize-props'
import { useMachine } from '../../runtime/use-machine'
import { createVueIdGenerator } from '../../runtime/vue-id'

const triggerSelector = citationAnatomy.build().trigger.selector

export interface CitationContext {
  api: ComputedRef<CitationApi>
  service: Service<CitationSchema>
  /** 根节点：悬停卡片搬到 portal 落点时，视觉轴从这里桥过去。 */
  rootRef: Ref<HTMLElement | null>
  /** hover 档的定位壳。 */
  positionerRef: Ref<HTMLElement | null>
  /** 悬停卡片迁移到的位置：全局配置的 portalContainer > body。 */
  portalTarget: ComputedRef<string | Element>
}

type CitationCallbacks = Pick<CitationSchema['props'], 'onActiveSourceChange' | 'onOpenChange' | 'onSourceOpen'>

export function useCitation(props: CitationSchema['props'], callbacks: CitationCallbacks = {}): CitationContext {
  const xhConfig = useXhConfig()
  const rootRef = ref<HTMLElement | null>(null)
  const positionerRef = ref<HTMLElement | null>(null)
  const idGen = createVueIdGenerator()
  const scope = createScope(null, idGen)
  const service = useMachine(citationMachine, () => ({ ...props, ...callbacks }), scope)

  // 无 DOM 环境（SSR）不建引擎与消解层：hover 档的卡片首屏本来就收着
  let config: RuntimeConfig | null = null
  if (typeof document !== 'undefined') {
    config = createRuntimeConfig({ scope, idGenerator: idGen })
    // 只提供注册函数，入栈出栈由机器按卡片开合驱动
    const registerLayer = (): { layer: Layer, dispose: Cleanup } => config!.layerRegistry.register({
      kind: 'popover',
      node: () => positionerRef.value,
      // 行内引用记为本层分支：按在另一处引用上是切换，不是层外交互
      branches: () => [...(rootRef.value?.querySelectorAll<HTMLElement>(triggerSelector) ?? [])],
      isModal: () => false,
      surfaces: () => [],
    })
    service.refs.set('config', config)
    service.refs.set('registerLayer', registerLayer)
    service.refs.set('position', createPositionEngine())
  }
  service.refs.set('getFloatingEl', () => positionerRef.value)

  const portalTarget = computed<string | Element>(() => xhConfig.value.portalContainer?.() ?? config?.portalContainer() ?? 'body')
  return { api: computed(() => connectCitation(service, vueNormalize)), service, rootRef, positionerRef, portalTarget }
}
