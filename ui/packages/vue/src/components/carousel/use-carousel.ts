import type { CarouselApi, CarouselSchema } from '@xihan-ui/headless'
import type { ComputedRef } from 'vue'
import { carouselMachine, connectCarousel } from '@xihan-ui/headless'
import { computed } from 'vue'
import { vueNormalize } from '../../runtime/normalize-props'
import { useMachine } from '../../runtime/use-machine'

export interface CarouselContext {
  api: ComputedRef<CarouselApi>
}

export function useCarousel(
  props: CarouselSchema['props'],
  onPageChange?: CarouselSchema['props']['onPageChange'],
): CarouselContext {
  // onPageChange 由组件外壳（emit）或组合式调用方提供，随 props 一并喂给机器
  const service = useMachine(carouselMachine, () => ({ ...props, onPageChange }))
  const api = computed(() => connectCarousel(service, vueNormalize))
  return { api }
}
