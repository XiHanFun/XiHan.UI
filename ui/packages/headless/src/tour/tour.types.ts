import type { Cleanup, Layer, Placement, PositionEnginePort, PositionResult, PropTypes, RuntimeConfig } from '@xihan-ui/core'
import type { MachineSchema } from '@xihan-ui/machine'

/** 一步引导的声明。整份清单由作者给出，组件只按下标取用，不反查 DOM。 */
export interface TourStep {
  /** 稳定标识，写进 data-step-id；作者据此对号入座（埋点、按步定制渲染）。 */
  id: string
  /**
   * 高亮目标的 CSS 选择器。null / 省略 / 查不到节点都视为"这一步不锚定任何元素"：
   * 浮层居中、不画高亮框、不出箭头——开场白与收尾页就是这个形态。
   */
  target?: string | null
  title?: string
  description?: string
  /** 这一步的首选放置位；缺省沿用整份引导的 placement。 */
  placement?: Placement
}

export interface TourTranslations {
  close: string
  /** progress-text 的文案；step 从 1 起，count 为总步数。 */
  progress: (step: number, count: number) => string
}

/** 高亮框的几何，视口坐标，已经含进 spotlightPadding。 */
export interface TourSpotlightRect {
  x: number
  y: number
  width: number
  height: number
}

// 适配器在挂载前填入 DOM 环境、定位引擎与元素 getter；纯逻辑测试与 SSR 下保持缺省，
// 此时副作用一律短路（机器状态照常转移，只是不定位、不量高亮框、不挂消解层与焦点域）。
export interface TourRefs {
  config: RuntimeConfig | null
  /** 注册本层并返回撤销句柄；只在展开期间调用，层不常驻栈。 */
  registerLayer: (() => { layer: Layer, dispose: Cleanup }) | null
  /** 浮层定位引擎；缺省即不产出位置结果。 */
  position: PositionEnginePort | null
  /** 被定位的浮层容器，通常是 positioner。 */
  getFloatingEl: () => HTMLElement | null
  /** 焦点域容器与消解层节点。 */
  getContentEl: () => HTMLElement | null
  /**
   * 换锚点的入口，由展开态的定位效应装上、退出时卸掉。
   * 步序变了要把引擎从上一步的目标上摘下来重挂——留着旧订阅就是两套坐标轮流写。
   */
  reanchor: (() => void) | null
}

export interface TourStepChangeDetails {
  /** 变化后的步序，恒在 [0, count - 1] 内。 */
  step: number
}

export interface TourOpenChangeDetails {
  open: boolean
}

export interface TourCompleteDetails {
  /** 走完的最后一步的步序。 */
  step: number
}

export interface TourSkipDetails {
  /** 用户放弃时停在的步序。 */
  step: number
}

