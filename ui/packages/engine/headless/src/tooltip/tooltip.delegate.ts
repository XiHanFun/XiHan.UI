/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 委托模式：从事件落点找出锚点、读出锚点上的提示内容，以及在锚点上挂摘 aria-describedby。
// 只在事件处理器与挂载后的效应里读写 DOM，渲染期不调用。

import type { KbdPlatform } from '@xihan-ui/core/hotkey'
import type { TooltipAnchor } from './tooltip.types'
import { detectKbdPlatform, parseAriaKeyshortcuts, resolveKbdPlatform } from '@xihan-ui/core/hotkey'
import { overflowItemLabel } from '../shared/overflow-menu'

/** 空白归一：连续空白并成一个空格，首尾去掉。 */
function tidy(text: string | null): string {
  return (text ?? '').split(/\s+/u).filter(Boolean).join(' ')
}

/**
 * 事件落点所在的锚点：容器里命中选择器的那个元素（不含容器自己），连同它上面读出的提示内容。
 * 文字取 data-xh-tooltip，没写时取锚点的可及名；快捷键取 aria-keyshortcuts 的第一条。
 * 落点不在锚点上，或锚点上既没有文字也没有快捷键时为 null。
 */
export function readTooltipAnchor(
  container: Element,
  target: EventTarget | null,
  selector: string,
  platform: KbdPlatform | undefined,
): TooltipAnchor | null {
  const node = target as Element | null
  const el = node && typeof node.closest === 'function' ? node.closest<HTMLElement>(selector) : null
  if (!el || el === container || !container.contains(el))
    return null
  const name = overflowItemLabel(el)
  const own = tidy(el.getAttribute('data-xh-tooltip'))
  const text = own || name
  const keys = parseAriaKeyshortcuts(el.getAttribute('aria-keyshortcuts'))[0] ?? null
  if (!text && !keys)
    return null
  return {
    el,
    text,
    keys,
    platform: platform === undefined || platform === 'auto' ? detectKbdPlatform() : resolveKbdPlatform(platform),
    described: own !== '' && own !== name,
  }
}

/** 锚点的 aria-describedby 里加上 id，原有的引用保留在前面。 */
export function linkDescription(el: Element, id: string): void {
  const ids = tidy(el.getAttribute('aria-describedby')).split(' ').filter(Boolean)
  if (!ids.includes(id))
    el.setAttribute('aria-describedby', [...ids, id].join(' '))
}

/** 从锚点的 aria-describedby 里摘掉 id；摘完为空时整个属性撤掉。 */
export function unlinkDescription(el: Element, id: string): void {
  const ids = tidy(el.getAttribute('aria-describedby')).split(' ').filter(token => token !== '' && token !== id)
  if (ids.length > 0)
    el.setAttribute('aria-describedby', ids.join(' '))
  else
    el.removeAttribute('aria-describedby')
}
