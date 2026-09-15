/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 定义 affix 类型契约。

import type { MachineSchema, PropTypes } from '@xihan-ui/core'

/** 吸附时贴靠可视区的边。 */
export type AffixSide = 'top' | 'bottom'

export interface AffixChangeDetails {
  /** 当前是否处于吸附状态。 */
  affixed: boolean
}

/**
 * 吸附时 content 的落位，单位 px，参照窗口视口。
 * 四个数值都是实测物理量，不换算为逻辑属性：它们按 root 的矩形计算，换成起始缘会在 RTL 下贴反。
 */
export interface AffixPin {
  /** 贴靠上边还是下边。 */
  side: AffixSide
  /** 距该边的距离。 */
  offset: number
  /** 左边缘的位置。 */
  left: number
  /** 宽度，取 root 的实测值；脱离常规流后不再由父级撑开。 */
  width: number
}

/** 占位盒需要撑起的尺寸，单位 px。 */
export interface AffixSize {
  width: number
  height: number
}

/** 适配器在挂载前填入的 DOM 取值器。 */
export interface AffixRefs {
  /** 占位盒节点：判定线与占位尺寸都由它测量。 */
  getRootEl: () => HTMLElement | null
  /** 滚动容器，返回 null 即整页滚动。 */
  getTargetEl: () => HTMLElement | null
}

export interface AffixSchema extends MachineSchema {
  props: {
    /** 吸附后距滚动容器可视区上边的距离（px）。 */
    offsetTop?: number
    /** 吸附后距滚动容器可视区下边的距离（px）；提供后改为贴靠下边。 */
    offsetBottom?: number
    /** 吸附状态变化回调。 */
    onAffixChange?: (details: AffixChangeDetails) => void
  }
  context: {
    /** 吸附时 content 的落位；未吸附时为 null。 */
    pin: AffixPin | null
    /** 占位尺寸；尚未测量时为 null。 */
    placeholder: AffixSize | null
  }
  computed: Record<string, never>
  refs: AffixRefs
  /** released 处于常规流；affixed 已脱离常规流固定在可视区边缘。 */
  state: 'released' | 'affixed'
  event:
    /** 观察器结算的一帧：是否应吸附、吸附位置、占位盒尺寸。 */
    | { type: 'SCROLL.RESOLVE', affixed: boolean, pin: AffixPin | null, placeholder: AffixSize | null }
  tag: never
  guard: 'shouldAffix' | 'shouldRelease'
  action: 'applyGeometry' | 'invokeOnChange'
  effect: 'trackScroll'
}

export interface AffixApi<T extends PropTypes = PropTypes> {
  /** 当前是否处于吸附状态。 */
  affixed: boolean
  getRootProps: () => T['element']
  getContentProps: () => T['element']
}

/** 读屏文案。本组件目前没有需要外露的文案，保留该位。 */
export interface AffixTranslations {}
