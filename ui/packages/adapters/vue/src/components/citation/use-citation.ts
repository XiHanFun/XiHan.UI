/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 use citation 相关实现。

import type { Service } from '@xihan-ui/core'
import type { CitationApi, CitationSchema } from '@xihan-ui/headless'
import type { ComputedRef, Ref } from 'vue'
import { createScope } from '@xihan-ui/core'
import { citationAnatomy, citationMachine, connectCitation } from '@xihan-ui/headless'
import { createDeferredPositionEngine } from '@xihan-ui/position'
import { computed, ref } from 'vue'
import { vueNormalize } from '../../runtime/normalize-props'
import { useMachine } from '../../runtime/use-machine'
import { useOverlayLayer } from '../../runtime/use-overlay'
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

type CitationNotifiers = Pick<CitationSchema['props'], 'onActiveSourceChange' | 'onOpenChange' | 'onSourceOpen'>

export function useCitation(props: CitationSchema['props'], callbacks: CitationNotifiers = {}): CitationContext {
  const rootRef = ref<HTMLElement | null>(null)
  const positionerRef = ref<HTMLElement | null>(null)
  const idGen = createVueIdGenerator()
  const scope = createScope(null, idGen)
  const service = useMachine(citationMachine, () => ({ ...props, ...callbacks }), scope)

  // 无 DOM 环境（SSR）不建引擎与消解层：hover 档的卡片首屏本来就收着
  const { portalTarget } = useOverlayLayer({
    scope,
    idGenerator: idGen,
    service,
    layer: () => ({
      kind: 'popover',
      node: () => positionerRef.value,
      // 行内引用记为本层分支：按在另一处引用上是切换，不是层外交互
      branches: () => [...(rootRef.value?.querySelectorAll<HTMLElement>(triggerSelector) ?? [])],
      isModal: () => false,
      // 只有 hover 档入栈：卡片悬停就出现，压在别的层上面不代表开在里面，只护着它开在其内容里的层
      opensOnHover: true,
    }),
    refs: () => service.refs.set('position', createDeferredPositionEngine()),
  })
  service.refs.set('getFloatingEl', () => positionerRef.value)

  return { api: computed(() => connectCitation(service, vueNormalize)), service, rootRef, positionerRef, portalTarget }
}
