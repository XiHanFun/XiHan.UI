/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 use carousel 相关实现。

import type { CarouselApi, CarouselSchema } from '@xihan-ui/headless'
import type { ComputedRef } from 'vue'
import { createScope } from '@xihan-ui/core'
import { carouselMachine, connectCarousel } from '@xihan-ui/headless'
import { computed } from 'vue'
import { vueNormalize } from '../../runtime/normalize-props'
import { useMachine } from '../../runtime/use-machine'
import { createVueIdGenerator } from '../../runtime/vue-id'

export interface CarouselContext {
  api: ComputedRef<CarouselApi>
}

export function useCarousel(
  props: CarouselSchema['props'],
  onPageChange?: CarouselSchema['props']['onPageChange'],
): CarouselContext {
  // 根与视口带 id：用 Vue 的 useId 派生的 scope，服务端与水合两侧同号
  const service = useMachine(carouselMachine, () => ({ ...props, onPageChange }), createScope(null, createVueIdGenerator()))
  const api = computed(() => connectCarousel(service, vueNormalize))
  return { api }
}
