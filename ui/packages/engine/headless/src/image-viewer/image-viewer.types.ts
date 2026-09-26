/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 定义 image viewer 类型契约。

import type { Cleanup, Layer, MachineSchema, OverlayBackdropVariant, OverlayCloseReason, PropTypes, RuntimeConfig } from '@xihan-ui/core'
import type { PresenceHandle } from '@xihan-ui/core/presence'
import type { SpringValue } from '@xihan-ui/motion'
import type { MultiPointerSession, PinchSnapshot, TrackedPoint } from '@xihan-ui/pointer'

/** 一张待查看的图片。 */
export interface ImageViewerItem {
  src: string
  /** 也是该图片在查看模式下的可及名。 */
  alt?: string
}

export interface ImageViewerTranslations {
  /** 对话框的可及名（当前图片没有 alt 时兜底）。 */
  content: string
  /** 工具条的可及名。它与对话框是两块不同的区域，共用一个名字时读屏无法区分所在位置。 */
  toolbar: string
  close: string
  zoomIn: string
  zoomOut: string
  rotateLeft: string
  rotateRight: string
  flipHorizontal: string
  flipVertical: string
  reset: string
  prev: string
  next: string
  /** counter 的文案；index 从 1 起，count 为总数。 */
  counter: (index: number, count: number) => string
}

/** 当前大图的加载相位：进入浮层与切换图片都从 loading 起算。 */
export type ImageViewerImageStatus = 'loading' | 'loaded' | 'error'

/** 按压通道里「正被按住的那一颗」：关闭钮、工具条七颗与两端翻页钮共用一台机器，按住的只能是其中一颗。 */
export type ImageViewerPressedPart
  = | 'close-trigger'
    | 'zoom-in-trigger'
    | 'zoom-out-trigger'
    | 'rotate-left-trigger'
    | 'rotate-right-trigger'
    | 'flip-horizontal-trigger'
    | 'flip-vertical-trigger'
    | 'reset-trigger'
    | 'prev-trigger'
    | 'next-trigger'

/** 当前图的变换：缩放、旋转（度）、翻转与平移（px）。 */
export interface ImageViewerTransform {
  scale: number
  rotate: number
  flipX: boolean
  flipY: boolean
  x: number
  y: number
}

// 适配器在挂载前填入 DOM 环境与元素 getter；纯逻辑测试下保持缺省（副作用不挂）。
export interface ImageViewerRefs {
  config: RuntimeConfig | null
  /** 注册本层并返回撤销句柄；只在展开期间调用，层不常驻栈。 */
  registerLayer: (() => { layer: Layer, dispose: Cleanup }) | null
  /** 视觉退场的租约真源；逻辑关闭后由它决定何时真正归还模态资源。 */
  presence: PresenceHandle | null
  getContentEl: () => HTMLElement | null
  /** 平移中的指针会话：起点与起始平移量；不在拖拽中时为 null。 */
  /** 单指平移的基准：按下时的指针位置与当时的偏移。 */
  panSession: { startX: number, startY: number, originX: number, originY: number } | null
  /** 跟随落在图片上的指针。open 期间存在，离开即移除。 */
  gesture: MultiPointerSession | null
  /**
   * 双指起始时的快照：两指几何，加上当时的缩放与位移。
   * 每一帧都相对它计算，不相对上一帧：相对上一帧会累积浮点误差。
   */
  pinchSession: { start: PinchSnapshot, scale: number, x: number, y: number } | null
  /** 松手后的平移弹簧（两轴各一支）：惯性滑行，或越出范围时硬弹簧回弹；落定、再按下或改变换时撤下。 */
  inertia: { x: SpringValue | null, y: SpringValue | null } | null
}

export interface ImageViewerOpenChangeDetails {
  open: boolean
  /**
   * 本次关闭的原因；展开时不带。
   * 用于区分用户主动取消与选完自动收起，前者常需要回滚草稿。
   */
  reason?: OverlayCloseReason
}

export interface ImageViewerIndexChangeDetails {
  /** 变化后的下标，恒在 [0, count - 1] 内。 */
  index: number
}

