import type { ReactNode } from 'react'
import { Children } from 'react'

/** 带载荷的插槽写成函数式 children：作者拿到的是这一层算好的派生值。 */
export type SlotChildren<P> = ReactNode | ((payload: P) => ReactNode)

/** 函数式 children 就调它，否则原样返回。 */
export function renderSlot<P>(children: SlotChildren<P>, payload: P): ReactNode {
  return typeof children === 'function' ? children(payload) : children
}

/**
 * children 里有没有真会画出东西的节点。
 *
 * Children.toArray 已经丢掉 null / undefined / 布尔，剩下的只要滤掉纯空白文本。
 * 拿它决定「作者给没给这段内容」：给了才补外层承载节点、才把名字改由它承担。
 */
export function slotPaints(children: ReactNode): boolean {
  return Children.toArray(children).some((node) => {
    if (typeof node === 'string')
      return node.trim() !== ''
    return true
  })
}
