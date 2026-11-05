/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 自绘滚动条的两份入参类型：use-scrollbars 与 scrollbar-bars 都要用，单独成文件，两边互不回引。

import type { Orientation } from '@xihan-ui/core'
import type { ScrollbarAnchor, ScrollbarSchema } from '@xihan-ui/headless'

/** 交给滚动条的 props。轴由 axes 决定、让位按实测溢出计算，两者都不从外部接收。 */
export type ScrollbarsProps = Omit<ScrollbarSchema['props'], 'orientation' | 'gutter' | 'anchor'>

export interface ScrollbarsOptions {
  /**
   * 真正在滚动的层。接收 getter 而不是节点：ref 挂载后才有值，
   * 多档互斥的宿主（同一个位置有两个可能的滚动层）在这里返回当前生效的那个。
   */
  scrollable: () => HTMLElement | null
  /** 排布哪几条轴，默认只排竖向。首帧确定之后不再变化。 */
  axes?: readonly Orientation[]
  /**
   * 条子贴在壳边（shell，默认）还是贴在滚动层自己的盒子上（layer）。
   * layer 要求壳是滚动层的定位祖先，条子渲染在该层之后、仍是壳的子节点；首帧确定之后不再变化。
   */
  anchor?: ScrollbarAnchor
  /** 显示时机、尺寸档、方向等，逐帧现读。 */
  props?: () => ScrollbarsProps
}
