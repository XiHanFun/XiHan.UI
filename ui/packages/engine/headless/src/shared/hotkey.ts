/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 快捷键在打字时让路：判断按键落点是不是正在打字的地方。键数组的归一、写法与命中在 @xihan-ui/core/hotkey。

import { isHTMLElement } from '@xihan-ui/core'

/** 不接受打字的输入类型：这些控件按键盘不产生文字，单键组合落在它们身上不算打字。 */
const NON_TYPING_INPUT_TYPES = new Set([
  'button',
  'checkbox',
  'color',
  'file',
  'image',
  'radio',
  'range',
  'reset',
  'submit',
])

/**
 * 按键落点是不是正在打字的地方（输入框、文本域、下拉、可编辑区）。
 *
 * 只在事件处理器里调用，那时节点确实在场。复选框、单选、按钮这类输入不算：
 * 它们按键盘不产生文字。
 */
export function isTypingTarget(target: EventTarget | null): boolean {
  if (!isHTMLElement(target))
    return false
  if (target.isContentEditable)
    return true
  const tag = target.tagName.toLowerCase()
  if (tag === 'textarea' || tag === 'select')
    return true
  if (tag !== 'input')
    return false
  return !NON_TYPING_INPUT_TYPES.has((target as HTMLInputElement).type)
}
