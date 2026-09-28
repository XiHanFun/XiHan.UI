/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 工具条的溢出收纳：放不下的条目按次序收进行尾「更多」钮弹出的菜单。
//
// 几何交给 core 的溢出原语；这里只管工具条自己的结构：哪些是条目、哪个是「更多」钮，
// 收起的条目在菜单里叫什么、是不是开关、与上一条之间有没有分组边界。
// 只在挂载后的效应与事件处理器里调用，渲染期不得读 DOM。

import type { Orientation, Service } from '@xihan-ui/core'
import type { MenuSchema } from '../menu/menu.types'
import type { ToolbarOverflowItem, ToolbarSchema } from './toolbar.types'
import { fitOverflowCount, isItemDisabled, itemQuerySelector, itemValue, measureOverflowLayout, queryItems } from '@xihan-ui/core'
import { overflowItemLabel, overflowMenuProps } from '../shared/overflow-menu'
import { toolbarAnatomy, toolbarItemQuery, toolbarOverflowTriggerQuery } from './toolbar.anatomy'

const GROUP_SELECTOR = itemQuerySelector({ scope: toolbarAnatomy.name, part: 'group' })
const SEPARATOR_SELECTOR = itemQuerySelector({ scope: toolbarAnatomy.name, part: 'separator' })
const ITEM_SELECTOR = itemQuerySelector(toolbarItemQuery)

/** 行尾的「更多」钮，只认这条工具条自己的（嵌套的另一条工具条里的不算）。 */
export function toolbarOverflowTrigger(root: HTMLElement): HTMLElement | null {
  return queryItems(root, toolbarOverflowTriggerQuery)[0] ?? null
}

/**
 * 每个条目落在哪一段：分组自成一段，root 上的分隔线把两侧切开。
 * 段号不同的相邻两条之间，菜单里补一条分隔线，工具条上的分组在菜单里仍看得出来。
 */
function segmentsOf(root: HTMLElement): Map<HTMLElement, string> {
  const segments = new Map<HTMLElement, string>()
  const groups = new Map<Element, number>()
  let cuts = 0
  for (const el of root.querySelectorAll<HTMLElement>(`${SEPARATOR_SELECTOR}, ${ITEM_SELECTOR}`)) {
    // 嵌套的另一条工具条归它自己
    if (el.parentElement?.closest(`[data-scope="${toolbarAnatomy.name}"][data-part="root"]`) !== root)
      continue
    const group = el.closest(GROUP_SELECTOR)
    const owned = group != null && root.contains(group) ? group : null
    if (el.matches(SEPARATOR_SELECTOR)) {
      if (!owned)
        cuts += 1
      continue
    }
    let index = -1
    if (owned) {
      index = groups.get(owned) ?? groups.size
      groups.set(owned, index)
    }
    segments.set(el, `${cuts}:${index}`)
  }
  return segments
}

/** 收起的条目在菜单里的样子：文字、禁用、按下态与分组边界，一律从条目当下的 DOM 读。 */
function describe(root: HTMLElement, collapsed: readonly HTMLElement[]): ToolbarOverflowItem[] {
  const segments = segmentsOf(root)
  let previous: string | undefined
  return collapsed.map((el, index) => {
    const segment = segments.get(el) ?? ''
    const pressed = el.getAttribute('aria-pressed')
    const item: ToolbarOverflowItem = {
      value: itemValue(el) ?? '',
      // 可及名都没有时退回身份值
      label: overflowItemLabel(el) || (itemValue(el) ?? ''),
      disabled: isItemDisabled(el),
      pressed: pressed == null ? null : pressed === 'true',
      separatorBefore: index > 0 && segment !== previous,
    }
    previous = segment
    return item
  })
}

/**
 * 量一次收纳：返回收进菜单的条目，文档序。
 *
 * 没放「更多」钮就不收，返回空数组，条目照常折行。容器没有排布（display: none、没有排版的宿主）时
 * 返回 null，调用方保留上一轮的结果：藏起来的工具条重新露面时，尺寸变化会再触发一次量测。
 * current 是上一轮收起的那些——它们此刻带着 hidden，量测期间临时露出来量自然排布；
 * 其余带 hidden 的条目是作者自己藏的，不参与收纳。
 */
export function measureToolbarOverflow(
  root: HTMLElement,
  current: readonly ToolbarOverflowItem[],
  orientation: Orientation,
): ToolbarOverflowItem[] | null {
  const trigger = toolbarOverflowTrigger(root)
  if (!trigger)
    return []
  const collapsed = new Set(current.map(item => item.value))
  const items = queryItems(root, toolbarItemQuery).filter(el => !el.hidden || collapsed.has(itemValue(el) ?? ''))
  const layout = measureOverflowLayout({
    container: root,
    items,
    trigger,
    axis: orientation === 'vertical' ? 'block' : 'inline',
    concealed: [...items, trigger],
  })
  if (!layout)
    return null
  return describe(root, items.slice(fitOverflowCount(layout)))
}

/** 两轮收纳结果是否一样：作 cell 的 isEqual 用，量到同一结果不多推一次更新。 */
export function sameOverflowItems(a: readonly ToolbarOverflowItem[], b: unknown): boolean {
  if (!Array.isArray(b) || a.length !== b.length)
    return false
  return a.every((item, index) => {
    const other = b[index] as ToolbarOverflowItem
    return item.value === other.value
      && item.label === other.label
      && item.disabled === other.disabled
      && item.pressed === other.pressed
      && item.separatorBefore === other.separatorBefore
  })
}

/**
 * 「更多」菜单的机器 props，从工具条的机器现读：条目随收纳走，开关条目是勾选项，
 * 选中一项即替它触发条目自己的点击。落位、选完收起与「一个都没收时受控关着」归共用的 overflowMenuProps。
 * 三端都用它喂菜单：Vue / React 交给 XhMenuRoot，Web Components 交给元素内自建的菜单机器。
 */
export function toolbarOverflowMenuProps(service: Service<ToolbarSchema>): MenuSchema['props'] {
  const { context, prop, send } = service
  return overflowMenuProps({
    entries: context.get('overflowItems').map(item => ({
      value: item.value,
      label: item.label,
      disabled: item.disabled,
      checked: item.pressed,
      separatorBefore: item.separatorBefore,
    })),
    orientation: prop('orientation') ?? 'horizontal',
    dir: prop('dir'),
    size: prop('size'),
    disabled: prop('disabled'),
    onSelect: value => send({ type: 'OVERFLOW.SELECT', value }),
  })
}
