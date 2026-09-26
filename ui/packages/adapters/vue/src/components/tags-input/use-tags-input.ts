/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 use tags input 相关实现。

import type { Service } from '@xihan-ui/core'
import type { TagsInputApi, TagsInputSchema } from '@xihan-ui/headless'
import type { ComputedRef, Ref } from 'vue'
import { createScope } from '@xihan-ui/core'
import { connectTagsInput, tagsInputMachine } from '@xihan-ui/headless'
import { computed, ref } from 'vue'
import { vueNormalize } from '../../runtime/normalize-props'
import { useMachine } from '../../runtime/use-machine'
import { createVueIdGenerator } from '../../runtime/vue-id'

export interface TagsInputContext {
  api: ComputedRef<TagsInputApi>
  /** 状态机实例，供部件上报 DOM 侧的事实（如标签节点带着焦点离场）。 */
  service: Service<TagsInputSchema>
  /** 标签所在的容器：列表动效接在它上面。 */
  controlRef: Ref<HTMLElement | null>
}

export function useTagsInput(
  props: TagsInputSchema['props'],
  handlers: Pick<TagsInputSchema['props'], 'onValueChange' | 'onInputValueChange'> = {},
): TagsInputContext {
  // scope id 走 Vue 的 useId，保证同页多实例的 IDREF 不相撞
  const idGen = createVueIdGenerator()
  const scope = createScope(null, idGen)
  const service = useMachine(tagsInputMachine, () => ({ ...props, ...handlers }), scope)
  const controlRef = ref<HTMLElement | null>(null)
  // 传 getter 而非节点本身，ref 在挂载后才有值
  service.refs.set('getControlEl', () => controlRef.value)
  const api = computed(() => connectTagsInput(service, vueNormalize))
  return { api, service, controlRef }
}
