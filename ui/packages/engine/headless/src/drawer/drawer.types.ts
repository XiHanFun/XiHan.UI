import type { PresenceHandle } from '@xihan-ui/behavior/presence'
import type { Cleanup, Layer, OverlayBackdropVariant, OverlayCloseReason, PropTypes, RuntimeConfig, Size } from '@xihan-ui/kernel'
import type { MachineSchema } from '@xihan-ui/machine'

/** 抽屉贴住的那条视口边，也是滑入方向的来源。 */
export type DrawerSide = 'top' | 'right' | 'bottom' | 'left'

export interface DrawerTranslations {
  close: string
}

// 适配器在挂载前填入 DOM 环境与元素 getter；纯逻辑测试下保持缺省（副作用不挂）。
export interface DrawerRefs {
  config: RuntimeConfig | null
  /** 注册本层并返回撤销句柄；只在展开期间调用，层不常驻栈。 */
  registerLayer: (() => { layer: Layer, dispose: Cleanup }) | null
  presence: PresenceHandle | null
  getContentEl: () => HTMLElement | null
  getTriggerEl: () => HTMLElement | null
  branches: () => Element[]
}

export interface DrawerOpenChangeDetails {
  open: boolean
  /**
   * 这一次是怎么关的；展开时不带。
   * 用它区分「用户主动取消」与「选完自动收起」，前者常要回滚草稿。
   */
  reason?: OverlayCloseReason
}

export interface DrawerSchema extends MachineSchema {
  props: {
    open?: boolean
    defaultOpen?: boolean
    modal?: boolean
    /**
     * 浮层挂在某个局部容器里而不是视口：遮罩与定位层从 fixed 换成 absolute，
     * 于是只罩住那个容器、不再盖满整屏。
     *
     * 挂到哪个容器是适配器的事（Vue 由 root 的 container 决定，WC 本就是 Light DOM、
     * 作者写在哪就在哪），这里只表达「按局部容器画」这一件事。
     */
    contained?: boolean
    /** 从哪条边滑出，默认 'right'。只影响输出的 data-side，不参与状态转移。 */
    side?: DrawerSide
    role?: 'dialog' | 'alertdialog'
    closeOnEscape?: boolean
    closeOnInteractOutside?: boolean
    restoreFocus?: boolean
    /** 尺寸：sm / md / lg。横放时换面板宽度、竖放时换面板高度，随 side 而定。 */
    size?: Size
    /** 遮罩形态：opaque / blur / transparent。落在 backdrop 上，只换那一层的底色与模糊。 */
    variant?: OverlayBackdropVariant
    translations?: Partial<DrawerTranslations>
    /** open 变化意图回调；受控时是唯一出口，非受控时随内部转移一并通知。 */
    onOpenChange?: (details: DrawerOpenChangeDetails) => void
  }
  context: Record<string, never>
  computed: Record<string, never>
  refs: DrawerRefs
  state: 'open' | 'closed'
  event:
    | { type: 'OPEN' }
    | { type: 'TOGGLE' }
    | { type: 'CLOSE', src?: 'esc' | 'close-trigger' | 'interact-outside' }
    // 受控回写：宿主改 open prop 后由 watch 派发，无条件跳转，不再通知
    | { type: 'CONTROLLED.OPEN' }
    | { type: 'CONTROLLED.CLOSE' }
  tag: never
  guard: 'isOpenControlled'
  action: 'invokeOnOpen' | 'invokeOnClose' | 'syncOpen'
  effect: 'trackOverlay'
}

export interface DrawerApi<T extends PropTypes = PropTypes> {
  open: boolean
  /** 已解析的滑出边（prop 缺省时是默认值），作者据此配动画。 */
  side: DrawerSide
  setOpen: (next: boolean) => void
  getRootProps: () => T['element']
  getTriggerProps: () => T['button']
  getBackdropProps: () => T['element']
  getPositionerProps: () => T['element']
  getContentProps: () => T['element']
  getHeaderProps: () => T['element']
  getTitleProps: () => T['element']
  getDescriptionProps: () => T['element']
  getBodyProps: () => T['element']
  getFooterProps: () => T['element']
  getCloseTriggerProps: () => T['button']
}
