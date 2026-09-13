/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 presence 相关实现。

export { attachCssExit } from './presence/animation-end'
// 进出场存在性子入口：三态机 + 退出租约 + CSS 退场探测。
export { createPresence } from './presence/index'
export type { ExitLease, PresenceHandle, PresenceOptions } from './presence/index'
export { nextPresence } from './presence/presence-machine'
export type { PresenceEvent, PresenceState } from './presence/presence-machine'
