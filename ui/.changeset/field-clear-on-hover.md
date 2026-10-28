---
'@xihan-ui/styles': major
'@xihan-ui/tokens': minor
'@xihan-ui/headless': patch
---

**调整** 字段里的清空钮改成按需露面、圆形：TextField、ColorField、ColorPicker、DateField、TimeField、TagsInput、Select、Combobox、Cascader、TreeSelect、DatePicker、DateRangePicker、TimePicker、TimeRangePicker 的 `clear-trigger` 在可悬停的精细指针下，有值且指针落在字段盒上、或盒里有焦点时才显出，触屏上有值即常显（Action Control 的 `has-value` 显示策略，字段盒的 control 部件投影 `data-xh-action-owner`；TextField、ColorField 的这个属性从 root 挪到 control）。钮取圆形 `--xh-shape-circle`，静息字形取新增的 `--xh-fg-field-clear`（次级前景兑 50% 的透明），指到钮上换满色。下拉一类的展开箭头 / 日历钮 / 时钟钮只在清空钮显出来时让位，指针离开字段盒即回来，两颗共用同一格、盒宽不跳；焦点正在展开钮上时它不让位。各组件的 `--xh-<组件>-action-radius` 与 `--xh-<组件>-action-fg` 覆盖槽照旧作用于清空钮。
