---
'@xihan-ui/headless': major
'@xihan-ui/vue': major
'@xihan-ui/react': major
'@xihan-ui/web-components': major
---

**破坏性** Tree 的勾选集合改名：`checkedValue` 改 `checked`，与同一组件里的 `selection` 同构。Table、Tree、Transfer 这类同时有选中、勾选、展开几套集合的数据视图保留 `selection` 指选中那一套，写进了约定。

| 旧名 | 新名 |
| --- | --- |
| `checkedValue` / `defaultCheckedValue` | `checked` / `defaultChecked` |
| `onCheckedValueChange` | `onCheckedChange` |
| Vue `v-model:checked-value` | `v-model:checked` |
| Web Components 事件 `checked-value-change` | `checked-change` |
| Api 的 `api.checkedValue`、`api.setCheckedValue()` | `api.checked`、`api.setChecked()` |
| 类型 `TreeCheckedValueChangeDetails` | `TreeCheckedChangeDetails` |
