/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 use command 相关实现。

import type { Service } from '@xihan-ui/core'
import type { CommandApi, CommandSchema } from '@xihan-ui/headless'
import type { ComputedRef, Ref } from 'vue'
import { createScope } from '@xihan-ui/core'
import { commandMachine, connectCommand } from '@xihan-ui/headless'
import { computed, ref, watch } from 'vue'
import { vueNormalize } from '../../runtime/normalize-props'
import { useMachine } from '../../runtime/use-machine'
import { useOverlay } from '../../runtime/use-overlay'
import { createVueIdGenerator } from '../../runtime/vue-id'

export interface CommandContext {
  service: Service<CommandSchema>
  api: ComputedRef<CommandApi>
  /** 浮层迁移到的位置：全局配置 > 单一落点。 */
  portalTarget: ComputedRef<string | Element>
  /** 当前是否应当渲染：退场动画播完之前仍为真。 */
  rendered: Ref<boolean>
  contentRef: Ref<HTMLElement | null>
  backdropRef: Ref<HTMLElement | null>
  listRef: Ref<HTMLElement | null>
  inputRef: Ref<HTMLInputElement | null>
}

export function useCommand(
  props: CommandSchema['props'],
  handlers: Pick<CommandSchema['props'], 'onOpenChange' | 'onInputValueChange' | 'onItemSelect'> = {},
): CommandContext {
  const contentRef = ref<HTMLElement | null>(null)
  const backdropRef = ref<HTMLElement | null>(null)
  const listRef = ref<HTMLElement | null>(null)
  const inputRef = ref<HTMLInputElement | null>(null)

  const idGen = createVueIdGenerator()
  const scope = createScope(null, idGen)
  const service = useMachine(commandMachine, () => ({ ...props, ...handlers }), scope)

  const api = computed(() => connectCommand(service, vueNormalize))
  // content 与 modal backdrop 的退场动画共同决定何时收起、归还资源；动态切 modal 时撤旧接新。
  // 服务端没有 DOM，可见与否跟着展开态走
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
      service.refs.set('getListEl', () => listRef.value)
      service.refs.set('getInputEl', () => inputRef.value)
      // List 在展开期间换代时重新发布引用，让依赖该端口的效应撤旧重绑。
      watch(listRef, (list) => {
        service.refs.set('getListEl', () => list)
        service.refs.get('syncListVisibility')?.()
      }, { flush: 'post' })
    },
    isOpen: () => service.state.get() === 'open',
    contentRef,
    additionalExitRefs: [backdropRef],
    // 不靠落位藏面板：焦点陷阱与滚动锁所在的浮层按需块到了才露出内容
    awaitOverlayKit: true,
  })

  return { service, api, portalTarget, rendered, contentRef, backdropRef, listRef, inputRef }
}
