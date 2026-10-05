/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 一个角色节点同时接两份 connect 产出：自己组件的那份（带解剖），再合进另一个部件的接线。
//
// 与 Vue / React 的 asChild 同一套合并，三端落到节点上的属性因此逐字一样：
// - 部件那份的解剖标记（data-scope、data-part、data-variant、data-xh-*）与挂载类让位给节点自己的解剖；
//   class 两份拼起来，部件那份去掉挂载类（xh-scope-*）；
// - 其余普通值部件说了算（id 与 aria 接线是部件的身份）；
// - 同名处理器节点自己的先跑，它 preventDefault 了，部件的就不跑。

import { isEventHandlerKey, stripScopeClass } from '@xihan-ui/core'

/** 解剖两位、家族标记与随视觉盒走的形态轴。 */
function isRoleMarker(key: string): boolean {
  return key === 'data-scope' || key === 'data-part' || key === 'data-variant' || key.startsWith('data-xh-')
}

/** onKeyDown 与 onKeydown 落到同一个事件上，合并前归成一种写法。 */
function eventKey(key: string): string {
  return `on${key[2]}${key.slice(3).toLowerCase()}`
}

type Handler = (event: Event) => void

/**
 * @param part 合进来的部件接线（例如菜单触发器的属性）
 * @param own 节点自己组件的那份属性
 * @returns 一份属性，交给 spreader 一次铺上
 */
export function mergeAsChildProps(part: Record<string, unknown>, own: Record<string, unknown>): Record<string, unknown> {
  const merged: Record<string, unknown> = {}
  const handlers = new Map<string, { own?: Handler, part?: Handler }>()
  const collect = (key: string, value: unknown, side: 'own' | 'part'): void => {
    const name = eventKey(key)
    const slot = handlers.get(name) ?? {}
    if (typeof value === 'function')
      slot[side] = value as Handler
    handlers.set(name, slot)
  }
  for (const [key, value] of Object.entries(own)) {
    if (isEventHandlerKey(key))
      collect(key, value, 'own')
    else
      merged[key] = value
  }
  for (const [key, value] of Object.entries(part)) {
    if (isRoleMarker(key))
      continue
    if (key === 'class') {
      const extra = typeof value === 'string' ? stripScopeClass(value) : ''
      if (extra)
        merged.class = typeof merged.class === 'string' && merged.class ? `${merged.class} ${extra}` : extra
      continue
    }
    if (isEventHandlerKey(key))
      collect(key, value, 'part')
    else
      merged[key] = value
  }
  for (const [name, { own: first, part: second }] of handlers) {
    if (first && second) {
      merged[name] = (event: Event) => {
        first(event)
        if (!event.defaultPrevented)
          second(event)
      }
    }
    else {
      merged[name] = first ?? second
    }
  }
  return merged
}
