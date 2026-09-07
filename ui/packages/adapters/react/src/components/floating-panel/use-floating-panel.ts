import type { RuntimeConfig, Service } from '@xihan-ui/core'
import type { FloatingPanelApi, FloatingPanelSchema } from '@xihan-ui/headless'
import type { RefObject } from 'react'
import { createRuntimeConfig } from '@xihan-ui/core'
import { connectFloatingPanel, floatingPanelMachine } from '@xihan-ui/headless'
import { useCallback, useMemo, useRef } from 'react'
import { useXhConfig } from '../../config/config'
import { reactNormalize } from '../../runtime/normalize-props'
import { useReactIdGenerator, useReactScope } from '../../runtime/react-id'
import { useMachine } from '../../runtime/use-machine'
import { useOverlayExit } from '../../runtime/use-overlay-exit'

export interface FloatingPanelContext {
  api: FloatingPanelApi
  service: Service<FloatingPanelSchema>
  /** 面板节点，跟手期间机器取它的文档挂指针监听。 */
  contentRef: RefObject<HTMLElement | null>
  /** 定位层节点，进退场动画挂在它身上。 */
  positionerRef: RefObject<HTMLElement | null>
  /** 定位层此刻该不该可见：退场动画播完之前仍为真。 */
  visible: boolean
  /** 浮层搬到哪儿：全局配置 > 运行时配置 > body。 */
  portalContainer: () => Element | null
}

export function useFloatingPanel(props: FloatingPanelSchema['props']): FloatingPanelContext {
  const idGenerator = useReactIdGenerator()
  const scope = useReactScope()
  const xhConfig = useXhConfig()
  const contentRef = useRef<HTMLElement | null>(null)
  const positionerRef = useRef<HTMLElement | null>(null)

  // 服务端没有 DOM、也就没有落点与退场：config 为 null 时浮层退回原地、可见与否跟着展开态
  const config = useMemo<RuntimeConfig | null>(
    () => (typeof document === 'undefined' ? null : createRuntimeConfig({ scope, idGenerator })),
    [scope, idGenerator],
  )

  // 机器的挂载效应会立刻读 refs，交在 onCreate 里才赶得上
  const onCreate = useCallback((service: Service<FloatingPanelSchema>) => {
    service.refs.set('getContentEl', () => contentRef.current)
  }, [])

  const service = useMachine(floatingPanelMachine, () => props, { scope, onCreate })
  const api = connectFloatingPanel(service, reactNormalize)

  // 退场闸门：收起从跟着展开态走，改成跟着 presence 走。面板整棵子树都在 positioner 底下，
  // 收起与进退场动画都落在它身上，探测器也从它身上读 animationName。
  // 取值器每帧换、闸门只建一次：现读这一帧的 api
  const latest = useRef(api)
  latest.current = api
  const visible = useOverlayExit({ config, isOpen: () => latest.current.open, contentRef: positionerRef })

  // 定位层要逃开祖先的层叠上下文：祖先链上任意一处 transform / filter / contain 都会抢走
  // position: fixed 的包含块，而连接层写的 left/top 是视口坐标，面板会落到错误的位置
  const portalContainer = useCallback(
    () => xhConfig.portalContainer?.() ?? config?.portalContainer() ?? null,
    [xhConfig, config],
  )

  return { api, service, contentRef, positionerRef, visible, portalContainer }
}
