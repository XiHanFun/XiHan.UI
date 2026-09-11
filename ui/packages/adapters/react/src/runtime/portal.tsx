import type { ReactNode } from 'react'
import { createPortalVisualBridge } from '@xihan-ui/core'
import { Fragment, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useXhConfig } from '../config/config'

const useIsomorphicLayoutEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect

/** 浮层挂到哪个容器；返回 null 即挂 body。 */
export type PortalContainer = (() => Element | null) | undefined

/**
 * 落点解析。
 *
 * 缺省立刻解析。推迟一拍会让 React 把这棵子树拆掉重建，机器刚放进去的焦点跟着丢——
 * 浮层展开却没有焦点，键盘用户当场卡住。
 *
 * deferUntilMounted 为真时首帧返回 null、搬迁排到挂载后的效应里，好让客户端首帧与
 * 服务端标记对齐。这一档是给「服务端直出过、且要搬走」的那一屏留的，代价就是上面那次拆建：
 * 两者不能兼得——React 没有「此刻在水合」这个渲染期信号，判不出该走哪一档。
 */
export function usePortalTarget(container: PortalContainer, deferUntilMounted = false): Element | null {
  const config = useXhConfig()
  const resolve = (): Element | null => {
    if (typeof document === 'undefined')
      return null
    return container?.() ?? config.portalContainer?.() ?? document.body
  }
  const [target, setTarget] = useState<Element | null>(() => (deferUntilMounted ? null : resolve()))
  useEffect(() => {
    setTarget(resolve())
    // resolve 每渲染都是新函数，跟着它走会每帧重设一次落点
  }, [container, config])
  return target
}

export interface XhPortalProps {
  container?: PortalContainer
  /** 已有的逻辑来源节点；给了就不生成来源标记，适合 Toolbar/ButtonGroup 内的锚定浮层。 */
  source?: { readonly current: Element | null }
  /**
   * 首帧就地渲染、等挂载后的效应再搬，用来与服务端标记对齐。缺省为假。
   * 开了这一档，内容会被拆建一次，机器放进去的焦点会丢。
   */
  deferUntilMounted?: boolean
  children?: ReactNode
}

/**
 * 把内容搬到浮层落点。
 *
 * 服务端一律就地渲染：react-dom/server 根本不支持 createPortal，而首屏即展开的浮层
 * 必须直出展开态——正文既要能被索引也要能被读屏念到，渲成空占位等于把这一屏丢了。
 */
export function XhPortal({ container, source, deferUntilMounted, children }: XhPortalProps): ReactNode {
  const target = usePortalTarget(container, deferUntilMounted)
  return <PortalWithVisualBridge target={target} source={source}>{children}</PortalWithVisualBridge>
}

function PortalWithVisualBridge({ target, source, children }: {
  target: Element | null
  source?: { readonly current: Element | null }
  children?: ReactNode
}): ReactNode {
  const sourceRef = useRef<HTMLTemplateElement | null>(null)
  const shellRef = useRef<HTMLDivElement | null>(null)
  const bridgeRef = useRef<{
    source: Element
    shell: HTMLElement
    dispose: () => void
  } | null>(null)

  useIsomorphicLayoutEffect(() => {
    const sourceNode = target ? (source?.current ?? sourceRef.current) : null
    const shell = shellRef.current
    if (target && (!sourceNode || !shell))
      throw new Error('[xh] Portal 视觉环境的来源标记或实例壳未挂载')
    const current = bridgeRef.current
    if (sourceNode && shell && current?.source === sourceNode && current.shell === shell)
      return
    current?.dispose()
    bridgeRef.current = null
    if (!sourceNode || !shell)
      return
    const bridge = createPortalVisualBridge({ source: sourceNode, shell })
    bridgeRef.current = { source: sourceNode, shell, dispose: bridge.dispose }
  })

  useEffect(() => () => {
    bridgeRef.current?.dispose()
    bridgeRef.current = null
  }, [])

  const shell = (
    <div ref={shellRef} data-xh-portal-shell="" style={{ display: 'contents' }}>
      {children}
    </div>
  )

  return (
    <Fragment>
      {source ? null : <template ref={sourceRef} data-xh-portal-source="" />}
      {target ? createPortal(shell, target) : shell}
    </Fragment>
  )
}
