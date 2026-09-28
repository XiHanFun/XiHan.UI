/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 溢出收纳：一排条目沿主轴排开，排不下的那一截按次序收进行尾的一个入口（「更多」钮）。
//
// 这里只管几何：量出每个条目在自然排布下的末端与容器能放下的长度，算出能露出几个。
// 收进去的条目怎样藏、入口弹出什么、条目的身份与文字，都归使用它的组件。

import type { Direction } from '../../kernel'
import { readDirection } from '../collection/direction'

/** 主轴：横排量行向，竖排量块向。 */
export type OverflowAxis = 'inline' | 'block'

/** 一次量测的结果，全部是容器自身坐标系里的长度（px），不受祖先缩放影响。 */
export interface OverflowLayout {
  /** 容器内衬盒在主轴上能放下的长度。 */
  available: number
  /** 每个条目在自然排布（全部露出、不换行）下的末端，从内衬盒的起始缘量起，按书写方向取逻辑值。 */
  ends: readonly number[]
  /** 收起时行尾要让出的长度：入口自身的长度加上它与前一个条目之间的间距。 */
  reserve: number
}

/** 半个像素的余量：量测带小数，恰好放得下的那一个不该因为舍入被判成放不下。 */
const TOLERANCE = 0.5

/**
 * 能露出的条目个数（从头数起的前缀长度）。
 *
 * 全部放得下时一个不收，行尾也不必让出入口的位置；放不下时先给入口让出 reserve，再从头数放得下几个。
 * 可用长度越大露出的越多，不会来回跳：入口的有无只取决于全部条目放不放得下。
 */
export function fitOverflowCount(layout: OverflowLayout): number {
  const { available, ends, reserve } = layout
  const count = ends.length
  if (count === 0)
    return 0
  if (ends[count - 1]! <= available + TOLERANCE)
    return count
  const room = available - reserve + TOLERANCE
  let fit = 0
  while (fit < count && ends[fit]! <= room)
    fit += 1
  return fit
}

export interface MeasureOverflowOptions {
  /** 条目排在它的内衬盒里；主轴上的可用长度取它。 */
  container: HTMLElement
  /** 参与收纳的条目，文档序。作者自己藏起来的条目不要传进来。 */
  items: readonly HTMLElement[]
  /** 行尾的入口：放不下时才露面，长度计进 reserve。 */
  trigger: HTMLElement
  axis: OverflowAxis
  /**
   * 量测期间要临时露出的节点：上一轮收起的条目与收着的入口。
   * 它们带着 hidden 属性，量完原样放回；整个过程在同一个同步段里，浏览器不会画出中间态。
   */
  concealed: readonly HTMLElement[]
  /** 书写方向；缺省从容器的计算样式现读。 */
  dir?: Direction
}

function px(value: string | undefined): number {
  const parsed = Number.parseFloat(value ?? '')
  return Number.isFinite(parsed) ? parsed : 0
}

/**
 * 量出自然排布：把上一轮收起的条目与入口临时露出，读完每个条目的末端再收回去。
 *
 * 条目的末端取 getBoundingClientRect 与容器的差，再按容器的缩放比例还原：对话框进场时的缩放
 * 会让矩形整体变小，可用长度却取自不受缩放影响的 clientWidth，两边不还原就对不上。
 * 容器没有排布（display: none、没有排版的宿主）时返回 null，调用方保持上一轮的结果。
 */