export interface ImageViewerSchema extends MachineSchema {
  props: {
    /** 图片清单。查看单张时提供长度 1 的数组。默认为空，此时打开也只有工具条与空视口。 */
    collection?: ImageViewerItem[]
    open?: boolean
    defaultOpen?: boolean
    /** 当前下标（0 起）。提供即受控：内部不再自行修改，只发 onIndexChange。 */
    index?: number
    /** 非受控初值，默认 0。 */
    defaultIndex?: number
    /** 前后翻页到头是否回绕，默认 true。 */
    loop?: boolean
    /** 缩放步长（加法），默认 0.5。 */
    zoomStep?: number
    /** 缩放下限，默认 0.25。 */
    minScale?: number
    /** 缩放上限，默认 8。 */
    maxScale?: number
    closeOnEscape?: boolean
    /** 点击遮罩（内容之外）关闭，默认 true。 */
    closeOnInteractOutside?: boolean
    restoreFocus?: boolean
    /** 遮罩形态：opaque / blur / transparent。写在 backdrop 上，只影响该层的底色与模糊。 */
    variant?: OverlayBackdropVariant
    translations?: Partial<ImageViewerTranslations>
    /** open 变化意图回调；受控时是唯一出口，非受控时随内部转移一并通知。 */
    onOpenChange?: (details: ImageViewerOpenChangeDetails) => void
    /** 下标变化意图回调；受控时是唯一出口，非受控时随内部写入一并通知。 */
    onIndexChange?: (details: ImageViewerIndexChangeDetails) => void
  }
  context: {
    /** 当前下标。受控（index 提供）时 cell 直读 prop，写入只发 onIndexChange 不修改内部值。 */
    index: number
    /** 当前图片的变换。切换图片与重新打开都归零。 */
    transform: ImageViewerTransform
    /** 正在拖拽平移。 */
    panning: boolean
    /** 松手后弹簧正在带着平移惯性滑行或回弹，投影 data-animating（样式层据此关掉过渡）。 */
    settling: boolean
    /** 当前大图的加载相位。切换图片与重新打开都回到 loading。 */
    imageStatus: ImageViewerImageStatus
    /**
     * 按压通道：Space / Enter 或触屏手指按下到松开之间正被按住的那颗按钮，该部件投影 data-pressed；
     * 没有按住时为 null。抬起、失焦、指针取消，浮层收起，或按住途中该按钮转为禁用时撤下。
     */
    pressed: ImageViewerPressedPart | null
  }
  computed: Record<string, never>
  refs: ImageViewerRefs
  state: 'open' | 'closed'
  event:
    | { type: 'OPEN' }
    | { type: 'CLOSE', src?: 'esc' | 'close-trigger' | 'interact-outside' }
    | { type: 'INDEX.SET', index: number }
    | { type: 'INDEX.NEXT' }
    | { type: 'INDEX.PREV' }
    /** delta 为加法步数：+1 放大一档、-1 缩小一档。 */
    | { type: 'ZOOM.BY', delta: number }
    | { type: 'ZOOM.SET', scale: number }
    /** delta 为度数，通常 ±90。 */
    | { type: 'ROTATE.BY', delta: number }
    | { type: 'FLIP', axis: 'x' | 'y' }
    | { type: 'TRANSFORM.RESET' }
    /** 大图自身派发的 DOM 事件，由 connect 挂在 image 上回送。 */
    | { type: 'IMAGE.LOAD' }
    | { type: 'IMAGE.ERROR' }
    /** 平移到绝对偏移（px），由视口的指针会话驱动。 */
    | { type: 'PAN.MOVE', x: number, y: number }
    /** 一根手指落在图片上。连接层只报告落点，是否跟随由会话管理。 */
    | { type: 'POINTERS.DOWN', pointerId: number, clientX: number, clientY: number }
    /** 触点移动或减少。一根是平移，两根是缩放，点数变化即重新记录基准。 */
    | { type: 'POINTERS.CHANGE', points: readonly TrackedPoint[] }
    /**
     * 最后一根手指离开。velocity 是它的松手速度（像素每秒），单指平移松手时按它惯性滑行；
     * canceled 表示被系统收走，这时不滑行，只把越出范围的平移收回来。
     */
    | { type: 'POINTERS.END', velocity?: { x: number, y: number }, canceled?: boolean }
    | { type: 'PAN.END' }
    // 受控回写：宿主改 open prop 后由 watch 派发，无条件跳转，不再通知
    | { type: 'CONTROLLED.OPEN' }
    | { type: 'CONTROLLED.CLOSE' }
    /**
     * 按压通道（shared/press）：某颗按钮被 Space / Enter 或触屏按住，part 说的是哪一颗；
     * 贴住缩放端点的缩放钮与到边界的翻页钮是原生 disabled，那份事实只有 connect 知道，随事件带给守卫。
     */
    | { type: 'PRESS.START', part: ImageViewerPressedPart, disabled?: boolean }
    /** 该按钮抬起、失焦或指针取消。 */
    | { type: 'PRESS.END', part: ImageViewerPressedPart }
  tag: never
  guard: 'isOpenControlled' | 'canPress'
  action:
    | 'invokeOnOpen'
    | 'invokeOnClose'
    | 'syncOpen'
    | 'setIndex'
    | 'goNext'
    | 'goPrev'
    | 'zoomBy'
    | 'panMove'
    | 'pointersDown'
    | 'pointersChange'
    | 'pointersEnd'
    | 'zoomTo'
    | 'rotateBy'
    | 'flip'
    | 'resetTransform'
    | 'panEnd'
    | 'resetImageStatus'
    | 'setImageLoaded'
    | 'setImageError'
    | 'startPress'
    | 'endPress'
    | 'releasePress'
    | 'releaseWhenInert'
  effect: 'trackOverlay' | 'trackPointers' | 'trackLiquid'
}

