/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 use hover card 相关实现。

import type { Service } from '@xihan-ui/core'
import type { HoverCardApi, HoverCardSchema } from '@xihan-ui/headless'
import type { ComputedRef, Ref } from 'vue'
import type { TitleDescriptionPresence } from '../../runtime/title-description'
import { createScope } from '@xihan-ui/core'
import { connectHoverCard, hoverCardMachine } from '@xihan-ui/headless'
import { createDeferredPositionEngine } from '@xihan-ui/position'
import { computed, ref } from 'vue'
import { vueNormalize } from '../../runtime/normalize-props'
import { useTitleDescriptionPresence } from '../../runtime/title-description'
import { useMachine } from '../../runtime/use-machine'
import { useOverlay } from '../../runtime/use-overlay'
import { createVueIdGenerator } from '../../runtime/vue-id'

export interface HoverCardContext {
  service: Service<HoverCardSchema>
  api: ComputedRef<HoverCardApi>
  /** 定位锚点。 */
  triggerRef: Ref<HTMLElement | null>
  /** 被定位的浮层。 */
  positionerRef: Ref<HTMLElement | null>
  /** 消解层节点，也是判定焦点是否仍在卡片内的依据。 */
  contentRef: Ref<HTMLElement | null>
  /** 标题与说明在不在场，由 XhHoverCardTitle / XhHoverCardDescription 登记：title 不在场时卡片的可及名指回 trigger。 */
  presence: TitleDescriptionPresence
  /** 当前是否应当渲染：退场动画播完之前仍为真。 */
  visible: Ref<boolean>
  /** 浮层迁移到的位置：全局配置的 portalContainer > body。 */
  portalTarget: ComputedRef<string | Element>
}

export function useHoverCard(
  props: HoverCardSchema['props'],
  onOpenChange?: HoverCardSchema['props']['onOpenChange'],
): HoverCardContext {
  const triggerRef = ref<HTMLElement | null>(null)
  const positionerRef = ref<HTMLElement | null>(null)
  const contentRef = ref<HTMLElement | null>(null)

  const idGen = createVueIdGenerator()
  const scope = createScope(null, idGen)
  const presence = useTitleDescriptionPresence()
  const service = useMachine(hoverCardMachine, () => ({ ...props, parts: presence.parts.value, onOpenChange }), scope)

  // 元素 getter 在无 DOM 环境下也要设，连接层判定焦点去向时经它们取节点
  service.refs.set('getAnchorEl', () => triggerRef.value)
  service.refs.set('getFloatingEl', () => positionerRef.value)
  service.refs.set('getContentEl', () => contentRef.value)

  const api = computed(() => connectHoverCard(service, vueNormalize))
  // 退场闸门：收起从跟着 open 走，改成跟着 presence 走
  const { visible, portalTarget } = useOverlay({
    scope,
    idGenerator: idGen,
    service,
    layer: () => ({
      kind: 'popover',
      node: () => contentRef.value,
      // trigger 记为本层分支，指针按在它上面算层内交互；
      // 浮层壳一并记上：卡片之外还浮着自绘滚动条，按住它拖动不该把卡片消解掉
      branches: () => [triggerRef.value, positionerRef.value].filter(Boolean) as Element[],
      // 悬停卡片非模态：不陷焦点、不锁滚动、无遮罩
      isModal: () => false,
      // 悬停就出现，压在别的层上面不代表开在里面：只护着它开在其内容里的层
      opensOnHover: true,
    }),
    refs: () => {
      // 定位引擎由适配器注入，机器只经端口驱动
      service.refs.set('position', createDeferredPositionEngine())
    },
    isOpen: () => api.value.open,
    contentRef,
  })

  return { visible, service, api, triggerRef, positionerRef, contentRef, presence, portalTarget }
}
