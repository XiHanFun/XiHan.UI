/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 定义 back top 类型契约。

import type { ActionVariant, MachineSchema, PropTypes, Size, Tone } from '@xihan-ui/core'

/** 滚回顶部的方式：auto 一步到位，smooth 平滑滚动。 */
export type BackTopBehavior = 'auto' | 'smooth'

export interface BackTopVisibilityChangeDetails {
  /** 按钮当前是否显示。 */
  visible: boolean
}

/** 读屏文案，默认英文。 */
export interface BackTopTranslations {
  /** 按钮的可及名。按钮内通常只有一个图标，名字只能由这里提供。 */
  trigger: string
}

/** 适配器在挂载前填入的 DOM 取值器。 */
export interface BackTopRefs {
  /** 滚动容器，返回 null 即整页滚动。 */
  getTargetEl: () => HTMLElement | null
}

export interface BackTopSchema extends MachineSchema {
  props: {
    /** 滚动超过该像素数后按钮才显示，默认 200。 */
    visibilityHeight?: number
    /** 滚回顶部的方式，默认 smooth。 */
    behavior?: BackTopBehavior
    translations?: Partial<BackTopTranslations>
    /** 形态：solid / subtle / outline / ghost，决定底色、描边与前景的使用方式。 */
    variant?: ActionVariant
    /** 语气：brand / neutral / success / warning / danger / info，决定按钮使用哪族颜色。 */
    tone?: Tone
    /** 尺寸：sm / md / lg。 */
    size?: Size
    /** 显隐变化时回调。 */
    onVisibilityChange?: (details: BackTopVisibilityChangeDetails) => void
  }
  context: Record<string, never>
  computed: Record<string, never>
  refs: BackTopRefs
  /** hidden 隐藏（滚动量未过线）；visible 显示。 */
  state: 'hidden' | 'visible'
  event:
    /** 观察器结算的一帧：按滚动量判断当前是否应显示。 */
    | { type: 'SCROLL.RESOLVE', visible: boolean }
    /** 点击了按钮。 */
    | { type: 'TRIGGER.CLICK' }
  tag: never
  guard: 'shouldShow' | 'shouldHide'
  action: 'scrollToTop' | 'invokeOnChange'
  effect: 'trackScroll'
}

export interface BackTopApi<T extends PropTypes = PropTypes> {
  /** 按钮当前是否显示。 */
  visible: boolean
  /** 程序化滚回顶部，与点击按钮走同一路径。 */
  scrollToTop: () => void
  getRootProps: () => T['element']
  getTriggerProps: () => T['button']
}
