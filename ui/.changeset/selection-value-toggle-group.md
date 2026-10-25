---
'@xihan-ui/headless': minor
'@xihan-ui/vue': minor
'@xihan-ui/react': minor
'@xihan-ui/web-components': minor
---

**新增** 开关组的值可以是任意类型，与选择器同一套：`value`、`defaultValue` 与 `collection` 里交进来数字、对象都行，`onValueChange`、`v-model` 与 `renderItem` 拿到的是原值。Vue 与 React 的 `XhToggleGroupRoot` 按 `value` 或 `collection` 推断值的类型、按 `multiple` 推断形状：写了 `multiple` 时值是数组，没写时是一个值或 `null`，单选却绑数组即报错；对象值给 `valueKey`。headless 新增 `ToggleGroupSelection` 与 `ToggleGroupModel` 两个按 `multiple` 收窄的类型；Web Components 写 `querySelector<XhToggleGroupElement<V>>('xh-toggle-group')`。
