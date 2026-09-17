/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 定义 dialog 类型契约。

import type { Cleanup, Layer, MachineSchema, OverlayBackdropVariant, OverlayCloseReason, PropTypes, RuntimeConfig, Size } from '@xihan-ui/core'
import type { PresenceHandle } from '@xihan-ui/core/presence'

export interface DialogTranslations {
  close: string
}

// 适配器在挂载前填入 DOM 环境与元素 getter；纯逻辑测试下保持缺省（副作用不挂）。
export interface DialogRefs {
  config: RuntimeConfig | null
  /** 注册本层并返回撤销句柄；只在展开期间调用，层不常驻栈。 */
  registerLayer: (() => { layer: Layer, dispose: Cleanup }) | null
  presence: PresenceHandle | null
  /** 展开期间 modal 改值时同步滚动锁与背景失活。 */
  syncModalResources: (() => void) | null
  getContentEl: () => HTMLElement | null
  getTriggerEl: () => HTMLElement | null
  branches: () => Element[]
  /**
   * connect 给部件写 id 时使用的组件名。归还焦点时按该名字获取 trigger，
   * 抽屉运行同一台状态机、部件名却是 drawer，由它的 refs 初值改写为自身的名字。
   */
  partScope: string
}

/**
 * 正被按住的按钮：开合触发器或角落的关闭钮。drawer 跑的是同一台机器，它的两颗同名按钮也记在这里；
 * 两颗按钮只记一个布尔分不清按住的是哪颗。
 */
export type DialogPressedPart = 'trigger' | 'close-trigger'

export interface DialogOpenChangeDetails {
  open: boolean
  /**
   * 本次关闭的原因；展开时不带。
   * 用于区分用户主动取消与确认后收起，前者常需要回滚草稿。
   */
  reason?: OverlayCloseReason
}

export interface DialogSchema extends MachineSchema {
  props: {
    open?: boolean
    defaultOpen?: boolean
    modal?: boolean
    role?: 'dialog' | 'alertdialog'
    closeOnEscape?: boolean
    closeOnInteractOutside?: boolean
    restoreFocus?: boolean
    /** 展开后先聚焦到 content 内匹配该选择器的元素；选择器不匹配时回退为默认聚焦顺序。 */
    initialFocus?: string
    /** 尺寸：sm / md / lg。只影响 content 的最大宽度，写在 content 上（本组件没有 root 部件）。 */
    size?: Size
    /** 遮罩形态：opaque / blur / transparent。写在 backdrop 上，只影响该层的底色与模糊。 */
    variant?: OverlayBackdropVariant
    translations?: Partial<DialogTranslations>
    /** open 变化意图回调；受控时是唯一出口，非受控时随内部转移一并通知。 */
    onOpenChange?: (details: DialogOpenChangeDetails) => void
    /** 退出动画结束或取消，且本层资源全部释放后通知；卸载和重新打开不通知。 */
    onExitComplete?: () => void
  }
  context: {
    /**
     * 正被按住的按钮：Space / Enter 或触屏手指按下到松开之间，该按钮投影 data-pressed；没有按住时为 null。
     * 指针按住由 :active 表出。面板收起时一并清空——按住 Enter 关掉面板后，里面的关闭钮不会再来 keyup。
     */
    pressed: DialogPressedPart | null
  }
  computed: Record<string, never>
  refs: DialogRefs
  state: 'open' | 'closed'
  event:
    | { type: 'OPEN' }
    | { type: 'TOGGLE' }
    | { type: 'CLOSE', src?: 'esc' | 'close-trigger' | 'interact-outside' }
    // 受控回写：宿主改 open prop 后由 watch 派发，无条件跳转，不再通知
    | { type: 'CONTROLLED.OPEN' }
    | { type: 'CONTROLLED.CLOSE' }
    // 按压通道（shared/press）：Space / Enter 或触屏按住与松开，part 说的是哪颗按钮
    | { type: 'PRESS.START', part: DialogPressedPart }
    | { type: 'PRESS.END', part: DialogPressedPart }
  tag: never
  guard: 'isOpenControlled'
  action: 'invokeOnOpen' | 'invokeOnClose' | 'syncOpen' | 'syncModalResources' | 'startPress' | 'endPress' | 'releasePress'
  effect: 'trackOverlay'
}

export interface DialogApi<T extends PropTypes = PropTypes> {
  open: boolean
  setOpen: (next: boolean) => void
  getTriggerProps: () => T['button']
  getBackdropProps: () => T['element']
  getPositionerProps: () => T['element']
  getContentProps: () => T['element']
  getHeaderProps: () => T['element']
  getIndicatorProps: () => T['element']
  getTitleProps: () => T['element']
  getDescriptionProps: () => T['element']
  getBodyProps: () => T['element']
  getFooterProps: () => T['element']
  getCloseTriggerProps: () => T['button']
}
