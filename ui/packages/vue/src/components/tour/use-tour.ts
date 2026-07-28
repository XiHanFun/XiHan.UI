import type { Cleanup, Layer, RuntimeConfig } from '@xihan-ui/core'
import type { TourApi, TourSchema } from '@xihan-ui/headless'
import type { Service } from '@xihan-ui/machine'
import type { ComputedRef, Ref } from 'vue'
import { createRuntimeConfig, createScope } from '@xihan-ui/core'
import { connectTour, tourMachine } from '@xihan-ui/headless'
import { createFloatingUiPositionEngine } from '@xihan-ui/position-floating-ui'
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

    // 只给注册函数、不在这里注册：层的入栈出栈跟着展开态走（机器的 trackLayer 效应负责）。
    // 挂载期就注册会让层与开合无关地常驻栈里，把同页其它层的 Escape 堵死。
    const registerLayer = (): { layer: Layer, dispose: Cleanup } => config.layerRegistry.register({
      // 引导是模态的：遮罩盖住整页，焦点陷在浮层里
      kind: 'modal',
      node: () => contentRef.value,
      branches: () => [],
      isModal: () => true,
      setModal: () => {},
      // 遮罩是"点它就该关本层"的表面；关不关仍由 closeOnInteractOutside 说了算（缺省不关）
      surfaces: () => [backdropRef.value].filter(Boolean) as Element[],
    })

    // 定位引擎由适配器建好注入；机器只经端口驱动，不认识具体引擎。
    // 锚点不在这里给——它是每一步 target 选择器查出来的节点，由机器自己解析
    service.refs.set('config', config)
    service.refs.set('registerLayer', registerLayer)
    service.refs.set('position', createFloatingUiPositionEngine())
    service.refs.set('getFloatingEl', () => positionerRef.value)
    service.refs.set('getContentEl', () => contentRef.value)
  }

  const api = computed(() => connectTour(service, vueNormalize))
  return { service, api, backdropRef, positionerRef, contentRef }
}
