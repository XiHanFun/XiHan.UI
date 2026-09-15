/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 use scroll area 相关实现。

import type { Orientation } from '@xihan-ui/core'
import type { ScrollAreaApi, ScrollAreaProps, ScrollAreaServices } from '@xihan-ui/headless'
import type { ComputedRef, MaybeRefOrGetter, Ref } from 'vue'
import { createScope } from '@xihan-ui/core'
import { connectScrollArea, scrollAreaScrollbarProps, scrollbarMachine } from '@xihan-ui/headless'
import { computed, ref, toValue } from 'vue'
import { vueNormalize } from '../../runtime/normalize-props'
import { useMachine } from '../../runtime/use-machine'
import { createVueIdGenerator } from '../../runtime/vue-id'

export interface ScrollAreaContext {
  /** 两条轴各一台 scrollbar 状态机。 */
  services: ScrollAreaServices
  api: ComputedRef<ScrollAreaApi>
  /** overflow:auto 的层，两台状态机都挂在它上面。 */
  viewportRef: Ref<HTMLElement | null>
  /** 内容包裹层。 */
  contentRef: Ref<HTMLElement | null>
  /** 两条轴各自的挂载点（即该 scrollbar 的根）与轨道，按轴现测。 */
  scrollbarRefs: Record<Orientation, Ref<HTMLElement | null>>
  trackRefs: Record<Orientation, Ref<HTMLElement | null>>
}

/** 滚动区没有自己的状态机：按轴各建一台 scrollbar，视口就是它们共同的滚动容器。 */
export function useScrollArea(source: MaybeRefOrGetter<ScrollAreaProps>): ScrollAreaContext {
  const viewportRef = ref<HTMLElement | null>(null)
  const contentRef = ref<HTMLElement | null>(null)
  const scrollbarRefs: Record<Orientation, Ref<HTMLElement | null>> = {
    vertical: ref<HTMLElement | null>(null),
    horizontal: ref<HTMLElement | null>(null),
  }
  const trackRefs: Record<Orientation, Ref<HTMLElement | null>> = {
    vertical: ref<HTMLElement | null>(null),
    horizontal: ref<HTMLElement | null>(null),
  }

  const idGen = createVueIdGenerator()
  const scope = createScope(null, idGen)
  const bar = (axis: Orientation): ScrollAreaServices[Orientation] => {
    // 每次取值现读 props：挂载后改 type / orientation 机器要跟着变
    const service = useMachine(scrollbarMachine, () => scrollAreaScrollbarProps(toValue(source), axis), scope)
    // 传 getter 而非节点，ref 在挂载后才有值；量尺寸与挂监听都在机器的效应里进行
    service.refs.set('getScrollableEl', () => viewportRef.value)
    service.refs.set('getTrackEl', () => trackRefs[axis].value)
    service.refs.set('getRootEl', () => scrollbarRefs[axis].value)
    return service
  }
  const services: ScrollAreaServices = { vertical: bar('vertical'), horizontal: bar('horizontal') }

  const api = computed(() => connectScrollArea(services, toValue(source), vueNormalize))
  return { services, api, viewportRef, contentRef, scrollbarRefs, trackRefs }
}
