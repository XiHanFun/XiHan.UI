---
'@xihan-ui/headless': major
'@xihan-ui/vue': major
'@xihan-ui/react': major
'@xihan-ui/web-components': major
---

**破坏性** CheckboxGroup 的选中数上下限从 `min / max` 改叫 `minSelected / maxSelected`，与 Select、Combobox、Cascader、TreeSelect、QuestionFlow 的选中数上限同名；裸 `min / max` 留给 NumberField、Slider 这类数值的上下限。

| 旧名 | 新名 |
| --- | --- |
| `min`（WC attribute `min`） | `minSelected`（Vue 模板与 WC attribute `min-selected`） |
| `max`（WC attribute `max`） | `maxSelected`（Vue 模板与 WC attribute `max-selected`） |
