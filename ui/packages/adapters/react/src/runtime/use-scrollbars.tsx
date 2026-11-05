/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 use scrollbars 相关实现。

import type { ReactNode } from 'react'
import type { BarRegistry } from './scrollbar-bars'
import type { ScrollbarsOptions } from './scrollbars-types'
import { useRef } from 'react'
import { useReactScope } from './react-id'
import { createRegistry, measureBars, renderBars } from './scrollbar-bars'

// 给已有滚动层配一套自绘滚动条。
//
// 条子是滚动层的兄弟，挂在组件既有的壳上（浮层族是 positioner，其余是 root）：
// 壳是定位盒，条子绝对定位贴它的内边距盒，不占布局、不进滚动层内部、不搬去别处。
// 多个滚动层并排共用一个壳（级联的列、时间列）时取 anchor: 'layer'：每层各自调一次本 hook，
// 条子紧跟在该层后面渲染、按层在壳内的偏移盒定位。
// 宿主只交「谁在滚」与「摆哪几条轴」，节点形状与机器接线都在这里，宿主那侧只有一行 render。

export type { ScrollbarsOptions, ScrollbarsProps } from './scrollbars-types'

export interface ScrollbarsHandle {
  /** 滚动条的节点，宿主把它拼接到外壳子节点的末尾。 */
  render: () => ReactNode[]
  /** 重新测量各条轴的尺寸。 */
  measure: () => void
}

/**
 * 滚动条的节点与状态机接线。
 *
 * axes 按首帧的值排定：每条轴一台状态机，轴数变化会使 hook 的调用顺序随之变化。
 * 浮层里的滚动层用 useOverlayScrollbars：同形，实现到第一次呈现时才加载。
 */
export function useScrollbars(options: ScrollbarsOptions): ScrollbarsHandle {
  const scope = useReactScope()
  const latest = useRef(options)
  latest.current = options
  const registry = useRef<BarRegistry | null>(null)
  registry.current ??= createRegistry(scope, () => latest.current)
  const reg = registry.current

  return {
    render: () => renderBars(reg),
    measure: () => measureBars(reg),
  }
}
