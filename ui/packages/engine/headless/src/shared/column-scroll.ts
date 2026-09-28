/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 定高滚动列的定位：各列把选中的那一格停到列顶。
//
// 时间选择（TimePicker、TimeRangePicker，以及 DatePicker / DateRangePicker 的时间列）一列一个定高滚动面，
// 几列并排、各是一长串数。打开时每一列都滚到选中的那一格，几列的选中落在同一行上，一眼读出所选时刻；
// 这一下是首帧内容，直接到位。打开之后选中值变了（点格、在输入段里敲、宿主改值），只有选中换了格的
// 那几列平滑滚过去——这是导航角色的平滑滚动，减弱动效下降成直接到位；选中没换的列留在用户自己滚到的位置。

import type { Scope } from '@xihan-ui/core'
import { resolveScrollBehavior } from '@xihan-ui/core'

export interface ColumnScrollTarget {
  scope: Scope
  /** 推迟到宿主完成一次渲染提交之后：选中标记要等 DOM 落定才读得到。 */
  flush: (fn: () => void) => void
  /** 浮层内容节点；宿主还没交出来时为 null。 */
  content: () => HTMLElement | null
  /** 内容里的各列（滚动容器）。带 hidden 的列跳过。 */
  columns: (content: HTMLElement) => HTMLElement[]
}

/** 每一列上次对齐时选中的是哪一格；还没对齐过的列不在表里。 */
const alignedOption = new WeakMap<HTMLElement, HTMLElement | null>()

function selectedOption(column: HTMLElement): HTMLElement | null {
  return column.querySelector<HTMLElement>('[role="option"][aria-selected="true"]')
}

/** 这一格停到列顶时列的滚动位置：它与第一格之间的距离（与此刻滚到哪儿无关），越界由浏览器夹进可滚范围。 */
function alignedTop(column: HTMLElement, option: HTMLElement): number {
  const first = column.querySelector<HTMLElement>('[role="option"]')
  return first ? option.getBoundingClientRect().top - first.getBoundingClientRect().top : 0
}

function liveColumns(target: ColumnScrollTarget): HTMLElement[] {
  const content = target.content()
  return content ? target.columns(content).filter(column => !column.hidden) : []
}

/** 各列直接停到选中的那一格。列还没有布局（高度为 0）时返回 false，等量得出尺寸再来。 */
function alignAll(target: ColumnScrollTarget): boolean {
  const columns = liveColumns(target)
  if (columns.length === 0 || columns.every(column => column.clientHeight === 0))
    return false
  for (const column of columns) {
    const option = selectedOption(column)
    alignedOption.set(column, option)
    if (option)
      column.scrollTop = alignedTop(column, option)
  }
  return true
}

/**
 * 写在展开态的 effect 上：打开时各列直接停到选中的那一格。
 * 浮层晚一拍才有布局（Light DOM 宿主先摘 hidden 再搬进落点）时，等内容量得出尺寸再对齐，仍在绘制之前。
 */
export function alignColumnsOnOpen(target: ColumnScrollTarget): () => void {
  let disposed = false
  let observer: ResizeObserver | undefined
  target.flush(() => {
    if (disposed || alignAll(target))
      return
    const content = target.content()
    const Observer = target.scope.getWin().ResizeObserver
    if (!content || typeof Observer !== 'function')
      return
    observer = new Observer(() => {
      if (disposed || !alignAll(target))
        return
      observer?.disconnect()
      observer = undefined
    })
    observer.observe(content)
  })
  return () => {
    disposed = true
    observer?.disconnect()
  }
}

/** 选中值变了之后调用：选中换了格的列平滑滚过去，减弱动效下直接到位；打开时还没对齐过的列不管。 */
export function followColumnSelection(target: ColumnScrollTarget): void {
  target.flush(() => {
    for (const column of liveColumns(target)) {
      if (!alignedOption.has(column))
        continue
      const option = selectedOption(column)
      if (option === alignedOption.get(column))
        continue
      alignedOption.set(column, option)
      if (!option)
        continue
      const top = alignedTop(column, option)
      if (typeof column.scrollTo === 'function')
        column.scrollTo({ top, behavior: resolveScrollBehavior('smooth', target.scope, column) })
      else
        column.scrollTop = top
    }
  })
}
