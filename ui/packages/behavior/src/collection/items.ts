import type { NavIntent, StepOptions } from './navigate'
import { DATA_PART, DATA_SCOPE } from '@xihan-ui/core'
import { focusSafely } from '../focus-scope/tabbable'
import { stepIndex } from './navigate'

// 条目集合的 DOM 只读侧。**只在事件处理器里调用**：那一刻两个适配器看到的是同一份活 DOM，
// 顺序天然是文档序，增删无需记账。渲染期（Vue 的 computed / WC 的 wire）不得调用——
// 那里 Vue 读到的是上一帧、WC 读到的是本帧，会让两个适配器分叉。

export interface ItemQuery {
  /** 组件名，对应 data-scope。 */
  scope: string
  /** 条目部件名，对应 data-part。 */
  part: string
}

/** 条目身份属性：值由作者声明，connect 原样回写，导航与选中都以它为准。 */
export const ITEM_VALUE_ATTR = 'data-value'

function selector(q: ItemQuery): string {
  return `[${DATA_SCOPE}="${q.scope}"][${DATA_PART}="${q.part}"]`
}

/**
 * 取容器内的条目元素，文档序。
 * 归属过滤保证嵌套同类集合（Tabs 套 Tabs、Accordion 套 Accordion）互不吞并。
 */
export function queryItems(container: HTMLElement | null, q: ItemQuery): HTMLElement[] {
  if (!container)
    return []
  const items = [...container.querySelectorAll<HTMLElement>(selector(q))]
  // 归属判据取"容器自己的 part"，而不是"任意同 scope 祖先"：
  // 条目与容器之间常隔着同 scope 的其它 part（Accordion 的 item/header），
  // 用任意同 scope 祖先做判据会把条目全部过滤掉。
  const part = container.getAttribute(DATA_PART)
  if (part == null)
    return items
  const containerSel = `[${DATA_SCOPE}="${q.scope}"][${DATA_PART}="${part}"]`
  return items.filter(el => el.parentElement?.closest(containerSel) === container)
}

export function itemValue(el: HTMLElement | null): string | null {
  return el?.getAttribute(ITEM_VALUE_ATTR) ?? null
}

/**
 * 条目是否不可停留。集合条目一律用 aria-disabled 表达禁用
 * （原生 disabled 不可聚焦，会让"禁用项仍可被方向键跳过/停留"的策略失效）。
 */
export function isItemDisabled(el: HTMLElement): boolean {
  return el.getAttribute('aria-disabled') === 'true' || el.hasAttribute('disabled')
}

export function indexOfValue(items: readonly HTMLElement[], value: string | null): number {
  if (value == null)
    return -1
  return items.findIndex(el => itemValue(el) === value)
}

export interface NavigateOptions extends StepOptions {
  /** 是否允许停留在禁用条目上，默认 false（跳过）。 */
  focusDisabled?: boolean
}

/** 从 from 值出发走一步，返回目标条目元素；无处可去时返回 null。 */
export function navigateItems(
  items: readonly HTMLElement[],
  from: string | null,
  intent: NavIntent,
  options: NavigateOptions = {},
): HTMLElement | null {
  const { focusDisabled = false, loop, skip } = options
  const next = stepIndex(items.length, indexOfValue(items, from), intent, {
    loop,
    skip: skip ?? (focusDisabled ? undefined : i => isItemDisabled(items[i]!)),
  })
  return next < 0 ? null : items[next]!
}

/**
 * 聚焦条目并滚入可视区。
 * focusSafely 走的是 preventScroll，长列表里不补 scrollIntoView 焦点会跑出视口。
 */
export function focusItem(el: HTMLElement | null): void {
  if (!el)
    return
  focusSafely(el)
  el.scrollIntoView?.({ block: 'nearest', inline: 'nearest' })
}
