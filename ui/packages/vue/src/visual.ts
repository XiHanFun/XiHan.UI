// @xihan-ui/vue/visual —— 视觉层的 Vue 适配。
//
// 与主入口分开：@xihan-ui/visual 是可选 peer，不用视觉效果的应用不会因为装了本包
// 而多出一个 WebGL 引擎。用之前先装 @xihan-ui/visual。
//
// 三种用法，从轻到重：
//   v-visual   给任意元素或组件的根元素铺一层背景，一个字都不用改组件
//   XhVisual   独立的视觉组件，插槽内容浮在效果之上
//   useVisual  自己拿画面实例，接自定义调度或调参面板

import type {
  MorphOptions,
  ParamValue,
  PointCloud,
  VisualEffect,
  VisualQuality,
  VisualSurface,
} from '@xihan-ui/visual'
import type { Directive, PropType, Ref, ShallowRef } from 'vue'
import { createVisualSurface } from '@xihan-ui/visual'
import {
  defineComponent,
  getCurrentScope,
  h,
  onScopeDispose,
  ref,
  shallowRef,
  watch,
} from 'vue'

export interface UseVisualOptions {
  effect: VisualEffect | string
  params?: Record<string, ParamValue>
  quality?: VisualQuality
  /** 自动绑定指针事件，默认 true。 */
  pointer?: boolean
  /** 创建后立即播放，默认 true。 */
  autoplay?: boolean
  /** 系统开启减弱动态效果时冻结时间轴，默认 true。 */
  respectReducedMotion?: boolean
  /** 滚出视口时暂停绘制，默认 true。 */
  pauseOffscreen?: boolean
}

export interface UseVisualReturn {
  readonly surface: ShallowRef<VisualSurface | null>
  setEffect: (effect: VisualEffect | string) => void
  setParams: (patch: Record<string, ParamValue>) => void
  setCloud: (cloud: PointCloud, options?: MorphOptions) => void
  play: () => void
  pause: () => void
  destroy: () => void
}

/**
 * 把一张视觉画面绑到 target 指向的元素上。
 *
 * target 变成 null 会销毁画面，指向新元素会重建；组件卸载时自动销毁。
 * 在 setup 之外调用需自己接管销毁——那时没有活动的 effect scope，返回的 destroy 就是唯一出口。
 */
export function useVisual(
  target: Ref<HTMLElement | null | undefined>,
  options: UseVisualOptions,
): UseVisualReturn {
  const surface = shallowRef<VisualSurface | null>(null)

  const stopWatch = watch(target, (el) => {
    surface.value?.destroy()
    surface.value = el ? createVisualSurface(el, options) : null
  }, { immediate: true, flush: 'post' })

  function destroy(): void {
    stopWatch()
    surface.value?.destroy()
    surface.value = null
  }

  if (getCurrentScope())
    onScopeDispose(destroy)

  return {
    surface,
    setEffect: (effect): void => surface.value?.setEffect(effect),
    setParams: (patch): void => surface.value?.setParams(patch),
    setCloud: (cloud, morph): void => surface.value?.setCloud(cloud, morph),
    play: (): void => surface.value?.play(),
    pause: (): void => surface.value?.pause(),
    destroy,
  }
}

/**
 * `<XhVisual>` —— 独立视觉组件。默认插槽的内容浮在效果之上；
 * 画布铺满根元素且 pointer-events: none，不会挡住插槽里的交互。
 */
export const XhVisual = defineComponent({
  name: 'XhVisual',
  props: {
    effect: { type: [Object, String] as PropType<VisualEffect | string>, required: true },
    params: { type: Object as PropType<Record<string, ParamValue>>, default: undefined },
    quality: { type: String as PropType<VisualQuality>, default: undefined },
    /** 数据驱动点云。效果的粒子通道是 cloud 模式时才有意义。 */
    cloud: { type: Object as PropType<PointCloud | null>, default: null },
    /** 换点云时的形变时长（秒）。 */
    morphDuration: { type: Number, default: undefined },
    pointer: { type: Boolean, default: true },
    autoplay: { type: Boolean, default: true },
    respectReducedMotion: { type: Boolean, default: true },
    pauseOffscreen: { type: Boolean, default: true },
    /** 渲染成什么标签。 */
    as: { type: String, default: 'div' },
  },
  setup(props, { slots, expose }) {
    const root = ref<HTMLElement | null>(null)
    const api = useVisual(root, {
      effect: props.effect,
      params: props.params,
      quality: props.quality,
      pointer: props.pointer,
      autoplay: props.autoplay,
      respectReducedMotion: props.respectReducedMotion,
      pauseOffscreen: props.pauseOffscreen,
    })

    watch(() => props.effect, effect => api.setEffect(effect))
    watch(() => props.quality, (quality) => {
      if (quality !== undefined)
        api.surface.value?.setQuality(quality)
    })
    watch(() => props.params, (params) => {
      if (params !== undefined)
        api.setParams(params)
    }, { deep: true })
    watch(() => props.autoplay, (on) => {
      if (on)
        api.play()
      else api.pause()
    })
    watch([() => props.cloud, api.surface], ([cloud]) => {
      if (cloud)
        api.setCloud(cloud, { duration: props.morphDuration })
    }, { immediate: true, flush: 'post' })

    expose(api)

    return () => h(
      props.as,
      { 'ref': root, 'data-scope': 'visual', 'data-part': 'root' },
      slots.default?.(),
    )
  },
})

export type VisualDirectiveValue = VisualEffect | string | UseVisualOptions

function toOptions(value: VisualDirectiveValue): UseVisualOptions {
  if (typeof value === 'string')
    return { effect: value }
  return 'effect' in value ? value : { effect: value }
}

const mounted = new WeakMap<HTMLElement, { surface: VisualSurface, effect: VisualEffect | string }>()

/**
 * `v-visual` —— 给任意元素铺一层视觉背景。
 *
 * 用在组件上时，Vue 会把指令落到该组件的单一根元素上，所以给现成组件加背景不需要改组件：
 *
 * ```vue
 * <XhButton v-visual="fluidEffect">提交</XhButton>
 * <div v-visual="{ effect: 'aurora', params: { speed: 1.6 } }" />
 * ```
 */
export const vVisual: Directive<HTMLElement, VisualDirectiveValue> = {
  mounted(el, binding) {
    const options = toOptions(binding.value)
    mounted.set(el, { surface: createVisualSurface(el, options), effect: options.effect })
  },
  updated(el, binding) {
    const entry = mounted.get(el)
    if (entry === undefined)
      return
    const options = toOptions(binding.value)
    if (options.effect !== entry.effect) {
      entry.surface.setEffect(options.effect)
      entry.effect = options.effect
    }
    if (options.params !== undefined)
      entry.surface.setParams(options.params)
  },
  unmounted(el) {
    mounted.get(el)?.surface.destroy()
    mounted.delete(el)
  },
}
