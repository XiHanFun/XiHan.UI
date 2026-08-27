// 排序投影：拖动过程中算出「此刻放手会落到第几位」，以及每一项该让到哪儿。
import type { DndDelta, DndRect, SortableOffsetsInput, SortableProjection, SortableProjectionInput } from './types'

const ZERO: DndDelta = { x: 0, y: 0 }

/**
 * 算出此刻的落点与每一项的位移。
 *
 * 判据是**被拖项的中心越过了谁的中心**，而不是矩形相交：项高不齐时相交判据会在边界反复横跳。
 * 沿轴扫描一遇到没越过的就停，落点因此是连续的——中间那一项再矮也必须先经过它，
 * 不会从第 0 位直接跳到第 5 位。
 *
 * 所有几何都取按下那一刻的快照。让位之后布局已经变了，拿变形后的几何再算落点会自激振荡。
 */
export function projectSortable(input: SortableProjectionInput): SortableProjection {
  const { rects, from, delta, axis } = input
  const count = rects.length

  if (count === 0)
    return { to: from, offsets: [] }

  if (!inRange(from, count))
    return { to: from, offsets: rects.map(() => ZERO) }

  const to = axis === 'both'
    ? nearestIndex(rects, from, delta)
    : scanAxis(rects, from, delta, axis)

  return { to, offsets: sortableOffsets({ rects, from, to, dragDelta: delta }) }
}

/**
 * 已知落点时算每一项的位移。
 *
 * 指针拖拽由 `projectSortable` 调它；键盘拖拽直接调——那边没有指针位移可依，
 * 被拖项就落到目标槽位的起点上。两条路径因此共用同一套让位规则，不会各让各的。
 */
export function sortableOffsets(input: SortableOffsetsInput): DndDelta[] {
  const { rects, from, to, dragDelta } = input
  const count = rects.length
  if (count === 0)
    return []
  if (!inRange(from, count) || !inRange(to, count))
    return rects.map(() => ZERO)

  return rects.map((self, index) => {
    if (index === from) {
      if (dragDelta)
        return dragDelta
      const target = rects[to]
      return target ? startDelta(target, self) : ZERO
    }
    // 被跨过的项各挪一格：目标是相邻那一项的起点。
    // 用起点差而不是被拖项的尺寸，间距与不等尺寸就都自动含进去了。
    if (to > from && index > from && index <= to) {
      const prev = rects[index - 1]
      return prev ? startDelta(prev, self) : ZERO
    }
    if (to < from && index >= to && index < from) {
      const next = rects[index + 1]
      return next ? startDelta(next, self) : ZERO
    }
    return ZERO
  })
}

/** 单轴扫描。先往后试，没挪动再往前试。 */
function scanAxis(rects: readonly DndRect[], from: number, delta: DndDelta, axis: 'horizontal' | 'vertical'): number {
  const horizontal = axis === 'horizontal'
  const centers = rects.map(rect => (horizontal ? rect.x + rect.width / 2 : rect.y + rect.height / 2))

  const origin = centers[from]
  const first = centers[0]
  const last = centers[centers.length - 1]
  if (origin === undefined || first === undefined || last === undefined)
    return from

  const moved = origin + (horizontal ? delta.x : delta.y)

  // 排版方向由首尾两项的先后决定，从右往左排时它是 -1。
  // 这样 rtl 不必额外传参，也不会有人忘了传。
  const dir = Math.sign(last - first)
  if (dir === 0)
    return from

  let to = from
  for (let i = from + 1; i < centers.length; i++) {
    const center = centers[i]
    if (center === undefined || (moved - center) * dir <= 0)
      break
    to = i
  }
  if (to !== from)
    return to

  for (let i = from - 1; i >= 0; i--) {
    const center = centers[i]
    if (center === undefined || (moved - center) * dir >= 0)
      break
    to = i
  }
  return to
}

/** 换行网格：落点取离被拖项中心最近的那一格。 */
function nearestIndex(rects: readonly DndRect[], from: number, delta: DndDelta): number {
  const self = rects[from]
  if (!self)
    return from

  const cx = self.x + self.width / 2 + delta.x
  const cy = self.y + self.height / 2 + delta.y

  let best = from
  let bestDistance = Number.POSITIVE_INFINITY
  rects.forEach((rect, index) => {
    const dx = rect.x + rect.width / 2 - cx
    const dy = rect.y + rect.height / 2 - cy
    const distance = dx * dx + dy * dy
    if (distance < bestDistance) {
      bestDistance = distance
      best = index
    }
  })
  return best
}

function startDelta(target: DndRect, self: DndRect): DndDelta {
  return { x: target.x - self.x, y: target.y - self.y }
}

function inRange(index: number, length: number): boolean {
  return Number.isInteger(index) && index >= 0 && index < length
}
