---
'@xihan-ui/headless': minor
'@xihan-ui/vue': minor
'@xihan-ui/react': minor
'@xihan-ui/web-components': minor
---

**新增** 组合框的值可以是任意类型，与选择器同一套：`value`、`defaultValue` 与 `collection` 里交进来数字、对象都行，`onValueChange`、`v-model`、插槽、`renderItem` 与自定义 `filter` 拿到的是原值；Vue 与 React 的 `XhComboboxRoot` 按 `value` 或 `collection` 推断值的类型，对象值给 `valueKey`。表单影子提交的是键；Web Components 写 `querySelector<XhComboboxElement<V>>('xh-combobox')`。
