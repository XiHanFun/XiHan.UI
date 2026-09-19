/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 定义 steps 类型契约。

import type { Direction, MachineSchema, Orientation, PropTypes, Size, Tone } from '@xihan-ui/core'

export interface StepsValueChangeDetails {
  /** 变化后的步序，恒在 [0, count] 内。 */
  value: number
}

/** 单步的状态，由步序计算；statuses 或 collection 可以逐步改写。出错 / 警示不是状态，是语气，使用 tones。 */
export type StepStatus = 'completed' | 'current' | 'incomplete'

/** 单步的数据。提供 collection 时，标题、说明、状态与禁用以它为准。 */
export interface StepNode {
  /** 标题文本。 */
  title?: string
  /** 说明文本。 */
  description?: string
  /** 覆盖该步的状态；未提供时由步序计算。 */
  status?: StepStatus
  /** 该步的语气：被驳回的写 danger、需要留意的写 warning；未提供时跟随整组的 tone。 */
  tone?: Tone
  /** 该步不可点击。 */
  disabled?: boolean
}

/** 单步的元信息，由 collection 推导，不含由步序计算的部分。 */
export interface StepNodeMeta {
  /** 第几步，0 起。 */
  index: number
  /** node.title ?? ''，恒为字符串。 */
  title: string
  /** 说明原样透传，未提供时为 undefined。 */
  description?: string
  /** 显式指定的状态，未提供时为 undefined。 */
  status?: StepStatus
  /** 显式指定的语气，未提供时为 undefined。 */
  tone?: Tone
  disabled: boolean
}

/**
 * 条目的声明：第几步（0 起）、作者是否标记为不可点击。
 * connect 在 Vue 的 render 期求值，此时 DOM 尚不存在，不得反查 DOM。
 * item 之下的 trigger / indicator / title / description / separator 共用这一份声明。
 */
export interface StepsItemProps {
  /** 第几步，0 起。 */
  index: number
  /** 作者声明该步不可点击（例如权限不足）。与 linear 的未解锁互相独立，任一命中即禁用。 */
  disabled?: boolean
}

/** 单步的呈现状态；自绘图标时按它取图案。 */
export interface StepsItemState {
  index: number
  status: StepStatus
  /** 该步自身的语气，未标记时为 undefined（跟随整组）。 */
  tone?: Tone
  /** 已走过：index < step。 */
  completed: boolean
  /** 正停在该步：index === step。 */
  current: boolean
  /** 不可点击：整组禁用、作者声明禁用、或 linear 下该步尚未解锁。 */
  disabled: boolean
}

