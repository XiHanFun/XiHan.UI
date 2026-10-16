/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 use rating 相关实现。

import type { Service } from '@xihan-ui/core'
import type { RatingApi, RatingSchema } from '@xihan-ui/headless'
import type { ComputedRef, Ref } from 'vue'
import { createScope } from '@xihan-ui/core'
import { connectRating, ratingMachine } from '@xihan-ui/headless'
import { computed, ref } from 'vue'
import { vueNormalize } from '../../runtime/normalize-props'
import { useMachine } from '../../runtime/use-machine'
import { createVueIdGenerator } from '../../runtime/vue-id'

export interface RatingContext {
  /**
   * 已渲染的 label 部件数量，由 XhRatingLabel 在 setup 里同步登记、卸载时撤销。
   * 可聚焦部件的 aria-labelledby 据此决定指不指过去：label 排在输入之前时，首帧与服务端直出就带上名字。
   */
  labelCount: Ref<number>
  api: ComputedRef<RatingApi>
  /** 状态机实例，供部件上报 DOM 侧的事实（如条目卸载带走了焦点）。 */
  service: Service<RatingSchema>
}

export function useRating(
  props: RatingSchema['props'],
  callbacks: Pick<RatingSchema['props'], 'onValueChange' | 'onHoverChange'> = {},
): RatingContext {
  const idGen = createVueIdGenerator()
  const scope = createScope(null, idGen)
  const labelCount = ref(0)
  const service = useMachine(ratingMachine, () => ({ ...props, labelled: labelCount.value > 0, ...callbacks }), scope)
  const api = computed(() => connectRating(service, vueNormalize))
  return { labelCount, api, service }
}
