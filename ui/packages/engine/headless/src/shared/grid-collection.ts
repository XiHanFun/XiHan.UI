/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// GridList 与 TagGroup 共用的可操作网格集合：一维的 APG grid。
//
// 条目担 row，条目里的正文与行内按钮落在 gridcell 下，整组只留一个 Tab 停靠点（roving tabindex）。
// 两者一模一样的那部分行为收在这里：选中集按 none / single / multiple 归一与改写、方向键与连打检索
// 在条目之间搬焦点、Tab 从组外进来时的落点、Ctrl / Cmd + A 全选、按键到命令的分派、行内控件的放行。
// 条目怎么查、文字从哪取、命令落成哪条机器事件由各自的 connect 交进来；DOM 上的属性字典
// （role、aria-*、data-*、tabindex）与处理器的挂载点留在各自的 connect 里。

import type { Direction, NavIntent, Orientation, SelectionOrder, Typeahead } from '@xihan-ui/core'
import { contains, focusItem, indexOfValue, isHTMLElement, isItemDisabled, itemValue, matchTypeahead, navigateItems, navIntentFromKey, toggleSelectAll } from '@xihan-ui/core'

export type GridSelectionMode = 'none' | 'single' | 'multiple'

/** 选中集归一：none 清空，single 截到长度 ≤ 1，multiple 去重。 */
export function normalizeGridSelection(next: readonly string[], mode: GridSelectionMode): string[] {
  if (mode === 'none')
    return []
  return mode === 'single' ? next.slice(0, 1) : [...new Set(next)]
}

/**
 * 切换一条之后的选中集：复选按在不在集合里增减；单选退化成选中它、不做取消；none 原样。
 * 单选下点已选中的那一条仍是选中它——单选集合里「一条都不选」不是用户点得出来的状态。
 */
export function toggleGridSelection(current: readonly string[], value: string, mode: GridSelectionMode): string[] {
  if (mode === 'none')
    return [...current]
  if (mode === 'single')
    return [value]
  return current.includes(value) ? current.filter(item => item !== value) : [...current, value]
}

/** 行里自带键盘与点击语义的控件：它们的按键与点击归自己，不当成对这一行的操作。 */
const INLINE_CONTROL = 'button, a[href], input, select, textarea, [contenteditable], [role="button"], [role="checkbox"], [role="link"]'

/** 事件是不是落在行里的某个行内控件上；落在行自身上不算。 */
export function fromInlineControl(target: EventTarget | null, row: Element | null): boolean {
  if (!row || !isHTMLElement(target) || target === row)
    return false
  const control = target.closest(INLINE_CONTROL)
  return control != null && control !== row && row.contains(control)
}

/** 网格认得的按键命令；导航与空格带着 Shift，交给调用方决定要不要扩选。 */
export type GridKey
  = | { kind: 'select-all' }
    | { kind: 'navigate', intent: NavIntent, extend: boolean }
    | { kind: 'delete' }
    | { kind: 'enter' }
    | { kind: 'typeahead', query: string }
    | { kind: 'space', extend: boolean }

export interface GridKeyOptions {
  /** 方向键的轴：条目竖排走上下键、横排走左右键。 */
  axis: Orientation
  dir: Direction
  /** 连打检索的缓冲；关掉检索时传 null。 */
  typeahead: Typeahead | null
}

/**
 * 按键 → 命令。返回 null 即这个键不归网格管，调用方不得 preventDefault。
 *
 * 次序有讲究：连打检索排在空格之前——缓冲区非空时空格是检索串的一部分，空的时候
 * push(' ') 返回 null，空格才落到最后当确认键。带 Ctrl / Cmd / Alt 的方向键不算导航、
 * 不参与检索；确认与摘除键不看修饰键。
 * 输入法组合态与可编辑目标不在这里判：那是各组件键盘入口的放行条件，写在各自的处理器开头。
 */
