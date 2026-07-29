import type { ItemQuery } from '@xihan-ui/behavior'
import { itemValue, queryItems } from '@xihan-ui/behavior'
import { createAnatomy } from '@xihan-ui/core'

// data-part 直接用 kebab-case，与 CSS 选择器一致。
// input 是多实例 part：时/分/秒/上下午各一个，段的身份由作者写在节点上，
// 结构与语义同分段时间输入（每段一个 spinbutton、整组一个 Tab 位），逻辑走 time-field 的纯函数。
// column 同样是多实例，每列是一个 listbox，option 是列里的选项；列间靠左右键换，列内靠上下键走。
export const timePickerAnatomy = createAnatomy('time-picker', [
  'root',
  'label',
  'control',
  'input',
  'trigger',
  'clear-trigger',
  'positioner',
  'content',
  'column',
  'option',
  'hidden-input',
])

/** 分段输入的集合：容器取 control（trigger 与清空按钮同在 control 里，但不是 input，查不到它们）。 */
export const timePickerInputQuery: ItemQuery = { scope: timePickerAnatomy.name, part: 'input' }

/** 列的集合：容器取 content。列自报 data-value 为自己的单位（hour/minute/second）。 */
export const timePickerColumnQuery: ItemQuery = { scope: timePickerAnatomy.name, part: 'column' }

/**
 * 选项的集合：容器取所属的列。
 * queryItems 按归属过滤，隔壁列的同名选项（分列与秒列都有 '30'）不会串过来。
 */
export const timePickerOptionQuery: ItemQuery = { scope: timePickerAnatomy.name, part: 'option' }

/** 按单位找到列节点；无 DOM 环境或该列未渲染时为 null。 */
export function findTimePickerColumn(content: HTMLElement | null, unit: string): HTMLElement | null {
  return queryItems(content, timePickerColumnQuery).find(el => itemValue(el) === unit) ?? null
}

/** 按单位与值找到选项节点；焦点落位与确认键都在事件那一刻现查它。 */
export function findTimePickerOption(content: HTMLElement | null, unit: string, value: string): HTMLElement | null {
  return queryItems(findTimePickerColumn(content, unit), timePickerOptionQuery)
    .find(el => itemValue(el) === value) ?? null
}
