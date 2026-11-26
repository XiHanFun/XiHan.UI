/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 use popover 相关实现。

import type { Service } from '@xihan-ui/core'
import type { PopoverApi, PopoverSchema } from '@xihan-ui/headless'
import type { ComputedRef, Ref } from 'vue'
import type { TitleDescriptionPresence } from '../../runtime/title-description'
import { createScope } from '@xihan-ui/core'
import { connectPopover, popoverMachine } from '@xihan-ui/headless'
import { createDeferredPositionEngine } from '@xihan-ui/position'
import { computed, ref } from 'vue'
import { vueNormalize } from '../../runtime/normalize-props'
import { useTitleDescriptionPresence } from '../../runtime/title-description'
import { useMachine } from '../../runtime/use-machine'
import { useOverlay } from '../../runtime/use-overlay'
import { createVueIdGenerator } from '../../runtime/vue-id'

export interface PopoverContext {
  service: Service<PopoverSchema>
  api: ComputedRef<PopoverApi>
  triggerRef: Ref<HTMLElement | null>
  positionerRef: Ref<HTMLElement | null>
  contentRef: Ref<HTMLElement | null>
  /** 当前是否应当渲染：退场动画播完之前仍为真。 */
  visible: Ref<boolean>
  /** 浮层迁移到的位置：全局配置的容器 > 运行时的浮层落点 > body。 */
  portalTarget: ComputedRef<string | Element>
  /**
   * 落点的视觉环境从哪取：缺省取 trigger；写了 anchor（哪怕暂时是 null）时为空，由 Portal 在 positioner 原位放来源标记。
   */
  portalSource: ComputedRef<Ref<HTMLElement | null> | undefined>
  /** 标题与说明在不在场，由 XhPopoverTitle / XhPopoverDescription 登记；content 只引用在场的部件。 */
  presence: TitleDescriptionPresence
}

export function usePopover(
  props: PopoverSchema['props'],
  onOpenChange?: PopoverSchema['props']['onOpenChange'],
  onExitComplete?: PopoverSchema['props']['onExitComplete'],
): PopoverContext {
  const triggerRef = ref<HTMLElement | null>(null)
  const positionerRef = ref<HTMLElement | null>(null)
  const contentRef = ref<HTMLElement | null>(null)

  const idGen = createVueIdGenerator()
  const scope = createScope(null, idGen)
  const presence = useTitleDescriptionPresence()
  const service = useMachine(popoverMachine, () => ({ ...props, parts: presence.parts.value, onOpenChange, onExitComplete }), scope)

  const api = computed(() => connectPopover(service, vueNormalize))
  // 退场闸门：收起从跟着 open 走，改成跟着 presence 走
  const { visible, portalTarget } = useOverlay({
    scope,
    idGenerator: idGen,
    service,
    layer: () => ({
      kind: 'popover',
      node: () => contentRef.value,
      // trigger 记为本层分支，点它算层内交互；外部锚点同理，点它交给打开它的那条命令去切换。
      // 浮层壳一并记上：面板之外还浮着自绘滚动条，按住它拖动不该把面板消解掉
      // 虚拟锚点只给得出矩形，不是节点，不记
      branches: () => [triggerRef.value, (props.anchor as Partial<Node> | null | undefined)?.nodeType === 1 ? props.anchor : null, positionerRef.value].filter(Boolean) as Element[],
      // modal 档会加滚动锁
      isModal: () => props.modal ?? false,
    }),
    // 定位引擎由适配器注入，机器只经端口驱动
    refs: () => {
      service.refs.set('position', createDeferredPositionEngine())
      service.refs.set('getAnchorEl', () => triggerRef.value)
      service.refs.set('getFloatingEl', () => positionerRef.value)
      service.refs.set('getContentEl', () => contentRef.value)
    },
    isOpen: () => api.value.open,
    contentRef,
  })

  const portalSource = computed(() => (props.anchor !== undefined ? undefined : triggerRef))

  return { visible, service, api, triggerRef, positionerRef, contentRef, portalTarget, portalSource, presence }
}
