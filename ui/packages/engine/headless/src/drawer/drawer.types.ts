/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 定义 drawer 类型契约。

import type { OverlayBackdropVariant, OverlayCloseReason, PropTypes, Size } from '@xihan-ui/core'
import type { DialogPoint, DialogRefs, DialogSchema } from '../dialog'

/** 抽屉贴靠的视口边，也是滑入方向的来源。 */
export type DrawerSide = 'top' | 'right' | 'bottom' | 'left'

export interface DrawerTranslations {
  close: string
  /** 改尺把手的 aria-label：把手是一条透明的命中区，读屏读不出它推的是哪条边。 */
  resizeTrigger: string
}

export interface DrawerPanelSizeChangeDetails {
  /** 面板沿贴边方向的厚度（像素）：左右放置是宽度，上下放置是高度。 */
  panelSize: number
}

/** 抽屉运行对话框的状态机，DOM 环境与元素 getter 这一组即属于它。 */
export type DrawerRefs = DialogRefs

export interface DrawerOpenChangeDetails {
  open: boolean
  /**
   * 本次关闭的原因；展开时不带。
   * 用于区分用户主动取消与选完自动收起，前者常需要回滚草稿。
   */
  reason?: OverlayCloseReason
}

/**
 * 抽屉的 schema：状态、效应与 refs 取自对话框，改尺在它上面另加一段。
 * props 这一层自行定义：多出 side、contained 与改尺那几项，文案与开合回调换成抽屉自身的形状。
 */
export interface DrawerSchema extends Omit<DialogSchema, 'props' | 'context' | 'event' | 'guard' | 'action'> {
  props: {
    open?: boolean
    defaultOpen?: boolean
    /**
     * 是否启用模态约束，默认 true。false 时不提供遮罩，页面其余部分保持可交互；
     * 展开期间可以切换，滚动锁、背景失活与焦点陷阱会同步更新。
     */
    modal?: boolean
    /**
     * 浮层挂在局部容器中而不是视口：遮罩与定位层从 fixed 改为 absolute，
     * 因此只覆盖该容器、不再覆盖整屏。
     *
     * 挂到哪个容器由适配器决定（Vue 由 root 的 container 决定，WC 本身是 Light DOM、
     * 作者写在何处即在何处），这里只表达按局部容器绘制这一点。
     */
    contained?: boolean
    /** 滑出的边，默认 'right'。只影响输出的 data-side，不参与状态转移。 */
    side?: DrawerSide
    role?: 'dialog' | 'alertdialog'
    closeOnEscape?: boolean
    closeOnInteractOutside?: boolean
    restoreFocus?: boolean
    /** 尺寸：sm / md / lg。横向放置时影响面板宽度、纵向放置时影响面板高度，随 side 而定。 */
    size?: Size
    /** 遮罩形态：opaque / blur / transparent。写在 backdrop 上，只影响该层的底色与模糊。 */
    variant?: OverlayBackdropVariant
    /**
     * 收起动画播完后卸载内容，默认 true。内容总是第一次打开才挂载；设为 false 时此后收起只隐藏、不卸载，
     * 再打开不重挂：内容里的组件状态、输入与滚动位置都留着，重开也不再付一遍挂载开销。
     * 适合反复开合、内容又重（设置面板、长表单）的抽屉。
     */
    unmountOnExit?: boolean
    translations?: Partial<DrawerTranslations>
    /** open 变化意图回调；受控时是唯一出口，非受控时随内部转移一并通知。 */
    onOpenChange?: (details: DrawerOpenChangeDetails) => void
    /** 退出动画结束或取消，且本层资源全部释放后通知；卸载和重新打开不通知。 */
    onExitComplete?: () => void
    /**
     * 可调厚度：朝向页面的那条边上的 resize-trigger 拖动或用方向键推，面板沿贴边方向变宽（左右放置）或变高（上下放置）。
     * 默认 false。厚度夹在 minPanelSize 与 maxPanelSize 之间，且不超出视口（contained 时是所在容器）。
     */
    resizable?: boolean
    /** 受控厚度（像素）；未提供即非受控。没有值时面板按 size 档的厚度绘制。 */
    panelSize?: number
    /** 非受控的初始厚度（像素）；不给即按 size 档。 */
    defaultPanelSize?: number
    /** 厚度下限（像素），默认 160。 */
    minPanelSize?: number
    /** 厚度上限（像素）；不给时只受视口（或所在容器）限制。 */
    maxPanelSize?: number
    /** 厚度变化意图：拖动途中连续发出，键盘每推一步发一次。 */
    onPanelSizeChange?: (details: DrawerPanelSizeChangeDetails) => void
  }
  context: DialogSchema['context'] & {
    /** 面板厚度；没被调过、也没给初值时为 null，按 size 档绘制。受控时直读 panelSize。 */
    panelSize: number | null
    /** 最近一次量到的实际厚度：还没调过时给把手的 aria-valuenow 用，不对外通知。 */
    measuredPanelSize: number | null
  }
  event: DialogSchema['event']
    /** 指针按住改尺把手：量下起点与这一场的上下限，开始跟手。 */
    | { type: 'RESIZE.START', point: DialogPoint, pointerId?: number }
    /** 键盘推一步：dx / dy 是屏幕坐标里的位移，推向页面那一侧是变厚。 */
    | { type: 'RESIZE.NUDGE', dx: number, dy: number }
    /** Home / End：推到下限或上限。 */
    | { type: 'RESIZE.TO_BOUND', bound: 'min' | 'max' }
    /** 把手得焦：量一次实际厚度，读屏报得出当前值。 */
    | { type: 'RESIZE.MEASURE' }
  guard: DialogSchema['guard'] | 'canResize'
  action: DialogSchema['action'] | 'startResize' | 'nudgeResize' | 'resizeToBound' | 'measurePanel'
}

export interface DrawerApi<T extends PropTypes = PropTypes> {
  open: boolean
  /** 当前厚度；没被调过、也没给初值时为 null。 */
  panelSize: number | null
  /** 正在被指针调厚度。 */
  resizing: boolean
  /** 已解析的滑出边（prop 未提供时是默认值），作者据此配置动画。 */
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
  /** 改尺把手：role=separator，落在朝向页面的那条边上；没开 resizable 时带 hidden。 */
  getResizeTriggerProps: () => T['element']
  /**
   * 浮层此刻该不该挂载。`present` 是适配器的退场闸门：打开中或收起动画还没播完为真。
   * 没打开过恒为假；unmountOnExit 为 false 时打开过之后恒为真，闸门落下的那段由适配器隐藏而不卸载。
   */
  isContentMounted: (present: boolean) => boolean
}
