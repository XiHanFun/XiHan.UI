---
'@xihan-ui/headless': major
'@xihan-ui/vue': major
'@xihan-ui/react': major
'@xihan-ui/web-components': major
---

**破坏性** DatePicker、TimePicker、ColorPicker、CalendarPicker 的多选开关从 `selectionMode: 'single' | 'multiple'` 改成布尔 `multiple`，与 Select、Combobox、Cascader、TreeSelect 一致：只有单 / 多两档的字段用 `multiple`，能关掉选择或另有 extended 档的集合（Listbox、Tree、Table、GridList、TagGroup）才用 `selectionMode`。

| 旧写法 | 新写法 |
| --- | --- |
| `selectionMode="multiple"`（Vue / React） | `multiple` |
| `selection-mode="multiple"`（Web Components） | `multiple` |
| `selectionMode="single"` | 去掉（缺省单选） |
| Api 上的 `api.selectionMode === 'multiple'` | `api.multiple` |
| 类型 `CalendarPickerSelectionMode`、`TimePickerSelectionMode`、`ColorPickerSelectionMode` | 删掉，改用 `boolean` |
