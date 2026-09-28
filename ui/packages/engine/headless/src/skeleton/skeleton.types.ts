/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 定义 skeleton 类型契约。

import type { MachineSchema, PropTypes } from '@xihan-ui/core'

/** 骨架条的形状：一行文字、一个圆、一块矩形。 */
export type SkeletonShape = 'text' | 'circle' | 'rect'

/** 骨架条的动效档：扫光、呼吸、静止。 */
export type SkeletonAnimation = 'shimmer' | 'pulse' | 'none'

export interface SkeletonProps {
  /** 是否还在加载，默认 true。 */
  loading?: boolean
  /** 容器内骨架条的默认形状，默认 'text'。 */
  shape?: SkeletonShape
  /** 动效档，默认 'shimmer'；默认档不输出 data-animation。 */
  animation?: SkeletonAnimation
}

export interface SkeletonSchema extends MachineSchema {
  props: SkeletonProps
  context: {
    /**
     * 容器是否还留着（没有 hidden）。加载中为真；加载结束后等淡出播完才为假，期间 data-state 已是 loaded。
     * 挂载时就已加载完的，初值即为假：首帧直接收起，不播淡出。
     */
    rendered: boolean
  }
  computed: Record<string, never>
  refs: Record<string, never>
  state: 'idle'
  event:
    /** 容器留着与否（淡出播完才报 false）。 */
    | { type: 'ROOT.RENDERED', rendered: boolean }
  tag: never
  guard: never
  action: 'setRendered'
  effect: 'trackRootPresence' | 'trackExitOverlay'
}

/** 单根骨架条的声明。 */
export interface SkeletonItemProps {
  /** 该根的形状，覆盖容器提供的默认值。 */
  shape?: SkeletonShape
}

export interface SkeletonApi<T extends PropTypes = PropTypes> {
  /** 当前是否处于加载态。 */
  loading: boolean
  getRootProps: () => T['element']
  getItemProps: (item?: SkeletonItemProps) => T['element']
}

/** 读屏文案。本组件目前没有需要外露的文案，保留该位。 */
export interface SkeletonTranslations {}
