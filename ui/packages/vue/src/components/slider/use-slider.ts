import type { SliderApi, SliderSchema } from '@xihan-ui/headless'
import type { Service } from '@xihan-ui/machine'
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
  /** 轨道节点。机器在指针事件发生的那一刻拿它量矩形，connect 一律不碰 DOM。 */
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
  // 两个回调由组件外壳（emit）或组合式调用方提供，随 props 一并喂给机器
  const service = useMachine(sliderMachine, () => ({ ...props, onValueChange, onValueChangeEnd }), scope)

  // 懒读而不是把节点直接塞进去：ref 在挂载后才有值，机器建起来的那一刻还是 null
  service.refs.set('getTrackEl', () => trackRef.value)

  const api = computed(() => connectSlider(service, vueNormalize))
  return { api, service, trackRef }
}
