import type { Cleanup, Layer, RuntimeConfig } from '@xihan-ui/core'
import type { TourApi, TourSchema } from '@xihan-ui/headless'
import type { Service } from '@xihan-ui/machine'
import type { ComputedRef, Ref } from 'vue'
import { createRuntimeConfig, createScope } from '@xihan-ui/core'
import { connectTour, tourMachine } from '@xihan-ui/headless'
import { createPositionEngine } from '@xihan-ui/position'
import { computed, ref } from 'vue'
import { vueNormalize } from '../../runtime/normalize-props'
import { useMachine } from '../../runtime/use-machine'
import { createVueIdGenerator } from '../../runtime/vue-id'

export interface TourContext {
  service: Service<TourSchema>
  api: ComputedRef<TourApi>
  backdropRef: Ref<HTMLElement | null>
  positionerRef: Ref<HTMLElement | null>
  contentRef: Ref<HTMLElement | null>
}

export function useTour(
  props: TourSchema['props'],
  notify: Pick<TourSchema['props'], 'onOpenChange' | 'onStepChange' | 'onComplete' | 'onSkip'> = {},
): TourContext {
  const backdropRef = ref<HTMLElement | null>(null)
  const positionerRef = ref<HTMLElement | null>(null)
  const contentRef = ref<HTMLElement | null>(null)

  const idGen = createVueIdGenerator()
  const scope = createScope(null, idGen)
  // 四个回调由组件外壳（emit）或组合式调用方提供，随 props 一并喂给机器
  const service = useMachine(tourMachine, () => ({ ...props, ...notify }), scope)

  if (typeof document !== 'undefined') {
    const config: RuntimeConfig = createRuntimeConfig({ scope, idGenerator: idGen })

    // 只提供注册函数，入栈出栈由机器的 trackLayer 效应按展开态驱动
    const registerLayer = (): { layer: Layer, dispose: Cleanup } => config.layerRegistry.register({
      // 引导是模态的：遮罩盖住整页，焦点陷在浮层里
      kind: 'modal',
      node: () => contentRef.value,
      branches: () => [],
      isModal: () => true,
      setModal: () => {},
      // 遮罩登记为可点关闭的表面，是否真关由 closeOnInteractOutside 决定
      surfaces: () => [backdropRef.value].filter(Boolean) as Element[],
    })

    // 定位引擎由适配器注入，机器只经端口驱动；锚点由机器按每步 target 自行解析
    service.refs.set('config', config)
    service.refs.set('registerLayer', registerLayer)
    service.refs.set('position', createPositionEngine())
    service.refs.set('getFloatingEl', () => positionerRef.value)
    service.refs.set('getContentEl', () => contentRef.value)
  }

  const api = computed(() => connectTour(service, vueNormalize))
  return { service, api, backdropRef, positionerRef, contentRef }
}
