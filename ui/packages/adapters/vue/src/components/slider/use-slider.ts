/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 use slider 相关实现。

import type { Service } from '@xihan-ui/core'
import type { SliderApi, SliderSchema } from '@xihan-ui/headless'
import type { ComputedRef, Ref } from 'vue'
import { createScope } from '@xihan-ui/core'
import { connectSlider, sliderMachine } from '@xihan-ui/headless'
import { computed, ref } from 'vue'
import { vueNormalize } from '../../runtime/normalize-props'
import { useMachine } from '../../runtime/use-machine'
import { createVueIdGenerator } from '../../runtime/vue-id'

export interface SliderContext {
  api: ComputedRef<SliderApi>
  service: Service<SliderSchema>
  /** 轨道节点，状态机在指针事件中读取它的矩形。 */
  trackRef: Ref<HTMLElement | null>
}

export function useSlider(
  props: SliderSchema['props'],
  onValueChange?: SliderSchema['props']['onValueChange'],
  onValueChangeEnd?: SliderSchema['props']['onValueChangeEnd'],
): SliderContext {
  const trackRef = ref<HTMLElement | null>(null)

  const idGen = createVueIdGenerator()
  const scope = createScope(null, idGen)
  const service = useMachine(sliderMachine, () => ({ ...props, onValueChange, onValueChangeEnd }), scope)

  // 传 getter 而非节点，ref 在挂载后才有值
  service.refs.set('getTrackEl', () => trackRef.value)

  const api = computed(() => connectSlider(service, vueNormalize))
  return { api, service, trackRef }
}
