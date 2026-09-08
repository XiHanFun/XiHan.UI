// @xihan-ui/react/backgrounds —— 视觉层的 React 适配。
//
// 与主入口分开：@xihan-ui/backgrounds 是可选 peer，不用视觉效果的应用不会因为装了本包
// 而多出一个 WebGL 引擎。用之前先装 @xihan-ui/backgrounds。
//
// 两种用法：
//   XhBackground   独立的视觉组件，children 浮在效果之上
//   useBackground  自己拿画面实例，把它返回的 ref 挂到任意元素上
//
// 没有第三种。Vue 那份的 v-background 靠指令这层介质挂到别人的元素上，
// React 没有这层介质；把 useBackground 的 ref 挂到元素上就是同一件事。

import type {
  BackgroundEffect,
  BackgroundQuality,
  BackgroundSurface,
  MorphOptions,
  ParamValue,
  PointCloud,
} from '@xihan-ui/backgrounds'
import type { ComponentPropsWithRef, ElementType, ReactNode, RefObject } from 'react'
import { createBackgroundSurface } from '@xihan-ui/backgrounds'
import { useEffect, useRef } from 'react'
import { mergeReactProps } from './runtime/merge-props'

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
  /** 当前画面实例，读 `.current`；没有元素挂着时是 null。 */
  readonly surface: RefObject<BackgroundSurface | null>
  /**
   * 挂载点。直接当 ref 用：`<div ref={visual.ref} />`，
   * React 会在元素进出 DOM 时把元素或 null 交进来。
   */
  ref: (element: Element | null) => void
  setEffect: (effect: BackgroundEffect | string) => void
  setParams: (patch: Record<string, ParamValue>) => void
  setCloud: (cloud: PointCloud, options?: MorphOptions) => void
  play: () => void
  pause: () => void
  destroy: () => void
}

/**
 * 建一张受 React 生命周期管理的视觉画面。
 *
 * 用**回调式 ref** 而不是 useEffect 里读一个 ref 对象：元素由 React 直接交到手上，
 * 元素换了、组件卸载了都会再调一遍，因此不需要额外的清理效应——
 * 加一个 `[]` 依赖的清理效应反而会在开发模式的重复挂载里把 ref 建好的画面销毁掉再也不建回来。
 */
export function useBackground(options: UseBackgroundOptions): UseBackgroundReturn {
  // 选项每渲染都可能是新对象，建画面时读最近这一份
  const latest = useRef(options)
  latest.current = options
  const surface = useRef<BackgroundSurface | null>(null)
  // 元素没换就不动画面：同一个元素会被反复交进来，不挡住的话画面每次都销毁重建，
  // 参数与点云的进度全部回到创建那一刻
  const attached = useRef<HTMLElement | null>(null)
  const api = useRef<UseBackgroundReturn | null>(null)

  if (api.current === null) {
    // 整份接口只建一次：回调式 ref 的身份换了，React 会先用 null 调旧的、再用节点调新的，
    // 画面于是每渲染一次就销毁重建一次
    const attach = (element: Element | null): void => {
      const el = element instanceof HTMLElement ? element : null
      if (el === attached.current)
        return
      attached.current = el
      surface.current?.destroy()
      surface.current = el === null ? null : createBackgroundSurface(el, latest.current)
    }

    const destroy = (): void => {
      attached.current = null
      surface.current?.destroy()
      surface.current = null
    }

    api.current = {
      surface,
      ref: attach,
      setEffect: (effect): void => surface.current?.setEffect(effect),
      setParams: (patch): void => surface.current?.setParams(patch),
      setCloud: (cloud, morph): void => surface.current?.setCloud(cloud, morph),
      play: (): void => surface.current?.play(),
      pause: (): void => surface.current?.pause(),
      destroy,
    }
  }

  return api.current
}

export interface XhBackgroundProps extends ComponentPropsWithRef<'div'> {
  effect: BackgroundEffect | string
  params?: Record<string, ParamValue>
  quality?: BackgroundQuality
  /** 数据驱动点云。效果的粒子通道是 cloud 模式时才有意义。 */
  cloud?: PointCloud | null
  /** 换点云时的形变时长（秒）。 */
  morphDuration?: number
  pointer?: boolean
  autoplay?: boolean
  respectReducedMotion?: boolean
  pauseOffscreen?: boolean
  /** 渲染成什么标签。 */
  as?: ElementType
}

/** 画面建好那一刻已经吃过的那份取值，用来算出后续每次提交要推什么。 */
interface AppliedState {
  surface: BackgroundSurface
  effect: BackgroundEffect | string
  quality: BackgroundQuality | undefined
  cloud: PointCloud | null
  autoplay: boolean
}

/**
 * `<XhBackground>` —— 独立视觉组件。children 浮在效果之上；
 * 画布铺满根元素且 pointer-events: none，不会挡住 children 里的交互。
 */
export function XhBackground({
  effect,
  params,
  quality,
  cloud = null,
  morphDuration,
  pointer = true,
  autoplay = true,
  respectReducedMotion = true,
  pauseOffscreen = true,
  as = 'div',
  children,
  ...rest
}: XhBackgroundProps): ReactNode {
  const api = useBackground({
    effect,
    params,
    quality,
    pointer,
    autoplay,
    respectReducedMotion,
    pauseOffscreen,
  })
  const applied = useRef<AppliedState | null>(null)

  // 不给依赖数组：每次提交后都把当前 props 推到画面上。
  // 跟着依赖走的话，调用方原地改参数对象里的某一项收不到；参数对象每渲染都新建同样收不到。
  useEffect(() => {
    const surface = api.surface.current
    if (surface === null) {
      applied.current = null
      return
    }
    // 画面刚建起来：创建时就吃了这一份 effect / quality / autoplay，别再推一遍
    if (applied.current?.surface !== surface)
      applied.current = { surface, effect, quality, cloud: null, autoplay }

    const state = applied.current
    if (effect !== state.effect) {
      surface.setEffect(effect)
      state.effect = effect
    }
    if (quality !== undefined && quality !== state.quality) {
      surface.setQuality(quality)
      state.quality = quality
    }
    if (params !== undefined)
      surface.setParams(params)
    if (cloud && cloud !== state.cloud) {
      // 第一份点云直接就位，之后的换形态才走过渡
      surface.setCloud(cloud, { duration: state.cloud === null ? 0 : morphDuration })
      state.cloud = cloud
    }
    if (autoplay !== state.autoplay) {
      if (autoplay)
        surface.play()
      else surface.pause()
      state.autoplay = autoplay
    }
  })

  const Tag = as as 'div'
  return (
    // 不发 data-scope：这个宿主不归任何皮肤管，几何全在 features/backgrounds 的内联样式里。
    // 发了 scope 而没有对应皮肤，开发模式的皮肤在场探测会给出一条永远修不掉的警告
    <Tag {...mergeReactProps({ ref: api.ref } as Record<string, unknown>, rest as Record<string, unknown>)}>
      {children}
    </Tag>
  )
}
