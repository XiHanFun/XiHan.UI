import type { Cleanup, Layer, OverlayCloseReason, PropTypes, RuntimeConfig } from '@xihan-ui/kernel'
import type { MachineSchema } from '@xihan-ui/machine'

/** 一张待看的图。 */
export interface ImageViewerItem {
  src: string
  /** 也是这张图在看片模式下的可及名。 */
  alt?: string
}

export interface ImageViewerTranslations {
  /** 对话框的可及名（当前图没有 alt 时兜底）。 */
  content: string
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
  getContentEl: () => HTMLElement | null
  /** 平移中的指针会话：起点与起始平移量；不在拖拽中为 null。 */
  panSession: { pointerId: number, startX: number, startY: number, originX: number, originY: number } | null
}

export interface ImageViewerOpenChangeDetails {
  open: boolean
  /**
   * 这一次是怎么关的；展开时不带。
   * 用它区分「用户主动取消」与「选完自动收起」，前者常要回滚草稿。
   */
  reason?: OverlayCloseReason
}

export interface ImageViewerIndexChangeDetails {
  /** 变化后的下标，恒在 [0, count - 1] 内。 */
  index: number
}

export interface ImageViewerSchema extends MachineSchema {
  props: {
    /** 图片清单。看单张就给长度 1 的数组。缺省为空，此时打开也只有工具条与空视口。 */
    items?: ImageViewerItem[]
    open?: boolean
    defaultOpen?: boolean
    /** 当前下标（0 起）。给定即受控：内部不再自改，只发 onIndexChange。 */
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
    /** 点遮罩（内容之外）关闭，默认 true。 */
    closeOnInteractOutside?: boolean
    restoreFocus?: boolean
    translations?: Partial<ImageViewerTranslations>
    /** open 变化意图回调；受控时是唯一出口，非受控时随内部转移一并通知。 */
    onOpenChange?: (details: ImageViewerOpenChangeDetails) => void
    /** 下标变化意图回调；受控时是唯一出口，非受控随内部写入一并通知。 */
    onIndexChange?: (details: ImageViewerIndexChangeDetails) => void
  }
  context: {
    /** 当前下标。受控（index 给定）时 cell 直读 prop，写只发 onIndexChange 不改内部值。 */
    index: number
    /** 当前图的变换。换图与重开都归零。 */
    transform: ImageViewerTransform
    /** 正在拖拽平移。 */
    panning: boolean
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
    /** 平移到绝对偏移（px），由视口的指针会话驱动。 */
    | { type: 'PAN.MOVE', x: number, y: number }
    | { type: 'PAN.START' }
    | { type: 'PAN.END' }
    // 受控回写：宿主改 open prop 后由 watch 派发，无条件跳转，不再通知
    | { type: 'CONTROLLED.OPEN' }
    | { type: 'CONTROLLED.CLOSE' }
  tag: never
  guard: 'isOpenControlled'
  action:
    | 'invokeOnOpen'
    | 'invokeOnClose'
    | 'syncOpen'
    | 'setIndex'
    | 'goNext'
    | 'goPrev'
    | 'zoomBy'
    | 'zoomTo'
    | 'rotateBy'
    | 'flip'
    | 'resetTransform'
    | 'panStart'
    | 'panMove'
    | 'panEnd'
  effect: 'trackOverlay'
}

export interface ImageViewerApi<T extends PropTypes = PropTypes> {
  open: boolean
  /** 当前下标，恒在 [0, count - 1] 内；清单为空时为 0。 */
  index: number
  count: number
  /** 当前那张图；清单为空时为 null。 */
  currentItem: ImageViewerItem | null
  transform: ImageViewerTransform
  /** 正在拖拽平移。 */
  panning: boolean
  /** 往前还翻得动（loop 且多于一张时恒为 true）。 */
  canPrev: boolean
  canNext: boolean
  setOpen: (next: boolean) => void
  /** 直接跳到某一张；越界会被夹回 [0, count - 1]。换图变换归零。 */
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
  /** 变换整体归零（缩放/旋转/翻转/平移）。 */
  reset: () => void
  getTriggerProps: () => T['button']
  getBackdropProps: () => T['element']
  getPositionerProps: () => T['element']
  getContentProps: () => T['element']
  getViewportProps: () => T['element']
  getImageProps: () => T['img']
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
