/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 file upload 相关实现。

import type { Scope } from '@xihan-ui/core'
import { createAnatomy } from '@xihan-ui/core'

// data-part 用 kebab-case，与 CSS 选择器一致。
export const fileUploadAnatomy = createAnatomy('file-upload', [
  'root',
  'label',
  'dropzone',
  'trigger',
  'hidden-input',
  'list',
  'item',
  'item-name',
  'item-size-text',
  'item-preview',
  'item-progress',
  'item-delete-trigger',
  'clear-trigger',
])

/**
 * 隐藏输入的 id。
 *
 * 连接层写入此 id，机器的 openFilePicker action 按此 id 找回节点，两处必须同源。
 */
export function fileUploadHiddenInputId(scope: Scope): string {
  return scope.partId(fileUploadAnatomy.name, 'hidden-input')
}

/** 文件列表的 id：连接层写入，机器接列表动效时按它找回节点。 */
export function fileUploadListId(scope: Scope): string {
  return scope.partId(fileUploadAnatomy.name, 'list')
}

/** 某个本地文件那条进度条的 id（key 是文件的内部 id）：连接层写入，机器等传完后的淡出播完时按它找回节点。 */
export function fileUploadProgressId(scope: Scope, key: string): string {
  return `${scope.partId(fileUploadAnatomy.name, 'item-progress')}-${key}`
}
