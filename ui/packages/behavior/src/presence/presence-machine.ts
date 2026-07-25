// 挂载 / 退场中 / 已卸载 三态。未定义的转移静默 no-op。
export type PresenceState = 'mounted' | 'exiting' | 'unmounted'
export type PresenceEvent = 'EXIT_CLAIMED' | 'CLOSE_NO_LEASE' | 'ALL_LEASES_DONE' | 'OPEN'

export function nextPresence(s: PresenceState, e: PresenceEvent): PresenceState {
  switch (s) {
    case 'mounted':
      return e === 'EXIT_CLAIMED' ? 'exiting' : e === 'CLOSE_NO_LEASE' ? 'unmounted' : s
    case 'exiting':
      return e === 'ALL_LEASES_DONE' ? 'unmounted' : e === 'OPEN' ? 'mounted' : s
    case 'unmounted':
      return e === 'OPEN' ? 'mounted' : s
  }
}
