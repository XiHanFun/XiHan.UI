/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 定义 float button 类型契约。

import type { ActionVariant, Cleanup, Direction, Layer, MachineSchema, PropTypes, RuntimeConfig, Size, Tone } from '@xihan-ui/core'
import type { LiquidGoo } from '@xihan-ui/core/visual-environment'
import type { SpringValue } from '@xihan-ui/motion'
import type { CollapsibleOpenChangeDetails } from '../collapsible'

/**
 * 固定在视口的哪一角。
 * start / end 跟随书写方向，RTL 下自动切换到另一侧；上下两条边没有方向问题，直接写 top / bottom。
 */
export type FloatButtonPlacement = 'top-start' | 'top-end' | 'bottom-start' | 'bottom-end'

/** 展开动作组的方式：指针悬停，或点击。 */
export type FloatButtonExpandTrigger = 'hover' | 'click'

/**
 * 拖动松手后贴向哪里：inline 贴左右两边里离得近的那条，block 贴上下两边，
 * nearest 贴四条边里最近的那条，none 不贴、停在松手的地方。
 */
export type FloatButtonSnap = 'inline' | 'block' | 'nearest' | 'none'

/** 视口的四条边，跟随书写方向：inline-start 在 LTR 下是左边、RTL 下是右边；block-start 是上边。 */
export type FloatButtonEdge = 'inline-start' | 'inline-end' | 'block-start' | 'block-end'

/**
 * 贴在一条边上：ratio 是触发器中心沿这条边落在视口的哪个比例处（0 到 1）。
 * 左右两条边从上往下量，上下两条边从行首往行尾量；离两端不足 offset 时收回到 offset 处。
 * 按比例记，视口尺寸变了仍贴在同一条边、同一比例上，存起来下次打开照样成立。
 */
export interface FloatButtonEdgePosition {
  edge: FloatButtonEdge
  ratio: number
}

/** 停在视口里的一点：触发器左上角相对视口的像素坐标（物理方向，不随书写方向翻转）。 */
export interface FloatButtonPointPosition {
  x: number
  y: number
}

/** 位置：贴边位置或视口里的一点。 */
export type FloatButtonPosition = FloatButtonEdgePosition | FloatButtonPointPosition

export interface FloatButtonPositionChangeDetails {
  position: FloatButtonPosition
}

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

/**
 * 拖动与位置。位置由状态机持有：拖动途中跟手，松手后按 snap 贴边、弹簧落定才提交。
 * 不给 position / defaultPosition 时停在 placement 那一角，第一次拖动从那里起步。
 */
export interface FloatButtonPositionProps {
  /** 能否用指针拖着触发器移动，默认 false。按下后移动过激活距离才算拖动，不到这个距离仍是一次点按。 */
  draggable?: boolean
  /** 松手后贴向哪里，默认 inline（贴左右两边里近的那条）。 */
  snap?: FloatButtonSnap
  /** 位置。提供即受控：拖动只发 onPositionChange，宿主写回才落到新位置。 */
  position?: FloatButtonPosition
  /** 初始位置，例如 `{ edge: 'inline-end', ratio: 0.75 }`：贴右边（LTR）、中心在视口 75% 高处。 */
  defaultPosition?: FloatButtonPosition
}