export interface StepsSchema extends MachineSchema {
  props: {
    /** 当前步序（0 起）。提供即受控：内部不再自行修改，只发 onValueChange。 */
    value?: number
    /** 非受控初值，默认 0。 */
    defaultValue?: number
    /**
     * 步骤数据，标题、说明、状态与禁用的事实源。提供后 count 未提供时取它的长度。
     * 未提供时回到文本与状态都写在部件上的方式。
     */
    collection?: StepNode[]
    /** 按下标覆盖单步状态，优先于 collection 与步序计算出的档位。 */
    statuses?: Record<number, StepStatus>
    /**
     * 按下标给单步标记语气，优先于 collection；被驳回的步写 danger、需要留意的步写 warning。
     * 写为 item 的 data-tone，该步的标记、标题与连接线都改用这族颜色。
     */
    tones?: Record<number, Tone>
    /**
     * 总步数，是步序的上界与读屏「第 k 步，共 n 步」的分母。
     * 未提供时按 0 处理：此时 root 带 data-empty，步序被固定在 0。
     */
    count?: number
    /** 方向键轴向，默认 horizontal；不同轴的方向键放行给页面滚动与读屏。 */
    orientation?: Orientation
    /**
     * 线性模式：只能回到已走过的步。未解锁（index > step）的 trigger 一律禁用。
     * 只拦截跳转，goToNextStep 逐步前进照常可用。
     */
    linear?: boolean
    /** 整组不可交互：trigger 全部退出 Tab 序列，指针与键盘都不响应。 */
    disabled?: boolean
    /** 方向键到达末尾是否回绕，默认 false。 */
    loop?: boolean
    /** 文字方向，默认 ltr；只影响水平轴上 ArrowLeft / ArrowRight 的前后语义。 */
    dir?: Direction
    translations?: Partial<StepsTranslations>
    /** 语气：brand / neutral / success / warning / danger / info，决定使用哪族颜色。 */
    tone?: Tone
    /** 尺寸：sm / md / lg。 */
    size?: Size
    /** 步序变化意图回调；受控时是唯一出口，非受控时随内部写入一并通知。 */
    onValueChange?: (details: StepsValueChangeDetails) => void
  }
  context: {
    /** 当前步序。受控（value 提供）时 cell 直读 prop，写入只发 onValueChange 不修改内部值。 */
    value: number
    /** 焦点位于组内时的瞬态锚点，焦点离开组即清空。只服务 roving tabindex 与方向键起点。 */
    focusedStep: number | null
    /** 按压通道：Space / Enter 或触屏按住的那一步的下标，该 trigger 投影 data-pressed。抬起、失焦或指针取消即清空，与步序、焦点锚点无关。 */
    pressedStep: number | null
  }
  computed: Record<string, never>
  refs: Record<string, never>
  /** 步骤条没有阶段可分：步序存放在 context 的 cell 中，状态机只是它的写入口。 */
  state: 'idle'
  event:
    | { type: 'VALUE.SET', value: number }
    | { type: 'STEP.PREV' }
    | { type: 'STEP.NEXT' }
    | { type: 'TRIGGER.FOCUS', step: number }
    | { type: 'LIST.BLUR' }
    /** 某一步的 trigger 被 Space / Enter 或触屏按住；disabled 是该步自身的禁用事实（含 linear 未解锁），由 connect 判定后随事件带入。 */
    | { type: 'PRESS.START', step: number, disabled?: boolean }
    /** 按住的那一步抬起、失焦或指针取消；只松开 step 对应的那一个。 */
    | { type: 'PRESS.END', step: number }
  tag: never
  guard: 'canPress'
  action:
    | 'setValue'
    | 'goPrev'
    | 'goNext'
    | 'setFocusedStep'
    | 'clearFocusedStep'
    | 'startPress'
    | 'endPress'
    | 'releaseWhenInert'
  effect: never
}

export interface StepsApi<T extends PropTypes = PropTypes> {
  /** 当前步序，恒在 [0, count] 内：count 减小后停在越界步也能读到可用的值。 */
  value: number
  count: number
  /** 由 collection 推导的步骤元信息，按数据顺序排列；未提供 collection 时为空数组。 */
  collection: readonly StepNodeMeta[]
  /** 全部完成（value 到达 count）。此时没有任何一步是 current，作者据此渲染完成页。 */
  complete: boolean
  /** 焦点在组外时为 null。 */
  focusedStep: number | null
  getItemState: (props: StepsItemProps) => StepsItemState
  /**
   * 直接跳到某一步；越界会被夹回 [0, count]。
   * 不检查 linear：linear 只拦截界面上的跳转，不拦截作者的命令式调用。
   */
  setValue: (next: number) => void
  goToNextStep: () => void
  goToPrevStep: () => void
  getRootProps: () => T['element']
  getListProps: () => T['element']
  getItemProps: (props: StepsItemProps) => T['element']
  getTriggerProps: (props: StepsItemProps) => T['button']
  getIndicatorProps: (props: StepsItemProps) => T['element']
  getTitleProps: (props: StepsItemProps) => T['element']
  getDescriptionProps: (props: StepsItemProps) => T['element']
  getSeparatorProps: (props: StepsItemProps) => T['element']
  /** 面板按 index 与当前步配对；未命中的常驻并带 hidden。 */
  getContentProps: (props: StepsItemProps) => T['element']
}

/** 读屏文案，默认英文。 */
export interface StepsTranslations {
  /** 步骤列表容器的 aria-label，用于区分同页的多条步骤条。 */
  list: string
}
