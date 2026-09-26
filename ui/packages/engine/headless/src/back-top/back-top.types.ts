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
    /** 形态：solid / subtle / outline / ghost，默认 outline（缺省中性，描边 + 磨砂面；solid 才品牌实心）。 */
    variant?: ActionVariant
    /** 语气：brand / neutral / success / warning / danger / info，决定按钮使用哪族颜色。 */
    tone?: Tone
    /** 尺寸：sm / md / lg，默认 md；触发器走 Action Control floating 档（40 / 48 / 56px）。 */
    size?: Size
    /** 显隐变化时回调。 */
    onVisibilityChange?: (details: BackTopVisibilityChangeDetails) => void
  }
  context: {
    /** 触发器正被按住：Space / Enter 或触屏手指按下到松开之间，投影 data-pressed。指针按住由 :active 表出。 */
    pressed: boolean
    /**
     * 按钮是否还留着（根上没有 hidden）。露面时立即为真；收起时等按钮的退场动画播完才为假，
     * 期间 data-state 已经是 hidden、退场动画在播。
     */
    triggerRendered: boolean
  }
  computed: Record<string, never>
  refs: BackTopRefs
  /** hidden 隐藏（滚动量未过线）；visible 显示。 */
  state: 'hidden' | 'visible'
  event:
    /** 观察器结算的一帧：按滚动量判断当前是否应显示。 */
    | { type: 'SCROLL.RESOLVE', visible: boolean }
    /** 点击了按钮。 */
    | { type: 'TRIGGER.CLICK' }
    // 按压通道（shared/press）：Space / Enter 或触屏按住与松开
    | { type: 'PRESS.START' }
    | { type: 'PRESS.END' }
    /** 按钮的进退场报来「该不该留着」。 */
    | { type: 'TRIGGER.RENDERED', rendered: boolean }
  tag: never
  guard: 'shouldShow' | 'shouldHide'
  action: 'scrollToTop' | 'invokeOnChange' | 'startPress' | 'endPress' | 'setTriggerRendered'
  effect: 'trackScroll' | 'trackLiquid' | 'trackTriggerPresence'
}

export interface BackTopApi<T extends PropTypes = PropTypes> {
  /** 按钮当前是否显示。 */
  visible: boolean
  /** 程序化滚回顶部，与点击按钮走同一路径。 */
  scrollToTop: () => void
  getRootProps: () => T['element']
  getTriggerProps: () => T['button']
}