/** 对外的回调。 */
export interface FloatButtonNotifiers {
  /** open 变化意图；受控时是唯一出口，非受控时随内部转移一并通知。 */
  onOpenChange?: (details: CollapsibleOpenChangeDetails) => void
  /**
   * 拖动落定后的新位置：贴边时给贴边位置（按比例，换个视口尺寸照样成立），snap 为 none 时给像素坐标。
   * 落定才通知一次，拖动途中不发；要记住位置就在这里存。
   */
  onPositionChange?: (details: FloatButtonPositionChangeDetails) => void
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

export type FloatButtonProps = FloatButtonDisclosureProps & FloatButtonPositionProps & FloatButtonNotifiers & FloatButtonAppearance

/** 液态档的色块组，以及展开时从触发器里分离、收起时融回的那几块（展开组里的动作）。 */
export interface FloatButtonLiquidGroup {
  goo: LiquidGoo
  items: () => readonly HTMLElement[]
}

/** 视口里的一点（物理像素）。 */
export interface FloatButtonPoint {
  x: number
  y: number
}

/** 一场拖动：按下那一刻量好的几何，之后每次移动都从这里算，不累计上一帧的误差。 */
export interface FloatButtonDrag {
  pointerId: number
  startX: number
  startY: number
  /** 按下时触发器左上角（落定途中按住则是弹簧此刻的位置）。 */
  origin: FloatButtonPoint
  /** 触发器边长。 */
  size: number
  /** 视口（包含块）的宽高，不含滚动条。 */
  width: number
  height: number
  /** 离视口四边至少留出的距离。 */
  gap: number
  rtl: boolean
  /** 移动过了激活距离、真正拖起来了。 */
  active: boolean
  root: HTMLElement
  session: { dispose: () => void }
}

/** 松手后两条轴各一支弹簧，带着松手速度把触发器送到贴边处。 */
export interface FloatButtonSettle {
  x: SpringValue
  y: SpringValue
}

/** 适配器只桥接所属 Document 的运行时、逻辑层登记与根节点；液态组由状态机自己挂上。 */
export interface FloatButtonRefs {
  config: RuntimeConfig | null
  registerLayer: ((input: Omit<Layer, 'id'>) => { layer: Layer, dispose: Cleanup }) | null
  getRootEl: () => HTMLElement | null
  liquidGroup: FloatButtonLiquidGroup | null
  drag: FloatButtonDrag | null
  settle: FloatButtonSettle | null
}

/** FloatButton 专用状态机：开合、禁用、位置与拖动和消解层资源都由 Headless 持有。 */
export interface FloatButtonSchema extends MachineSchema {
  props: FloatButtonDisclosureProps & FloatButtonPositionProps & FloatButtonNotifiers & Pick<FloatButtonAppearance, 'expandTrigger' | 'offset'>
  context: {
    /** 提交了的位置；null 表示还停在 placement 那一角。 */
    position: FloatButtonPosition | null
    /** 拖动与落定途中触发器左上角的位置（物理像素）；此时它压过提交了的位置。 */
    movingPoint: FloatButtonPoint | null
    /** 真正拖起来了（移动过激活距离），投影 data-dragging。 */
    dragging: boolean
    /** 刚拖完：浏览器补派的那次 click 不再开合。 */
    swallowClick: boolean
    /** 视口高度：停在一点时据此判断展开组朝上还是朝下长。服务端渲染时为 null。 */
    viewportHeight: number | null
    /**
     * 挂载时开着、还没收起过：这一段打开属于首帧，展开组投影 data-instant 直接呈现、不播进场。
     * 第一次收起时清掉，之后的每一次打开照常进场。
     */
    openedAtMount: boolean
    /** 触发器正被按住：Space / Enter 或触屏手指按下到松开之间，投影 data-pressed。指针按住由 :active 表出。 */
    pressed: boolean
    /** 液态档收起后动作正融回触发器：展开组留在原处、不可交互，融回落定才藏起来。 */
    merging: boolean
  }
  computed: Record<string, never>
  refs: FloatButtonRefs
  state: 'open' | 'closed'
  event:
    | { type: 'OPEN' }
    | { type: 'CLOSE', src?: 'hover' | 'esc' | 'interact-outside' | 'programmatic' | 'drag' }
    | { type: 'TOGGLE' }
    | { type: 'DISABLE' }
    | { type: 'CONTROLLED.OPEN' }
    | { type: 'CONTROLLED.CLOSE' }
    // 按压通道（shared/press）：Space / Enter 或触屏按住与松开
    | { type: 'PRESS.START' }
    | { type: 'PRESS.END' }
    // 拖动：按下先不算，移动过激活距离才接管；松手带着两条轴的速度
    | { type: 'DRAG.START', pointerId: number, clientX: number, clientY: number }
    | { type: 'DRAG.MOVE', clientX: number, clientY: number }
    | { type: 'DRAG.END', velocityX: number, velocityY: number, canceled: boolean }
    | { type: 'CLICK.SWALLOW' }
    | { type: 'VIEWPORT.RESIZE', height: number }
  tag: never
  guard:
    | 'isDisabled'
    | 'isOpenControlled'
    | 'canPress'
    | 'canDrag'
  action:
    | 'invokeOnOpen'
    | 'invokeOnClose'
    | 'syncOpen'
    | 'syncDisabled'
    | 'startPress'
    | 'endPress'
    | 'releaseWhenInert'
    | 'startMerge'
    | 'endMerge'
    | 'clearOpenedAtMount'
    | 'armDrag'
    | 'moveDrag'
    | 'endDrag'
    | 'clearSwallowClick'
    | 'setViewportHeight'
  effect: 'trackLayer' | 'trackLiquid' | 'trackLiquidGroup' | 'trackListExit' | 'trackViewport'
}

export interface FloatButtonApi<T extends PropTypes = PropTypes> {
  /** 展开的动作组当前是否显示。 */
  open: boolean
  setOpen: (next: boolean) => void
  /** 提交了的位置；null 表示停在 placement 那一角。 */
  position: FloatButtonPosition | null
  /** 改位置：受控时只发 onPositionChange。 */
  setPosition: (next: FloatButtonPosition) => void
  /** 正被拖着。 */
  dragging: boolean
  getRootProps: () => T['element']
  getTriggerProps: () => T['button']
  getListProps: () => T['element']
}
