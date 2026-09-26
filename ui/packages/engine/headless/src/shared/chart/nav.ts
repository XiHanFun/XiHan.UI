/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 绘图区的按键 → 意图。绘图区不随 RTL 镜像，左键始终向左；落到哪个数据由各图表按自己的形态决定。

/**
 * next / prev 沿自变量方向走一个键，series-next / series-prev 在同一个键上换到视觉次序的下一个 / 上一个系列，
 * first / last 到当前系列的首尾，page-next / page-prev 跨 10% 的键。
 */
export type ChartNavIntent = 'next' | 'prev' | 'series-next' | 'series-prev' | 'first' | 'last' | 'page-next' | 'page-prev'

/** 绘图区的朝向：vertical 自变量横排，horizontal 自变量竖排，radial 按角度顺时针（饼图）。 */
export type ChartNavLayout = 'vertical' | 'horizontal' | 'radial'

export interface ChartNavKeyEventLike {
  readonly key: string
  readonly altKey?: boolean
  readonly ctrlKey?: boolean
  readonly metaKey?: boolean
}

/**
 * 方向键按视觉方向解释：vertical 下左右走键、上下换系列（堆叠自下而上、分组自左而右都算「上」一个是下一个系列）；
 * horizontal 下两对方向键互换；radial 下右与下是顺时针的下一个，左与上是上一个。
 * 带修饰键的按键不归绘图区（留给浏览器与读屏），返回 null。
 */
export function chartNavIntentFromKey(event: ChartNavKeyEventLike, layout: ChartNavLayout): ChartNavIntent | null {
  if (event.altKey || event.ctrlKey || event.metaKey)
    return null
  switch (event.key) {
    case 'Home':
      return 'first'
    case 'End':
      return 'last'
    case 'PageDown':
      return 'page-next'
    case 'PageUp':
      return 'page-prev'
    default:
      break
  }
  if (layout === 'radial') {
    if (event.key === 'ArrowRight' || event.key === 'ArrowDown')
      return 'next'
    if (event.key === 'ArrowLeft' || event.key === 'ArrowUp')
      return 'prev'
    return null
  }
  const along = layout === 'vertical'
    ? { next: 'ArrowRight', prev: 'ArrowLeft', up: 'ArrowUp', down: 'ArrowDown' }
    : { next: 'ArrowDown', prev: 'ArrowUp', up: 'ArrowRight', down: 'ArrowLeft' }
  switch (event.key) {
    case along.next:
      return 'next'
    case along.prev:
      return 'prev'
    case along.up:
      return 'series-next'
    case along.down:
      return 'series-prev'
    default:
      return null
  }
}

/** 跨 10% 的键，至少 1 个。 */
export function chartPageSize(count: number): number {
  return Math.max(1, Math.round(count / 10))
}
