/** 一层相对本次冻结事件路径的位置。 */
export type DismissPathHit = 'inside' | 'surface' | 'outside'

/** 该层能否参加本次消解。 */
export type DismissRouteReadiness = 'ready' | 'missing-participant' | 'unarmed' | 'missing-node'

export interface ReadyDismissRouteEntry<T> {
  readonly candidate: T
  readonly hit: DismissPathHit
  readonly readiness: 'ready'
}

export interface BlockedDismissRouteEntry {
  readonly readiness: Exclude<DismissRouteReadiness, 'ready'>
}

export type DismissRouteEntry<T> = ReadyDismissRouteEntry<T> | BlockedDismissRouteEntry

export type DismissRouteBarrier = Exclude<DismissRouteReadiness, 'ready'>
  | 'inside'
  | 'surface'
  | 'inert-exempt'
  | null

export interface DismissRoutePlan<T> {
  /** 始终按原层栈的栈顶到栈底排列。 */
  readonly candidates: readonly T[]
  readonly barrier: DismissRouteBarrier
}

/** 冻结路径是否包含给定节点集合中的任意一项。 */
export function dismissPathIncludes(
  path: readonly EventTarget[],
  targets: readonly EventTarget[],
): boolean {
  return targets.some(target => path.includes(target))
}

/** 这一项之后已经无需解析更低的层。 */
export function isDismissRouteTerminal<T>(entry: DismissRouteEntry<T>): boolean {
  return entry.readiness !== 'ready' || entry.hit !== 'outside'
}

/**
 * 从栈顶向下生成一次 pointer/focus 的纯计划。
 *
 * outside 层进入候选并继续；surface 层进入候选后成为屏障；inside、无参与者、未武装与无节点
 * 都直接成为屏障，不得越过它触碰更低层。
 */
export function planOutsideDismissRoute<T>(
  entries: readonly DismissRouteEntry<T>[],
  inertExempt = false,
): DismissRoutePlan<T> {
  if (inertExempt)
    return Object.freeze({ candidates: Object.freeze([]), barrier: 'inert-exempt' })

  const candidates: T[] = []
  for (const entry of entries) {
    if (entry.readiness !== 'ready')
      return Object.freeze({ candidates: Object.freeze(candidates), barrier: entry.readiness })
    if (entry.hit === 'inside')
      return Object.freeze({ candidates: Object.freeze(candidates), barrier: 'inside' })
    candidates.push(entry.candidate)
    if (entry.hit === 'surface')
      return Object.freeze({ candidates: Object.freeze(candidates), barrier: 'surface' })
  }
  return Object.freeze({ candidates: Object.freeze(candidates), barrier: null })
}

/** 当前层栈是否严格等于原始计划的前 length 项。 */
export function matchesDismissPrefix<T>(
  current: readonly T[],
  original: readonly T[],
  length: number,
): boolean {
  return current.length === length
    && length <= original.length
    && current.every((item, index) => item === original[index])
}
