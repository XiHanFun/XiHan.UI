// 一次交互之后的选中集。输入是「当前选中集 + 这一下点了什么、按着什么键」，输出是新的集合。
import type { SelectionInput, SelectionOrder, SelectionState } from './types'

/** 空选中集。 */
export const EMPTY_SELECTION: SelectionState = { selected: [], anchor: null }

/**
 * 点一下之后的选中集。
 *
 * 语义按文件管理器那套，四条互不重叠：
 * - 裸点击：整份换成这一项，锚点挪过来
 * - Ctrl+点击：切换这一项，锚点挪过来
 * - Shift+点击：锚点到这一项那一段，**整份替换**当前集合，锚点不动
 * - Ctrl+Shift+点击：那一段**并进**当前集合，锚点不动
 *
 * 锚点不动是 Shift 的关键：连着按 Shift 才能从同一个起点反复改选区大小。
 * 还没有锚点时 Shift 退化成裸点击——没有起点，「一段」无从谈起。
 *
 * `single` 忽略两个修饰键，恒是换成这一项：多选语义在单选模式下没有意义。
 * `none` 原样返回。
 */
export function applySelection(input: SelectionInput): SelectionState {
  const { state, mode, value, extend, additive, items, isDisabled } = input

  if (mode === 'none' || isDisabled?.(value))
    return state

  if (mode === 'single')
    return { selected: [value], anchor: value }

  const anchor = state.anchor
  if (extend && anchor != null) {
    const range = rangeBetween(anchor, value, { items, isDisabled })
    // 锚点留在原处：这一段的起点还是它
    return { selected: additive ? union(state.selected, range) : range, anchor }
  }

  if (additive)
    return { selected: toggle(state.selected, value), anchor: value }

  return { selected: [value], anchor: value }
}

/**
 * 全选 / 全不选。
 *
 * 当前可选项已经全在集合里就整段清空，否则整段选上——同一个键来回按能开能关。
 * 只动可选项：禁用的项既不会被选上，也不会因为它没被选上而让「已全选」判不成立。
 */
export function toggleSelectAll(state: SelectionState, order: SelectionOrder): SelectionState {
  const selectable = order.items.filter(value => !order.isDisabled?.(value))
  if (selectable.length === 0)
    return { selected: [], anchor: state.anchor }

  const chosen = new Set(state.selected)
  const all = selectable.every(value => chosen.has(value))
  return { selected: all ? [] : selectable, anchor: state.anchor }
}

/** 清空。锚点一并清掉：选区没了，起点也就没有意义。 */
export function clearSelection(): SelectionState {
  return EMPTY_SELECTION
}

/**
 * 两项之间那一段（含两端），按全序取，跳过禁用项。
 *
 * 谁在前谁在后不看调用方给的先后，看它们在全序里的位置——从下往上拖出来的选区
 * 与从上往下拖出来的应该是同一段。
 */
export function rangeBetween(from: string, to: string, order: SelectionOrder): string[] {
  const start = order.items.indexOf(from)
  const end = order.items.indexOf(to)
  if (start < 0 || end < 0)
    return []
  const [lo, hi] = start <= end ? [start, end] : [end, start]
  return order.items.slice(lo, hi + 1).filter(value => !order.isDisabled?.(value))
}

/** 有就去掉，没有就加上。 */
function toggle(selected: readonly string[], value: string): string[] {
  return selected.includes(value) ? selected.filter(item => item !== value) : [...selected, value]
}

/** 并集，保留先后并去重。 */
function union(a: readonly string[], b: readonly string[]): string[] {
  const out = [...a]
  for (const value of b) {
    if (!out.includes(value))
      out.push(value)
  }
  return out
}
