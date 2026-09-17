/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 定义 float button 类型契约。

import type { ActionVariant, Cleanup, Direction, Layer, MachineSchema, PropTypes, RuntimeConfig, Size, Tone } from '@xihan-ui/core'
import type { CollapsibleOpenChangeDetails } from '../collapsible'

/**
 * 固定在视口的哪一角。
 * start / end 跟随书写方向，RTL 下自动切换到另一侧；上下两条边没有方向问题，直接写 top / bottom。
 */
export type FloatButtonPlacement = 'top-start' | 'top-end' | 'bottom-start' | 'bottom-end'

/** 展开动作组的方式：指针悬停，或点击。 */
export type FloatButtonExpandTrigger = 'hover' | 'click'

/** 读屏文案，默认英文。 */
export interface FloatButtonTranslations {
  /** 触发器的可及名。其中通常只有一个图标，名字只能由这里提供。 */
  trigger: string
}

/** 开合状态；视觉轴不进入状态机。 */
export interface FloatButtonDisclosureProps {
  open?: boolean
  defaultOpen?: boolean
  disabled?: boolean
  /** 文字方向，只作用于排版；作者未提供时不写入。 */
  dir?: Direction
}

/** 对外的回调。 */
export interface FloatButtonNotifiers {
  /** open 变化意图；受控时是唯一出口，非受控时随内部转移一并通知。 */
  onOpenChange?: (details: CollapsibleOpenChangeDetails) => void
}

/** 落位与外形，不进入状态机：它们不改变开合，只决定固定位置、外观与展开方式。 */
export interface FloatButtonAppearance {
  /** 固定在哪一角，默认 bottom-end。 */
  placement?: FloatButtonPlacement
  /** 距两条边的距离（px），默认 24。 */
  offset?: number
  /** 展开方式，默认 click。 */
  expandTrigger?: FloatButtonExpandTrigger
  /** 变体：solid / subtle / outline / ghost，默认 outline（缺省中性，描边 + 磨砂面；solid 才品牌实心）。 */
  variant?: ActionVariant
  /** 颜色：brand / neutral / success / warning / danger / info。 */
  tone?: Tone
  /** 尺寸：sm / md / lg，默认与 lg 同档：悬浮按钮需要易于触达，起始即比行内按钮大一档。 */
  size?: Size
  translations?: Partial<FloatButtonTranslations>
}

export type FloatButtonProps = FloatButtonDisclosureProps & FloatButtonNotifiers & FloatButtonAppearance

/** 适配器只桥接所属 Document 的运行时、逻辑层登记与根节点。 */
export interface FloatButtonRefs {
  config: RuntimeConfig | null
  registerLayer: ((input: Omit<Layer, 'id'>) => { layer: Layer, dispose: Cleanup }) | null
  getRootEl: () => HTMLElement | null
}

/** FloatButton 专用状态机：开合、禁用和消解层资源都由 Headless 持有。 */
export interface FloatButtonSchema extends MachineSchema {
  props: FloatButtonDisclosureProps & FloatButtonNotifiers & Pick<FloatButtonAppearance, 'expandTrigger'>
  context: {
    /** 触发器正被按住：Space / Enter 或触屏手指按下到松开之间，投影 data-pressed。指针按住由 :active 表出。 */
    pressed: boolean
  }
  computed: Record<string, never>
  refs: FloatButtonRefs
  state: 'open' | 'closed'
  event:
    | { type: 'OPEN' }
    | { type: 'CLOSE', src?: 'hover' | 'esc' | 'interact-outside' | 'programmatic' }
    | { type: 'TOGGLE' }
    | { type: 'DISABLE' }
    | { type: 'CONTROLLED.OPEN' }
    | { type: 'CONTROLLED.CLOSE' }
    // 按压通道（shared/press）：Space / Enter 或触屏按住与松开
    | { type: 'PRESS.START' }
    | { type: 'PRESS.END' }
  tag: never
  guard:
    | 'isDisabled'
    | 'isOpenControlled'
    | 'canPress'
  action:
    | 'invokeOnOpen'
    | 'invokeOnClose'
    | 'syncOpen'
    | 'syncDisabled'
    | 'startPress'
    | 'endPress'
    | 'releaseWhenInert'
  effect: 'trackLayer'
}

export interface FloatButtonApi<T extends PropTypes = PropTypes> {
  /** 展开的动作组当前是否显示。 */
  open: boolean
  setOpen: (next: boolean) => void
  getRootProps: () => T['element']
  getTriggerProps: () => T['button']
  getListProps: () => T['element']
}
