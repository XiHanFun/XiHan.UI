// 拖拽重排的共用纯函数：沿轴的落点判定与读屏播报。
// 不碰 DOM、不认识状态机——矩形由连接层在事件处理器里量好交进来。
//
// 放在 shared/ 而不是某个组件里：table 的行与列、tree 的节点、tabs 的标签
// 四处吃同一套判定与同一套播报，四处的落点语义必须一模一样。

/** 落在参照项的哪一侧。`inside` 只有层级结构（树）才用得上。 */
export type DropPosition = 'before' | 'after' | 'inside'

/** 一个候选落点：它是谁、它此刻占哪块地方。 */
export interface DragRect {
  value: string
  start: number
  size: number
}

export interface DropTarget {
  targetValue: string
  position: DropPosition
}

/**
 * 沿一条轴找落点：指针落在谁身上、落在它的前半还是后半。
 *
 * 只比一维：调用方按自己的轴把矩形拍扁（横排给 left/width，竖排给 top/height），
 * 于是同一个函数同时服务列拖拽与行拖拽。
 *
 * 指针在所有候选之外时返回 null 而不是夹到两端——「此刻没有合法落点」是一档真实状态，
 * 指示线该消失，把它夹到最近的一端会让人以为松手就落在那儿。
 */
export function hitAlong(rects: readonly DragRect[], point: number): DropTarget | null {
  for (const rect of rects) {
    if (point < rect.start || point > rect.start + rect.size)
      continue
    return {
      targetValue: rect.value,
      position: point < rect.start + rect.size / 2 ? 'before' : 'after',
    }
  }
  return null
}

/**
 * 三档落点：前四分之一是 before、后四分之一是 after、当中一半是 inside。
 *
 * 中间那档给得比两侧宽，因为「放进去」是这类拖拽的主用途，而两条边界线
 * 在视觉上本来就窄；两侧各留四分之一已经够瞄准。
 * `allowInside` 为假时退回两档均分（叶子节点没有里面可言）。
 */
export function hitAlongNested(
  rects: readonly DragRect[],
  point: number,
  allowInside: (value: string) => boolean,
): DropTarget | null {
  for (const rect of rects) {
    if (point < rect.start || point > rect.start + rect.size)
      continue
    const ratio = rect.size === 0 ? 0 : (point - rect.start) / rect.size
    if (!allowInside(rect.value))
      return { targetValue: rect.value, position: ratio < 0.5 ? 'before' : 'after' }
    if (ratio < 0.25)
      return { targetValue: rect.value, position: 'before' }
    if (ratio > 0.75)
      return { targetValue: rect.value, position: 'after' }
    return { targetValue: rect.value, position: 'inside' }
  }
  return null
}

/**
 * 把落点折算成「摘掉被拖项之后要插在第几位」。
 *
 * 这一步单独立出来是因为它有个反直觉的修正：提交是「先摘后插」两步，
 * 摘掉自己会让排在自己后面的每一项都往前挪一格，所以往后搬时目标下标要减一。
 * 少这一下的表现是「往右拖一格纹丝不动」——看起来像没生效，其实是刚好抵消了。
 *
 * 落在自己身上返回 null：那不是一次移动。
 */
export function insertionIndex(
  values: readonly string[],
  dragValue: string,
  target: DropTarget,
): number | null {
  const from = values.indexOf(dragValue)
  const at = values.indexOf(target.targetValue)
  if (from < 0 || at < 0 || target.targetValue === dragValue)
    return null
  const shifted = from < at ? at - 1 : at
  const to = target.position === 'after' ? shifted + 1 : shifted
  return to === from ? null : to
}

/** 播报的五档。`rejected` 是落点被守卫拒掉那一句。 */
export type DragAnnounceKind = 'moved' | 'dropped' | 'canceled' | 'rejected'

export interface DragTranslations {
  /** 一项的名字。默认取它的标识。 */
  item: (value: string) => string
  moved: (name: string, position: number, total: number) => string
  dropped: (name: string, position: number) => string
  canceled: (name: string, position: number) => string
  /** 落点不合法。视觉上表现为「不画线」，读屏里必须有人说一句。 */
  rejected: (name: string) => string
}

export interface DragAnnounceInput {
  value: string
  /** 人类读法的第几位，从 1 数起。 */
  position: number
  total: number
  translations?: Partial<DragTranslations>
}

/**
 * 拼一句播报。
 *
 * `rejected` 这一档是给 indicator-only 补的：落点不合法时界面上只是「那条线没出现」，
 * 看得见的人懂了，听的人只会听到一片安静。
 */
export function dragAnnouncement(kind: DragAnnounceKind, input: DragAnnounceInput): string {
  const { value, position, total, translations: t } = input
  const name = t?.item?.(value) ?? value

  switch (kind) {
    case 'moved':
      return t?.moved?.(name, position, total) ?? `Moved ${name} to position ${position} of ${total}.`
    case 'dropped':
      return t?.dropped?.(name, position) ?? `${name} dropped at position ${position}.`
    case 'canceled':
      return t?.canceled?.(name, position) ?? `Move canceled. ${name} returned to position ${position}.`
    case 'rejected':
      return t?.rejected?.(name) ?? `${name} cannot be dropped here.`
  }
}
