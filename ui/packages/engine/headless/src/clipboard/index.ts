/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 导出 clipboard 模块的公共接口。

export { clipboardAnatomy } from './clipboard.anatomy'
export { connectClipboard } from './clipboard.connect'
export { clipboardKeyboard } from './clipboard.keyboard'
export { CLIPBOARD_TIMEOUT, clipboardMachine, resolveClipboardTimeout, writeToClipboard } from './clipboard.machine'
export { clipboardMeta } from './clipboard.meta'
export type { ClipboardApi, ClipboardCopyErrorDetails, ClipboardIndicatorProps, ClipboardSchema, ClipboardStatus, ClipboardStatusChangeDetails, ClipboardTranslations } from './clipboard.types'