export interface TourSchema extends MachineSchema {
  props: {
    /** 步骤清单。它同时是步序的上界与读屏"第 m 步，共 n 步"的分母。 */
    steps?: TourStep[]
    /** 当前步序（0 起）。给定即受控：内部不再自改，只发 onStepChange。 */
    step?: number
    /** 非受控初值，默认 0。 */
    defaultStep?: number
    open?: boolean
    defaultOpen?: boolean
    /** 整份引导的首选放置位，默认 bottom；单步可用自己的 placement 覆盖。 */
    placement?: Placement
    /** 浮层与目标的间距（px）。 */
    offset?: number
    closeOnEscape?: boolean
    /**
     * 层外交互关闭，默认 false。
     * 与浮层类组件刻意相反：引导是一条有始有终的流程，点一下页面别处就整条没了，
     * 用户既回不去也不知道发生了什么——要退出得走 skip 或 close 这两个明确出口。
     */
    closeOnInteractOutside?: boolean
    /** 画遮罩，默认 true。 */
    showBackdrop?: boolean
    /** 高亮框在目标四周留出的空白（px），默认 8。 */
    spotlightPadding?: number
    translations?: Partial<TourTranslations>
    /** 步序变化意图回调；受控时是唯一出口，非受控随内部写入一并通知。 */
    onStepChange?: (details: TourStepChangeDetails) => void
    /** open 变化意图回调；受控时是唯一出口，非受控时随内部转移一并通知。 */
    onOpenChange?: (details: TourOpenChangeDetails) => void
    /** 末步再按"下一步"：先发它，再按 onOpenChange 关闭。 */
    onComplete?: (details: TourCompleteDetails) => void
    /** 用户主动放弃（skip-trigger 或 Escape）：先发它，再按 onOpenChange 关闭。 */
    onSkip?: (details: TourSkipDetails) => void
  }
  context: {
    /** 当前步序。受控（step 给定）时 cell 直读 prop，写只发 onStepChange 不改内部值。 */
    step: number
    /** 定位引擎回填的最新结果；connect 只读它，不碰 DOM 也不调引擎。 */
    position: PositionResult | null
    /** 高亮框几何，由效应量出来写进来；居中步与收起态恒为 null。 */
    spotlight: TourSpotlightRect | null
  }
  computed: Record<string, never>
  refs: TourRefs
  state: 'open' | 'closed'
  event:
    | { type: 'OPEN' }
    | { type: 'CLOSE', src?: 'esc' | 'close-trigger' | 'interact-outside' | 'complete' | 'skip' }
    | { type: 'STEP.SET', step: number }
    | { type: 'STEP.PREV' }
    | { type: 'STEP.NEXT' }
    | { type: 'SKIP' }
    // 受控回写：宿主改 open prop 后由 watch 派发，无条件跳转，不再通知
    | { type: 'CONTROLLED.OPEN' }
    | { type: 'CONTROLLED.CLOSE' }
  tag: never
  guard: 'isOpenControlled' | 'isLastStep' | 'isLastStepOpenControlled'
  action:
    | 'invokeOnOpen'
    | 'invokeOnClose'
    | 'invokeOnComplete'
    | 'invokeOnSkip'
    | 'syncOpen'
    | 'setStep'
    | 'goPrev'
    | 'goNext'
    | 'measureSpotlight'
    | 'reanchorPosition'
    | 'clearGeometry'
  effect: 'trackPosition' | 'trackSpotlight' | 'trackLayer'
}

export interface TourApi<T extends PropTypes = PropTypes> {
  open: boolean
  /** 当前步序，恒在 [0, count - 1] 内；清单为空时为 0。 */
  step: number
  count: number
  /** 当前步的声明；清单为空时为 null。 */
  currentStep: TourStep | null
  /** 停在首步：上一步按钮据此禁用。 */
  firstStep: boolean
  /** 停在末步：下一步按钮据此改文案（"完成"）。 */
  lastStep: boolean
  /** 这一步锚定了页面元素：居中步为 false，此时不画高亮框也不出箭头。 */
  anchored: boolean
  /** "第 m 步，共 n 步"。作者没写 progress-text 的内容时由适配器填上。 */
  progressText: string
  setOpen: (next: boolean) => void
  /** 直接跳到某一步；越界会被夹回 [0, count - 1]。 */
  setStep: (next: number) => void
  /** 末步再走一步 = 完成：先发 onComplete，再关闭。 */
  goToNextStep: () => void
  goToPrevStep: () => void
  /** 放弃引导：先发 onSkip，再关闭。 */
  skip: () => void
  getRootProps: () => T['element']
  getBackdropProps: () => T['element']
  getSpotlightProps: () => T['element']
  getPositionerProps: () => T['element']
  getContentProps: () => T['element']
  getTitleProps: () => T['element']
  getDescriptionProps: () => T['element']
  getProgressTextProps: () => T['element']
  getPrevTriggerProps: () => T['button']
  getNextTriggerProps: () => T['button']
  getSkipTriggerProps: () => T['button']
  getCloseTriggerProps: () => T['button']
  getArrowProps: () => T['element']
}
