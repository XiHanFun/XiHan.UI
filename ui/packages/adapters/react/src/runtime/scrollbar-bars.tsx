/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 自绘滚动条的节点与状态机：每条轴一台状态机，登记表管交叉口让位与重新测量。
//
// useScrollbars（常显的滚动面）静态引入这里；浮层里的 useOverlayScrollbars 第一次要用时才 import()，
// 消费方的打包器把它切成按需块，浮层关着的时候不进首屏。

import type { Orientation, Scope, Service } from '@xihan-ui/core'
import type { ScrollbarAnchor, ScrollbarSchema } from '@xihan-ui/headless'
import type { ReactNode } from 'react'
import type { ScrollbarsOptions, ScrollbarsProps } from './use-scrollbars'
import { connectScrollbar, isOverflowing, SCROLLBAR_DEFAULT_TYPE, scrollbarMachine } from '@xihan-ui/headless'
import { useEffect, useRef, useSyncExternalStore } from 'react'
import { reactNormalize } from './normalize-props'
import { useMachine } from './use-machine'

const DEFAULT_AXES: readonly Orientation[] = ['vertical']

/** 一条轴的接线：各滚动条把自己的状态机登记进来，交叉口让位与重新测量都按该表计算。 */
export interface BarRegistry {
  scope: Scope
  axes: readonly Orientation[]
  anchor: ScrollbarAnchor | undefined
  scrollable: () => HTMLElement | null
  props: () => ScrollbarsProps
  add: (axis: Orientation, service: Service<ScrollbarSchema>) => void
  remove: (axis: Orientation) => void
  services: () => Service<ScrollbarSchema>[]
  /** 这条轴的滚动条当前常驻在场。 */
  standing: (service: Service<ScrollbarSchema>) => boolean
  /** 两条轴都在场。 */
  both: () => boolean
  /** 登记表变了（建起、撤掉、某条轴在场与否翻转）就通知各条轴重算。 */
  subscribe: (fn: () => void) => () => void
  getVersion: () => number
  notify: () => void
}

export function createRegistry(scope: Scope, options: () => ScrollbarsOptions): BarRegistry {
  const services = new Map<Orientation, Service<ScrollbarSchema>>()
  const axes = options().axes ?? DEFAULT_AXES
  const subscribers = new Set<() => void>()
  let version = 0

  const notify = (): void => {
    version += 1
    for (const fn of subscribers) fn()
  }

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
    // 建起这一步落在渲染期（useState 的惰性初始化里），此刻还没有订阅者，推也推不出去；
    // 轴数首帧排定、之后不再增删，各条轴挂载后的效应会把「我在场了」推一次，够用。
    add: (axis, service) => services.set(axis, service),
    // 撤掉落在 layout effect 的清理里，推得出去也推得安全：剩下那条要立刻收回让位
    remove: (axis) => {
      services.delete(axis)
      notify()
    },
    services: () => [...services.values()],
    standing,
    // 各自在末端让出交叉口那一格，只有一条时不让，免得滑块行程平白短一截
    both: () => axes.length > 1 && services.size === axes.length && [...services.values()].every(standing),
    subscribe: (fn) => {
      subscribers.add(fn)
      return () => void subscribers.delete(fn)
    },
    getVersion: () => version,
    notify,
  }
}

/** 一条轴的滚动条：三层节点加一块可选的交叉口补丁。 */
function ScrollbarBar({ axis, registry }: { axis: Orientation, registry: BarRegistry }): ReactNode {
  const rootRef = useRef<HTMLElement | null>(null)
  const trackRef = useRef<HTMLElement | null>(null)

  // 让不让交叉口那一格取决于另一条轴：它建起来、或它在场与否翻转，都由登记表推过来重渲。
  // 在渲染体里算出这一位再交给取值器，机器读到的与这一帧渲染出的节点是同一个答案。
  useSyncExternalStore(registry.subscribe, registry.getVersion, registry.getVersion)
  const gutter = registry.both()

  const service = useMachine(scrollbarMachine, () => ({
    ...registry.props(),
    orientation: axis,
    anchor: registry.anchor,
    gutter,
  }), {
    scope: registry.scope,
    // 传 getter 而非节点，ref 在挂载后才有值；量尺寸与挂监听都在机器的效应里进行
    onCreate: (svc) => {
      svc.refs.set('getScrollableEl', registry.scrollable)
      svc.refs.set('getTrackEl', () => trackRef.current)
      svc.refs.set('getRootEl', () => rootRef.current)
      registry.add(axis, svc as Service<ScrollbarSchema>)
      return () => registry.remove(axis)
    },
  })

  const api = connectScrollbar(service, reactNormalize)
  // 本轴在场与否一翻，另一条轴的让位就要跟着改；只在真翻了的那一拍推过去，不会来回震
  const standing = registry.standing(service)
  useEffect(() => {
    registry.notify()
  }, [registry, standing])

  // 交叉口补丁只写在竖条里；只有一条轴在场时右下角没有缺口要补，收起来免得平白盖住一块内容
  const corner = registry.axes.length > 1 && axis === 'vertical'
    ? (
        <div
          {...api.getCornerProps()}
          hidden={gutter ? undefined : true}
        />
      )
    : null

  return (
    <div
      {...api.getRootProps()}
      ref={(el: HTMLDivElement | null) => { rootRef.current = el }}
    >
      <div
        {...api.getTrackProps()}
        ref={(el: HTMLDivElement | null) => { trackRef.current = el }}
      >
        <div {...api.getThumbProps()} />
      </div>
      {corner}
    </div>
  )
}

/** 登记表里每条轴的滚动条节点，宿主拼接到外壳子节点的末尾。 */
export function renderBars(reg: BarRegistry): ReactNode[] {
  return reg.axes.map(axis => (
    <ScrollbarBar key={`xh-scrollbar-${axis}`} axis={axis} registry={reg} />
  ))
}

/** 重新测量登记表里各条轴的尺寸。 */
export function measureBars(reg: BarRegistry): void {
  for (const service of reg.services())
    connectScrollbar(service, reactNormalize).measure()
}
