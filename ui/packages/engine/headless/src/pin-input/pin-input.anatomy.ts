/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 pin input 相关实现。

import type { Scope } from '@xihan-ui/core'
import { createAnatomy } from '@xihan-ui/core'

// input 是多实例 part：一格一个，文档序即下标序。
// group 把连着的几格圈成一段（123-456 这种分段写法），separator 是段与段之间的那道分隔；
// 两者都不参与下标计算，格子的顺序仍由文档序决定。
// hidden-input 是整份验证码的表单出口，与逐格的 input 分开。
export const pinInputAnatomy = createAnatomy('pin-input', [
  'root',
  'label',
  'group',
  'input',
  'separator',
  'hidden-input',
])

/** 第 index 格的 id：连接层照它写到格子上，机器照它找回格子搬焦点。 */
export function pinInputCellId(scope: Scope, index: number): string {
  return scope.partId(pinInputAnatomy.name, `input-${index}`)
}
