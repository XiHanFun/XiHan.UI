/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 定义 drawer 类型契约。

import type { OverlayBackdropVariant, OverlayCloseReason, PropTypes, Size } from '@xihan-ui/core'
import type { DialogRefs, DialogSchema } from '../dialog'

/** 抽屉贴靠的视口边，也是滑入方向的来源。 */
export type DrawerSide = 'top' | 'right' | 'bottom' | 'left'

export interface DrawerTranslations {
  close: string
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
 * 抽屉的 schema：除 props 外整份取自对话框：状态、事件、守卫、动作、效应与 refs 都是它的。
 * props 这一层自行定义：多出 side 与 contained，文案与开合回调换成抽屉自身的形状。
 */
export interface DrawerSchema extends Omit<DialogSchema, 'props'> {
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
    translations?: Partial<DrawerTranslations>
    /** open 变化意图回调；受控时是唯一出口，非受控时随内部转移一并通知。 */
    onOpenChange?: (details: DrawerOpenChangeDetails) => void
    /** 退出动画结束或取消，且本层资源全部释放后通知；卸载和重新打开不通知。 */
    onExitComplete?: () => void
  }
}

export interface DrawerApi<T extends PropTypes = PropTypes> {
  open: boolean
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
}
