/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 网格布局：按整数格放置的卡片夹到网格内、向上压实、拖动与改大小时推开碰撞项、找空位放入新项。

/** 网格上的位置与大小，单位是格。 */
export interface GridRect {
  readonly x: number
  readonly y: number
  readonly w: number
  readonly h: number
}

/** 网格上的一项。 */
export interface GridItem extends GridRect {
  readonly id: string
}

/** 布局选项。 */
export interface GridOptions {
  /** 调整之后整体向上压实，缺省 true。 */
  readonly compact?: boolean
}

/** 新放入的项：不写 x、y 时放到第一个放得下的空位。 */
export interface GridPlacement {
  readonly id: string
  readonly w: number
  readonly h: number
  readonly x?: number
  readonly y?: number
}

function integer(value: number, name: string): number {
  if (!Number.isFinite(value))
    throw new RangeError(`[designer-kit] grid ${name} must be a finite number, got ${value}`)
  return Math.round(value)
}

function columnCount(columns: number): number {
  return Math.max(1, integer(columns, 'columns'))
}

/**
 * 把位置大小夹到网格内：取整，宽在 1 到列数之间，高至少 1，x 不让项越过右边界，x、y 不小于 0。
 * 列数与位置大小不是有限数时抛 `RangeError`。
 */
export function clampToGrid<T extends GridRect>(item: T, columns: number): T {
  const total = columnCount(columns)
  const w = Math.min(Math.max(integer(item.w, 'w'), 1), total)
  const h = Math.max(integer(item.h, 'h'), 1)
  const x = Math.min(Math.max(integer(item.x, 'x'), 0), total - w)
  const y = Math.max(integer(item.y, 'y'), 0)
  return { ...item, x, y, w, h }
}

/** 两项是否重叠；只是边相接不算。 */
export function gridCollides(a: GridRect, b: GridRect): boolean {
  return a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h
}

function lowestFree<T extends GridRect>(item: T, placed: readonly GridRect[]): T {
  let y = item.y
  let colliders = placed.filter(other => gridCollides({ ...item, y }, other))
  while (colliders.length > 0) {
    y = Math.max(...colliders.map(other => other.y + other.h))
    colliders = placed.filter(other => gridCollides({ ...item, y }, other))
  }
  return y === item.y ? item : { ...item, y }
}

function rise<T extends GridRect>(item: T, placed: readonly GridRect[]): T {
  let y = item.y
  while (y > 0 && !placed.some(other => gridCollides({ ...item, y: y - 1 }, other)))
    y--
  return y === item.y ? item : { ...item, y }
}

/** 按 y、x、原有次序排出处理次序；first 给出的下标在同位置时优先。 */
function order(items: readonly GridRect[], first = -1): number[] {
  return items
    .map((_, index) => index)
    .sort((a, b) => {
      const ia = items[a]!
      const ib = items[b]!
      return ia.y - ib.y || ia.x - ib.x || (a === first ? -1 : b === first ? 1 : a - b)
    })
}

function compactClamped<T extends GridRect>(items: readonly T[], first = -1): T[] {
  const result = items.slice()
  const placed: T[] = []
  for (const index of order(items, first)) {
    const item = lowestFree(rise(items[index]!, placed), placed)
    placed.push(item)
    result[index] = item
  }
  return result
}

/**
 * 压实布局：先夹到网格内，再按自上而下、自左而右的次序，把每项向上移到碰到别的项为止；
 * 原本重叠的项向下推开。返回新数组，次序与输入相同。
 */
export function compactLayout<T extends GridRect>(items: readonly T[], columns: number): T[] {
  return compactClamped(items.map(item => clampToGrid(item, columns)))
}

function indexOf(items: readonly GridItem[], id: string): number {
  const index = items.findIndex(item => item.id === id)
  if (index < 0)
    throw new RangeError(`[designer-kit] grid item ${JSON.stringify(id)} does not exist`)
  return index
}

/** 固定 anchor 处的项，其余项按自上而下的次序避开已放好的项、向下推开。 */
function settle<T extends GridItem>(items: readonly T[], anchor: number, options: GridOptions): T[] {
  const result = items.slice()
  const placed: T[] = [items[anchor]!]
  for (const index of order(items)) {
    if (index === anchor)
      continue
    const item = lowestFree(items[index]!, placed)
    placed.push(item)
    result[index] = item
  }
  return options.compact === false ? result : compactClamped(result, anchor)
}

/**
 * 拖动或改大小：把 id 的项放到 target（只改写了的项），压到它的项向下推开，被推的项再推开它压到的；
 * 向下拖时，顶边不低于它新顶边的被压项先挪到它的上方，压实后两者对调。
 * 之后缺省整体压实，同位置时被拖的项优先。返回新数组，次序与输入相同；id 不存在时抛 `RangeError`。
 */
export function setGridItemRect<T extends GridItem>(items: readonly T[], id: string, target: Partial<GridRect>, columns: number, options: GridOptions = {}): T[] {
  const index = indexOf(items, id)
  const origin = clampToGrid(items[index]!, columns)
  const moved = clampToGrid({ ...items[index]!, ...target }, columns)
  const clamped = items.map((item, i) => {
    if (i === index)
      return moved
    const other = clampToGrid(item, columns)
    if (moved.y > origin.y && other.y <= moved.y && gridCollides(other, moved))
      return { ...other, y: Math.max(0, moved.y - other.h) }
    return other
  })
  return settle(clamped, index, options)
}

/**
 * 放入新项：写了 x、y 时放在那里并推开碰撞的项，没写时放到第一个放得下的空位（自上而下、自左而右）。
 * 新项排在数组末尾；id 已存在时抛 `RangeError`。
 */
export function placeGridItem(items: readonly GridItem[], placement: GridPlacement, columns: number, options: GridOptions = {}): GridItem[] {
  if (items.some(item => item.id === placement.id))
    throw new RangeError(`[designer-kit] grid item ${JSON.stringify(placement.id)} already exists`)
  const clamped = items.map(item => clampToGrid(item, columns))
  if (placement.x !== undefined && placement.y !== undefined) {
    const item = clampToGrid({ id: placement.id, x: placement.x, y: placement.y, w: placement.w, h: placement.h }, columns)
    return settle([...clamped, item], clamped.length, options)
  }
  const size = clampToGrid({ id: placement.id, x: 0, y: 0, w: placement.w, h: placement.h }, columns)
  const total = columnCount(columns)
  for (let y = 0; ; y++) {
    for (let x = 0; x + size.w <= total; x++) {
      const candidate = { ...size, x, y }
      if (!clamped.some(other => gridCollides(candidate, other)))
        return [...clamped, candidate]
    }
  }
}

/** 移除一项，缺省之后整体压实；id 不存在时抛 `RangeError`。 */
export function removeGridItem<T extends GridItem>(items: readonly T[], id: string, columns: number, options: GridOptions = {}): T[] {
  const index = indexOf(items, id)
  const rest = items.filter((_, i) => i !== index)
  return options.compact === false ? rest : compactLayout(rest, columns)
}