export function readGridKey(event: KeyboardEvent, options: GridKeyOptions): GridKey | null {
  const command = event.ctrlKey || event.metaKey
  if (command && !event.altKey && (event.key === 'a' || event.key === 'A'))
    return { kind: 'select-all' }
  const intent = command || event.altKey ? null : navIntentFromKey(event.key, { axis: options.axis, dir: options.dir })
  if (intent)
    return { kind: 'navigate', intent, extend: event.shiftKey }
  if (event.key === 'Delete' || event.key === 'Backspace')
    return { kind: 'delete' }
  if (event.key === 'Enter')
    return { kind: 'enter' }
  const query = !command && !event.altKey ? options.typeahead?.push(event.key) ?? null : null
  if (query != null)
    return { kind: 'typeahead', query }
  if (event.key === ' ')
    return { kind: 'space', extend: event.shiftKey }
  return null
}

export interface GridCollectionOptions {
  /** 按文档序现读条目；只在事件回调里调用——connect 在渲染期求值，那时 DOM 可能还不在。 */
  items: (container: HTMLElement) => HTMLElement[]
  /** 条目的连打检索取字。 */
  text: (item: HTMLElement) => string
  /** 导航起点：焦点在组内时是焦点条目，否则是首个选中值。 */
  anchor: string | null
  /** 方向键走到头是否回绕。 */
  loop: boolean
  isSelected: (value: string) => boolean
  /** 焦点搬到这一条之后通知机器记下锚点。 */
  onFocus: (value: string) => void
  /**
   * 全选与范围选的全序；不给即按 DOM 现读。给了数据的集合传数据序：
   * 条目可能按需渲染、也可能被作者重排，数据序才是用户认的那一个。
   */
  order?: SelectionOrder | null
}

export interface GridCollection {
  /** 聚焦这一条并通知机器；不是条目返回 null。 */
  focusValue: (el: HTMLElement | null) => string | null
  /** 按导航意图从锚点走一步；禁用条目跳过。返回落到的值。 */
  focusBy: (container: HTMLElement, intent: NavIntent) => string | null
  /** 连打检索：从锚点的下一条绕一圈找，未命中保持原状。 */
  focusMatch: (container: HTMLElement, query: string) => void
  /**
   * 容器自己拿到焦点（Tab 从组外进来）时把焦点交给条目：首个可停留的选中条目，没有就是首个可停留条目。
   * 焦点从组内交到容器手上（摘完最后一条）、或是冒泡上来的条目焦点，都不接管。
   */
  enter: (event: FocusEvent) => void
  /** 焦点离开了整组（去了组外，或被移出了文档）。 */
  leaves: (event: FocusEvent) => boolean
  /** 全序与禁用判定。 */
  order: (container: HTMLElement) => SelectionOrder
  /** 全选 / 全不选之后的选中集：可选条目已全在就整段取消，否则整段并进；选中的禁用条目留着。 */
  selectAll: (container: HTMLElement, current: readonly string[]) => string[]
}

export function createGridCollection(options: GridCollectionOptions): GridCollection {
  const { items, anchor } = options

  const focusValue = (el: HTMLElement | null): string | null => {
    const next = itemValue(el)
    if (next == null)
      return null
    focusItem(el)
    options.onFocus(next)
    return next
  }

  const order = (container: HTMLElement): SelectionOrder => {
    if (options.order)
      return options.order
    const all = items(container)
    const disabled = new Set(all.filter(el => isItemDisabled(el)).map(itemValue).filter((value): value is string => value != null))
    return {
      items: all.map(itemValue).filter((value): value is string => value != null),
      isDisabled: value => disabled.has(value),
    }
  }

  return {
    focusValue,
    focusBy: (container, intent) => focusValue(navigateItems(items(container), anchor, intent, { loop: options.loop })),
    focusMatch: (container, query) => {
      const all = items(container)
      focusValue(matchTypeahead(all, indexOfValue(all, anchor), query, {
        text: options.text,
        skip: isItemDisabled,
      }))
    },
    enter: (event) => {
      const container = event.currentTarget as HTMLElement
      if (event.target !== container || contains(container, event.relatedTarget as Node | null))
        return
      const all = items(container)
      const selected = all.find((el) => {
        const value = itemValue(el)
        return value != null && options.isSelected(value) && !isItemDisabled(el)
      })
      // 落点条目自己的 onFocus 会把锚点接过去
      focusItem(selected ?? navigateItems(all, null, 'first'))
    },
    leaves: event => !contains(event.currentTarget as HTMLElement, event.relatedTarget as Node | null),
    order,
    selectAll: (container, current) => [...toggleSelectAll({ selected: current, anchor: null }, order(container)).selected],
  }
}
