/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 slot content 相关实现。

import type { ReactNode } from 'react'
import { Children } from 'react'

/** 带载荷的插槽写为函数式 children：作者得到的是本层计算好的派生值。 */
export type SlotChildren<P> = ReactNode | ((payload: P) => ReactNode)

/** 函数式 children 即调用它，否则原样返回。 */
export function renderSlot<P>(children: SlotChildren<P>, payload: P): ReactNode {
  return typeof children === 'function' ? children(payload) : children
}

/**
 * children 中是否有真正会渲染出内容的节点。
 *
 * Children.toArray 已经丢弃 null / undefined / 布尔，剩余的只需滤除纯空白文本。
 * 用它判断作者是否提供了这段内容：提供后才补外层承载节点、才把名字改由它承担。
 */
export function slotPaints(children: ReactNode): boolean {
  return Children.toArray(children).some((node) => {
    if (typeof node === 'string')
      return node.trim() !== ''
    return true
  })
}

/**
 * children 是否只有纯文本。
 *
 * Children.toArray 已经丢弃 null / undefined / 布尔，剩余的只要有一个不是字符串或数字
 * 就不算纯文本。用它决定是否替作者补一层承载节点：作者写的是一段文字时，包一层才能应用
 * 该层的规则；作者自己写了节点则一律不动。
 */
export function slotIsPlainText(children: ReactNode): boolean {
  return slotPaints(children)
    && Children.toArray(children).every(node => typeof node === 'string' || typeof node === 'number')
}
