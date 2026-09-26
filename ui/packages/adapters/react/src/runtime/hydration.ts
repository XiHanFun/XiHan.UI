/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 hydration 相关实现。

import { useState, useSyncExternalStore } from 'react'

const subscribe = (): (() => void) => () => {}
const onClient = (): boolean => false
const onServer = (): boolean => true

/**
 * 这个组件实例的首次渲染是不是服务端渲染或水合：是的话它的 DOM 来自服务端 HTML，随页面首屏就在。
 *
 * 服务端快照只在服务端渲染与水合时生效，客户端全新挂载拿到的是客户端快照。值在首次渲染时定下：
 * 水合结束后 React 会按客户端快照再渲染一轮，那一轮不改变「它是水合来的」这件事。
 */
export function useHydratedMount(): boolean {
  const hydrating = useSyncExternalStore(subscribe, onClient, onServer)
  const [first] = useState(hydrating)
  return first
}
