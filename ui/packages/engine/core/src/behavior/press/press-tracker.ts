/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 按压通道：Space / Enter 按住与粗指针（触屏）按住期间，把「正在按」这一事实交给调用方。
//
// 指针按下皮肤靠 :active 就看得见；键盘激活与触屏按下却不是——Space / Enter 按住时按钮没有
// :active，触屏上 :active 要么延后要么被滚动接管。于是这一路由 Headless 投影 data-pressed，
// 皮肤写 :is(:active, [data-pressed])，三种输入看见同一副按压面。
//
// 跟踪器不自存状态、不持有 DOM：按住与否的真源在调用方（机器 context），这里只把事件翻成
// 「该按下」与「该松开」两句话。connect 每次重算都会重新合成 handlers，自存状态会在重算之间丢失。
import { isComposingEvent } from '../../kernel/capability/ime'

export interface PressTrackerOptions {
  /** 当前是否处于按住态；真源在调用方。 */
  isPressed: () => boolean
  /** 按住态翻转时回调，只在真变时调。 */
  onChange: (pressed: boolean) => void
}

/** connect 合成到部件 getter 上的事件处理器；名字即 DOM 事件名。 */
export interface PressHandlers {
  onKeyDown: (event: KeyboardEvent) => void
  onKeyUp: (event: KeyboardEvent) => void
  onBlur: () => void
  onPointerDown: (event: PointerEvent) => void
  onPointerUp: () => void
  onPointerCancel: () => void
}

/** 原生按钮的两个激活键；别的键不算按压。 */
function isActivationKey(event: KeyboardEvent): boolean {
  return event.key === ' ' || event.key === 'Enter'
}

/**
 * 粗指针：只认触屏。鼠标有 :active，笔是细指针；
 * 触屏的 pointer 事件隐式捕获，手指滑出再抬起 pointerup 仍落在原节点上，不必盯 pointerleave。
 */
function isCoarsePointer(event: PointerEvent): boolean {
  return event.pointerType === 'touch'
}

/** 把键盘与粗指针的按住翻成 onChange(true / false)。 */
export function createPressTracker(options: PressTrackerOptions): PressHandlers {
  const set = (pressed: boolean): void => {
    if (options.isPressed() !== pressed)
      options.onChange(pressed)
  }
  return {
    onKeyDown: (event) => {
      // 长按的重复键不再报；输入法组合期间的键不是激活
      if (event.repeat || isComposingEvent(event) || !isActivationKey(event))
        return
      set(true)
    },
    onKeyUp: (event) => {
      if (!isActivationKey(event))
        return
      set(false)
    },
    // 焦点走了就没有「按住」可言：Alt+Tab、程序化 blur 都不会再来 keyup
    onBlur: () => set(false),
    onPointerDown: (event) => {
      if (!isCoarsePointer(event))
        return
      set(true)
    },
    onPointerUp: () => set(false),
    // 手指滑出去起了滚动，浏览器接管指针
    onPointerCancel: () => set(false),
  }
}
