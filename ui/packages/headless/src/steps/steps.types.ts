import type { Direction, Orientation, PropTypes } from '@xihan-ui/core'
import type { MachineSchema } from '@xihan-ui/machine'

export interface StepsStepChangeDetails {
  /** 变化后的步序，恒在 [0, count] 内。 */
  step: number
}

/** 单步的三态。completed 在前、incomplete 在后，正是走过的方向。 */
export type StepStatus = 'completed' | 'current' | 'incomplete'

/**
 * 条目自报家门：这是第几步（0 起）、作者有没有把它标成不可点。
 * connect 因此是 (context, 本条目声明) 的纯函数，不反查 DOM——
 * Vue 侧 connect 在 render 期求值（本帧 DOM 还不存在），WC 侧在 updated 后求值（DOM 已就位），
 * 连接期读 DOM 会让两个适配器的首帧快照分叉。
 *
 * item 之下的 trigger / indicator / title / description / separator 全部共用这一份声明：
 * 它们描述的是同一步，各自再报一遍只会给出两个可能对不上的答案。
 */
export interface StepsItemProps {
  /** 第几步，0 起。 */
  index: number
  /** 作者自报这一步不可点（比如权限不足）。与 linear 的未解锁互相独立，任一命中即禁用。 */
  disabled?: boolean
}

/** 单步的呈现状态。作者要自绘图标（对勾 / 序号 / 圆点）时按它取图案，不必自己比大小。 */
export interface StepsItemState {
  index: number
  status: StepStatus
  /** 走过了：index < step。 */
  completed: boolean
  /** 正停在这一步：index === step。 */
  current: boolean
  /** 点不动：整组禁用、作者自报禁用、或 linear 下这一步还没解锁。 */
  disabled: boolean
}

export interface StepsSchema extends MachineSchema {
  props: {
    /** 当前步序（0 起）。给定即受控：内部不再自改，只发 onStepChange。 */
    step?: number
    /** 非受控初值，默认 0。 */
    defaultStep?: number
    /**
     * 总步数。作者渲染几个 item 就给几，必填——它是步序的上界，也是读屏"第 k 步，共 n 步"的分母。
     * 缺省按 0 处理：此时 root 带 data-empty，步序被夹死在 0。
     */
    count?: number
    /** 方向键轴向，默认 horizontal；不同轴的方向键放行给页面滚动与读屏。 */
    orientation?: Orientation
    /**
     * 线性模式：只能回头看走过的步，跳不到还没走到的步。
     * 未解锁（index > step）的 trigger 一律禁用，点击与方向键都不认。
     * 它只管"跳"，不管"走"——goToNextStep 逐步前进照常可用。
     */
    linear?: boolean
    /** 整组不可交互：trigger 全部退出 Tab 序列，指针与键盘都不认。 */
    disabled?: boolean
    /** 文字方向，默认 ltr；只影响水平轴上 ArrowLeft/ArrowRight 的前后语义。 */
    dir?: Direction
    /** 步序变化意图回调；受控时是唯一出口，非受控随内部写入一并通知。 */
    onStepChange?: (details: StepsStepChangeDetails) => void
  }
  context: {
    /** 当前步序。受控（step 给定）时 cell 直读 prop，写只发 onStepChange 不改内部值。 */
    step: number
    /** 焦点位于组内时的瞬态锚点，焦点离组即清空。只服务 roving tabindex 与方向键起点。 */
    focusedStep: number | null
  }
  computed: Record<string, never>
  refs: Record<string, never>
  /** 步骤条没有阶段可分：步序住在 context 的 cell 里，机器只是它的写入口。 */
  state: 'idle'
  event:
    | { type: 'STEP.SET', step: number }
    | { type: 'STEP.PREV' }
    | { type: 'STEP.NEXT' }
    | { type: 'TRIGGER.FOCUS', step: number }
    | { type: 'LIST.BLUR' }
  tag: never
  guard: never
  action: 'setStep' | 'goPrev' | 'goNext' | 'setFocusedStep' | 'clearFocusedStep'
  effect: never
}

export interface StepsApi<T extends PropTypes = PropTypes> {
  /** 当前步序，恒在 [0, count] 内：count 变小后停在越界步也读得到一个可用的值。 */
  step: number
  count: number
  /** 全部走完（step 走到 count）。此时没有任何一步是 current，作者据此渲染完成页。 */
  complete: boolean
  /** 焦点在组外时为 null。 */
  focusedStep: number | null
  getItemState: (props: StepsItemProps) => StepsItemState
  /**
   * 直接跳到某一步；越界会被夹回 [0, count]。
   * 刻意不认 linear：linear 拦的是用户在界面上乱跳，作者自己的代码（表单校验通过后放行）
   * 不该被同一道锁挡住——真要拦，作者手上有 step 与 complete，判起来比这里更清楚。
   */
  setStep: (next: number) => void
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
  /** 面板按 index 与当前步配对；未命中的常挂并带 hidden。 */
  getContentProps: (props: StepsItemProps) => T['element']
}
