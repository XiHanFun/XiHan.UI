/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 环形布局：节点按分组聚在一起、等角排在一个圆上，组与组之间留一份空当；自 12 点方向顺时针。

import { invalidArgument } from '../../errors'

export interface CircularOptions {
  /** 圆心，缺省 [0, 0]。 */
  readonly center?: readonly [number, number]
  readonly radius: number
  /** 节点所在的分组：同组的节点排在一起，组按第一次出现的先后；缺省不分组。 */
  readonly group?: (index: number) => string | null | undefined
  /** 组与组之间的空当占几份节点间距，缺省 1。 */
  readonly groupGap?: number
}

export interface CircularPoint {
  readonly index: number
  readonly x: number
  readonly y: number
  /** 自 12 点方向顺时针的角度（弧度）。 */
  readonly angle: number
}

/** 排出 count 个节点在圆上的位置；返回按圆上次序排列的点，index 是节点的下标。 */
export function circular(count: number, options: CircularOptions): CircularPoint[] {
  if (!Number.isInteger(count) || count < 0)
    throw invalidArgument('节点数必须是非负整数', { count })
  if (!(options.radius >= 0))
    throw invalidArgument('环形布局的半径必须是非负数', { radius: options.radius })
  const [cx, cy] = options.center ?? [0, 0]
  const groups = new Map<string | null, number[]>()
  for (let i = 0; i < count; i++) {
    const g = options.group?.(i) ?? null
    const list = groups.get(g)
    if (list)
      list.push(i)
    else
      groups.set(g, [i])
  }
  const gap = groups.size > 1 ? Math.max(0, options.groupGap ?? 1) : 0
  const slots = count + gap * groups.size
  const step = slots > 0 ? (2 * Math.PI) / slots : 0
  const out: CircularPoint[] = []
  let at = 0
  for (const members of groups.values()) {
    for (const index of members) {
      const angle = at * step
      out.push({ index, x: cx + options.radius * Math.sin(angle), y: cy - options.radius * Math.cos(angle), angle })
      at += 1
    }
    at += gap
  }
  return out
}
