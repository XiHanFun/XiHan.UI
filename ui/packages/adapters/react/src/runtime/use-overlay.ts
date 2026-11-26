/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 use overlay 相关实现。

import type { IdGenerator, Layer, MachineSchema, RuntimeConfig, Scope, Service } from '@xihan-ui/core'
import type { ExitGate, PresenceHandle } from '@xihan-ui/core/presence'
import { createRuntimeConfig } from '@xihan-ui/core'
import { createExitGate } from '@xihan-ui/core/presence'
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { useXhConfig } from '../config/config'

// 服务端没有提交这一步，layout effect 换成永不执行的 useEffect，避开 React 的警告
const useIsomorphicLayoutEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect

/** 浮层这一层要交给状态机的内容：运行时配置、消隐层注册、进出场租约。 */
export interface OverlayWiring {
  /**
   * 当前是否应当渲染／可见：展开即真，退场动画播完之前也是真。
   *
   * 连接层为 content 写的 hidden 跟随展开态，收起那一帧节点就不生成盒子、
   * 退场动画一帧都无法播放；用该值覆盖，被延长的是可见的时间而不是存在的时间。
   */
  rendered: boolean
  /** 浮层迁移到的位置：实例 > 全局配置 > 运行时配置 > body。 */
  portalContainer: () => Element | null
  /** 传给 useMachine 的 onCreate：交出 refs 并返回清理函数。 */
  onCreate: (service: Service<MachineSchema>) => () => void
}

export interface UseOverlayOptions {
  scope: Scope
  idGenerator: IdGenerator
  /** 首帧的展开态：状态机尚未建立，按 props 计算，与 initialState 同一判定。 */
  initialOpen: boolean
  /** 每次提交后现读状态机的展开态：进出场跟随它，不能跟随首帧的值。 */
  isOpen: () => boolean
  /** 消隐层的种类、分支与模态判定；落点与表面由下面两项提供。 */
  layer: () => Omit<Layer, 'id' | 'node' | 'surfaces'>
  /** 消隐层的落点节点。 */
  node: () => HTMLElement | null
  /** 点击即应关闭本层的表面，如遮罩；没有则不提供。 */
  surfaces?: () => Element[]
  /** 退场动画从哪个节点上探测；未提供时使用落点节点。 */
  exitNode?: () => HTMLElement | null
  /** 同一浮层需要一起等待完成的其他表面，例如 Dialog 遮罩。 */
  additionalExitNodes?: () => Array<HTMLElement | null>
  /** 各组件自己要交给状态机的 refs；config、registerLayer 与 presence 由本层交付。 */
  refs?: (service: Service<MachineSchema>, config: RuntimeConfig) => void
  /** 作者写在实例上的浮层容器。 */
  container?: () => Element | null
  /**
   * 展开后等 core 的浮层按需块到了才露出内容。焦点陷阱、滚动锁与背景失活都在那一块里，
   * 不靠落位藏面板的浮层（对话框、抽屉、图片查看器、命令面板）第一次打开时若按需块还没到，
   * 露出来的那一下焦点与滚动都还没被接管；靠定位的浮层落位前本就藏着，不用开。
   * 只管挂载之后的展开：挂载时就开着的照常露出，与服务端直出的标记对齐。
   */
  awaitOverlayKit?: boolean
}

/**
 * 浮层族共用的接线：运行时配置、消隐层注册、进出场租约、CSS 退场探测、落点解析。
 *
 * rendered 的初值取状态机状态而不是 false：服务端没有 DOM、无法建立 presence，
 * 无法计算它就只发一个空占位，客户端首帧却能计算：两侧标记不一致即水合失配。
 */
export function useOverlay(options: UseOverlayOptions): OverlayWiring {
  const { scope, idGenerator, initialOpen, container } = options
  const xhConfig = useXhConfig()
  const [rendered, setRendered] = useState(initialOpen)

  // 取值器随渲染换，接线只建一次：拿 ref 转一道，别让它成为重建的理由
  const latest = useRef(options)
  latest.current = options
  const scrollRoot = useRef(xhConfig.scrollRoot)
  scrollRoot.current = xhConfig.scrollRoot

  const parts = useMemo(() => {
    if (typeof document === 'undefined')
      return null
    const config: RuntimeConfig = createRuntimeConfig({
      scope,
      idGenerator,
      // 宿主把滚动搬进内容容器时 body 本身不滚，加锁会是空操作；这条把真正在滚的那层交给滚动锁
      scrollRoot: () => scrollRoot.current?.() ?? null,
    })
    return { config, gate: null as ExitGate | null }
  }, [scope, idGenerator])

  const onCreate = useCallback((service: Service<MachineSchema>): (() => void) => {
    if (!parts)
      return () => {}
    const { config } = parts
    // StrictMode 重建机器时必须重新建立已销毁的闸门，不能继续使用旧租约容器。
    // 挂载时就开着的不等浮层按需块，与服务端直出的标记对齐；收起过一次之后按常规等
    const gate = createExitGate({
      open: latest.current.initialOpen,
      onExitComplete: () => setRendered(false),
      onOverlayKitReady: latest.current.awaitOverlayKit ? setRendered : undefined,
    })
    parts.gate = gate
    // 只提供注册函数，入栈出栈由机器的效应按展开态驱动
    const registerLayer = (): ReturnType<RuntimeConfig['layerRegistry']['register']> =>
      config.layerRegistry.register({
        ...latest.current.layer(),
        node: () => latest.current.node(),
        surfaces: () => latest.current.surfaces?.() ?? [],
      })
    service.refs.set('config', config)
    service.refs.set('registerLayer', registerLayer)
    service.refs.set('presence', gate.presence)
    latest.current.refs?.(service, config)
    return () => {
      gate.dispose()
      if (parts.gate === gate)
        parts.gate = null
    }
  }, [parts])

  // data-state 落到 DOM 之后再驱动进出场：早于提交驱动，退场探测读到的还是上一帧的
  // animationName，量不到这次的动画。展开那一帧要等按需块时，rendered 在同一轮布局效应里翻假，一帧都不露
  useIsomorphicLayoutEffect(() => {
    const open = latest.current.isOpen()
    const gate = parts?.gate
    if (!gate) {
      setRendered(open)
      return
    }
    if (open)
      gate.presence.update(true)
    gate.track((latest.current.exitNode ?? latest.current.node)(), ...latest.current.additionalExitNodes?.() ?? [])
    gate.update(open)
    setRendered(gate.visible)
  })

  const portalContainer = useCallback(
    () => container?.() ?? xhConfig.portalContainer?.() ?? parts?.config.portalContainer() ?? null,
    [container, xhConfig, parts],
  )

  return { rendered, portalContainer, onCreate }
}

export type { PresenceHandle }
