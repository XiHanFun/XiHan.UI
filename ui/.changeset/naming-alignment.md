---
"@xihan-ui/headless": major
"@xihan-ui/styles": major
"@xihan-ui/vue": major
"@xihan-ui/web-components": major
---

把跨组件已经分叉的名字统一回一套。part 名与 prop 名在 1.0 之后就是公开 API——皮肤按
`data-part` 选择、使用者按 prop 名调用——改名一律是破坏性变更，所以趁 alpha 一次改完。

**time-picker 的列表条目由 `option` 改叫 `item`。** 另外 32 个组件的列表条目都叫 `item`，
只有它是 `option`。ARIA 角色仍是 `role="option"`（那是角色不是部件名），列里的候选值集合
`TimePickerColumn.options` 也不动（那是数据不是部件）。

迁移点：

- `data-part='option'` 改成 `data-part='item'`；皮肤覆盖槽 `--xh-time-picker-option-*`
  改成 `--xh-time-picker-item-*`（共 10 个）。
- Vue 组件 `XhTimePickerOption` 改名 `XhTimePickerItem`。
- WC 的 `::part(option)` 改成 `::part(item)`。
- headless 导出：`timePickerOptionQuery` → `timePickerItemQuery`、`findTimePickerOption` →
  `findTimePickerItem`、`timePickerOptionValue` → `timePickerItemValue`、
  `TimePickerOptionProps` → `TimePickerItemProps`。
- `TimePickerApi` 上：`getOptionProps` → `getItemProps`、`isOptionSelected` → `isItemSelected`、
  `isOptionDisabled` → `isItemDisabled`、`focusedOption` → `focusedItem`。
- 键盘规格号 `time-picker.kbd.option-*` → `time-picker.kbd.item-*`。
