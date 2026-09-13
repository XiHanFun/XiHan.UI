/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 导出 hotkeys 模块的公共接口。

export { detectHotkeysPlatform, formatHotkey, isTypingTarget, matchesHotkey, resolveHotkeysPlatform } from '../shared/hotkey'
export type { HotkeySegment, HotkeysPlatform, HotkeysResolvedPlatform } from '../shared/hotkey'
export { hotkeysAnatomy } from './hotkeys.anatomy'
export { connectHotkeys } from './hotkeys.connect'
export { hotkeysKeyboard } from './hotkeys.keyboard'
export { hotkeysMeta } from './hotkeys.meta'
export type { HotkeysApi, HotkeysProps, HotkeysTarget, HotkeysTriggerDetails } from './hotkeys.types'
