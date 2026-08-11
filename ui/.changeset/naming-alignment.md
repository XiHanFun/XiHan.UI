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

**transfer 的数据入口由 `items` 改叫 `collection`。** 另外 17 个集合组件的数据入口都叫
`collection`。单条的类型名 `TransferItem`、某一侧看得见的条目 `visibleItems`、纯函数
`transferVisibleItems` 都不动——它们说的是「条目」，不是「数据入口」。

迁移点：

- Vue：`<XhTransferRoot :items="…">` 改成 `:collection="…"`。
- WC：`el.items = […]` 改成 `el.collection = […]`（这个入口表达不成属性，本来就只能走 property）。
- `TransferApi.items` → `TransferApi.collection`。

**checkbox-group 的组内子部件对齐 radio-group。** 同一语义两套名字：checkbox-group 用
`item-control` / `item-hidden-input`，radio-group 用 `indicator` / `hidden-input`。裸名是全仓
多数（`indicator` 13 处、`hidden-input` 10 处），checkbox-group 随大流。`item-text` 不动
（21 份解剖都这么叫）。

迁移点：

- `data-part='item-control'` → `'indicator'`，`data-part='item-hidden-input'` → `'hidden-input'`。
- 皮肤覆盖槽 `--xh-checkbox-group-control-*` → `--xh-checkbox-group-indicator-*`（10 个），
  与 radio-group 的 `--xh-radio-group-indicator-*` 对齐。
- `CheckboxGroupApi.getItemControlProps` → `getIndicatorProps`，
  `getItemHiddenInputProps` → `getHiddenInputProps`（两个名字 radio-group 早就在用）。
- Vue 组件 `XhCheckboxGroupItemControl` → `XhCheckboxGroupIndicator`。

**table 的空态部件由 `empty-state` 改叫 `empty`。** 部件名不该与组件的 scope 名撞车——
`empty-state` 是一个独立组件的 `data-scope`，再拿它当 table 的部件名，写皮肤时
`[data-part='empty-state']` 与 `[data-scope='empty-state']` 混在一起读不出谁是谁。
combobox 早就叫 `empty`。独立的 `empty-state` 组件本身不动。

迁移点：

- `data-part='empty-state'` → `'empty'`。
- `TableApi.getEmptyStateProps` → `getEmptyProps`。
- Vue 组件 `XhTableEmptyState` → `XhTableEmpty`（`XhEmptyState*` 那一族是另一个组件，不变）。
- WC 的 `::part(empty-state)` → `::part(empty)`。
