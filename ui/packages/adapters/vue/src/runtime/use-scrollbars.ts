/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 use scrollbars 相关实现。

import type { Orientation, Scope, Service } from '@xihan-ui/core'
import type { ScrollbarAnchor, ScrollbarApi, ScrollbarSchema } from '@xihan-ui/headless'
import type { ComputedRef, MaybeRefOrGetter, Ref, VNode } from 'vue'
import { createScope } from '@xihan-ui/core'
import { connectScrollbar, isOverflowing, SCROLLBAR_DEFAULT_TYPE, scrollbarMachine } from '@xihan-ui/headless'
import { computed, h, ref, toValue } from 'vue'
import { vueNormalize } from './normalize-props'
import { useMachine } from './use-machine'
import { createVueIdGenerator } from './vue-id'

// 给已有滚动层配一套自绘滚动条。
//
// 条子是滚动层的兄弟，挂在组件既有的壳上（浮层族是 positioner，其余是 root）：
// 壳是定位盒，条子绝对定位贴它的内边距盒，不占布局、不进滚动层内部、不搬去别处。
// 多个滚动层并排共用一个壳（级联的列、时间列）时取 anchor: 'layer'：每层各自调一次本组合式，
// 条子紧跟在该层后面渲染、按层在壳内的偏移盒定位。
// 宿主只交「谁在滚」与「摆哪几条轴」，节点形状与机器接线都在这里，宿主那侧只有一行 render。

/** 交给滚动条的 props。轴由 axes 决定、让位按实测溢出计算，两者都不从外部接收。 */
export type ScrollbarsProps = Omit<ScrollbarSchema['props'], 'orientation' | 'gutter' | 'anchor'>

export interface ScrollbarsOptions {
  /**
   * 真正在滚动的层。接收 getter 而不是节点：ref 挂载后才有值，
   * 多档互斥的宿主（同一个位置有两个可能的滚动层）在这里返回当前生效的那个。
   */
  scrollable: () => HTMLElement | null
  /** 排布哪几条轴，默认只排竖向。 */
  axes?: readonly Orientation[]
  /**
   * 条子贴在壳边（shell，默认）还是贴在滚动层自己的盒子上（layer）。
   * layer 要求壳是滚动层的定位祖先，条子渲染在该层之后、仍是壳的子节点。
   */
  anchor?: ScrollbarAnchor
  /** 显示时机、尺寸档、方向等，逐帧现读。 */
  props?: MaybeRefOrGetter<ScrollbarsProps>
  /** 已有宿主 Scope 时与它共用，避免 iframe / ShadowRoot 中另回 ambient Document。 */
  scope?: Scope
}

export interface ScrollbarsHandle {
  /** 滚动条的节点，宿主把它拼接到外壳子节点的末尾。 */
  render: () => VNode[]
  /** 重新测量两条轴的尺寸。 */
  measure: () => void
}

interface Bar {
  axis: Orientation
  service: Service<ScrollbarSchema>
  api: ComputedRef<ScrollbarApi>
  rootRef: Ref<HTMLElement | null>
  trackRef: Ref<HTMLElement | null>
}

const DEFAULT_AXES: readonly Orientation[] = ['vertical']

export function useScrollbars(options: ScrollbarsOptions): ScrollbarsHandle {
  const axes = options.axes ?? DEFAULT_AXES
  const scope = options.scope ?? createScope(null, createVueIdGenerator())
  const bars: Bar[] = []

  /**
   * 该轴的滚动条当前常驻在场。判据不经 api：api 中就要读 gutter，读回来会形成循环，
   * 因此直接读作者提供的 props 与状态机测得的尺寸。
   */
  const standing = (bar: Bar): boolean => {
    const given = toValue(options.props)
    const native = bar.service.context.get('coarse') && !given?.forceVisible
    const type = given?.type ?? SCROLLBAR_DEFAULT_TYPE
    return !native && (type === 'always' || isOverflowing(bar.service.context.get('metrics')))
  }

  /** 两条轴都在场：各自在末端让出交叉口一格，只有一条时不让，避免滑块行程无故缩短。 */
  const both = (): boolean => axes.length > 1 && bars.length === axes.length && bars.every(standing)

  for (const axis of axes) {
    const rootRef = ref<HTMLElement | null>(null)
    const trackRef = ref<HTMLElement | null>(null)
    // 每次取值现读 props：挂载后改 type / size 机器要跟着变
    const service = useMachine(scrollbarMachine, () => ({
      ...toValue(options.props),
      orientation: axis,
      anchor: options.anchor,
      gutter: both(),
    }), scope)
    // 传 getter 而非节点，ref 在挂载后才有值；量尺寸与挂监听都在机器的效应里进行
    service.refs.set('getScrollableEl', options.scrollable)
    service.refs.set('getTrackEl', () => trackRef.value)
    service.refs.set('getRootEl', () => rootRef.value)
    bars.push({
      axis,
      service,
      api: computed(() => connectScrollbar(service, vueNormalize)),
      rootRef,
      trackRef,
    })
  }

  /** 交叉口补丁只写在竖条中；只有一条轴在场时右下角没有缺口需要补，收起以免无故遮住一块内容。 */
  const corner = (bar: Bar): VNode[] =>
    axes.length > 1 && bar.axis === 'vertical'
      ? [h('div', {
          ...bar.api.value.getCornerProps() as Record<string, unknown>,
          hidden: both() ? undefined : true,
        })]
      : []

  return {
    render: () => bars.map(bar => h('div', {
      ...bar.api.value.getRootProps() as Record<string, unknown>,
      key: `xh-scrollbar-${bar.axis}`,
      ref: bar.rootRef,
    }, [
      h('div', {
        ...bar.api.value.getTrackProps() as Record<string, unknown>,
        ref: bar.trackRef,
      }, [h('div', bar.api.value.getThumbProps() as Record<string, unknown>)]),
      ...corner(bar),
    ])),
    measure: () => {
      for (const bar of bars) bar.api.value.measure()
    },
  }
}
