---
'@xihan-ui/headless': minor
'@xihan-ui/styles': minor
'@xihan-ui/vue': minor
'@xihan-ui/react': minor
'@xihan-ui/web-components': minor
---

**新增** 文本字段的回车提交 `onValueCommit`（Vue 为 `value-commit` 事件，Web Components 派发 `value-commit`）：单行输入框里按回车发出，带当前值，写了 `mask` 时另带 `unmaskedValue`。输入法组合期间的回车不算，多行宿主里回车是换行不发，禁用、只读与按住不放的连发都不发；回车的缺省行为照旧，放在表单里仍触发隐式提交。键盘表新增 `text-field.kbd.commit`。

**新增** 文本字段的在途态 `loading`：输入框报告 `aria-busy`，根与盒带 `data-loading`，盒里输入框之后新增的 `loading` 部件（Vue / React 为 `XhTextFieldLoading`）露出一枚加载环，直径取控件内图标档，对读屏隐藏；在途不算禁用，照常输入与回车。不写结构时开了 `loading` 才铺，排在清空按钮之前。新增覆盖槽 `--xh-text-field-loading-fg`、`--xh-text-field-loading-duration`。连接层 API 新增 `loading` 与 `getLoadingProps`。
