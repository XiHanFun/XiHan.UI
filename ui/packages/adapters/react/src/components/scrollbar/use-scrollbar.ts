/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 use scrollbar 相关实现。

import type { Service } from '@xihan-ui/core'
import type { ScrollbarApi, ScrollbarSchema } from '@xihan-ui/headless'
import type { RefObject } from 'react'
import { connectScrollbar, scrollbarMachine } from '@xihan-ui/headless'
import { useCallback, useRef } from 'react'
import { reactNormalize } from '../../runtime/normalize-props'
import { useReactScope } from '../../runtime/react-id'
import { useMachine } from '../../runtime/use-machine'

/** 作者交出滚动容器的两条路径：直接提供节点（或取节点的函数），或者提供它的 id。 */
export type ScrollbarTarget = HTMLElement | (() => HTMLElement | null) | null | undefined

type ScrollbarProps = ScrollbarSchema['props']

/** 作者提供的 props 连同滚动容器；`scrollable` 不进入状态机，由这里解析为节点交给 refs。 */
export type ScrollbarSource = ScrollbarProps & { scrollable?: ScrollbarTarget }

export interface ScrollbarContext {
  service: Service<ScrollbarSchema>
  api: ScrollbarApi
  /** 根节点，指针进出它也视为指针仍在滚动条上。 */
  rootRef: RefObject<HTMLElement | null>
  /** 轨道节点，长度在拖动/点击时现测。 */
  trackRef: RefObject<HTMLElement | null>
}

export function useScrollbar(source: ScrollbarSource): ScrollbarContext {
  const scope = useReactScope()
  const rootRef = useRef<HTMLElement | null>(null)
  const trackRef = useRef<HTMLElement | null>(null)

  // 取值器随渲染换，接线只建一次：拿 ref 转一道，解析滚动容器时现读这一份
  const latest = useRef(source)
  latest.current = source

  /**
   * 优先使用作者提供的节点，没有时再按 controls 作为 id 查询。
   * 每次调用现查：作者的容器可能是条件渲染的，缓存会永远指向第一帧的节点（或 null）。
   */
  const resolveScrollable = useCallback((): HTMLElement | null => {
    const { scrollable: given, controls: id } = latest.current
    if (typeof given === 'function')
      return given()
    if (given)
      return given
    if (!id || typeof document === 'undefined')
      return null
    const found = document.getElementById(id)
    return found instanceof HTMLElement ? found : null
  }, [])

  // 量尺寸与挂监听都在机器的挂载效应里跑，三处取值口得赶在那之前交出去
  const onCreate = useCallback((service: Service<ScrollbarSchema>) => {
    service.refs.set('getScrollableEl', resolveScrollable)
    service.refs.set('getTrackEl', () => trackRef.current)
    service.refs.set('getRootEl', () => rootRef.current)
  }, [resolveScrollable])

  // 每次取值现读 props：挂载后改 type / disabled 机器要跟着变
  const service = useMachine(scrollbarMachine, () => {
    const { scrollable: _scrollable, ...rest } = latest.current
    return rest
  }, { scope, onCreate })

  return { service, api: connectScrollbar(service, reactNormalize), rootRef, trackRef }
}