export function measureOverflowLayout(options: MeasureOverflowOptions): OverflowLayout | null {
  const { container, items, trigger, axis, concealed } = options
  const inline = axis === 'inline'
  const mainSize = (el: HTMLElement): number => (inline ? el.offsetWidth : el.offsetHeight)
  if (mainSize(container) === 0)
    return null

  const revealed = concealed.filter(el => el.hidden)
  for (const el of revealed)
    el.hidden = false
  try {
    const win = container.ownerDocument.defaultView
    const style = win?.getComputedStyle(container)
    const rect = container.getBoundingClientRect()
    const scale = (inline ? rect.width : rect.height) / mainSize(container) || 1
    const rtl = inline && (options.dir ?? readDirection(container)) === 'rtl'

    let available: number
    let start: number
    let endOf: (el: HTMLElement) => number
    if (inline) {
      const padStart = px(rtl ? style?.paddingRight : style?.paddingLeft)
      const padEnd = px(rtl ? style?.paddingLeft : style?.paddingRight)
      available = container.clientWidth - padStart - padEnd
      if (rtl) {
        start = rect.right - (px(style?.borderRightWidth) + padStart) * scale
        endOf = el => (start - el.getBoundingClientRect().left) / scale
      }
      else {
        start = rect.left + (container.clientLeft + padStart) * scale
        endOf = el => (el.getBoundingClientRect().right - start) / scale
      }
    }
    else {
      const padStart = px(style?.paddingTop)
      available = container.clientHeight - padStart - px(style?.paddingBottom)
      start = rect.top + (container.clientTop + padStart) * scale
      endOf = el => (el.getBoundingClientRect().bottom - start) / scale
    }

    const gap = px(inline ? style?.columnGap : style?.rowGap)
    return {
      available,
      ends: items.map(endOf),
      reserve: mainSize(trigger) + gap,
    }
  }
  finally {
    for (const el of revealed)
      el.hidden = true
  }
}

export interface TrackOverflowOptions {
  /** 条目所在的容器：它变宽变窄就重量。 */
  container: HTMLElement
  /** 条目与入口；条目增减后按它重新取一遍，逐个盯尺寸。 */
  nodes: () => Iterable<Element>
  /** 要重量了。同一帧里的多次变化只回调一次。 */
  onChange: () => void
}

/**
 * 条目上会改变收纳结果或菜单文案的声明：可及名、按下态、禁用与身份。
 * 不盯 hidden：那是收纳自己写的，盯了等于自己触发自己。
 */
const DECLARATION_ATTRS = ['aria-label', 'aria-labelledby', 'aria-pressed', 'aria-disabled', 'disabled', 'value']

/**
 * 盯住会改变收纳结果的变化：容器与条目的尺寸、条目增减与改写（文字、可及名、按下态、禁用）、
 * 字体加载完成、窗口尺寸。宿主缺哪种观察器就少盯哪一路，窗口尺寸变化照常生效。
 *
 * 回调排到下一帧再跑：收纳会改条目的显隐，在观察器回调里当场改，同一帧里被盯着的节点又变了尺寸，
 * 浏览器会报 ResizeObserver 循环。
 */
export function trackOverflowLayout(win: Window & typeof globalThis, options: TrackOverflowOptions): () => void {
  const { container, nodes, onChange } = options
  let disposed = false
  let frame = 0
  const schedule = (): void => {
    if (disposed || frame)
      return
    frame = win.requestAnimationFrame(() => {
      frame = 0
      if (!disposed)
        onChange()
    })
  }

  const ResizeObserverCtor = win.ResizeObserver
  const resizeObserver = typeof ResizeObserverCtor === 'function' ? new ResizeObserverCtor(schedule) : null
  const observeAll = (): void => {
    if (!resizeObserver)
      return
    resizeObserver.disconnect()
    resizeObserver.observe(container)
    for (const node of nodes())
      resizeObserver.observe(node)
  }
  observeAll()

  const MutationObserverCtor = win.MutationObserver
  const mutationObserver = typeof MutationObserverCtor === 'function'
    ? new MutationObserverCtor((records) => {
        if (records.some(record => record.type === 'childList'))
          observeAll()
        schedule()
      })
    : null
  mutationObserver?.observe(container, {
    childList: true,
    subtree: true,
    characterData: true,
    attributes: true,
    attributeFilter: DECLARATION_ATTRS,
  })

  const fonts = container.ownerDocument.fonts as FontFaceSet | undefined
  fonts?.addEventListener?.('loadingdone', schedule)
  win.addEventListener('resize', schedule)

  return () => {
    disposed = true
    if (frame)
      win.cancelAnimationFrame(frame)
    resizeObserver?.disconnect()
    mutationObserver?.disconnect()
    fonts?.removeEventListener?.('loadingdone', schedule)
    win.removeEventListener('resize', schedule)
  }
}
