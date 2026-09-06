import type { IdGenerator, Layer, MachineSchema, RuntimeConfig, Scope, Service } from '@xihan-ui/core'
import type { PresenceHandle } from '@xihan-ui/core/presence'
import { createRuntimeConfig } from '@xihan-ui/core'
import { attachCssExit, createPresence } from '@xihan-ui/core/presence'
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { useXhConfig } from '../config/config'

// 服务端没有提交这一步，layout effect 换成永不执行的 useEffect，避开 React 的警告
const useIsomorphicLayoutEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect

/** 浮层这一层要交给机器的东西：运行时配置、消隐层注册、进出场租约。 */
export interface OverlayWiring {
  /**
   * 此刻该不该渲染／可见：展开即真，退场动画播完之前也是真。
   *
   * 连接层给 content 打的 hidden 跟着展开态走，收起那一帧节点就不生成盒子、
   * 退场动画一帧都播不出来；拿这个值盖过去，被拉长的是「可见的时间」而不是「存在的时间」。
   */
  rendered: boolean
  /** 浮层搬到哪儿：实例 > 全局配置 > 运行时配置 > body。 */
  portalContainer: () => Element | null
  /** 传给 useMachine 的 onCreate：把 refs 交出去并返回清理函数。 */
  onCreate: (service: Service<MachineSchema>) => () => void
}

export interface UseOverlayOptions {
  scope: Scope
  idGenerator: IdGenerator
  /** 首帧的展开态：机器还没建出来，按 props 算，与 initialState 同一条判定。 */
  initialOpen: boolean
  /** 每次提交后现读机器的展开态——进出场跟着它走，不能跟着首帧那个值走。 */
  isOpen: () => boolean
  /** 消隐层的种类、分支与模态判定；落点与表面由下面两项给。 */
  layer: () => Omit<Layer, 'id' | 'node' | 'surfaces'>
  /** 消隐层的落点节点。 */
  node: () => HTMLElement | null
  /** 点它即应关闭本层的表面，如遮罩；没有就不给。 */
  surfaces?: () => Element[]
  /** 退场动画从哪个节点上探测；不给就用落点节点。 */
  exitNode?: () => HTMLElement | null
  /** 各家自己要交给机器的 refs；config、registerLayer 与 presence 由本层交。 */
  refs?: (service: Service<MachineSchema>, config: RuntimeConfig) => void
  /** 作者写在实例上的浮层容器。 */
  container?: () => Element | null
}

/**
 * 浮层族共用的接线：运行时配置、消隐层注册、进出场租约、CSS 退场探测、落点解析。
 *
 * rendered 的初值取机器状态而不是 false：服务端拿不到 DOM、建不了 presence，
 * 算不出它就只发一个空占位，客户端首帧却算得出——两侧标记对不上即水合失配。
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
    const presence = createPresence({ config, open: initialOpen, onRenderedChange: setRendered })
    return { config, presence }
  }, [scope, idGenerator, initialOpen])

  const onCreate = useCallback((service: Service<MachineSchema>): (() => void) => {
    if (!parts)
      return () => {}
    const { config, presence } = parts
    // 只提供注册函数，入栈出栈由机器的效应按展开态驱动
    const registerLayer = (): ReturnType<RuntimeConfig['layerRegistry']['register']> =>
      config.layerRegistry.register({
        ...latest.current.layer(),
        node: () => latest.current.node(),
        surfaces: () => latest.current.surfaces?.() ?? [],
      })
    service.refs.set('config', config as never)
    service.refs.set('registerLayer', registerLayer as never)
    service.refs.set('presence', presence as never)
    latest.current.refs?.(service, config)
    return () => presence.dispose()
  }, [parts])

  // data-state 落到 DOM 之后再驱动进出场：早于提交驱动，退场探测读到的还是上一帧的
  // animationName，量不到这次的动画
  const detachExit = useRef<(() => void) | undefined>(undefined)
  useIsomorphicLayoutEffect(() => {
    const open = latest.current.isOpen()
    if (!parts) {
      setRendered(open)
      return
    }
    parts.presence.update(open)
    const node = (latest.current.exitNode ?? latest.current.node)()
    detachExit.current?.()
    detachExit.current = node ? attachCssExit(node, parts.presence) : undefined
  })

  useEffect(() => () => {
    detachExit.current?.()
    detachExit.current = undefined
  }, [])

  const portalContainer = useCallback(
    () => container?.() ?? xhConfig.portalContainer?.() ?? parts?.config.portalContainer() ?? null,
    [container, xhConfig, parts],
  )

  return { rendered, portalContainer, onCreate }
}

export type { PresenceHandle }
