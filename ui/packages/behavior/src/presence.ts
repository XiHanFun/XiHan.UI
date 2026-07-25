export { attachCssExit } from './presence/animation-end'
// 进出场存在性子入口：三态机 + 退出租约 + CSS 退场探测。
export { createPresence } from './presence/index'
export type { ExitLease, PresenceHandle, PresenceOptions } from './presence/index'
export { nextPresence } from './presence/presence-machine'
export type { PresenceEvent, PresenceState } from './presence/presence-machine'
