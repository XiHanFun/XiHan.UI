/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 导出 kbd 模块的公共接口。

export { detectKbdPlatform, formatHotkey, isTypingTarget, matchesHotkey, resolveKbdPlatform } from '../shared/hotkey'
export { kbdAnatomy } from './kbd.anatomy'
export { connectKbd } from './kbd.connect'
export { kbdKeyboard } from './kbd.keyboard'
export { kbdMeta } from './kbd.meta'
export type { HotkeySegment, KbdApi, KbdKeyProps, KbdPlatform, KbdProps, KbdResolvedPlatform, KbdTarget, KbdTranslations, KbdTriggerDetails, KbdVariant } from './kbd.types'
