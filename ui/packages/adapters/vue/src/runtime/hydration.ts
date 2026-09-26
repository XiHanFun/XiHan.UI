/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 hydration 相关实现。

import { getCurrentInstance } from 'vue'

/**
 * 当前组件是不是在水合：它的 DOM 来自服务端 HTML，随页面首屏就在。只在 setup 中调用。
 *
 * 水合时 Vue 先让组件的 vnode 认领服务端渲染的节点，再运行 setup；全新挂载的 vnode 在渲染之前没有节点。
 */
export function isHydratingSetup(): boolean {
  return getCurrentInstance()?.vnode.el != null
}
