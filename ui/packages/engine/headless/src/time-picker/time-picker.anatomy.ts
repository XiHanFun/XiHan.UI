import type { ItemQuery } from '@xihan-ui/behavior'
import { itemValue, queryItems } from '@xihan-ui/behavior'
import { createAnatomy } from '@xihan-ui/kernel'

// data-part 直接用 kebab-case，与 CSS 选择器一致。
// segment-group 把全部段位与作者写的分隔符兜成一块，占满盒里剩下的宽度，尾部按钮靠在末端。
// input 是多实例 part：时/分/秒/上下午各一个，段的身份由作者写在节点上，
// 结构与语义同分段时间输入（每段一个 spinbutton、整组一个 Tab 位），逻辑走 time-field 的纯函数。
// column 同样是多实例，每列是一个 listbox，option 是列里的选项；列间靠左右键换，列内靠上下键走。
// presets 是浮层里的快捷选项列（「此刻」「上午 9 点」这类），preset 是其中一项。
export const timePickerAnatomy = createAnatomy('time-picker', [
  'root',
  'label',
  'control',
  'segment-group',
  'input',
  'trigger',
  'clear-trigger',
  'positioner',
  'content',
  'presets',
  'preset',
  'column',
  'item',
  'hidden-input',
])

/** 分段输入的集合：容器取 control（trigger 与清空按钮同在 control 里，但不是 input，查不到它们）。 */
export const timePickerInputQuery: ItemQuery = { scope: timePickerAnatomy.name, part: 'input' }

/** 快捷选项的集合：容器取那一列自己。选项自报 data-value 为自己的值。 */
export const timePickerPresetQuery: ItemQuery = { scope: timePickerAnatomy.name, part: 'preset' }

/** 列的集合：容器取 content。列自报 data-value 为自己的单位（hour/minute/second）。 */
export const timePickerColumnQuery: ItemQuery = { scope: timePickerAnatomy.name, part: 'column' }

/**
 * 选项的集合：容器取所属的列。
 * queryItems 按归属过滤，隔壁列的同名选项（分列与秒列都有 '30'）不会串过来。
 */
export const timePickerItemQuery: ItemQuery = { scope: timePickerAnatomy.name, part: 'item' }

/** 按单位找到列节点；无 DOM 环境或该列未渲染时为 null。 */
export function findTimePickerColumn(content: HTMLElement | null, unit: string): HTMLElement | null {
  return queryItems(content, timePickerColumnQuery).find(el => itemValue(el) === unit) ?? null
}

/** 按单位与值找到选项节点；焦点落位与确认键都在事件那一刻现查它。 */
export function findTimePickerItem(content: HTMLElement | null, unit: string, value: string): HTMLElement | null {
  return queryItems(findTimePickerColumn(content, unit), timePickerItemQuery)
    .find(el => itemValue(el) === value) ?? null
}
