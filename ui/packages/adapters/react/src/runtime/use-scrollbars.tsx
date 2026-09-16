/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 use scrollbars 相关实现。

import type { Orientation, Scope, Service } from '@xihan-ui/core'
import type { ScrollbarAnchor, ScrollbarSchema } from '@xihan-ui/headless'
import type { ReactNode } from 'react'
import { connectScrollbar, isOverflowing, SCROLLBAR_DEFAULT_TYPE, scrollbarMachine } from '@xihan-ui/headless'
import { useRef } from 'react'
import { reactNormalize } from './normalize-props'
import { useReactScope } from './react-id'
import { useMachine } from './use-machine'

// 给已有滚动层配一套自绘滚动条。
//
// 条子是滚动层的兄弟，挂在组件既有的壳上（浮层族是 positioner，其余是 root）：
// 壳是定位盒，条子绝对定位贴它的内边距盒，不占布局、不进滚动层内部、不搬去别处。
// 多个滚动层并排共用一个壳（级联的列、时间列）时取 anchor: 'layer'：每层各自调一次本 hook，
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
  /** 排布哪几条轴，默认只排竖向。首帧确定之后不再变化。 */
  axes?: readonly Orientation[]
  /**
   * 条子贴在壳边（shell，默认）还是贴在滚动层自己的盒子上（layer）。
   * layer 要求壳是滚动层的定位祖先，条子渲染在该层之后、仍是壳的子节点；首帧确定之后不再变化。
   */
  anchor?: ScrollbarAnchor
  /** 显示时机、尺寸档、方向等，逐帧现读。 */
  props?: () => ScrollbarsProps
}

export interface ScrollbarsHandle {
  /** 滚动条的节点，宿主把它拼接到外壳子节点的末尾。 */
  render: () => ReactNode[]
  /** 重新测量各条轴的尺寸。 */
  measure: () => void
}

const DEFAULT_AXES: readonly Orientation[] = ['vertical']

/** 一条轴的接线：各滚动条把自己的状态机登记进来，交叉口让位与重新测量都按该表计算。 */
interface BarRegistry {
  scope: Scope
  axes: readonly Orientation[]
  anchor: ScrollbarAnchor | undefined
  scrollable: () => HTMLElement | null
  props: () => ScrollbarsProps
  add: (axis: Orientation, service: Service<ScrollbarSchema>) => void
  remove: (axis: Orientation) => void
  services: () => Service<ScrollbarSchema>[]
  /** 两条轴都在场。 */
  both: () => boolean
}

function createRegistry(scope: Scope, options: () => ScrollbarsOptions): BarRegistry {
  const services = new Map<Orientation, Service<ScrollbarSchema>>()
  const axes = options().axes ?? DEFAULT_AXES

  /**
   * 该轴的滚动条当前常驻在场。判据不经 api：api 中就要读 gutter，读回来会形成循环，
   * 因此直接读作者提供的 props 与状态机测得的尺寸。
   */
  const standing = (service: Service<ScrollbarSchema>): boolean => {
    const given = options().props?.()
    const native = service.context.get('coarse') && !given?.forceVisible
    const type = given?.type ?? SCROLLBAR_DEFAULT_TYPE
    return !native && (type === 'always' || isOverflowing(service.context.get('metrics')))
  }

  return {
    scope,
    axes,
    anchor: options().anchor,
    scrollable: () => options().scrollable(),
    props: () => options().props?.() ?? {},
    add: (axis, service) => services.set(axis, service),
    remove: axis => services.delete(axis),
    services: () => [...services.values()],
    // 各自在末端让出交叉口那一格，只有一条时不让，免得滑块行程平白短一截
    both: () => axes.length > 1 && services.size === axes.length && [...services.values()].every(standing),
  }
}

/** 一条轴的滚动条：三层节点加一块可选的交叉口补丁。 */
function ScrollbarBar({ axis, registry }: { axis: Orientation, registry: BarRegistry }): ReactNode {
  const rootRef = useRef<HTMLElement | null>(null)
  const trackRef = useRef<HTMLElement | null>(null)

  const service = useMachine(scrollbarMachine, () => ({
    ...registry.props(),
    orientation: axis,
    anchor: registry.anchor,
    gutter: registry.both(),
  }), {
    scope: registry.scope,
    // 传 getter 而非节点，ref 在挂载后才有值；量尺寸与挂监听都在机器的效应里进行
    onCreate: (svc) => {
      svc.refs.set('getScrollableEl', registry.scrollable as never)
      svc.refs.set('getTrackEl', (() => trackRef.current) as never)
      svc.refs.set('getRootEl', (() => rootRef.current) as never)
      registry.add(axis, svc as Service<ScrollbarSchema>)
      return () => registry.remove(axis)
    },
  })

  const api = connectScrollbar(service, reactNormalize)
  // 交叉口补丁只写在竖条里；只有一条轴在场时右下角没有缺口要补，收起来免得平白盖住一块内容
  const corner = registry.axes.length > 1 && axis === 'vertical'
    ? (
        <div
          {...api.getCornerProps() as Record<string, unknown>}
          hidden={registry.both() ? undefined : true}
        />
      )
    : null

  return (
    <div
      {...api.getRootProps() as Record<string, unknown>}
      ref={(el: HTMLDivElement | null) => { rootRef.current = el }}
    >
      <div
        {...api.getTrackProps() as Record<string, unknown>}
        ref={(el: HTMLDivElement | null) => { trackRef.current = el }}
      >
        <div {...api.getThumbProps() as Record<string, unknown>} />
      </div>
      {corner}
    </div>
  )
}

/**
 * 滚动条的节点与状态机接线。
 *
 * axes 按首帧的值排定：每条轴一台状态机，轴数变化会使 hook 的调用顺序随之变化。
 */
export function useScrollbars(options: ScrollbarsOptions): ScrollbarsHandle {
  const scope = useReactScope()
  const latest = useRef(options)
  latest.current = options
  const registry = useRef<BarRegistry | null>(null)
  registry.current ??= createRegistry(scope, () => latest.current)
  const reg = registry.current

  return {
    render: () => reg.axes.map(axis => (
      <ScrollbarBar key={`xh-scrollbar-${axis}`} axis={axis} registry={reg} />
    )),
    measure: () => {
      for (const service of reg.services())
        connectScrollbar(service, reactNormalize).measure()
    },
  }
}
