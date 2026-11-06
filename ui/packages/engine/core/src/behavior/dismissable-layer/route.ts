/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

/** 一层相对本次冻结事件路径的位置。 */
export type DismissPathHit = 'inside' | 'surface' | 'outside'

/** 该层能否参加本次消解。shielded：上面有悬停就出现的层开在本层的内容里，并且挡下了这次交互。 */
export type DismissRouteReadiness = 'ready' | 'missing-participant' | 'unarmed' | 'missing-node' | 'shielded'

/**
 * 一层挡下这次交互时护着谁。缺省护着栈里它下面的每一层：经按下、聚焦打开的层，打开它的那次交互没有收掉
 * 下面的层，说明它开在里面，栈序即嵌套。悬停就出现的层（提示、导航面板这类内联层，悬停卡片、悬停展开的菜单）压在别的层上面不代表开在里面，
 * 只护着它开在其内容里的层：parentsOnly 为 true 的项挡下交互时自己不成为屏障，更低的层照常求值。
 */
interface DismissRouteScope {
  readonly parentsOnly?: boolean
}

export interface ReadyDismissRouteEntry<T> extends DismissRouteScope {
  readonly candidate: T
  readonly hit: DismissPathHit
  readonly readiness: 'ready'
}

export interface BlockedDismissRouteEntry extends DismissRouteScope {
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

/** 这一项挡下了本次交互：它自己不进候选。 */
export function isDismissRouteBlocked<T>(entry: DismissRouteEntry<T>): boolean {
  return entry.readiness !== 'ready' || entry.hit === 'inside'
}

/** 这一项之后已经无需解析更低的层。 */
export function isDismissRouteTerminal<T>(entry: DismissRouteEntry<T>): boolean {
  if (isDismissRouteBlocked(entry))
    return !entry.parentsOnly
  return entry.readiness === 'ready' && entry.hit === 'surface'
}

/**
 * 从栈顶向下生成一次 pointer/focus 的纯计划。
 *
 * outside 层进入候选并继续；surface 层进入候选后成为屏障；inside、无参与者、未武装、无节点与
 * 被上面悬停就出现的层护住的层都直接成为屏障，不得越过它触碰更低层。只护祖先的层（parentsOnly）
 * 挡下交互时自己不进候选、也不成为屏障，更低的层照常求值。
 */
export function planOutsideDismissRoute<T>(
  entries: readonly DismissRouteEntry<T>[],
  inertExempt = false,
): DismissRoutePlan<T> {
  if (inertExempt)
    return Object.freeze({ candidates: Object.freeze([]), barrier: 'inert-exempt' })

  const candidates: T[] = []
  for (const entry of entries) {
    if (entry.readiness !== 'ready') {
      if (entry.parentsOnly)
        continue
      return Object.freeze({ candidates: Object.freeze(candidates), barrier: entry.readiness })
    }
    if (entry.hit === 'inside') {
      if (entry.parentsOnly)
        continue
      return Object.freeze({ candidates: Object.freeze(candidates), barrier: 'inside' })
    }
    candidates.push(entry.candidate)
    if (entry.hit === 'surface')
      return Object.freeze({ candidates: Object.freeze(candidates), barrier: 'surface' })
  }
  return Object.freeze({ candidates: Object.freeze(candidates), barrier: null })
}

/** 当前层栈是否严格等于原始计划去掉已退栈各层之后剩下的那几项，次序不变。 */
export function matchesDismissRemainder<T>(
  current: readonly T[],
  original: readonly T[],
  removed: ReadonlySet<T>,
): boolean {
  let at = 0
  for (const item of original) {
    if (removed.has(item))
      continue
    if (current[at] !== item)
      return false
    at += 1
  }
  return at === current.length
}
