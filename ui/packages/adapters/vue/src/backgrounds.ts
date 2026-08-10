// @xihan-ui/vue/backgrounds —— 视觉层的 Vue 适配。
//
// 与主入口分开：@xihan-ui/backgrounds 是可选 peer，不用视觉效果的应用不会因为装了本包
// 而多出一个 WebGL 引擎。用之前先装 @xihan-ui/backgrounds。
//
// 三种用法，从轻到重：
//   v-background   给任意元素或组件的根元素铺一层背景，一个字都不用改组件
//   XhBackground   独立的视觉组件，插槽内容浮在效果之上
//   useBackground  自己拿画面实例，接自定义调度或调参面板

import type {
  BackgroundEffect,
  BackgroundQuality,
  BackgroundSurface,
  MorphOptions,
  ParamValue,
  PointCloud,
} from '@xihan-ui/backgrounds'
import type { Directive, PropType, ShallowRef, VNodeRef } from 'vue'
import { createBackgroundSurface } from '@xihan-ui/backgrounds'
import {
  defineComponent,
  getCurrentScope,
  h,
  onScopeDispose,
  shallowRef,
} from 'vue'

export interface UseBackgroundOptions {
  effect: BackgroundEffect | string
  params?: Record<string, ParamValue>
  quality?: BackgroundQuality
  /** 自动绑定指针事件，默认 true。 */
  pointer?: boolean
  /** 创建后立即播放，默认 true。 */
  autoplay?: boolean
  /** 系统开启减弱动态效果时冻结时间轴，默认 true。 */
  respectReducedMotion?: boolean
  /** 滚出视口时暂停绘制，默认 true。 */
  pauseOffscreen?: boolean
}

export interface UseBackgroundReturn {
  readonly surface: ShallowRef<BackgroundSurface | null>
  /**
   * 挂载点。直接当模板 ref 用：`<div :ref="visual.attach">`，
   * 渲染器会在元素进出 DOM 时把元素或 null 交进来。
   */
  attach: (element: Element | null) => void
  setEffect: (effect: BackgroundEffect | string) => void
  setParams: (patch: Record<string, ParamValue>) => void
  setCloud: (cloud: PointCloud, options?: MorphOptions) => void
  play: () => void
  pause: () => void
  destroy: () => void
}

/**
 * 建一张受 Vue 生命周期管理的视觉画面。
 *
 * 用**函数式 ref** 而不是监听一个模板 ref：元素由渲染器直接交到手上，
 * 不经过响应式与调度队列，因此不受 flush 时序影响，元素换了也一定收得到。
 * 组件卸载时自动销毁；在 setup 之外调用则需自己调 destroy。
 */
export function useBackground(options: UseBackgroundOptions): UseBackgroundReturn {
  const surface = shallowRef<BackgroundSurface | null>(null)
  // 元素没换就不动画面：函数式 ref 每次 patch 都会被再调一遍，
  // 不挡住的话每渲染一帧就销毁重建一次，画面永远停在创建时那份参数上
  let attached: HTMLElement | null = null

  function attach(element: Element | null): void {
    const el = element instanceof HTMLElement ? element : null
    if (el === attached)
      return
    attached = el
    surface.value?.destroy()
    surface.value = el === null ? null : createBackgroundSurface(el, options)
  }

  function destroy(): void {
    attached = null
    surface.value?.destroy()
    surface.value = null
  }

  if (getCurrentScope())
    onScopeDispose(destroy)

  return {
    surface,
    attach,
    setEffect: (effect): void => surface.value?.setEffect(effect),
    setParams: (patch): void => surface.value?.setParams(patch),
    setCloud: (cloud, morph): void => surface.value?.setCloud(cloud, morph),
    play: (): void => surface.value?.play(),
    pause: (): void => surface.value?.pause(),
    destroy,
  }
}

/**
 * `<XhBackground>` —— 独立视觉组件。默认插槽的内容浮在效果之上；
 * 画布铺满根元素且 pointer-events: none，不会挡住插槽里的交互。
 */