export interface ImageViewerApi<T extends PropTypes = PropTypes> {
  open: boolean
  /** 当前下标，恒在 [0, count - 1] 内；清单为空时为 0。 */
  index: number
  count: number
  /** 当前图片；清单为空时为 null。 */
  currentItem: ImageViewerItem | null
  transform: ImageViewerTransform
  /** 正在拖拽平移。 */
  panning: boolean
  /** 当前大图的加载相位；切换图片与重新打开都回到 loading。 */
  imageStatus: ImageViewerImageStatus
  /** 向前仍可翻页（loop 且多于一张时恒为 true）。 */
  canPrev: boolean
  canNext: boolean
  setOpen: (next: boolean) => void
  /** 直接跳到某一张；越界会被夹回 [0, count - 1]。切换图片时变换归零。 */
  setIndex: (next: number) => void
  next: () => void
  prev: () => void
  zoomIn: () => void
  zoomOut: () => void
  setScale: (scale: number) => void
  rotateLeft: () => void
  rotateRight: () => void
  flipHorizontal: () => void
  flipVertical: () => void
  /** 变换整体归零（缩放 / 旋转 / 翻转 / 平移）。 */
  reset: () => void
  getTriggerProps: () => T['button']
  getBackdropProps: () => T['element']
  getPositionerProps: () => T['element']
  getContentProps: () => T['element']
  getViewportProps: () => T['element']
  getImageProps: () => T['img']
  /**
   * 底部的控件带，放置缩放、旋转、翻转与归零按钮。
   *
   * 它报告 `role=group`：一组有名字的控件，每个按钮各占一个 Tab 位。
   * 不报告 `role=toolbar`：该角色承诺条内依靠方向键移动，而左右方向键与
   * Home/End 在这里是翻页；需要该移动方式时在这条带中放置一个 Toolbar 组件。
   */
  getToolbarProps: () => T['element']
  getZoomInTriggerProps: () => T['button']
  getZoomOutTriggerProps: () => T['button']
  getRotateLeftTriggerProps: () => T['button']
  getRotateRightTriggerProps: () => T['button']
  getFlipHorizontalTriggerProps: () => T['button']
  getFlipVerticalTriggerProps: () => T['button']
  getResetTriggerProps: () => T['button']
  getPrevTriggerProps: () => T['button']
  getNextTriggerProps: () => T['button']
  getCounterProps: () => T['element']
  getCloseTriggerProps: () => T['button']
}
