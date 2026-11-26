/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 use image viewer 相关实现。

import type { Service } from '@xihan-ui/core'
import type { ImageViewerApi, ImageViewerSchema } from '@xihan-ui/headless'
import type { ComputedRef, Ref } from 'vue'
import { createScope } from '@xihan-ui/core'
import { connectImageViewer, imageViewerMachine } from '@xihan-ui/headless'
import { computed, ref } from 'vue'
import { vueNormalize } from '../../runtime/normalize-props'
import { useMachine } from '../../runtime/use-machine'
import { useOverlay } from '../../runtime/use-overlay'
import { createVueIdGenerator } from '../../runtime/vue-id'

export interface ImageViewerContext {
  service: Service<ImageViewerSchema>
  api: ComputedRef<ImageViewerApi>
  /** 浮层迁移到的位置：全局配置 > 单一落点。 */
  portalTarget: ComputedRef<string | Element>
  rendered: Ref<boolean>
  contentRef: Ref<HTMLElement | null>
  backdropRef: Ref<HTMLElement | null>
}

export function useImageViewer(
  props: ImageViewerSchema['props'],
  handlers: Pick<ImageViewerSchema['props'], 'onOpenChange' | 'onIndexChange'> = {},
): ImageViewerContext {
  const contentRef = ref<HTMLElement | null>(null)
  const backdropRef = ref<HTMLElement | null>(null)

  const idGen = createVueIdGenerator()
  const scope = createScope(null, idGen)
  const service = useMachine(imageViewerMachine, () => ({ ...props, ...handlers }), scope)

  // 内容与遮罩的退场动画共同决定何时收起；服务端没有 DOM，可见与否跟着展开态走
  const { visible: rendered, portalTarget } = useOverlay({
    scope,
    idGenerator: idGen,
    service,
    layer: () => ({
      kind: 'modal',
      node: () => contentRef.value,
      branches: () => [],
      isModal: () => true,
      surfaces: () => [backdropRef.value].filter(Boolean) as Element[],
    }),
    refs: () => {
      service.refs.set('getContentEl', () => contentRef.value)
    },
    isOpen: () => service.state.get() === 'open',
    contentRef,
    additionalExitRefs: [backdropRef],
    // 不靠落位藏面板：焦点陷阱与滚动锁所在的浮层按需块到了才露出内容
    awaitOverlayKit: true,
  })

  const api = computed(() => connectImageViewer(service, vueNormalize))

  return { service, api, rendered, contentRef, backdropRef, portalTarget }
}