export const XhBackground = defineComponent({
  name: 'XhBackground',
  props: {
    effect: { type: [Object, String] as PropType<BackgroundEffect | string>, required: true },
    params: { type: Object as PropType<Record<string, ParamValue>>, default: undefined },
    quality: { type: String as PropType<BackgroundQuality>, default: undefined },
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
    const api = useBackground({
      effect: props.effect,
      params: props.params,
      quality: props.quality,
      pointer: props.pointer,
      autoplay: props.autoplay,
      respectReducedMotion: props.respectReducedMotion,
      pauseOffscreen: props.pauseOffscreen,
    })

    let appliedEffect: BackgroundEffect | string | undefined
    let appliedQuality: BackgroundQuality | undefined
    let appliedCloud: PointCloud | null = null
    let appliedAutoplay = props.autoplay

    /**
     * 把当前 props 推到画面上。在渲染函数里调用而不是挂 watcher：
     * 渲染函数一定会随 props 变化重跑，且这里读到的参数值同时建立了依赖追踪，
     * 调用方原地改参数对象里的某一项也收得到。
     */
    function sync(): void {
      const surface = api.surface.value
      if (surface === null)
        return
      if (props.effect !== appliedEffect) {
        surface.setEffect(props.effect)
        appliedEffect = props.effect
      }
      if (props.quality !== undefined && props.quality !== appliedQuality) {
        surface.setQuality(props.quality)
        appliedQuality = props.quality
      }
      if (props.params !== undefined)
        surface.setParams(props.params)
      if (props.cloud && props.cloud !== appliedCloud) {
        // 第一份点云直接就位，之后的换形态才走过渡
        surface.setCloud(props.cloud, { duration: appliedCloud === null ? 0 : props.morphDuration })
        appliedCloud = props.cloud
      }
      if (props.autoplay !== appliedAutoplay) {
        if (props.autoplay)
          surface.play()
        else surface.pause()
        appliedAutoplay = props.autoplay
      }
    }

    // 签名照 VNodeRef 的函数式 ref 写：渲染器在元素进出 DOM 时把元素或 null 交进来。
    // 同一个元素会被反复交进来，attach 对此幂等；只有真换了画面才重置记账。
    const mount: VNodeRef = (element): void => {
      const previous = api.surface.value
      api.attach(element instanceof HTMLElement ? element : null)
      const current = api.surface.value
      if (current === previous || current === null)
        return
      appliedEffect = props.effect
      appliedQuality = props.quality
      appliedCloud = null
      appliedAutoplay = props.autoplay
      sync()
    }

    expose(api)

    return () => {
      sync()
      return h(
        props.as,
        { 'ref': mount, 'data-scope': 'background', 'data-part': 'root' },
        slots.default?.(),
      )
    }
  },
})

export type BackgroundDirectiveValue = BackgroundEffect | string | UseBackgroundOptions

function toOptions(value: BackgroundDirectiveValue): UseBackgroundOptions {
  if (typeof value === 'string')
    return { effect: value }
  return 'effect' in value ? value : { effect: value }
}

const mounted = new WeakMap<HTMLElement, { surface: BackgroundSurface, effect: BackgroundEffect | string }>()

/**
 * `v-background` —— 给任意元素铺一层视觉背景。
 *
 * 用在组件上时，Vue 会把指令落到该组件的单一根元素上，所以给现成组件加背景不需要改组件：
 *
 * ```vue
 * <XhButton v-background="fluidEffect">提交</XhButton>
 * <div v-background="{ effect: 'aurora', params: { speed: 1.6 } }" />
 * ```
 */
export const vBackground: Directive<HTMLElement, BackgroundDirectiveValue> = {
  mounted(el, binding) {
    const options = toOptions(binding.value)
    mounted.set(el, { surface: createBackgroundSurface(el, options), effect: options.effect })
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
