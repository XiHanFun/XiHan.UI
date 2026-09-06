import type { ReactNode } from 'react'
import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { useXhConfig } from '../config/config'

/** 浮层挂到哪个容器；返回 null 即挂 body。 */
export type PortalContainer = (() => Element | null) | undefined

/**
 * 落点解析：实例上写了的以实例为准，其次全局配置，最后 body。
 *
 * 首帧一律返回 null。服务端没有 document，客户端首帧要与服务端渲出来的那一份对齐——
 * 落点在挂载后的效应里才补上，此后内容才搬进浮层。
 */
export function usePortalTarget(container: PortalContainer): Element | null {
  const config = useXhConfig()
  const [target, setTarget] = useState<Element | null>(null)
  useEffect(() => {
    setTarget(container?.() ?? config.portalContainer?.() ?? document.body)
  }, [container, config])
  return target
}

export interface XhPortalProps {
  container?: PortalContainer
  children?: ReactNode
}

/**
 * 把内容搬到浮层落点。
 *
 * 服务端与客户端首帧就地渲染，不搬。react-dom/server 根本不支持 createPortal，
 * 而首屏即展开的浮层必须直出展开态——正文既要能被索引也要能被读屏念到，
 * 渲成空占位等于把这一屏丢了。搬迁推迟到挂载后的效应里，水合时两侧标记因此一致。
 */
export function XhPortal({ container, children }: XhPortalProps): ReactNode {
  const target = usePortalTarget(container)
  if (!target)
    return children
  return createPortal(children, target)
}
