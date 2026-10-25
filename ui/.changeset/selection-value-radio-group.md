---
'@xihan-ui/headless': minor
'@xihan-ui/vue': minor
'@xihan-ui/react': minor
'@xihan-ui/web-components': minor
---

**新增** 单选组的值可以是任意类型，与选择器同一套：`value`、`defaultValue` 与 `collection` 里交进来数字、对象都行，选中值是一个值或 `null`，`onValueChange`、`v-model` 与 `renderItem` 拿到的是原值；Vue 与 React 的 `XhRadioGroupRoot` 按 `value` 或 `collection` 推断值的类型，对象值给 `valueKey`。隐藏的原生 radio 提交的是键；Web Components 写 `querySelector<XhRadioGroupElement<V>>('xh-radio-group')`。
