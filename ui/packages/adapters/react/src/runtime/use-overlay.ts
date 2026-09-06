import type { Cleanup, IdGenerator, Layer, MachineSchema, RuntimeConfig, Scope, Service } from '@xihan-ui/core'
import type { PresenceHandle } from '@xihan-ui/core/presence'
import type { RefObject } from 'react'
import { createRuntimeConfig } from '@xihan-ui/core'
import { attachCssExit, createPresence } from '@xihan-ui/core/presence'
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { useXhConfig } from '../config/config'

// 服务端没有提交这一步，layout effect 换成永不执行的 useEffect，避开 React 的警告
const useIsomorphicLayoutEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect

/** 浮层这一层要交给机器的东西：运行时配置、消隐层注册、进出场租约。 */
export interface OverlayWiring {
  /** 当前该不该渲染内容：展开即真，关闭后等退场动画走完才转假。 */
  rendered: boolean
  /** 接在内容节点上，用来量退场动画、作消隐层的落点。 */
  contentRef: RefObject<HTMLElement | null>
  /** 接在遮罩节点上。 */
  backdropRef: RefObject<HTMLElement | null>
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
  /** 每次提交后现读机器的展开态——进出场要跟着它走，不能跟着首帧那个值走。 */
  isOpen: () => boolean
  /** 消隐层的种类与模态判定；node 与 surfaces 由本层补。 */
  layer: () => Omit<Layer, 'id' | 'node' | 'surfaces'>
  /** 作者写在实例上的浮层容器。 */
  container?: () => Element | null
}

/**
 * 浮层族共用的接线：运行时配置、消隐层注册、进出场租约、CSS 退场探测。
 *
 * rendered 的初值取机器状态而不是 false：服务端拿不到 DOM、建不了 presence，
 * 算不出 rendered 就只发一个空占位，客户端首帧却算得出——两侧标记对不上即水合失配。
 */
export function useOverlay(options: UseOverlayOptions): OverlayWiring {
  const { scope, idGenerator, initialOpen, isOpen, layer, container } = options
  const xhConfig = useXhConfig()
  const contentRef = useRef<HTMLElement | null>(null)
  const backdropRef = useRef<HTMLElement | null>(null)
  const [rendered, setRendered] = useState(initialOpen)

  // 取值器随渲染换，接线只建一次：拿 ref 转一道，别让它成为重建的理由
  const latest = useRef({ layer, container, isOpen, scrollRoot: xhConfig.scrollRoot })
  latest.current = { layer, container, isOpen, scrollRoot: xhConfig.scrollRoot }

  const parts = useMemo(() => {
    if (typeof document === 'undefined')
      return null
    const config: RuntimeConfig = createRuntimeConfig({
      scope,
      idGenerator,
      // 宿主把滚动搬进内容容器时 body 本身不滚，加锁会是空操作；这条把真正在滚的那层交给滚动锁
      scrollRoot: () => latest.current.scrollRoot?.() ?? null,
    })
    const presence = createPresence({ config, open: initialOpen, onRenderedChange: setRendered })
    return { config, presence }
    // initialOpen 只作初值，后续由 presence.update 驱动；带上它会让接线随开合重建
  }, [scope, idGenerator])

  const onCreate = useCallback((service: Service<MachineSchema>): (() => void) => {
    if (!parts)
      return () => {}
    const { config, presence } = parts
    // 只提供注册函数，入栈出栈由机器的效应按展开态驱动
    const registerLayer = (): { layer: Layer, dispose: Cleanup } => config.layerRegistry.register({
      ...latest.current.layer(),
      node: () => contentRef.current,
      surfaces: () => [backdropRef.current].filter(Boolean) as Element[],
    })
    service.refs.set('config', config as never)
    service.refs.set('registerLayer', registerLayer as never)
    service.refs.set('presence', presence as never)
    service.refs.set('getContentEl', (() => contentRef.current) as never)
    service.refs.set('getTriggerEl', (() => null) as never)
    service.refs.set('branches', (() => []) as never)
    return () => presence.dispose()
  }, [parts])

  // data-state 落到 DOM 之后再驱动进出场：早于提交驱动，退场探测读到的还是上一帧的
  // animationName，量不到这次的动画
  const detachExit = useRef<(() => void) | undefined>(undefined)
  useIsomorphicLayoutEffect(() => {
    if (!parts)
      return
    parts.presence.update(latest.current.isOpen())
    detachExit.current?.()
    detachExit.current = contentRef.current ? attachCssExit(contentRef.current, parts.presence) : undefined
  })

  useEffect(() => () => {
    detachExit.current?.()
    detachExit.current = undefined
  }, [])

  const portalContainer = useCallback(
    () => container?.() ?? xhConfig.portalContainer?.() ?? parts?.config.portalContainer() ?? null,
    [container, xhConfig, parts],
  )

  return { rendered, contentRef, backdropRef, portalContainer, onCreate }
}

export type { PresenceHandle }
